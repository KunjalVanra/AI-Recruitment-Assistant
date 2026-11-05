import React from "react";

function Card({
  title,
  subtitle,
  children,
  action,
  className = "",
  style = {},
  padding = true,
  hoverable = false,
}) {
  return (
    <div
      className={`card ${hoverable ? "card-hoverable" : ""} ${className}`}
      style={{
        ...style,
      }}
    >
      {(title || action) && (
        <div
          style={{
            padding: "18px 24px",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            {title && (
              <h3 style={{ fontSize: "16px", fontWeight: 700, margin: 0, color: "var(--text-main)" }}>
                {title}
              </h3>
            )}
            {subtitle && (
              <p style={{ fontSize: "12.5px", color: "var(--text-muted)", margin: "3px 0 0" }}>
                {subtitle}
              </p>
            )}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div style={{ padding: padding ? "24px" : 0 }}>
        {children}
      </div>
    </div>
  );
}

export default Card;
