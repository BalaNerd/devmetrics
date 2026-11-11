import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "transparent",
        }}
      >
        <svg
          width="32"
          height="32"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Step 1: Base Anchor */}
          <rect
            x="5"
            y="18"
            width="5.5"
            height="10"
            rx="2.5"
            fill="#A5A79B"
            fillOpacity="0.85"
          />
          {/* Step 2: Dominant Telemetry Pillar */}
          <rect
            x="13.5"
            y="4"
            width="5.5"
            height="24"
            rx="2.75"
            fill="#E8D2B5"
          />
          {/* Step 3: Velocity Branch with Accent Pip */}
          <rect
            x="22"
            y="11"
            width="5.5"
            height="17"
            rx="2.75"
            fill="#590907"
          />
          <circle cx="24.75" cy="14" r="1.5" fill="#E8D2B5" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
