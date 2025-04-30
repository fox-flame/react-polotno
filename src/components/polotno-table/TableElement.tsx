"use client";
import React, { useRef, useState } from "react";
import { observer } from "mobx-react-lite";
import { Group, Rect, Text, Line } from "react-konva";
import { unstable_registerShapeComponent } from "polotno/config";

import CellEditor from "./CellEditor";

// TableElement component for rendering a table on the canvas
const TableElement = observer(
  ({ element, store }: { element: any; store: any }) => {
    console.log("🚀 ~ element:", element);
    const groupRef = useRef(null);
    const [editingCell, setEditingCell] = useState<string | null>(null);
    const [cellMeasurements, setCellMeasurements] = useState<{
      [key: string]: { width: number; height: number };
    }>({});
    const [hoveredResizer, setHoveredResizer] = useState<{
      type: string;
      index: number;
    } | null>(null);
    const [resizing, setResizing] = useState<{
      type: string;
      index: number;
      startPos: number;
      sizes: number[];
    } | null>(null);

    // Calculate row heights and column widths
    const calculateTableDimensions = () => {
      const { rows, columns, width, height } = element;
      
      // Use stored dimensions or default to equal distribution
      let colWidths = element.columnWidths || Array(columns).fill(width / columns);
      let rowHeights = element.rowHeights || Array(rows).fill(height / rows);

      // Ensure arrays match current dimensions
      if (colWidths.length !== columns) {
        const defaultWidth = width / columns;
        colWidths = Array(columns).fill(defaultWidth);
      }
      if (rowHeights.length !== rows) {
        const defaultHeight = height / rows;
        rowHeights = Array(rows).fill(defaultHeight);
      }

      return { colWidths, rowHeights };
    };

    const { colWidths, rowHeights } = calculateTableDimensions();

    // Update dimensions when resizing
    const updateDimensions = (type: 'column' | 'row', index: number, newSize: number) => {
      const { columnWidths = [...colWidths], rowHeights = [...rowHeights] } = element;
      
      if (type === 'column') {
        columnWidths[index] = Math.max(newSize, 20); // Minimum width of 20px
        element.set({ columnWidths });
      } else {
        rowHeights[index] = Math.max(newSize, 20); // Minimum height of 20px
        element.set({ rowHeights });
      }
    };

    // Handle mousedown on cell
    const handleCellClick = (row: number, col: number, e: any) => {
      // If we're clicking with the shift key, do multi-select
      const multiSelect = e.evt.shiftKey;
      if (element.selectCell) {
        element.selectCell(row, col, multiSelect);
      } else if (element.set) {
        // Fallback if selectCell doesn't exist
        const cellKey = `${row},${col}`;
        if (multiSelect) {
          const currentSelection = [...(element.selectedCells || [])];
          const index = currentSelection.indexOf(cellKey);
          if (index === -1) {
            currentSelection.push(cellKey);
          } else {
            currentSelection.splice(index, 1);
          }
          element.set({ selectedCells: currentSelection });
        } else {
          element.set({ selectedCells: [cellKey] });
        }
      }
      e.cancelBubble = true;
    };

    // Handle double click on cell
    const handleCellDoubleClick = (row: number, col: number, e: any) => {
      setEditingCell(`${row},${col}`);
      e.cancelBubble = true;
    };

    // Handle cell edit completion
    const handleCellEditComplete = (
      row: number,
      col: number,
      newText: string
    ) => {
      if (element.setText) {
        element.setText(row, col, newText);
      } else if (element.set) {
        // Fallback if setText doesn't exist
        const newData = [...(element.data || [])];
        if (newData[row] && col < (element.columns || 0)) {
          newData[row] = [...newData[row]];
          newData[row][col] = newText;
          element.set({ data: newData });
        }
      }
      setEditingCell(null);
    };

    // Handle cell edit cancel
    const handleCellEditCancel = () => {
      setEditingCell(null);
    };

    // Handle mouse down on resizer
    const handleResizerMouseDown = (type: string, index: number, e: any) => {
      console.log("🚀 ~ handleResizerMouseDown ~ type:", type);
      e.cancelBubble = true;

      const startPos = type === "column" ? e.evt.clientX : e.evt.clientY;
      const sizes = type === "column" ? [...colWidths] : [...rowHeights];

      setResizing({
        type,
        index,
        startPos,
        sizes,
      });

      const handleMouseMove = (moveEvt: MouseEvent) => {
        if (!resizing) return;

        const currentPos =
          type === "column" ? moveEvt.clientX : moveEvt.clientY;
        const delta = currentPos - startPos;

        // Update sizes based on the delta
        const newSizes = [...sizes];

        if (type === "column") {
          // Ensure we don't make columns too small
          const minColWidth = 20;
          const maxDelta = newSizes[index] - minColWidth;
          const safetyDelta = delta > 0 ? delta : Math.max(delta, -maxDelta);

          newSizes[index] += safetyDelta;
          if (index < newSizes.length - 1) {
            // If not the last column, take space from the next column
            const nextMaxDelta = newSizes[index + 1] - minColWidth;
            const nextSafetyDelta =
              -safetyDelta > 0
                ? -safetyDelta
                : Math.max(-safetyDelta, -nextMaxDelta);
            newSizes[index + 1] -= safetyDelta;
          }
        } else {
          // Ensure we don't make rows too small
          const minRowHeight = 20;
          const maxDelta = newSizes[index] - minRowHeight;
          const safetyDelta = delta > 0 ? delta : Math.max(delta, -maxDelta);

          newSizes[index] += safetyDelta;
          if (index < newSizes.length - 1) {
            // If not the last row, take space from the next row
            const nextMaxDelta = newSizes[index + 1] - minRowHeight;
            const nextSafetyDelta =
              -safetyDelta > 0
                ? -safetyDelta
                : Math.max(-safetyDelta, -nextMaxDelta);
            newSizes[index + 1] -= safetyDelta;
          }
        }

        // Update the resizing state with the new sizes
        setResizing({
          ...resizing,
          sizes: newSizes,
        });
      };

      const handleMouseUp = () => {
        setResizing(null);
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    };

    // Calculate cell position and dimensions
    const getCellPadding = () => {
      return element.cellPadding || 8; // Default padding of 8px
    };

    const getCellProps = (row: number, col: number) => {
      let x = 0;
      for (let i = 0; i < col; i++) {
        x +=
          resizing && resizing.type === "column"
            ? resizing.sizes[i]
            : colWidths[i];
      }

      let y = 0;
      for (let i = 0; i < row; i++) {
        y +=
          resizing && resizing.type === "row"
            ? resizing.sizes[i]
            : rowHeights[i];
      }

      const width =
        resizing && resizing.type === "column" && col === resizing.index
          ? resizing.sizes[col]
          : colWidths[col];

      const height =
        resizing && resizing.type === "row" && row === resizing.index
          ? resizing.sizes[row]
          : rowHeights[row];

      return { x, y, width, height };
    };

    // Render column resizers
    const renderColumnResizers = () => {
      return colWidths.slice(0, -1).map((width, i) => {
        let x = 0;
        for (let j = 0; j <= i; j++) {
          x +=
            resizing && resizing.type === "column"
              ? resizing.sizes[j]
              : colWidths[j];
        }

        return (
          <Line
            key={`col-resizer-${i}`}
            points={[x, 0, x, element.height]}
            stroke={
              hoveredResizer?.type === "column" && hoveredResizer?.index === i
                ? "#3B82F6"
                : "transparent"
            }
            strokeWidth={5}
            onMouseEnter={() => setHoveredResizer({ type: "column", index: i })}
            onMouseLeave={() => setHoveredResizer(null)}
            onMouseDown={(e) => handleResizerMouseDown("column", i, e)}
            listening={true}
          />
        );
      });
    };

    // Render row resizers
    const renderRowResizers = () => {
      return rowHeights.slice(0, -1).map((height, i) => {
        let y = 0;
        for (let j = 0; j <= i; j++) {
          y +=
            resizing && resizing.type === "row"
              ? resizing.sizes[j]
              : rowHeights[j];
        }

        return (
          <Line
            key={`row-resizer-${i}`}
            points={[0, y, element.width, y]}
            stroke={
              hoveredResizer?.type === "row" && hoveredResizer?.index === i
                ? "#3B82F6"
                : "transparent"
            }
            strokeWidth={5}
            onMouseEnter={() => setHoveredResizer({ type: "row", index: i })}
            onMouseLeave={() => setHoveredResizer(null)}
            onMouseDown={(e) => handleResizerMouseDown("row", i, e)}
            listening={true}
          />
        );
      });
    };

    // Render table cells
    const renderCells = () => {
      const cells = [];
      const {
        data,
        cellPadding,
        borderWidth,
        borderColor,
        headerRow,
        cellStyles,
        selectedCells,
      } = element;

      for (let row = 0; row < element.rows; row++) {
        for (let col = 0; col < element.columns; col++) {
          const { x, y, width, height } = getCellProps(row, col);
          const cellKey = `${row},${col}`;

          // Get text directly from data as a fallback if getText is not available
          const text = element.getText
            ? element.getText(row, col)
            : (element.data && element.data[row] && element.data[row][col]) ||
              "";

          const isHeader = headerRow && row === 0;
          const isSelected = selectedCells && selectedCells.includes(cellKey);

          // Get cell-specific styling
          // Get cell style directly from cellStyles as a fallback if getCellStyle is not available
          const cellStyle = element.getCellStyle
            ? element.getCellStyle(row, col)
            : (element.cellStyles && element.cellStyles[cellKey]) || {};

          const backgroundColor =
            cellStyle.backgroundColor || (isHeader ? "#f3f4f6" : "#ffffff");
          const textColor = cellStyle.textColor || "#000000";
          const fontWeight =
            cellStyle.fontWeight || (isHeader ? "bold" : "normal");
          const fontStyle = cellStyle.fontStyle || "normal";
          const textDecoration = cellStyle.textDecoration || "none";
          const textAlign = cellStyle.textAlign || "left";
          const fontSize = cellStyle.fontSize || 14;

          cells.push(
            <Group key={cellKey} x={x} y={y}>
              <Rect
                width={width}
                height={height}
                fill={element.cellBackgrounds?.[`${row},${col}`] || backgroundColor}
                stroke={borderColor}
                strokeWidth={borderWidth}
                perfectDrawEnabled={false}
              />
              {isSelected && (
                <Rect
                  width={width}
                  height={height}
                  stroke="#3B82F6"
                  strokeWidth={2}
                  dash={[2, 2]}
                  perfectDrawEnabled={false}
                />
              )}
              <Text
                x={cellPadding}
                y={cellPadding}
                width={width - cellPadding * 2}
                height={height - cellPadding * 2}
                text={text}
                fontSize={fontSize}
                fontStyle={fontStyle === "italic" ? "italic" : undefined}
                textDecoration={
                  textDecoration === "underline" ? "underline" : undefined
                }
                fontFamily="Arial"
                fill={textColor}
                align={textAlign}
                fontVariant={fontWeight === "bold" ? "bold" : undefined}
                verticalAlign="middle"
                wrap="word"
                ellipsis={true}
                perfectDrawEnabled={false}
              />
              <Rect
                width={width}
                height={height}
                fill="transparent"
                onMouseDown={(e) => handleCellClick(row, col, e)}
                onDblClick={(e) => handleCellDoubleClick(row, col, e)}
                perfectDrawEnabled={false}
              />
            </Group>
          );
        }
      }

      return cells;
    };

    return (
      <>
        <Group ref={groupRef}>
          {renderCells()}
          {renderColumnResizers()}
          {renderRowResizers()}
        </Group>

        {/* Cell Editor (appears when a cell is being edited) */}
        {editingCell && (
          <CellEditor
            cellKey={editingCell}
            initialText={
              element.getText
                ? element.getText(...editingCell.split(",").map(Number))
                : (element.data &&
                    element.data[editingCell.split(",")[0]] &&
                    element.data[editingCell.split(",")[0]][
                      editingCell.split(",")[1]
                    ]) ||
                  ""
            }
            element={element}
            onComplete={handleCellEditComplete}
            onCancel={handleCellEditCancel}
          />
        )}

        {/* Show the toolbar if any cell is selected */}
        {/* {element.selectedCells && element.selectedCells.length > 0 && (
          <TableToolbar element={element} store={store} />
        )} */}
      </>
    );
  }
);

// Register the TableElement component with Polotno
unstable_registerShapeComponent("table", TableElement as unknown as any);

export default TableElement;
