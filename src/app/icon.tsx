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
          <path
            d="M8 22C4 16 7 7 15 6C23 5 28 11 26 18C24 25 15 27 10 24"
            stroke="#590907"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <path
            d="M10 24C12 21 15 17 21 16C26 15 27 9 22 7"
            stroke="#E8D2B5"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <circle cx="21" cy="16" r="3" fill="#E8D2B5" />
          <circle cx="21" cy="16" r="1.5" fill="#590907" />
          <circle cx="8" cy="22" r="2.5" fill="#A5A79B" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
