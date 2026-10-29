import json
from datetime import datetime, timezone, timedelta
from app.core.database import SessionLocal, engine, Base
from app.core.security import get_password_hash
from app.models.user import User, UserRole
from app.models.spatial import State, District, RoadSegment, Bridge, RoadStatus, RiskLevel, BridgeHealth
from app.models.incident import IncidentReport, IncidentCategory, IncidentSeverity, IncidentStatus
from app.models.prediction import DisruptionPrediction
from app.models.logistics import Vehicle, Consignment, TelemetryPoint, VehicleStatus, CargoType, ConsignmentPriority, ConsignmentStatus
from app.models.alert import Alert, AlertSeverity, AlertCategory
from app.models.audit import AuditLog

def init_db():
    print("Creating all database tables...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Check if already seeded
    if db.query(User).first():
        print("Database already contains data. Skipping initial seed.")
        db.close()
        return

    print("Seeding initial NER geospatial data, users, and scenarios...")

    # 1. SEED 8 NER STATES
    states_data = [
        {"name": "Assam", "code": "AS", "capital": "Dispur", "lat": 26.1433, "lng": 91.7898},
        {"name": "Arunachal Pradesh", "code": "AR", "capital": "Itanagar", "lat": 27.0844, "lng": 93.6053},
        {"name": "Meghalaya", "code": "ML", "capital": "Shillong", "lat": 25.5788, "lng": 91.8933},
        {"name": "Manipur", "code": "MN", "capital": "Imphal", "lat": 24.8170, "lng": 93.9368},
        {"name": "Mizoram", "code": "MZ", "capital": "Aizawl", "lat": 23.7271, "lng": 92.7176},
        {"name": "Nagaland", "code": "NL", "capital": "Kohima", "lat": 25.6751, "lng": 94.1086},
        {"name": "Sikkim", "code": "SK", "capital": "Gangtok", "lat": 27.3389, "lng": 88.6065},
        {"name": "Tripura", "code": "TR", "capital": "Agartala", "lat": 23.8315, "lng": 91.2868},
    ]
    for s in states_data:
        db.add(State(name=s["name"], code=s["code"], capital=s["capital"], center_lat=s["lat"], center_lng=s["lng"]))
    db.commit()

    # 2. SEED KEY DISTRICTS
    districts_data = [
        {"name": "Kamrup Metropolitan", "state": "Assam", "hq": "Guwahati", "lat": 26.1445, "lng": 91.7362},
        {"name": "Dibrugarh", "state": "Assam", "hq": "Dibrugarh", "lat": 27.4728, "lng": 94.9120},
        {"name": "Cachar", "state": "Assam", "hq": "Silchar", "lat": 24.8333, "lng": 92.7789},
        {"name": "Nagaon", "state": "Assam", "hq": "Nagaon", "lat": 26.3452, "lng": 92.6840},
        {"name": "Papum Pare", "state": "Arunachal Pradesh", "hq": "Yupia", "lat": 27.1438, "lng": 93.6821},
        {"name": "Tawang", "state": "Arunachal Pradesh", "hq": "Tawang", "lat": 27.5861, "lng": 91.8594},
        {"name": "East Khasi Hills", "state": "Meghalaya", "hq": "Shillong", "lat": 25.5788, "lng": 91.8933},
        {"name": "Ri-Bhoi", "state": "Meghalaya", "hq": "Nongpoh", "lat": 25.9015, "lng": 91.8797},
        {"name": "Imphal West", "state": "Manipur", "hq": "Lamphelpat", "lat": 24.8170, "lng": 93.9368},
        {"name": "Senapati", "state": "Manipur", "hq": "Senapati", "lat": 25.2673, "lng": 94.0204},
        {"name": "Kohima", "state": "Nagaland", "hq": "Kohima", "lat": 25.6751, "lng": 94.1086},
        {"name": "Dimapur", "state": "Nagaland", "hq": "Dimapur", "lat": 25.9068, "lng": 93.7273},
        {"name": "Aizawl", "state": "Mizoram", "hq": "Aizawl", "lat": 23.7271, "lng": 92.7176},
        {"name": "Gangtok", "state": "Sikkim", "hq": "Gangtok", "lat": 27.3389, "lng": 88.6065},
        {"name": "Mangan", "state": "Sikkim", "hq": "Mangan", "lat": 27.5144, "lng": 88.5284},
        {"name": "West Tripura", "state": "Tripura", "hq": "Agartala", "lat": 23.8315, "lng": 91.2868},
    ]
    for d in districts_data:
        db.add(District(name=d["name"], state_name=d["state"], headquarters=d["hq"], lat=d["lat"], lng=d["lng"]))
    db.commit()

    # 3. SEED ROAD SEGMENTS (Critical Transit Arteries)
    road_segments = [
        # NH-10: Siliguri -> Gangtok Lifeline (Landslide-prone)
        {
            "id": "NER-RD-NH10-01",
            "highway_number": "NH-10",
            "name": "Sevoke Coronation to Teesta Bazaar",
            "start_lat": 26.8833, "start_lng": 88.4667,
            "end_lat": 27.0600, "end_lng": 88.5000,
            "state": "Sikkim", "district": "Gangtok",
            "length_km": 34.5, "surface_type": "Paved Mountainous", "road_class": "National Highway",
            "current_status": RoadStatus.RESTRICTED, "status_reason": "Single lane open due to rockfall clearance near 29th Mile",
            "current_risk_score": 0.78, "current_risk_level": RiskLevel.HIGH,
            "elevation_m": 450.0, "slope_degrees": 28.5, "soil_type": "Schist/Gneiss Fragile", "distance_to_river_km": 0.2
        },
        {
            "id": "NER-RD-NH10-02",
            "highway_number": "NH-10",
            "name": "Teesta Bazaar to Rangpo Sikkim Border",
            "start_lat": 27.0600, "start_lng": 88.5000,
            "end_lat": 27.1767, "end_lng": 88.5283,
            "state": "Sikkim", "district": "Gangtok",
            "length_km": 22.0, "surface_type": "Paved Mountainous", "road_class": "National Highway",
            "current_status": RoadStatus.OPEN, "status_reason": "Clear passage with active monitoring",
            "current_risk_score": 0.35, "current_risk_level": RiskLevel.MEDIUM,
            "elevation_m": 720.0, "slope_degrees": 22.0, "soil_type": "Metamorphic Rock", "distance_to_river_km": 0.3
        },
        {
            "id": "NER-RD-NH10-03",
            "highway_number": "NH-10",
            "name": "Rangpo to Gangtok Central Terminal",
            "start_lat": 27.1767, "start_lng": 88.5283,
            "end_lat": 27.3389, "end_lng": 88.6065,
            "state": "Sikkim", "district": "Gangtok",
            "length_km": 38.2, "surface_type": "Paved Heavy Duty", "road_class": "National Highway",
            "current_status": RoadStatus.OPEN, "status_reason": "Open for all commercial vehicles",
            "current_risk_score": 0.18, "current_risk_level": RiskLevel.LOW,
            "elevation_m": 1650.0, "slope_degrees": 15.0, "soil_type": "Rocky Loam", "distance_to_river_km": 1.2
        },

        # NH-27 / NH-40: Guwahati to Shillong Corridor
        {
            "id": "NER-RD-NH40-01",
            "highway_number": "NH-40",
            "name": "Guwahati Khanapara to Nongpoh Expressway",
            "start_lat": 26.1158, "start_lng": 91.8217,
            "end_lat": 25.9015, "end_lng": 91.8797,
            "state": "Meghalaya", "district": "Ri-Bhoi",
            "length_km": 52.0, "surface_type": "4-Lane Divided Highway", "road_class": "National Highway",
            "current_status": RoadStatus.OPEN, "status_reason": "High speed smooth flow",
            "current_risk_score": 0.12, "current_risk_level": RiskLevel.LOW,
            "elevation_m": 480.0, "slope_degrees": 8.0, "soil_type": "Red Clay", "distance_to_river_km": 3.0
        },
        {
            "id": "NER-RD-NH40-02",
            "highway_number": "NH-40",
            "name": "Nongpoh to Umiam Lake & Shillong Gate",
            "start_lat": 25.9015, "start_lng": 91.8797,
            "end_lat": 25.5788, "end_lng": 91.8933,
            "state": "Meghalaya", "district": "East Khasi Hills",
            "length_km": 47.5, "surface_type": "4-Lane Mountain Expressway", "road_class": "National Highway",
            "current_status": RoadStatus.OPEN, "status_reason": "Safe with fog advisories",
            "current_risk_score": 0.22, "current_risk_level": RiskLevel.LOW,
            "elevation_m": 1520.0, "slope_degrees": 14.2, "soil_type": "Laterite Rock", "distance_to_river_km": 1.8
        },

        # NH-29: Dimapur to Kohima Lifeline
        {
            "id": "NER-RD-NH29-01",
            "highway_number": "NH-29",
            "name": "Dimapur Commercial Hub to Chumukedima Bypass",
            "start_lat": 25.9068, "start_lng": 93.7273,
            "end_lat": 25.8200, "end_lng": 93.7800,
            "state": "Nagaland", "district": "Dimapur",
            "length_km": 18.0, "surface_type": "Paved 4-Lane", "road_class": "National Highway",
            "current_status": RoadStatus.OPEN, "status_reason": "Normal freight movement",
            "current_risk_score": 0.15, "current_risk_level": RiskLevel.LOW,
            "elevation_m": 195.0, "slope_degrees": 4.5, "soil_type": "Alluvial", "distance_to_river_km": 0.8
        },
        {
            "id": "NER-RD-NH29-02",
            "highway_number": "NH-29",
            "name": "Chumukedima Rockfall Zone to Kohima Entry",
            "start_lat": 25.8200, "start_lng": 93.7800,
            "end_lat": 25.6751, "end_lng": 94.1086,
            "state": "Nagaland", "district": "Kohima",
            "length_km": 54.0, "surface_type": "Mountain Highway", "road_class": "National Highway",
            "current_status": RoadStatus.CLOSED, "status_reason": "Severe landslide debris blocking both lanes at Mile 14; clearance underway",
            "current_risk_score": 0.92, "current_risk_level": RiskLevel.SEVERE,
            "elevation_m": 1440.0, "slope_degrees": 32.0, "soil_type": "Unconsolidated Shale", "distance_to_river_km": 0.4
        },

        # Alternative route bypassing NH29 landslide: Medziphema - Niuland - Kohima Rural Link
        {
            "id": "NER-RD-SHN-ALT",
            "highway_number": "SH-08",
            "name": "Niuland to Kohima North Alternative Bypass",
            "start_lat": 25.8200, "start_lng": 93.7800,
            "end_lat": 25.6751, "end_lng": 94.1086,
            "state": "Nagaland", "district": "Kohima",
            "length_km": 76.5, "surface_type": "2-Lane Asphalt", "road_class": "State Highway",
            "current_status": RoadStatus.OPEN, "status_reason": "Designated emergency bypass corridor",
            "current_risk_score": 0.38, "current_risk_level": RiskLevel.MEDIUM,
            "elevation_m": 1100.0, "slope_degrees": 12.0, "soil_type": "Clay Loam", "distance_to_river_km": 2.1
        },

        # NH-37: Assam Brahmaputra Trunk Route
        {
            "id": "NER-RD-NH37-01",
            "highway_number": "NH-37",
            "name": "Guwahati Jalukbari to Nagaon Bypass",
            "start_lat": 26.1445, "start_lng": 91.7362,
            "end_lat": 26.3452, "end_lng": 92.6840,
            "state": "Assam", "district": "Kamrup Metropolitan",
            "length_km": 118.0, "surface_type": "4-Lane Paved", "road_class": "National Highway",
            "current_status": RoadStatus.OPEN, "status_reason": "Unimpeded transit",
            "current_risk_score": 0.08, "current_risk_level": RiskLevel.LOW,
            "elevation_m": 55.0, "slope_degrees": 1.5, "soil_type": "Alluvial Plain", "distance_to_river_km": 4.5
        },
        {
            "id": "NER-RD-NH37-02",
            "highway_number": "NH-37",
            "name": "Nagaon to Kaziranga National Park Corridor",
            "start_lat": 26.3452, "start_lng": 92.6840,
            "end_lat": 26.5800, "end_lng": 93.3600,
            "state": "Assam", "district": "Nagaon",
            "length_km": 88.0, "surface_type": "2-Lane with Animal Corridors", "road_class": "National Highway",
            "current_status": RoadStatus.RESTRICTED, "status_reason": "Speed limit 40 km/h due to flood warning and animal crossing",
            "current_risk_score": 0.62, "current_risk_level": RiskLevel.HIGH,
            "elevation_m": 72.0, "slope_degrees": 2.0, "soil_type": "Wetland Silt", "distance_to_river_km": 0.5
        },
        {
            "id": "NER-RD-NH37-03",
            "highway_number": "NH-37",
            "name": "Jorhat to Dibrugarh Logistics Terminal",
            "start_lat": 26.7509, "start_lng": 94.2037,
            "end_lat": 27.4728, "end_lng": 94.9120,
            "state": "Assam", "district": "Dibrugarh",
            "length_km": 132.0, "surface_type": "4-Lane Highway", "road_class": "National Highway",
            "current_status": RoadStatus.OPEN, "status_reason": "Clear commercial passage",
            "current_risk_score": 0.14, "current_risk_level": RiskLevel.LOW,
            "elevation_m": 98.0, "slope_degrees": 1.8, "soil_type": "Alluvial", "distance_to_river_km": 2.0
        },

        # NH-13: Trans-Arunachal Highway (Bhalukpong - Bomdila - Tawang)
        {
            "id": "NER-RD-NH13-01",
            "highway_number": "NH-13",
            "name": "Bhalukpong Assam-Arunachal Border to Bomdila",
            "start_lat": 27.0100, "start_lng": 92.6500,
            "end_lat": 27.2600, "end_lng": 92.4200,
            "state": "Arunachal Pradesh", "district": "Papum Pare",
            "length_km": 96.0, "surface_type": "Heavy Mountain Paved", "road_class": "National Highway",
            "current_status": RoadStatus.RESTRICTED, "status_reason": "Heavy monsoon fog; convoys escorted by BRO",
            "current_risk_score": 0.65, "current_risk_level": RiskLevel.HIGH,
            "elevation_m": 2210.0, "slope_degrees": 26.0, "soil_type": "Metamorphic Schist", "distance_to_river_km": 0.6
        },
        {
            "id": "NER-RD-NH13-02",
            "highway_number": "NH-13",
            "name": "Sela Tunnel Approach to Tawang Strategic Sector",
            "start_lat": 27.5000, "start_lng": 92.1000,
            "end_lat": 27.5861, "end_lng": 91.8594,
            "state": "Arunachal Pradesh", "district": "Tawang",
            "length_km": 72.0, "surface_type": "High Altitude All-Weather Paved", "road_class": "National Highway",
            "current_status": RoadStatus.OPEN, "status_reason": "Sela Tunnel operational; road clear",
            "current_risk_score": 0.28, "current_risk_level": RiskLevel.MEDIUM,
            "elevation_m": 3100.0, "slope_degrees": 20.0, "soil_type": "Granite Alpine", "distance_to_river_km": 1.5
        },

        # NH-102: Imphal to Moreh Border
        {
            "id": "NER-RD-NH102-01",
            "highway_number": "NH-102",
            "name": "Imphal East to Tengnoupal & Moreh Border",
            "start_lat": 24.8170, "start_lng": 93.9368,
            "end_lat": 24.2400, "end_lng": 94.3000,
            "state": "Manipur", "district": "Imphal West",
            "length_km": 107.0, "surface_type": "Paved Highway", "road_class": "National Highway",
            "current_status": RoadStatus.RESTRICTED, "status_reason": "Security checkpoints and intermittent waterlogging",
            "current_risk_score": 0.55, "current_risk_level": RiskLevel.MEDIUM,
            "elevation_m": 850.0, "slope_degrees": 9.0, "soil_type": "Clayey Silt", "distance_to_river_km": 1.0
        },

        # NH-208: Tripura Arterial Lifeline
        {
            "id": "NER-RD-NH208-01",
            "highway_number": "NH-208",
            "name": "Kumarghat to Agartala Capital Gateway",
            "start_lat": 24.1600, "start_lng": 92.0200,
            "end_lat": 23.8315, "end_lng": 91.2868,
            "state": "Tripura", "district": "West Tripura",
            "length_km": 124.0, "surface_type": "2-Lane Asphalt", "road_class": "National Highway",
            "current_status": RoadStatus.OPEN, "status_reason": "Normal vehicular movement",
            "current_risk_score": 0.16, "current_risk_level": RiskLevel.LOW,
            "elevation_m": 60.0, "slope_degrees": 3.0, "soil_type": "Laterite Alluvium", "distance_to_river_km": 1.8
        }
    ]

    for r in road_segments:
        db.add(RoadSegment(**r))
    db.commit()

    # 4. SEED STRATEGIC BRIDGES
    bridges = [
        {
            "id": "NER-BRG-01",
            "name": "Bhupen Hazarika Setu (Dhola-Sadiya Bridge)",
            "road_segment_id": "NER-RD-NH37-03",
            "lat": 27.7975, "lng": 95.6631,
            "state": "Assam", "district": "Dibrugarh",
            "river_name": "Lohit River",
            "health_status": BridgeHealth.SAFE,
            "load_capacity_tons": 60.0,
            "length_meters": 9150.0
        },
        {
            "id": "NER-BRG-02",
            "name": "Bogibeel Rail-cum-Road Bridge",
            "road_segment_id": "NER-RD-NH37-03",
            "lat": 27.3994, "lng": 94.7578,
            "state": "Assam", "district": "Dibrugarh",
            "river_name": "Brahmaputra River",
            "health_status": BridgeHealth.SAFE,
            "load_capacity_tons": 70.0,
            "length_meters": 4940.0
        },
        {
            "id": "NER-BRG-03",
            "name": "Old Saraighat Bridge",
            "road_segment_id": "NER-RD-NH37-01",
            "lat": 26.1783, "lng": 91.6853,
            "state": "Assam", "district": "Kamrup Metropolitan",
            "river_name": "Brahmaputra River",
            "health_status": BridgeHealth.CAUTION,
            "load_capacity_tons": 35.0,
            "length_meters": 1290.0
        },
        {
            "id": "NER-BRG-04",
            "name": "Coronation Bridge (Sevoke)",
            "road_segment_id": "NER-RD-NH10-01",
            "lat": 26.8833, "lng": 88.4667,
            "state": "Sikkim", "district": "Gangtok",
            "river_name": "Teesta River",
            "health_status": BridgeHealth.CAUTION,
            "load_capacity_tons": 25.0,
            "length_meters": 110.0
        }
    ]
    for b in bridges:
        db.add(Bridge(**b))
    db.commit()

    # 5. SEED SYNTHETIC USERS (6 Granular Roles)
    users = [
        {
            "email": "superadmin@ner.gov.in",
            "username": "superadmin",
            "hashed_password": get_password_hash("Admin@12345"),
            "full_name": "Dr. Prabin Sharma",
            "role": UserRole.SUPER_ADMIN,
            "department": "MDoNER Digital Systems Architecture",
            "state": "Assam",
            "district": "Kamrup Metropolitan",
            "phone_number": "+91-9435012345"
        },
        {
            "email": "mdoner.admin@ner.gov.in",
            "username": "govtadmin",
            "hashed_password": get_password_hash("Govt@12345"),
            "full_name": "Ms. Ananya Bora, IAS",
            "role": UserRole.GOVT_ADMIN,
            "department": "Ministry of Development of North Eastern Region",
            "state": "Assam",
            "district": "Kamrup Metropolitan",
            "phone_number": "+91-9435098765"
        },
        {
            "email": "district.officer@assam.gov.in",
            "username": "districtofficer",
            "hashed_password": get_password_hash("District@12345"),
            "full_name": "Sri Debajit Saikia",
            "role": UserRole.DISTRICT_OFFICER,
            "department": "District Disaster Management Authority (DDMA)",
            "state": "Assam",
            "district": "Kamrup Metropolitan",
            "phone_number": "+91-9435112233"
        },
        {
            "email": "field.officer@ner.gov.in",
            "username": "fieldofficer",
            "hashed_password": get_password_hash("Field@12345"),
            "full_name": "Tenzing Lepcha",
            "role": UserRole.FIELD_OFFICER,
            "department": "PWD Road Safety & Surveillance Unit",
            "state": "Sikkim",
            "district": "Gangtok",
            "phone_number": "+91-9800123456"
        },
        {
            "email": "logistics@ner-trans.in",
            "username": "logisticsoperator",
            "hashed_password": get_password_hash("Logistics@12345"),
            "full_name": "Imran Hussain",
            "role": UserRole.LOGISTICS_OPERATOR,
            "department": "North East Essential Freight Consortium",
            "state": "Assam",
            "district": "Kamrup Metropolitan",
            "phone_number": "+91-9854011223"
        },
        {
            "email": "public@viewer.in",
            "username": "publicviewer",
            "hashed_password": get_password_hash("Public@12345"),
            "full_name": "Citizen Traveler",
            "role": UserRole.PUBLIC_VIEWER,
            "department": "General Public",
            "state": "Meghalaya",
            "district": "East Khasi Hills",
            "phone_number": "+91-9988776655"
        }
    ]
    for u in users:
        db.add(User(**u))
    db.commit()

    # 6. SEED INCIDENTS WITH COMPLETE LIFECYCLE
    incidents = [
        {
            "id": "INC-2026-001",
            "title": "Severe Rockfall & Mudslide on Chumukedima Hill Section",
            "category": IncidentCategory.LANDSLIDE,
            "severity": IncidentSeverity.CRITICAL,
            "status": IncidentStatus.VERIFIED,
            "road_segment_id": "NER-RD-NH29-02",
            "lat": 25.7500, "lng": 93.9200,
            "state": "Nagaland", "district": "Kohima",
            "description": "Massive landslide brought down boulders and wet mud over a 150-meter stretch of NH-29. Both carriageways blocked. Heavy BRO excavators deployed.",
            "reporter_name": "Field Officer Vilie Angami",
            "verifier_name": "Sri Debajit Saikia (DDMA Officer)",
            "verification_notes": "Ground verification confirmed complete blockage. Traffic diverted to Niuland-Kohima State Route.",
            "image_url": "https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80",
            "offline_client_id": "OFF-REP-NAG-2026-99"
        },
        {
            "id": "INC-2026-002",
            "title": "Teesta River Swelling & Bank Erosion near 29th Mile",
            "category": IncidentCategory.FLOOD,
            "severity": IncidentSeverity.HIGH,
            "status": IncidentStatus.VERIFIED,
            "road_segment_id": "NER-RD-NH10-01",
            "lat": 26.9800, "lng": 88.4800,
            "state": "Sikkim", "district": "Gangtok",
            "description": "Continuous heavy rainfall in upper catchment has caused Teesta waters to lap against the road revetment. Road restricted to light motor vehicles only.",
            "reporter_name": "Tenzing Lepcha (Field Officer)",
            "verifier_name": "District Magistrate Gangtok",
            "verification_notes": "Heavy trucks over 15 tons diverted via Lava-Algarah corridor.",
            "image_url": "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=800&q=80",
            "offline_client_id": "OFF-REP-SK-2026-01"
        },
        {
            "id": "INC-2026-003",
            "title": "Kaziranga Southern Edge Flood Water Logging",
            "category": IncidentCategory.FLOOD,
            "severity": IncidentSeverity.MEDIUM,
            "status": IncidentStatus.UNDER_REVIEW,
            "road_segment_id": "NER-RD-NH37-02",
            "lat": 26.5900, "lng": 93.2000,
            "state": "Assam", "district": "Nagaon",
            "description": "Mora Diphlu stream overflowing onto low-lying shoulder. Wildlife moving towards Karbi Anglong hills across highway.",
            "reporter_name": "Forest Ranger Bipul Das",
            "verifier_name": None,
            "verification_notes": None,
            "image_url": "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80",
            "offline_client_id": "OFF-REP-AS-2026-44"
        }
    ]
    for inc in incidents:
        db.add(IncidentReport(**inc))
    db.commit()

    # 7. SEED AI DISRUPTION PREDICTIONS WITH SHAP VALUES
    predictions = [
        {
            "road_segment_id": "NER-RD-NH29-02",
            "risk_probability": 0.92,
            "risk_level": RiskLevel.SEVERE,
            "forecast_horizon_hours": 24,
            "contributing_factors_json": json.dumps({
                "rainfall_24h_mm": 0.36,
                "slope_steepness": 0.28,
                "shale_rock_instability": 0.16,
                "antecedent_saturation": 0.12
            }),
            "rainfall_current_mm": 142.0,
            "rainfall_antecedent_mm": 280.0,
            "soil_saturation_pct": 91.5,
            "weather_summary": "Extremely Heavy Monsoonal Downpour",
            "model_version": "xgb-v1.0.0-ner",
            "prediction_confidence": 0.94,
            "uncertainty_score": 0.06
        },
        {
            "road_segment_id": "NER-RD-NH10-01",
            "risk_probability": 0.78,
            "risk_level": RiskLevel.HIGH,
            "forecast_horizon_hours": 24,
            "contributing_factors_json": json.dumps({
                "river_distance_proximity": 0.34,
                "rainfall_intensity": 0.26,
                "slope_erosion": 0.18
            }),
            "rainfall_current_mm": 98.0,
            "rainfall_antecedent_mm": 190.0,
            "soil_saturation_pct": 82.0,
            "weather_summary": "Heavy Continuous Downpour",
            "model_version": "xgb-v1.0.0-ner",
            "prediction_confidence": 0.89,
            "uncertainty_score": 0.11
        },
        {
            "road_segment_id": "NER-RD-NH13-01",
            "risk_probability": 0.65,
            "risk_level": RiskLevel.HIGH,
            "forecast_horizon_hours": 24,
            "contributing_factors_json": json.dumps({
                "high_altitude_slope": 0.31,
                "monsoon_saturation": 0.24,
                "fog_visibility": 0.10
            }),
            "rainfall_current_mm": 75.0,
            "rainfall_antecedent_mm": 140.0,
            "soil_saturation_pct": 74.0,
            "weather_summary": "Dense Mountain Fog & Heavy Showers",
            "model_version": "xgb-v1.0.0-ner",
            "prediction_confidence": 0.86,
            "uncertainty_score": 0.14
        },
        {
            "road_segment_id": "NER-RD-NH40-01",
            "risk_probability": 0.12,
            "risk_level": RiskLevel.LOW,
            "forecast_horizon_hours": 24,
            "contributing_factors_json": json.dumps({
                "engineered_drainage": -0.25,
                "slope_protection_wall": -0.20,
                "moderate_showers": 0.08
            }),
            "rainfall_current_mm": 24.0,
            "rainfall_antecedent_mm": 60.0,
            "soil_saturation_pct": 45.0,
            "weather_summary": "Light Showers",
            "model_version": "xgb-v1.0.0-ner",
            "prediction_confidence": 0.95,
            "uncertainty_score": 0.05
        }
    ]
    for p in predictions:
        db.add(DisruptionPrediction(**p))
    db.commit()

    # 8. SEED VEHICLES & TELEMETRY
    vehicles = [
        {
            "id": "AS-01-GB-4521",
            "model_name": "Tata Prima 3530.K Heavy Carrier",
            "driver_name": "Ramen Kakati",
            "driver_phone": "+91-9854123890",
            "status": VehicleStatus.IN_TRANSIT,
            "current_lat": 25.8500, "current_lng": 93.7500,
            "current_speed_kmh": 42.5, "current_heading": 115.0,
            "fuel_pct": 78.0, "is_anomaly": False
        },
        {
            "id": "SK-01-EA-1092",
            "model_name": "Ashok Leyland Captain 2820",
            "driver_name": "Pemba Bhutia",
            "driver_phone": "+91-9800778899",
            "status": VehicleStatus.IN_TRANSIT,
            "current_lat": 27.1200, "current_lng": 88.5100,
            "current_speed_kmh": 28.0, "current_heading": 45.0,
            "fuel_pct": 64.0, "is_anomaly": False
        },
        {
            "id": "NL-07-C-7744",
            "model_name": "Eicher Pro 6035",
            "driver_name": "Kevi Sema",
            "driver_phone": "+91-9436123456",
            "status": VehicleStatus.STALLED,
            "current_lat": 25.8150, "current_lng": 93.7900,
            "current_speed_kmh": 0.0, "current_heading": 90.0,
            "fuel_pct": 82.0, "is_anomaly": True,
            "anomaly_reason": "Stalled for > 75 minutes at Chumukedima landslide approach"
        },
        {
            "id": "ML-05-D-3301",
            "model_name": "BharatBenz 2823R",
            "driver_name": "Khyrmen Mawlong",
            "driver_phone": "+91-9774012399",
            "status": VehicleStatus.IDLE,
            "current_lat": 25.5788, "current_lng": 91.8933,
            "current_speed_kmh": 0.0, "current_heading": 0.0,
            "fuel_pct": 92.0, "is_anomaly": False
        }
    ]
    for v in vehicles:
        db.add(Vehicle(**v))
    db.commit()

    # 9. SEED ESSENTIAL GOODS CONSIGNMENTS
    consignments = [
        {
            "id": "CNS-NER-2026-081",
            "title": "Cold-Chain Critical Vaccines & Antibiotics",
            "cargo_type": CargoType.MEDICINE,
            "priority": ConsignmentPriority.CRITICAL,
            "status": ConsignmentStatus.IN_TRANSIT,
            "weight_tons": 2.4,
            "origin_name": "Guwahati Central Medical Depot (Jalukbari)",
            "origin_lat": 26.1445, "origin_lng": 91.7362,
            "destination_name": "Kohima Civil Hospital & Medical Store",
            "destination_lat": 25.6751, "destination_lng": 94.1086,
            "assigned_vehicle_id": "AS-01-GB-4521",
            "planned_distance_km": 348.0,
            "estimated_duration_hours": 8.5,
            "expected_delivery_time": datetime.now(timezone.utc) + timedelta(hours=4)
        },
        {
            "id": "CNS-NER-2026-082",
            "title": "FCI Essential Rice & Grain Emergency Ration",
            "cargo_type": CargoType.FOOD,
            "priority": ConsignmentPriority.HIGH,
            "status": ConsignmentStatus.IN_TRANSIT,
            "weight_tons": 18.0,
            "origin_name": "Siliguri Food Corporation Depot",
            "origin_lat": 26.7271, "origin_lng": 88.3953,
            "destination_name": "Gangtok Food Distribution Warehouse",
            "destination_lat": 27.3389, "destination_lng": 88.6065,
            "assigned_vehicle_id": "SK-01-EA-1092",
            "planned_distance_km": 114.0,
            "estimated_duration_hours": 4.5,
            "expected_delivery_time": datetime.now(timezone.utc) + timedelta(hours=2)
        },
        {
            "id": "CNS-NER-2026-083",
            "title": "Structural Bridge Girder Components",
            "cargo_type": CargoType.CONSTRUCTION,
            "priority": ConsignmentPriority.MEDIUM,
            "status": ConsignmentStatus.DELAYED,
            "weight_tons": 24.5,
            "origin_name": "Dimapur Railway Freight Yard",
            "origin_lat": 25.9068, "origin_lng": 93.7273,
            "destination_name": "Imphal Highway Expansion Project Base",
            "destination_lat": 24.8170, "destination_lng": 93.9368,
            "assigned_vehicle_id": "NL-07-C-7744",
            "planned_distance_km": 204.0,
            "estimated_duration_hours": 6.5,
            "expected_delivery_time": datetime.now(timezone.utc) - timedelta(hours=1)
        }
    ]
    for c in consignments:
        db.add(Consignment(**c))
    db.commit()

    # 10. SEED ALERTS
    alerts = [
        {
            "id": "ALT-2026-001",
            "title": "NH-29 Complete Road Closure: Landslide at Mile 14",
            "message": "NH-29 between Chumukedima and Kohima is strictly CLOSED for all vehicular traffic due to massive rockfall. Divert to Niuland-Kohima bypass.",
            "severity": AlertSeverity.CRITICAL,
            "category": AlertCategory.ROAD_CLOSURE,
            "state": "Nagaland",
            "district": "Kohima",
            "road_segment_id": "NER-RD-NH29-02",
            "recommended_action": "Avoid NH-29 corridor. Take Niuland State Route SH-08.",
            "source": "Nagaland State Disaster Management Authority (NSDMA)",
            "is_active": True, "is_verified": True
        },
        {
            "id": "ALT-2026-002",
            "title": "High Landslide Risk Warning: NH-10 Teesta Corridor",
            "message": "Heavy 24h rainfall (140mm) predicted over Darjeeling-Sikkim foothills. Soil saturation at 82%. Travel after sunset discouraged.",
            "severity": AlertSeverity.WARNING,
            "category": AlertCategory.HIGH_RISK,
            "state": "Sikkim",
            "district": "Gangtok",
            "road_segment_id": "NER-RD-NH10-01",
            "recommended_action": "Heavy multi-axle freight vehicles to halt at Melli checkpost.",
            "source": "IMD Gangtok Regional Meteorological Centre",
            "is_active": True, "is_verified": True
        },
        {
            "id": "ALT-2026-003",
            "title": "Vehicle Stoppage Alert: Consignment CNS-NER-2026-083",
            "message": "Vehicle NL-07-C-7744 carrying construction materials has been stationary for 75+ mins near Chumukedima approach.",
            "severity": AlertSeverity.DANGER,
            "category": AlertCategory.VEHICLE_DELAY,
            "state": "Nagaland",
            "district": "Dimapur",
            "road_segment_id": "NER-RD-NH29-02",
            "recommended_action": "Contact driver Kevi Sema (+91-9436123456) and reroute via SH-08.",
            "source": "AI Fleet Telemetry Anomaly Detector",
            "is_active": True, "is_verified": True
        }
    ]
    for a in alerts:
        db.add(Alert(**a))
    db.commit()

    # 11. AUDIT LOG INITIAL SEED
    db.add(AuditLog(
        user_email="system",
        action="SYSTEM_INITIALIZATION",
        resource_type="System",
        resource_id="NER-INIT",
        details="Platform database populated with 8 NER states, transit corridors, and operational baseline."
    ))
    db.commit()

    print("Database seeding completed successfully!")
    db.close()

if __name__ == "__main__":
    init_db()

