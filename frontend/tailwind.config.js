/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gov: {
          blue: "#0F2942",     // Deep Navy
          light: "#F4F6F9",    // Clean light grey
          border: "#E2E8F0",
          accent: "#1E40AF",   // Royal blue
          success: "#10B981",  // Verified green
          warning: "#F59E0B",  // Amber caution
          danger: "#EF4444",   // Severe/Closed red
        }
      }
    },
  },
  plugins: [],
}

