"use client";
import React from "react";
import { observer } from "mobx-react-lite";
import { SectionTab } from "polotno/side-panel";
import { Button } from "@blueprintjs/core";
import FaTable from "@meronex/icons/fa/FaTable";
import { createTableElement, handleAddTable } from "./create-table-element";

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
      </div>
    );
  }),
};
