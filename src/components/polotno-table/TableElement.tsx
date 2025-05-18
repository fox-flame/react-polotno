"use client";
import React, { useRef, useEffect, useState, useMemo } from "react";
import { observer } from "mobx-react-lite";
import { Group, Rect, Text, Line } from "react-konva";
import { unstable_registerShapeComponent } from "polotno/config";
import { Html } from "react-konva-utils";
import ContentEditable from "react-contenteditable";
import { Icon, IconSize } from "@blueprintjs/core";

// TableElement component for rendering a table on the canvas
const TableElement = observer(
  ({ element, store }: { element: any; store: any }) => {
    const [editingCell, setEditingCell] = useState<string | null>(null);
    const [showDrag, setShowDrag] = useState(false);
    const [overlayActive, setOverlayActive] = useState(true);
    const htmlContainerRef = useRef<HTMLDivElement>(null);
    const isShowDrag = useMemo(
      () =>
        showDrag &&
        store.selectedElements?.length === 1 &&
        store.selectedElements?.find((el: any) => el.type === "table"),
      [showDrag, store.selectedElements]
    );

    const tableRef = useRef<any>();

    useEffect(() => {
      if (!editingCell) return;
      function handleClickOutside(event: MouseEvent) {
        if (
          htmlContainerRef.current &&
          !htmlContainerRef.current.contains(event.target as Node)
        ) {
          setEditingCell(null);
        }
      }
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [editingCell]);

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
      let colWidths =
        element.columnWidths || Array(columns).fill(width / columns);
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
    };

    // Handle cell edit completion
    const handleCellEditComplete = (
      row: number,
      col: number,
      newText: string
    ) => {
      setEditingCell(null);
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
    };

    // Handle text change
    const handleTextChange = (e: any, row: number, col: number) => {
      if (element.setText) {
        element.setText(row, col, e.target.value);
      } else if (element.set) {
        // Fallback if setText doesn't exist
        const newData = [...(element.data || [])];
        if (newData[row] && col < (element.columns || 0)) {
          newData[row] = [...newData[row]];
          newData[row][col] = e.target.value;
          element.set({ data: newData });
        }
      }
    };

    // Handle mouse down on resizer
    const handleResizerMouseDown = (type: string, index: number, e: any) => {
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
        const currentPos =
          type === "column" ? moveEvt.clientX : moveEvt.clientY;
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

        if (type === "column") {
          element.set({
            columnWidths: newSizes,
            width: newSizes.reduce((sum, w) => sum + w, 0),
          });
        } else {
          element.set({
            rowHeights: newSizes,
            height: newSizes.reduce((sum, h) => sum + h, 0),
          });
        }
      };

      const handleMouseUp = () => {
        setResizing(null);
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
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
      let totalHeight = rowHeights.reduce(
        (sum: any, height: any) => sum + height,
        0
      );
      return colWidths.map((width: any, i: any) => {
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
      let totalWidth = colWidths.reduce(
        (sum: any, width: any) => sum + width,
        0
      );
      return rowHeights.map((height: any, i: any) => {
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
        cellPadding,
        borderWidth,
        borderColor,
        headerRow,
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

          // Get cell-specific styling
          // Get cell style directly from cellStyles as a fallback if getCellStyle is not available
          const cellStyle = element.getCellStyle
            ? element.getCellStyle(row, col)
            : (element.cellStyles && element.cellStyles[cellKey]) || {};

          const backgroundColor =
            element.cellBackgrounds?.[cellKey] ||
            cellStyle.backgroundColor ||
            (isHeader ? "#f3f4f6" : "#ffffff");

          const textColor = element.cellTextColors?.[cellKey] || "#000000";
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
                fill={
                  element.cellBackgrounds?.[`${row},${col}`] || backgroundColor
                }
                stroke={borderColor}
                strokeWidth={borderWidth}
                perfectDrawEnabled={false}
              />
              {editingCell && editingCell === cellKey && (
                <Html>
                  <div
                    ref={htmlContainerRef}
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 0,
                      width: width,
                      height: height,
                      transform: `rotate(${element.rotation}deg)`,
                      transformOrigin: "center center",
                    }}
                  >
                    <ContentEditable
                      html={text || ""}
                      onChange={(e) => handleTextChange(e, row, col)}
                      onBlur={(e) =>
                        handleCellEditComplete(row, col, e.target.innerText)
                      }
                      className="data-input"
                      style={{
                        width: "100%",
                        height: "100%",
                        border: `${borderWidth}px solid rgb(0, 123, 255)`,
                        padding: (element.cellPadding || 8) + "px",
                        margin: 0,
                        background:
                          element.cellBackgrounds?.[`${row},${col}`] ||
                          backgroundColor,
                        outline: "none",
                        textAlign: textAlign,
                        verticalAlign: "middle",
                        fontSize: `${fontSize || 14}px`,
                        resize: "none",
                        overflow: "hidden",
                        cursor: "text",
                        color: textColor,
                        boxSizing: "border-box",
                        wordWrap: "break-word",
                        wordBreak: "break-all",
                        whiteSpace: "pre-wrap",
                      }}
                      onPaste={(e) => {
                        e.preventDefault();
                        const text = e.clipboardData.getData("text/plain");
                        document.execCommand("insertText", false, text);
                      }}
                    />
                  </div>
                </Html>
              )}

              {/* {isSelected && (
                <Rect
                  width={width}
                  height={height}
                  stroke="#3B82F6"
                  strokeWidth={2}
                  dash={[2, 2]}
                  perfectDrawEnabled={false}
                />
              )} */}
              <Text
                padding={element.cellPadding}
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
                onClick={(e) => handleCellDoubleClick(row, col, e)}
                perfectDrawEnabled={false}
              />
            </Group>
          );
        }
      }

      return cells;
    };

    const handleDrag = (event: any) => {
      if (!element.isDragging) return;
      element.set({
        x: event.target.x(),
        y: event.target.y(),
      });
    };

    const startDrag = () => {
      element.set({ isDragging: true });
    };

    const stopDrag = () => {
      element.set({ isDragging: false });
    };

    const handleTransform = (e: any) => {
      const node = e.currentTarget;
      const scaleX = node.scaleX();
      const scaleY = node.scaleY();

      // Reset scale to 1 so future transforms are relative to the new size
      node.scaleX(1);
      node.scaleY(1);

      // Scale column widths and row heights
      const newColWidths = colWidths.map((w: number) => w * scaleX);
      const newRowHeights = rowHeights.map((h: number) => h * scaleY);

      // Set width/height to the sum of the new arrays
      element.set({
        x: node.x(),
        y: node.y(),
        width: newColWidths.reduce((sum: number, w: number) => sum + w, 0),
        height: newRowHeights.reduce((sum: number, h: number) => sum + h, 0),
        columnWidths: newColWidths,
        rowHeights: newRowHeights,
        rotation: node.rotation?.() ?? 0,
      });
    };

    return (
      <Group
        ref={tableRef}
        // remember to use "element" name. Polotno will use it internally to find correct node
        name="element"
        // also it is important to pass id
        // so polotno can automatically do selection
        id={element.id}
        x={element.x}
        y={element.y}
        width={element.width}
        height={element.height}
        draggable={true}
        onDragStart={startDrag}
        onDragMove={handleDrag}
        onDragEnd={stopDrag}
        onClick={() => {
          setOverlayActive(true);
          store.selectElements([element.id]);
        }}
        onTransform={handleTransform}
        onMouseEnter={(e) => {
          const stage = e.target.getStage();
          if (stage) stage.container().style.cursor = "move";
        }}
        onMouseLeave={(e) => {
          const stage = e.target.getStage();
          if (stage) stage.container().style.cursor = "default";
        }}
        onDblClick={(e) => {
          e.cancelBubble = true;
          if (tableRef.current && tableRef.current.startDrag) {
            tableRef.current.startDrag();
          }
        }}
      >
        {renderCells()}

        {/* Bottom Center Drag Handle */}
        {isShowDrag && (
          <Group
            x={element.width / 2 - 16}
            y={rowHeights.reduce((sum: number, h: number) => sum + h, 0) + 10}
          >
            <Html>
              <div
                style={{
                  width: 32,
                  height: 32,
                  background: "#fff",
                  borderRadius: "50%",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
                  border: "3px solid #3B82F6",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "move",
                  position: "absolute",
                  left: 0,
                  top: 0,
                  transform: `rotate(${element.rotation}deg)`,
                }}
                onMouseDown={(e) => {
                  startDrag();
                  if (tableRef.current && tableRef.current.startDrag) {
                    tableRef.current.startDrag();
                  }
                }}
              >
                <Icon icon="move" color="#666" size={IconSize.STANDARD} />
              </div>
            </Html>
          </Group>
        )}

        {overlayActive && (
          <Rect
            x={0}
            y={0}
            width={element.width}
            height={rowHeights.reduce((sum: number, h: number) => sum + h, 0)}
            fill="transparent"
            listening={true}
            onClick={() => setOverlayActive(false)}
            onDblClick={(e) => {
              if (tableRef.current && tableRef.current.startDrag) {
                tableRef.current.startDrag();
              }
              setOverlayActive(false);
            }}
          />
        )}
        {renderColumnResizers()}
        {renderRowResizers()}
      </Group>
    );
  }
);

// Register the TableElement component with Polotno
unstable_registerShapeComponent("table", TableElement as unknown as any);

export default TableElement;
