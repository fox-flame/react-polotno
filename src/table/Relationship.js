import React from "react";

export default function Relationship({ value, backgroundColor }) {
  return (
    <div
      style={{
        backgroundColor,
        borderRadius: 4,
        padding: "2px 8px",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "12px",
        color: "#333",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        maxWidth: "100%"
      }}
    >
      {value}
    </div>
  );
}
