"use client";
import React, { useState } from "react";
import { observer } from "mobx-react-lite";
import { Navbar, NumericInput, Alignment } from "@blueprintjs/core";
import ColorPicker from "polotno/toolbar/color-picker";
import { unstable_registerToolbarComponent } from "polotno/config";

const TableToolbar = observer(({ store }: { store: any }) => {
  const element = store.selectedElements[0];

  const [showRowOperations, setShowRowOperations] = useState(false);
  const [showColumnOperations, setShowColumnOperations] = useState(false);
  const [selectedRowForOps, setSelectedRowForOps] = useState<number | null>(
    null
  );
  const [selectedColForOps, setSelectedColForOps] = useState<number | null>(
    null
  );

  // Get the first selected cell for reference
  const getSelectedCellIndices = (): [number, number] | null => {
    if (element?.selectedCells?.length === 0) return null;

    const cell = element?.selectedCells?.[0];
    if (!cell || !cell.includes(",")) return null;

    const [row, col] = cell.split(",").map(Number);
    return [row, col];
  };

  // Get unique rows and columns from selected cells
  const getSelectedRowsAndCols = () => {
    const rows = new Set<number>();
    const cols = new Set<number>();

    element.selectedCells.forEach((cell: string) => {
      const [row, col] = cell.split(",").map(Number);
      rows.add(row);
      cols.add(col);
    });

    return {
      rows: Array.from(rows).sort((a, b) => a - b),
      cols: Array.from(cols).sort((a, b) => a - b),
    };
  };

  // General table structure operations
  const handleAddRow = () => {
    element.addRow();
  };

  const handleRemoveRow = () => {
    const { rows } = getSelectedRowsAndCols();
    if (rows.length > 0) {
      // Remove from bottom to top to avoid index shifting issues
      [...rows].reverse().forEach((rowIndex) => {
        element.removeRow(rowIndex);
      });
    }
  };

  const handleAddColumn = () => {
    element.addColumn();
  };

  const handleRemoveColumn = () => {
    const { cols } = getSelectedRowsAndCols();
    if (cols.length > 0) {
      // Remove from right to left to avoid index shifting issues
      [...cols].reverse().forEach((colIndex) => {
        element.removeColumn(colIndex);
      });
    }
  };

  // Position-specific operations
  const handleInsertRowAbove = (rowIndex: number) => {
    element.addRow(rowIndex);
    setShowRowOperations(false);
  };

  const handleInsertRowBelow = (rowIndex: number) => {
    element.addRow(rowIndex + 1);
    setShowRowOperations(false);
  };

  const handleDeleteRow = (rowIndex: number) => {
    element.removeRow(rowIndex);
    setShowRowOperations(false);
  };

  const handleInsertColumnLeft = (colIndex: number) => {
    element.addColumn(colIndex);
    setShowColumnOperations(false);
  };

  const handleInsertColumnRight = (colIndex: number) => {
    element.addColumn(colIndex + 1);
    setShowColumnOperations(false);
  };

  const handleDeleteColumn = (colIndex: number) => {
    element.removeColumn(colIndex);
    setShowColumnOperations(false);
  };

  // Cell formatting operations
  const handleCellBackgroundChange = (color: string) => {
    element.setStyleForSelectedCells({ backgroundColor: color });
  };

  const handleTextColorChange = (color: string) => {
    element.setStyleForSelectedCells({ textColor: color });
  };

  const handleCellPaddingChange = (padding: number) => {
    element.set({ cellPadding: padding });
  };

  const handleBorderWidthChange = (width: number) => {
    element.set({ borderWidth: width });
  };

  const handleBorderColorChange = (color: string) => {
    element.set({ borderColor: color });
  };

  // Text formatting operations
  const handleTextBold = () => {
    const selectedIndices = getSelectedCellIndices();
    if (!selectedIndices) return;

    const [row, col] = selectedIndices;
    const currentStyle = element.getCellStyle(row, col);
    const isBold = currentStyle.fontWeight === "bold";

    element.setStyleForSelectedCells({
      fontWeight: isBold ? "normal" : "bold",
    });
  };

  const handleTextItalic = () => {
    const selectedIndices = getSelectedCellIndices();
    if (!selectedIndices) return;

    const [row, col] = selectedIndices;
    const currentStyle = element.getCellStyle(row, col);
    const isItalic = currentStyle.fontStyle === "italic";

    element.setStyleForSelectedCells({
      fontStyle: isItalic ? "normal" : "italic",
    });
  };

  const handleTextUnderline = () => {
    const selectedIndices = getSelectedCellIndices();
    if (!selectedIndices) return;

    const [row, col] = selectedIndices;
    const currentStyle = element.getCellStyle(row, col);
    const isUnderlined = currentStyle.textDecoration === "underline";

    element.setStyleForSelectedCells({
      textDecoration: isUnderlined ? "none" : "underline",
    });
  };

  const handleTextAlign = (align: "left" | "center" | "right") => {
    element.setStyleForSelectedCells({
      textAlign: align,
    });
  };

  const handleFontSizeChange = (size: number) => {
    element.setStyleForSelectedCells({
      fontSize: size,
    });
  };

  // Helper to determine if a style is active
  const isStyleActive = (styleKey: string, value: string): boolean => {
    const selectedIndices = getSelectedCellIndices();
    if (!selectedIndices) return false;

    const [row, col] = selectedIndices;
    const style = element.getCellStyle(row, col);
    return style[styleKey] === value;
  };

  // Determine if the cell has a specific style applied
  const isBold = isStyleActive("fontWeight", "bold");
  const isItalic = isStyleActive("fontStyle", "italic");
  const isUnderlined = isStyleActive("textDecoration", "underline");

  // Get active text alignment
  const getTextAlign = (): "left" | "center" | "right" => {
    const selectedIndices = getSelectedCellIndices();
    if (!selectedIndices) return "left";

    const [row, col] = selectedIndices;
    const style = element.getCellStyle(row, col);
    return (style.textAlign as "left" | "center" | "right") || "left";
  };

  // Get the font size
  const getFontSize = (): number => {
    const selectedIndices = getSelectedCellIndices();
    if (!selectedIndices) return 14;

    const [row, col] = selectedIndices;
    const style = element.getCellStyle(row, col);
    return style.fontSize || 14;
  };

  // Get the text color
  const getTextColor = (): string => {
    const selectedIndices = getSelectedCellIndices();
    if (!selectedIndices) return "#000000";

    const [row, col] = selectedIndices;
    const style = element.getCellStyle(row, col);
    return style.textColor || "#000000";
  };

  // Get cell background color
  const getCellBackgroundColor = (): string => {
    const selectedIndices = getSelectedCellIndices();
    if (!selectedIndices) return "#ffffff";

    const [row, col] = selectedIndices;
    const style = element.getCellStyle(row, col);
    return style.backgroundColor || "#ffffff";
  };

  console.log("element", element);

  return (
    <div>
      <div className="pb-2 border-b border-gray-200">
        <div className="text-sm font-medium text-gray-700">Table Editor</div>
      </div>

      {/* Table Structure Controls */}
      <div className="bg-gray-50 p-3 rounded-lg">
        <h3 className="text-xs uppercase text-gray-500 font-medium mb-2">
          Table Structure
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Rows</span>
            <div className="flex items-center">
              <button
                className="w-8 h-8 rounded bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100"
                onClick={handleRemoveRow}
                disabled={element.rows <= 1}
              >
                <i className="fas fa-minus text-xs"></i>
              </button>
              <span className="w-8 text-center font-mono text-sm">
                {element.rows}
              </span>
              <button
                className="w-8 h-8 rounded bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100"
                onClick={handleAddRow}
              >
                <i className="fas fa-plus text-xs"></i>
              </button>
              <button
                className="ml-2 w-8 h-8 rounded bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100"
                onClick={() => {
                  const indices = getSelectedCellIndices();
                  if (indices) {
                    setSelectedRowForOps(indices[0]);
                    setShowRowOperations(true);
                    setShowColumnOperations(false);
                  }
                }}
              >
                <i className="fas fa-ellipsis-h text-xs"></i>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Columns</span>
            <div className="flex items-center">
              <button
                className="w-8 h-8 rounded bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100"
                onClick={handleRemoveColumn}
                disabled={element.columns <= 1}
              >
                <i className="fas fa-minus text-xs"></i>
              </button>
              <span className="w-8 text-center font-mono text-sm">
                {element.columns}
              </span>
              <button
                className="w-8 h-8 rounded bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100"
                onClick={handleAddColumn}
              >
                <i className="fas fa-plus text-xs"></i>
              </button>
              <button
                className="ml-2 w-8 h-8 rounded bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100"
                onClick={() => {
                  const indices = getSelectedCellIndices();
                  if (indices) {
                    setSelectedColForOps(indices[1]);
                    setShowColumnOperations(true);
                    setShowRowOperations(false);
                  }
                }}
              >
                <i className="fas fa-ellipsis-h text-xs"></i>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Header Row</span>
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                className="form-checkbox h-4 w-4 text-primary rounded"
                checked={element.headerRow}
                onChange={(e) => element.set({ headerRow: e.target.checked })}
              />
            </label>
          </div>
        </div>
      </div>

      {/* Cell Styling Controls */}
      <div className="bg-gray-50 p-3 rounded-lg">
        <h3 className="text-xs uppercase text-gray-500 font-medium mb-2">
          Cell Styling
        </h3>
        {element.selectedCells.length > 0 && (
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-700 block mb-1">
                Cell Background
              </label>
              <div className="flex items-center space-x-2">
                <div
                  className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
                  style={{
                    backgroundColor:
                      element.selectedCells.length === 1
                        ? element.cellBackgrounds?.[element.selectedCells[0]] ||
                          "#ffffff"
                        : "#ffffff",
                  }}
                  onClick={() => {
                    const newBackgrounds = { ...element.cellBackgrounds };
                    element.selectedCells.forEach((cellKey: any) => {
                      newBackgrounds[cellKey] =
                        element.selectedCells.length === 1
                          ? undefined
                          : "#ffffff";
                    });
                    element.set({ cellBackgrounds: newBackgrounds });
                  }}
                />
                <ColorPicker
                  value={
                    element.selectedCells.length === 1
                      ? element.cellBackgrounds?.[element.selectedCells[0]] ||
                        "#ffffff"
                      : "#ffffff"
                  }
                  onChange={(color) => {
                    const newBackgrounds = { ...element.cellBackgrounds };
                    element.selectedCells.forEach((cellKey: any) => {
                      newBackgrounds[cellKey] = color;
                    });
                    element.set({ cellBackgrounds: newBackgrounds });
                  }}
                  store={store}
                />
              </div>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <div>
            <label className="text-sm text-gray-700 block mb-1">
              Cell Background
            </label>
            <div className="flex items-center space-x-2">
              <div
                className="w-8 h-8 rounded border border-gray-300"
                style={{ backgroundColor: getCellBackgroundColor() }}
              ></div>
              <ColorPicker
                value={getCellBackgroundColor()}
                onChange={handleCellBackgroundChange}
                store={store}
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-700 block mb-1">
              Cell Padding
            </label>
            <div className="flex items-center">
              <input
                type="range"
                min="0"
                max="20"
                value={element.cellPadding}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                onChange={(e) =>
                  handleCellPaddingChange(parseInt(e.target.value))
                }
              />
              <span className="w-10 text-center font-mono text-sm ml-2">
                {element.cellPadding}px
              </span>
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-700 block mb-1">
              Border Width
            </label>
            <div className="flex items-center">
              <input
                type="range"
                min="0"
                max="5"
                value={element.borderWidth}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                onChange={(e) =>
                  handleBorderWidthChange(parseInt(e.target.value))
                }
              />
              <span className="w-10 text-center font-mono text-sm ml-2">
                {element.borderWidth}px
              </span>
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-700 block mb-1">
              Border Color
            </label>
            <div className="flex items-center space-x-2">
              <div
                className="w-8 h-8 rounded border border-gray-300"
                style={{ backgroundColor: element.borderColor }}
              ></div>
              <ColorPicker
                value={element.borderColor}
                onChange={handleBorderColorChange}
                store={store}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Text Formatting Controls */}
      <div className="bg-gray-50 p-3 rounded-lg">
        <h3 className="text-xs uppercase text-gray-500 font-medium mb-2">
          Text Formatting
        </h3>

        <div className="space-y-3">
          <div className="flex space-x-1">
            <button
              className={`flex-1 flex items-center justify-center p-2 rounded ${
                isBold
                  ? "bg-primary text-white"
                  : "bg-white border border-gray-200 hover:bg-gray-100"
              }`}
              onClick={handleTextBold}
            >
              <i className="fas fa-bold"></i> Bold
            </button>
            <button
              className={`flex-1 flex items-center justify-center p-2 rounded ${
                isItalic
                  ? "bg-primary text-white"
                  : "bg-white border border-gray-200 hover:bg-gray-100"
              }`}
              onClick={handleTextItalic}
            >
              <i className="fas fa-italic"></i> Italic
            </button>
            <button
              className={`flex-1 flex items-center justify-center p-2 rounded ${
                isUnderlined
                  ? "bg-primary text-white"
                  : "bg-white border border-gray-200 hover:bg-gray-100"
              }`}
              onClick={handleTextUnderline}
            >
              <i className="fas fa-underline"></i> Underline
            </button>
          </div>

          <div>
            <label className="text-sm text-gray-700 block mb-1">
              Text Alignment
            </label>
            <div className="flex space-x-1">
              <button
                className={`flex-1 flex items-center justify-center p-2 rounded ${
                  getTextAlign() === "left"
                    ? "bg-primary text-white"
                    : "bg-white border border-gray-200 hover:bg-gray-100"
                }`}
                onClick={() => handleTextAlign("left")}
              >
                <i className="fas fa-align-left"></i> Align Left
              </button>
              <button
                className={`flex-1 flex items-center justify-center p-2 rounded ${
                  getTextAlign() === "center"
                    ? "bg-primary text-white"
                    : "bg-white border border-gray-200 hover:bg-gray-100"
                }`}
                onClick={() => handleTextAlign("center")}
              >
                <i className="fas fa-align-center"></i> Align Center
              </button>
              <button
                className={`flex-1 flex items-center justify-center p-2 rounded ${
                  getTextAlign() === "right"
                    ? "bg-primary text-white"
                    : "bg-white border border-gray-200 hover:bg-gray-100"
                }`}
                onClick={() => handleTextAlign("right")}
              >
                <i className="fas fa-align-right"></i> Align Right
              </button>
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-700 block mb-1">
              Font Size
            </label>
            <div className="flex items-center">
              <input
                type="range"
                min="8"
                max="40"
                value={getFontSize()}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                onChange={(e) => handleFontSizeChange(parseInt(e.target.value))}
              />
              <span className="w-12 text-center font-mono text-sm ml-2">
                {getFontSize()}px
              </span>
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-700 block mb-1">
              Text Color
            </label>
            <div className="flex items-center space-x-2">
              <div
                className="w-8 h-8 rounded border border-gray-300"
                style={{ backgroundColor: getTextColor() }}
              ></div>
              <ColorPicker
                value={getTextColor()}
                onChange={handleTextColorChange}
                store={store}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Row Operations Popover */}
      {showRowOperations && selectedRowForOps !== null && (
        <div className="absolute top-0 right-full mr-2 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
          <div className="p-2 border-b border-gray-200">
            <div className="text-xs text-gray-500 font-medium">
              Row Operations
            </div>
          </div>
          <div className="p-1.5">
            <button
              className="flex items-center space-x-2 w-full text-left px-2 py-1.5 text-sm hover:bg-gray-100 rounded"
              onClick={() => handleInsertRowAbove(selectedRowForOps)}
            >
              <i className="fas fa-arrow-up text-gray-600"></i>
              <span>Insert Above</span>
            </button>
            <button
              className="flex items-center space-x-2 w-full text-left px-2 py-1.5 text-sm hover:bg-gray-100 rounded"
              onClick={() => handleInsertRowBelow(selectedRowForOps)}
            >
              <i className="fas fa-arrow-down text-gray-600"></i>
              <span>Insert Below</span>
            </button>
            <button
              className="flex items-center space-x-2 w-full text-left px-2 py-1.5 text-sm hover:bg-gray-100 rounded text-red-600"
              onClick={() => handleDeleteRow(selectedRowForOps)}
              disabled={element.rows <= 1}
            >
              <i className="fas fa-trash-alt"></i>
              <span>Delete Row</span>
            </button>
          </div>
        </div>
      )}

      {/* Column Operations Popover */}
      {showColumnOperations && selectedColForOps !== null && (
        <div className="absolute top-0 right-full mr-2 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
          <div className="p-2 border-b border-gray-200">
            <div className="text-xs text-gray-500 font-medium">
              Column Operations
            </div>
          </div>
          <div className="p-1.5">
            <button
              className="flex items-center space-x-2 w-full text-left px-2 py-1.5 text-sm hover:bg-gray-100 rounded"
              onClick={() => handleInsertColumnLeft(selectedColForOps)}
            >
              <i className="fas fa-arrow-left text-gray-600"></i>
              <span>Insert Left</span>
            </button>
            <button
              className="flex items-center space-x-2 w-full text-left px-2 py-1.5 text-sm hover:bg-gray-100 rounded"
              onClick={() => handleInsertColumnRight(selectedColForOps)}
            >
              <i className="fas fa-arrow-right text-gray-600"></i>
              <span>Insert Right</span>
            </button>
            <button
              className="flex items-center space-x-2 w-full text-left px-2 py-1.5 text-sm hover:bg-gray-100 rounded text-red-600"
              onClick={() => handleDeleteColumn(selectedColForOps)}
              disabled={element.columns <= 1}
            >
              <i className="fas fa-trash-alt"></i>
              <span>Delete Column</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
});

export default TableToolbar;

// unstable_registerToolbarComponent("table", TableToolbar);
