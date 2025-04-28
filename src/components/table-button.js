"use client";
import React, { useRef } from "react";
import { Button, Dialog, DialogBody } from "@blueprintjs/core";
import { TableEditor } from "../table/TableEditor";
import { getTableURL } from "./table-to-svg";

export const SvgTableButton = ({ store, element }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  React.useEffect(() => {
    if (!element.custom?.isTable) {
      return;
    }
    const { src, ratio } = getTableURL({
      ...element.custom.state,
      headerColor: element.custom.state.headerColor || "#e6f7ff",
      rowColors: element.custom.state.rowColors || {},
      columnColors: element.custom.state.columnColors || {},
      cellColors: element.custom.state.cellColors || {}
    });
    element.set({
      src,
      height: element.width / ratio
    });
  }, [element, element?.custom?.state]);

  if (!element.custom?.isTable) {
    return null;
  }

  return (
    <>
      <Button
        onClick={() => {
          setIsOpen(true);
        }}
        minimal
      >
        Edit table
      </Button>
      <Dialog
        title="Edit table"
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
        }}
      >
        <DialogBody>
          <TableEditor
            data={element.custom?.state.data}
            columns={element.custom?.state.columns}
            headerColor={element.custom?.state.headerColor || "#e6f7ff"}
            rowColors={element.custom?.state.rowColors || {}}
            columnColors={element.custom?.state.columnColors || {}}
            cellColors={element.custom?.state.cellColors || {}}
            onChange={(state) => {
              // Ensure we preserve all styling information
              const updatedState = {
                ...state,
                headerColor: state.headerColor || element.custom.state.headerColor || "#e6f7ff",
                rowColors: state.rowColors || element.custom.state.rowColors || {},
                columnColors: state.columnColors || element.custom.state.columnColors || {},
                cellColors: state.cellColors || element.custom.state.cellColors || {}
              };
              
              element.set({
                custom: {
                  ...element.custom,
                  state: updatedState
                }
              });
            }}
          />
        </DialogBody>
      </Dialog>
    </>
  );
};

export const ImportJSONButton = ({ store, element }) => {
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target.result);
        store.loadJSON(jsonData);
      } catch (error) {
        console.error("Error parsing JSON file:", error);
        alert("Error parsing JSON file. Please make sure it's a valid JSON file.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <>
      <Button 
        onClick={() => {
          fileInputRef.current.click();
        }}
      >
        Import JSON
      </Button>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept=".json"
        onChange={handleFileChange}
      />
    </>
  );
};

export const LoadJSONButton = ({ store, element }) => {
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target.result);
        store.loadJSON(jsonData);
      } catch (error) {
        console.error("Error parsing JSON file:", error);
        alert("Error parsing JSON file. Please make sure it's a valid JSON file.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <>
      <Button 
        onClick={() => {
          fileInputRef.current.click();
        }}
      >
        Load JSON
      </Button>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept=".json"
        onChange={handleFileChange}
      />
    </>
  );
};
