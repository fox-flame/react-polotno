"use client";
import { unstable_registerShapeModel } from "polotno/config";
import { reaction } from "mobx";
import { types } from "mobx-state-tree";

// Define types for cell styles
interface CellStyle {
  backgroundColor?: string;
  textColor?: string;
  fontWeight?: "normal" | "bold";
  fontStyle?: "normal" | "italic";
  textDecoration?: "none" | "underline";
  textAlign?: "left" | "center" | "right";
  fontSize?: number;
}

// Interface for cell styles object
interface CellStyles {
  [key: string]: CellStyle;
}

// Register the model with Polotno first with simple props
unstable_registerShapeModel(
  // Model definition
  {
    type: "table",
    rotation: 0,
    opacity: 1,
    rows: 3,
    columns: 4,
    cellPadding: 8,
    borderWidth: 1,
    borderColor: "#dddddd",
    headerRow: true,
    data: types.frozen([
      ["Header 1", "Header 2", "Header 3", "Header 4"],
      ["Cell 1,1", "Cell 1,2", "Cell 1,3", "Cell 1,4"],
      ["Cell 2,1", "Cell 2,2", "Cell 2,3", "Cell 2,4"],
    ]),
    cellStyles: types.frozen({}),
    selectedCells: types.frozen([]),
    columnWidths: types.frozen([]),
    rowHeights: types.frozen([]),
    cellBackgrounds: types.frozen({}),
  },
  // Extend function
  (self: any) => {
    return self.actions((tableModel: any) => {
      // Setup reactions
      reaction(
        () => [tableModel.rows, tableModel.columns],
        ([rows, columns]) => {
          let newData = [...tableModel.data];

          // Ensure we have enough rows
          while (newData.length < rows) {
            newData.push(Array(columns).fill(""));
          }

          // Truncate extra rows
          if (newData.length > rows) {
            newData = newData.slice(0, rows);
          }

          // Ensure each row has the correct number of columns
          newData = newData.map((row) => {
            let newRow = [...row];

            // Ensure we have enough columns
            while (newRow.length < columns) {
              newRow.push("");
            }

            // Truncate extra columns
            if (newRow.length > columns) {
              newRow = newRow.slice(0, columns);
            }

            return newRow;
          });

          tableModel.data = newData;
        }
      );

      return {
        // Get text data for a specific cell
        getText(row: number, col: number): string {
          if (!tableModel.data[row] || !tableModel.data[row][col]) {
            return "";
          }
          return tableModel.data[row][col];
        },

        // Set text data for a specific cell
        setText(row: number, col: number, text: string) {
          const newData = [...tableModel.data];

          // Ensure the row exists
          if (!newData[row]) {
            while (newData.length <= row) {
              const newRow = Array(tableModel.columns).fill("");
              newData.push(newRow);
            }
          }

          // Ensure the column exists in that row
          if (!newData[row][col] && col < tableModel.columns) {
            newData[row] = [...newData[row]];
            while (newData[row].length <= col) {
              newData[row].push("");
            }
          }

          // Update the cell text
          if (newData[row] && col < tableModel.columns) {
            newData[row][col] = text;
            tableModel.data = newData;
          }
        },

        // Get style for a specific cell
        getCellStyle(row: number, col: number): CellStyle {
          const key = `${row},${col}`;
          return (tableModel.cellStyles as CellStyles)[key] || {};
        },

        // Set style for a specific cell
        setCellStyle(row: number, col: number, style: CellStyle) {
          const key = `${row},${col}`;
          const newStyles = { ...(tableModel.cellStyles as CellStyles) };
          newStyles[key] = { ...(newStyles[key] || {}), ...style };
          tableModel.cellStyles = newStyles;
        },

        // Set style for multiple cells
        setStyleForSelectedCells(style: CellStyle) {
          const newStyles = { ...(tableModel.cellStyles as CellStyles) };

          (tableModel.selectedCells as string[]).forEach((cellKey: string) => {
            newStyles[cellKey] = { ...(newStyles[cellKey] || {}), ...style };
          });

          tableModel.cellStyles = newStyles;
        },

        // Add a row to the table
        addRow(atIndex?: number) {
          const newData = [...tableModel.data];
          const newRow = Array(tableModel.columns).fill("");

          if (
            atIndex !== undefined &&
            atIndex >= 0 &&
            atIndex <= newData.length
          ) {
            newData.splice(atIndex, 0, newRow);
          } else {
            newData.push(newRow);
          }

          tableModel.data = newData;
          tableModel.rows += 1;
        },

        // Add a column to the table
        addColumn(atIndex?: number) {
          const newData = tableModel.data.map((row: any) => {
            const newRow = [...row];
            if (
              atIndex !== undefined &&
              atIndex >= 0 &&
              atIndex <= newRow.length
            ) {
              newRow.splice(atIndex, 0, "");
            } else {
              newRow.push("");
            }
            return newRow;
          });

          tableModel.data = newData;
          tableModel.columns += 1;
        },

        // Remove a row from the table
        removeRow(index: number) {
          if (
            index < 0 ||
            index >= tableModel.data.length ||
            tableModel.rows <= 1
          ) {
            return;
          }

          const newData = [...tableModel.data];
          newData.splice(index, 1);

          // Clear selected cells
          tableModel.data = newData;
          tableModel.rows -= 1;
          tableModel.selectedCells = [];
        },

        // Remove a column from the table
        removeColumn(index: number) {
          if (
            index < 0 ||
            index >= tableModel.columns ||
            tableModel.columns <= 1
          ) {
            return;
          }

          const newData = tableModel.data.map((row: any) => {
            const newRow = [...row];
            newRow.splice(index, 1);
            return newRow;
          });

          // Clear selected cells
          tableModel.data = newData;
          tableModel.columns -= 1;
          tableModel.selectedCells = [];
        },

        // Select a cell
        selectCell(row: number, col: number, multiSelect = false) {
          const cellKey = `${row},${col}`;

          if (!multiSelect) {
            tableModel.selectedCells = [cellKey];
          } else {
            const currentSelection = [
              ...(tableModel.selectedCells as string[]),
            ];
            const index = currentSelection.indexOf(cellKey);

            if (index === -1) {
              currentSelection.push(cellKey);
            } else {
              currentSelection.splice(index, 1);
            }

            tableModel.selectedCells = currentSelection;
          }
        },

        // Clear cell selection
        clearSelection() {
          tableModel.selectedCells = [];
        },
      };
    });
  }
);
