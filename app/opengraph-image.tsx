import { ImageResponse } from "next/og";

export const alt = "Plant Care : suivi d'arrosage intelligent de vos plantes";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 96,
          background: "#f6efe2",
          color: "#3a2f24",
        }}
      >
        <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="#5f6c30" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
          <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
        </svg>
        <div style={{ fontSize: 96, fontWeight: 700, color: "#6a4c93", marginTop: 24 }}>Plant Care</div>
        <div style={{ fontSize: 44, marginTop: 16 }}>Arrosage intelligent, adapté à la météo et aux saisons</div>
      </div>
    ),
    size,
  );
}
