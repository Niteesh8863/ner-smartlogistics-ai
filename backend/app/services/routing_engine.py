import math
import networkx as nx
from typing import List, Dict, Any, Optional, Tuple
from sqlalchemy.orm import Session
from app.models.spatial import RoadSegment, RoadStatus, RiskLevel
from app.models.logistics import CargoType
from app.schemas.spatial import RouteAlternative, RouteSegmentDetail, RoutePlanResponse

def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

class RiskAwareRoutingEngine:
    """
    Risk-Time-Distance Multi-Objective Graph Routing Engine
    Cost = alpha * time + beta * risk + gamma * distance
    Strict safety rule: Never recommend or traverse confirmed closed roads.
    """
    def __init__(self, db: Session):
        self.db = db
        self.segments: List[RoadSegment] = db.query(RoadSegment).all()

    def _build_graph(self, avoid_closed: bool = True, risk_weight_multiplier: float = 1.0) -> nx.DiGraph:
        G = nx.DiGraph()

        for seg in self.segments:
            # Hard safety constraint
            if avoid_closed and seg.current_status == RoadStatus.CLOSED:
                continue

            u = f"{seg.start_lat:.4f},{seg.start_lng:.4f}"
            v = f"{seg.end_lat:.4f},{seg.end_lng:.4f}"

            # Assume average speeds: National Highway 60km/h, State 45km/h, Mountain 35km/h
            speed = 50.0
            if "Mountain" in seg.surface_type:
                speed = 35.0
            elif "4-Lane" in seg.surface_type:
                speed = 70.0

            time_hours = seg.length_km / speed
            risk = seg.current_risk_score * risk_weight_multiplier
            
            # Status penalty for RESTRICTED roads (e.g., single-lane convoy)
            status_penalty = 1.0
            if seg.current_status == RoadStatus.RESTRICTED:
                status_penalty = 1.5

            # Bi-directional road network representation
            edge_data = {
                "segment_id": seg.id,
                "name": seg.name,
                "highway": seg.highway_number,
                "length_km": seg.length_km,
                "time_hours": time_hours * status_penalty,
                "risk_score": risk,
                "status": seg.current_status,
                "start_coord": [seg.start_lat, seg.start_lng],
                "end_coord": [seg.end_lat, seg.end_lng]
            }

            G.add_edge(u, v, **edge_data)
            # Reverse direction
            rev_data = dict(edge_data)
            rev_data["start_coord"] = edge_data["end_coord"]
            rev_data["end_coord"] = edge_data["start_coord"]
            G.add_edge(v, u, **rev_data)

        return G

    def _find_closest_node(self, G: nx.DiGraph, lat: float, lng: float) -> Optional[str]:
        best_node = None
        min_dist = float("inf")
        for node in G.nodes():
            n_lat, n_lng = map(float, node.split(","))
            dist = haversine_km(lat, lng, n_lat, n_lng)
            if dist < min_dist:
                min_dist = dist
                best_node = node
        return best_node

    def plan_route(
        self,
        origin_lat: float, origin_lng: float,
        dest_lat: float, dest_lng: float,
        cargo_type: CargoType = CargoType.MEDICINE,
        alpha_time: float = 0.40,
        beta_risk: float = 0.45,
        gamma_dist: float = 0.15
    ) -> List[RouteAlternative]:

        # Adjust weights based on cargo sensitivity
        if cargo_type == CargoType.MEDICINE or cargo_type == CargoType.EMERGENCY:
            beta_risk = 0.60
            alpha_time = 0.30
            gamma_dist = 0.10
        elif cargo_type == CargoType.FOOD:
            beta_risk = 0.45
            alpha_time = 0.35
            gamma_dist = 0.20
        elif cargo_type == CargoType.CONSTRUCTION:
            beta_risk = 0.30
            alpha_time = 0.30
            gamma_dist = 0.40

        # Build graphs: (1) Standard avoiding closed, (2) Extra risk-averse
        G_standard = self._build_graph(avoid_closed=True, risk_weight_multiplier=1.0)
        G_safer = self._build_graph(avoid_closed=True, risk_weight_multiplier=2.5)

        start_node = self._find_closest_node(G_standard, origin_lat, origin_lng)
        end_node = self._find_closest_node(G_standard, dest_lat, dest_lng)

        if not start_node or not end_node:
            return []

        def cost_func(u, v, data):
            # Normalized cost components
            t_norm = data["time_hours"] / 10.0
            r_norm = data["risk_score"]
            d_norm = data["length_km"] / 200.0
            return (alpha_time * t_norm) + (beta_risk * r_norm) + (gamma_dist * d_norm)

        alternatives = []

        # 1. Primary Safe & Optimized Route
        try:
            path_std = nx.shortest_path(G_standard, source=start_node, target=end_node, weight=cost_func)
            alt_primary = self._compile_route(
                G_standard, path_std, origin_lat, origin_lng, dest_lat, dest_lng,
                label="Recommended Risk-Optimized Route", is_recommended=True
            )
            alternatives.append(alt_primary)
        except (nx.NetworkXNoPath, nx.NodeNotFound):
            pass

        # 2. Maximum Safety / Minimal Risk Alternative
        def extreme_risk_cost(u, v, data):
            return (0.15 * (data["time_hours"] / 10.0)) + (0.75 * data["risk_score"]) + (0.10 * (data["length_km"] / 200.0))

        try:
            path_safer = nx.shortest_path(G_safer, source=start_node, target=end_node, weight=extreme_risk_cost)
            # If path is different or even if similar, compile it
            alt_safer = self._compile_route(
                G_safer, path_safer, origin_lat, origin_lng, dest_lat, dest_lng,
                label="Maximum Safety Alternative Bypass", is_recommended=False
            )
            # Only add if path differs or as explicit second choice
            if not alternatives or alt_safer.path_coords != alternatives[0].path_coords:
                alternatives.append(alt_safer)
            else:
                alt_safer.label = "All-Weather Strategic Alternative"
                alternatives.append(alt_safer)
        except (nx.NetworkXNoPath, nx.NodeNotFound):
            pass

        return alternatives

    def _compile_route(
        self, G: nx.DiGraph, path_nodes: List[str],
        orig_lat: float, orig_lng: float, dest_lat: float, dest_lng: float,
        label: str, is_recommended: bool
    ) -> RouteAlternative:
        coords = [[orig_lat, orig_lng]]
        segments_detail = []
        total_dist = 0.0
        total_time = 0.0
        risk_scores = []
        safety_notes = []
        has_closed = False

        for i in range(len(path_nodes) - 1):
            u = path_nodes[i]
            v = path_nodes[i + 1]
            edge = G[u][v]
            
            coords.append(edge["start_coord"])
            coords.append(edge["end_coord"])

            total_dist += edge["length_km"]
            total_time += edge["time_hours"]
            risk_scores.append(edge["risk_score"])

            segments_detail.append(RouteSegmentDetail(
                road_segment_id=edge["segment_id"],
                name=edge["name"],
                highway_number=edge["highway"],
                length_km=edge["length_km"],
                risk_score=round(edge["risk_score"], 2),
                status=edge["status"]
            ))

            if edge["status"] == RoadStatus.CLOSED:
                has_closed = True
                safety_notes.append(f"WARNING: Segment {edge['name']} is officially closed!")
            elif edge["status"] == RoadStatus.RESTRICTED:
                safety_notes.append(f"CAUTION: Segment {edge['name']} is subject to restricted traffic.")

        coords.append([dest_lat, dest_lng])
        avg_risk = sum(risk_scores) / max(len(risk_scores), 1)
        max_risk = max(risk_scores) if risk_scores else 0.0

        if max_risk > 0.70:
            safety_notes.append("Passes through high-probability monsoon landslide hazard corridor.")
        else:
            safety_notes.append("Corridor clear of confirmed severe hazards.")

        return RouteAlternative(
            route_id=f"RT-{label[:3].upper()}-{int(total_dist)}",
            label=label,
            is_recommended=is_recommended,
            path_coords=coords,
            total_distance_km=round(total_dist, 1),
            estimated_time_hours=round(total_time, 2),
            average_risk_score=round(avg_risk, 2),
            max_segment_risk=round(max_risk, 2),
            passes_closed_roads=has_closed,
            segments=segments_detail,
            safety_notes=safety_notes,
            cost_score=round(total_time * 0.4 + avg_risk * 10 * 0.45 + (total_dist / 50) * 0.15, 2)
        )

