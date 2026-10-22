import { ImageResponse } from "next/og";
export const alt =
  "Church of Christ at Red Cross — a church family in Blantyre, Malawi";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default async function Image() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "#faf8f4",
        color: "#29241f",
        padding: "70px 80px",
        fontFamily: "sans-serif",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          right: 0,
          height: 14,
          background: "#743c21",
        }}
      />
      <div
        style={{
          display: "flex",
          fontSize: 22,
          letterSpacing: 5,
          textTransform: "uppercase",
          color: "#743c21",
        }}
      >
        Faith · Fellowship · Service
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          marginTop: 42,
          fontSize: 80,
          lineHeight: 1.1,
          fontWeight: 700,
          maxWidth: 1000,
        }}
      >
        <span>Church of Christ</span>
        <span>at Red Cross</span>
      </div>
      <div
        style={{
          display: "flex",
          marginTop: 32,
          fontSize: 28,
          color: "#6c6257",
        }}
      >
        A church family in Blantyre, Malawi.
      </div>
      <div
        style={{
          display: "flex",
          marginTop: "auto",
          fontSize: 24,
          color: "#743c21",
        }}
      >
        All are welcome. Plan your visit at churchofchrist.mw
      </div>
    </div>,
    {
      ...size,
    },
  );
}
