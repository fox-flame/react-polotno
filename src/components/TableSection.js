"use client";
import React from "react";
import { observer } from "mobx-react-lite";
import { SectionTab } from "polotno/side-panel";
import { Button } from "@blueprintjs/core";
import FaTable from "@meronex/icons/fa/FaTable";
import { handleAddTable } from "./create-table-element";
import TableToolbar from "./polotno-table/TableToolbar";

// define the new custom section
export const TableSection = {
  name: "table",
  Tab: (props) => (
    <SectionTab name="Table" {...props}>
      <FaTable />
    </SectionTab>
  ),
  // we need observer to update component automatically on any store changes
  Panel: observer(({ store }) => {
    const element = store.selectedElements[0];

    return (
      <div style={{ height: "100%", overflow: "auto" }}>
        <Button
          fill
          onClick={() => {
            handleAddTable(store);
          }}
        >
          Create table
        </Button>

        {element && element.type === "table" && element.custom.isTable && (
          <TableToolbar element={element} store={store} />
        )}
      </div>
    );
  }),
};
