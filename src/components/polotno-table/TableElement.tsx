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

const getColorBrightness = (color: string) => {
  // For transparent, return 1 (light)
  if (color === 'transparent') return 1;
  
  // Convert hex to RGB
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16) / 255;
  const g = parseInt(hex.substr(2, 2), 16) / 255;
  const b = parseInt(hex.substr(4, 2), 16) / 255;
  
  // Calculate relative luminance
  return 0.299 * r + 0.587 * g + 0.114 * b;
};


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
    const [isDragging, setIsDragging] = useState(false);
    const dragStartPos = useRef({ x: 0, y: 0 });

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
    const handleResize = (type: 'column' | 'row', index: number, delta: number) => {
      if (type === 'column') {
        const newColumnWidths = [...(element.columnWidths || colWidths)];
        const nextIndex = index + 1;

        // Ensure we don't make columns too small
        const minWidth = 20;
        const currentWidth = newColumnWidths[index];
        const nextWidth = newColumnWidths[nextIndex];

        const maxDelta = nextWidth - minWidth;
        const safeDelta = Math.min(delta, maxDelta);

        newColumnWidths[index] = Math.max(currentWidth + safeDelta, minWidth);
        newColumnWidths[nextIndex] = Math.max(nextWidth - safeDelta, minWidth);

        element.set({ columnWidths: newColumnWidths });
      } else {
        const newRowHeights = [...(element.rowHeights || rowHeights)];
        const nextIndex = index + 1;

        // Ensure we don't make rows too small
        const minHeight = 20;
        const currentHeight = newRowHeights[index];
        const nextHeight = newRowHeights[nextIndex];

        const maxDelta = nextHeight - minHeight;
        const safeDelta = Math.min(delta, maxDelta);

        newRowHeights[index] = Math.max(currentHeight + safeDelta, minHeight);
        newRowHeights[nextIndex] = Math.max(nextHeight - safeDelta, minHeight);

        element.set({ rowHeights: newRowHeights });
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

      const startPos = type === 'column' ? e.evt.clientX : e.evt.clientY;
      const sizes = type === "column" ? [...colWidths] : [...rowHeights];

      setResizing({
        type,
        index,
        startPos,
        sizes,
      });

      const handleMouseMove = (moveEvt: MouseEvent) => {
        const currentPos = type === 'column' ? moveEvt.clientX : moveEvt.clientY;
        const delta = currentPos - startPos;

        // Update sizes based on the delta
        const newSizes = [...sizes];
        const minSize = 20;

        if (index === newSizes.length - 1) {
          // For last column/row, just resize it directly
          newSizes[index] = Math.max(sizes[index] + delta, minSize);
        } else {
          // For other columns/rows, adjust with next column/row
          const currentSize = newSizes[index];
          const nextSize = newSizes[index + 1];

          const maxDelta = nextSize - minSize;
          const safeDelta = Math.min(delta, maxDelta);

          newSizes[index] = Math.max(currentSize + safeDelta, minSize);
          newSizes[index + 1] = Math.max(nextSize - safeDelta, minSize);
        }

        setResizing({
          type,
          index,
          startPos,
          sizes: newSizes,
        });

        if (type === 'column') {
          element.set({ columnWidths: newSizes });
        } else {
          element.set({ rowHeights: newSizes });
        }
      };

      const handleMouseUp = () => {
        setResizing(null);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
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
      let totalHeight = rowHeights.reduce((sum, height) => sum + height, 0);
      return colWidths.map((width, i) => {
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
            points={[x, 0, x, totalHeight]}
            stroke={
              hoveredResizer?.type === "column" && hoveredResizer?.index === i
                ? "#3B82F6"
                : "transparent"
            }
            strokeWidth={10}
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
      let totalWidth = colWidths.reduce((sum, width) => sum + width, 0);
      return rowHeights.map((height, i) => {
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
            points={[0, y, totalWidth, y]}
            stroke={
              hoveredResizer?.type === "row" && hoveredResizer?.index === i
                ? "#3B82F6"
                : "transparent"
            }
            strokeWidth={10}
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
            element.cellBackgrounds?.[cellKey] || 
            cellStyle.backgroundColor || 
            (isHeader ? "#f3f4f6" : "#ffffff");
          const textColor = 
            getColorBrightness(backgroundColor) > 0.5 ? "#000000" : "#ffffff";
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

    const handleDragStart = (e: any) => {
      setIsDragging(true);
      const pos = e.target.getStage().getPointerPosition();
      dragStartPos.current = {
        x: pos.x - element.x,
        y: pos.y - element.y
      };
      e.cancelBubble = true;
    };

    const handleDragMove = (e: any) => {
      if (!isDragging) return;
      const pos = e.target.getStage().getPointerPosition();
      element.set({
        x: pos.x - dragStartPos.current.x,
        y: pos.y - dragStartPos.current.y
      });
    };

    const handleDragEnd = () => {
      setIsDragging(false);
    };

    return (
      <>
        <Group
          draggable={!editingCell}
          onDragStart={handleDragStart}
          onDragMove={handleDragMove}
          onDragEnd={handleDragEnd}
          x={element.x}
          y={element.y}
        >
          {renderCells()}
          {renderColumnResizers()}
          {renderRowResizers()}
          
          {/* Bottom Center Drag Handle */}
          <Group>
            <Rect
              x={element.width / 2 - 30}
              y={rowHeights.reduce((sum, height) => sum + height, 0) + 5}
              width={60}
              height={15}
              fill="rgba(0, 0, 0, 0.2)"
              cornerRadius={5}
              onMouseDown={handleDragStart}
              onMouseUp={handleDragEnd}
            />
            <Text
              x={element.width / 2 - 30}
              y={rowHeights.reduce((sum, height) => sum + height, 0) + 8}
              width={60}
              height={15}
              text="DRAG"
              fontSize={10}
              fill="white"
              align="center"
            />
          </Group>
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