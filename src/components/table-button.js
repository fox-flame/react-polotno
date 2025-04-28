"use client";
import React, { useRef, useState } from "react";
import { Button, Dialog, DialogBody } from "@blueprintjs/core";
import { getTableURL } from "./table-to-svg";
import TanStackTable from './tanstack-table';

// Default data and columns
const defaultData = [
  { id: 1, name: 'John Doe', age: 30, email: 'john@example.com' },
  { id: 2, name: 'Jane Smith', age: 25, email: 'jane@example.com' },
  { id: 3, name: 'Bob Johnson', age: 35, email: 'bob@example.com' },
];

const defaultColumns = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'age',
    header: 'Age',
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
];

export const SvgTableButton = ({ store, element }) => {
  const [isOpen, setIsOpen] = useState(false);

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

  const handleOpen = () => {
    // Initialize data if it doesn't exist
    if (!element.custom?.state?.data) {
      element.set({
        custom: {
          ...element.custom,
          state: {
            ...element.custom?.state,
            data: defaultData,
            columns: defaultColumns,
            headerColor: element.custom?.state?.headerColor || "#e6f7ff",
            rowColors: element.custom?.state?.rowColors || {},
            columnColors: element.custom?.state?.columnColors || {},
            cellColors: element.custom?.state?.cellColors || {}
          }
        }
      });
    }
    setIsOpen(true);
  };

  return (
    <>
      <Button
        onClick={handleOpen}
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
          <TanStackTable
            data={element.custom?.state?.data || defaultData}
            columns={element.custom?.state?.columns || defaultColumns}
            headerColor={element.custom?.state?.headerColor || "#e6f7ff"}
            rowColors={element.custom?.state?.rowColors || {}}
            columnColors={element.custom?.state?.columnColors || {}}
            cellColors={element.custom?.state?.cellColors || {}}
            onChange={(state) => {
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
