import React from "react";

function Button({
  children,
  variant = "primary", // primary, secondary, outline, danger, danger-outline
  size = "md", // sm, md, lg
  icon: Icon,
  iconPosition = "left",
  loading = false,
  disabled = false,
  className = "",
  style = {},
  onClick,
  type = "button",
  ...props
}) {
  const variantClass = `btn-${variant}`;
  const sizeClass = size === "sm" ? "btn-sm" : size === "lg" ? "btn-lg" : "";

  return (
    <button
      type={type}
      className={`btn ${variantClass} ${sizeClass} ${className}`}
      disabled={disabled || loading}
      onClick={onClick}
      style={style}
      {...props}
    >
      {loading && (
        <span
          style={{
            width: "14px",
            height: "14px",
            border: "2px solid currentColor",
            borderRightColor: "transparent",
            borderRadius: "50%",
            display: "inline-block",
            animation: "spin 0.6s linear infinite",
          }}
        />
      )}
      {!loading && Icon && iconPosition === "left" && <Icon size={size === "sm" ? 14 : 16} />}
      <span>{children}</span>
      {!loading && Icon && iconPosition === "right" && <Icon size={size === "sm" ? 14 : 16} />}
    </button>
  );
}

export default Button;
