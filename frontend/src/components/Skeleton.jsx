import React from "react";

function Skeleton({
  width = "100%",
  height = "20px",
  borderRadius = "6px",
  style = {},
  className = "",
}) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{
        width,
        height,
        borderRadius,
        ...style,
      }}
    />
  );
}

export function TableSkeleton({ rows = 5, columns = 4 }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "16px" }}>
      {Array.from({ length: rows }).map((_, rIdx) => (
        <div key={rIdx} style={{ display: "flex", gap: "16px" }}>
          {Array.from({ length: columns }).map((_, cIdx) => (
            <Skeleton
              key={cIdx}
              height="24px"
              width={cIdx === 0 ? "80px" : "100%"}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="card card-padding" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      <Skeleton width="40%" height="18px" />
      <Skeleton width="70%" height="32px" />
      <Skeleton width="90%" height="14px" />
    </div>
  );
}

export default Skeleton;
