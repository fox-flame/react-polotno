"use client";
import React from "react";
import { observer } from "mobx-react-lite";
import { SectionTab } from "polotno/side-panel";
import FaTable from "@meronex/icons/fa/FaTable";
import { handleAddTemplateTable, tableTemplates } from "./index";
import { TableToolbar } from "./polotno-table/TableToolbar";

export const TableSection = {
  name: "table",
  Tab: (props: any) => (
    <SectionTab name="Table" {...props}>
      <FaTable />
    </SectionTab>
  ),
  Panel: observer(({ store }: { store: any }) => {
    const element = store.selectedElements[0];

    return (
      <div style={{ height: "100%", overflow: "auto" }}>
        {element && element.type === "table" && element.custom.isTable ? (
          <TableToolbar store={store} />
        ) : (
          <div>
            <p style={{ fontWeight: "bold", marginBottom: 5 }}>Table Section</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", // Creates responsive columns
                  gap: 8,
                }}
              >
                {tableTemplates.map((template, index) => (
                  <DraggableTableTemplate
                    key={index}
                    template={template}
                    store={store}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }),
};

// Draggable Table Template Component
const DraggableTableTemplate = observer(
  ({ template, store }: { template: any; store: any }) => {
    return (
      <div
        draggable={true}
        onDragEnd={(e) => {
          e.preventDefault();
          const canvasElement = document.getElementsByTagName("canvas")[0];
          const rect = canvasElement.getBoundingClientRect();
          const x =
            e.clientX - rect.left - (template.width ? template.width : 150);
          const y =
            e.clientY - rect.top - (template.height ? template.height : 100);

          handleAddTemplateTable(store, { x, y, ...template });
        }}
        style={{
          padding: "8px",
          border: "1px solid #ccc",
          borderRadius: "5px",
          cursor: "grab", // Indicate it's draggable
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f9f9f9", // Optional visual feedback
        }}
        onClick={() => handleAddTemplateTable(store, template)} // Still allow click to add
      >
        <div
          style={{
            width: "100%",
            height: "auto",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 5,
          }}
          dangerouslySetInnerHTML={{ __html: template.svgPlaceholder }}
        />
        <p style={{ fontSize: "0.8em", margin: 0 }}>
          {template.rows} x {template.columns}
        </p>
      </div>
    );
  }
);
