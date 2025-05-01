import React from "react";
import { observer } from "mobx-react-lite";
import { unstable_registerShapeComponent } from "polotno/config";
import { Group, Rect, Text, Circle, Line } from "react-konva";
import { Html } from "react-konva-utils";

// Create a separate component for the table content
const TableContent = observer(
  ({ element, onCellClick, onMouseEnter, onMouseLeave }) => {
    const textareaRef = React.useRef(null);
    const [hoveredBorder, setHoveredBorder] = React.useState(null);
    const isResizing = React.useRef(false);
    const resizeDirection = React.useRef(null);
    const resizeStart = React.useRef({
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      index: -1,
    });

    // Calculate default sizes
    const defaultColumnWidth = element.width / element.tableData[0].length;
    const defaultRowHeight = element.height / element.tableData.length;

    // Initialize column and row sizes if not present
    React.useEffect(() => {
      if (!element.columnWidths || !element.rowHeights) {
        const initialColumnWidths = new Array(element.tableData[0].length).fill(
          defaultColumnWidth
        );
        const initialRowHeights = new Array(element.tableData.length).fill(
          defaultRowHeight
        );
        element.set({
          columnWidths: initialColumnWidths,
          rowHeights: initialRowHeights,
        });
      }
    }, []);

    React.useEffect(() => {
      if (isResizing.current) {
        document.addEventListener("mousemove", handleResize);
        document.addEventListener("mouseup", stopResize);
      }
      return () => {
        document.removeEventListener("mousemove", handleResize);
        document.removeEventListener("mouseup", stopResize);
      };
    }, [isResizing.current]);

    const handleTextChange = (e, row, col) => {
      const newText = e.target.value;
      const newTableData = [...element.tableData];
      newTableData[row][col] = { ...newTableData[row][col], text: newText };
      element.set({ tableData: newTableData });
    };

    const startResize = (e, type, index) => {
      isResizing.current = true;
      resizeDirection.current = type;
      resizeStart.current = {
        x: e.evt.clientX,
        y: e.evt.clientY,
        index,
        sizes:
          type === "column"
            ? [
                ...(element.columnWidths ||
                  new Array(element.tableData[0].length).fill(
                    defaultColumnWidth
                  )),
              ]
            : [
                ...(element.rowHeights ||
                  new Array(element.tableData.length).fill(defaultRowHeight)),
              ],
      };
      e.evt.stopPropagation();

      // Add event listeners
      document.addEventListener("mousemove", handleResize);
      document.addEventListener("mouseup", stopResize);
    };

    const handleResize = (e) => {
      if (!isResizing.current) return;

      const { index, sizes } = resizeStart.current;
      const delta =
        resizeDirection.current === "column"
          ? e.clientX - resizeStart.current.x
          : e.clientY - resizeStart.current.y;

      const newSizes = [...sizes];
      const minSize = 30;
      const newSize = Math.max(minSize, sizes[index] + delta);

      // Calculate the total size and distribute any excess proportionally
      const totalSize =
        resizeDirection.current === "column" ? element.width : element.height;
      const otherSizes = sizes.filter((_, i) => i !== index);
      const otherSizesTotal = otherSizes.reduce((sum, size) => sum + size, 0);

      // Ensure the new size doesn't exceed reasonable bounds
      const maxSize = totalSize - otherSizesTotal * 0.5; // Allow up to 50% compression of other cells
      const clampedSize = Math.min(maxSize, newSize);

      newSizes[index] = clampedSize;

      // Update the sizes smoothly
      if (resizeDirection.current === "column") {
        element.set({
          columnWidths: newSizes,
        });
      } else {
        element.set({
          rowHeights: newSizes,
        });
      }
    };

    const stopResize = () => {
      isResizing.current = false;
      resizeDirection.current = null;
      setHoveredBorder(null);

      // Remove event listeners
      document.removeEventListener("mousemove", handleResize);
      document.removeEventListener("mouseup", stopResize);
    };

    // Calculate cell positions with safety checks
    const getCellPosition = (rowIndex, colIndex) => {
      const columnWidths =
        element.columnWidths ||
        new Array(element.tableData[0].length).fill(defaultColumnWidth);
      const rowHeights =
        element.rowHeights ||
        new Array(element.tableData.length).fill(defaultRowHeight);

      const x = columnWidths
        .slice(0, colIndex)
        .reduce((sum, width) => sum + width, 0);
      const y = rowHeights
        .slice(0, rowIndex)
        .reduce((sum, height) => sum + height, 0);
      return { x, y };
    };

    // Get cell dimensions with safety checks
    const getCellDimensions = (rowIndex, colIndex) => {
      const columnWidths =
        element.columnWidths ||
        new Array(element.tableData[0].length).fill(defaultColumnWidth);
      const rowHeights =
        element.rowHeights ||
        new Array(element.tableData.length).fill(defaultRowHeight);

      return {
        width: columnWidths[colIndex],
        height: rowHeights[rowIndex],
      };
    };

    const getResizeHandleStyle = (type, index) => {
      const position =
        type === "column"
          ? getCellPosition(0, index + 1)
          : getCellPosition(index + 1, 0);

      if (type === "column") {
        return {
          x: position.x - 15,
          y: 0,
          width: 30,
          height: element.height,
          cursor: "col-resize",
          opacity: 0,
        };
      } else {
        return {
          x: 0,
          y: position.y - 15,
          width: element.width,
          height: 30,
          cursor: "row-resize",
          opacity: 0,
        };
      }
    };

    // Add cursor styles to document body
    React.useEffect(() => {
      if (hoveredBorder) {
        document.body.style.cursor =
          hoveredBorder.type === "column" ? "col-resize" : "row-resize";
      } else {
        document.body.style.cursor = "";
      }
      return () => {
        document.body.style.cursor = "";
      };
    }, [hoveredBorder]);

    return (
      <>
        {element.tableData.map((row, rowIndex) => (
          <Group key={rowIndex}>
            {row.map((cell, colIndex) => {
              const position = getCellPosition(rowIndex, colIndex);
              const dimensions = getCellDimensions(rowIndex, colIndex);
              return (
                <Group
                  key={colIndex}
                  x={position.x}
                  y={position.y}
                  onClick={() => onCellClick(rowIndex, colIndex)}
                  onMouseEnter={() => onMouseEnter(rowIndex, colIndex)}
                  onMouseLeave={onMouseLeave}
                >
                  <Rect
                    width={dimensions.width}
                    height={dimensions.height}
                    stroke={element.cellBorderColor || "#ccc"}
                    strokeWidth={element.cellBorderWidth || 1}
                    fill={
                      element.highlightedCell?.row === rowIndex &&
                      element.highlightedCell?.col === colIndex
                        ? "lightblue"
                        : "white"
                    }
                  />
                  <Html>
                    <div
                      style={{
                        position: "absolute",
                        left: 0,
                        top: 0,
                        width: dimensions.width,
                        height: dimensions.height,
                        transform: `rotate(${element.rotation}deg)`,
                        transformOrigin: "center center",
                        pointerEvents: hoveredBorder ? "none" : "auto",
                      }}
                    >
                      <textarea
                        ref={textareaRef}
                        value={cell.text || ""}
                        onChange={(e) =>
                          handleTextChange(e, rowIndex, colIndex)
                        }
                        style={{
                          width: "100%",
                          height: "100%",
                          border: "none",
                          padding: (element.cellPadding || 8) + "px",
                          margin: 0,
                          background: "transparent",
                          outline: "none",
                          textAlign: "center",
                          fontSize: "14px",
                          fontStyle: cell.italic ? "italic" : "normal",
                          fontWeight: cell.bold ? "bold" : "normal",
                          resize: "none",
                          overflow: "hidden",
                          cursor: "text",
                          color: "black",
                          boxSizing: "border-box",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          wordWrap: "break-word",
                          whiteSpace: "pre-wrap",
                          pointerEvents: hoveredBorder ? "none" : "auto",
                        }}
                      />
                    </div>
                  </Html>
                </Group>
              );
            })}
          </Group>
        ))}

        {/* Column resize handles with visual indicators */}
        {(
          element.columnWidths ||
          new Array(element.tableData[0].length).fill(defaultColumnWidth)
        ).map((width, colIndex) => {
          if (colIndex === element.tableData[0].length - 1) return null;
          const style = getResizeHandleStyle("column", colIndex);
          return (
            <Group key={`col-resize-${colIndex}`}>
              <Rect
                {...style}
                onMouseEnter={() =>
                  setHoveredBorder({ type: "column", index: colIndex })
                }
                onMouseLeave={() =>
                  !isResizing.current && setHoveredBorder(null)
                }
                onMouseDown={(e) => startResize(e, "column", colIndex)}
              />
              {hoveredBorder?.type === "column" &&
                hoveredBorder.index === colIndex && (
                  <>
                    <Rect
                      x={style.x + 14}
                      y={0}
                      width={2}
                      height={element.height}
                      fill="#4285f4"
                    />
                    <Rect
                      x={style.x + 13}
                      y={0}
                      width={4}
                      height={element.height}
                      fill="rgba(66, 133, 244, 0.2)"
                    />
                  </>
                )}
            </Group>
          );
        })}

        {/* Row resize handles with visual indicators */}
        {(
          element.rowHeights ||
          new Array(element.tableData.length).fill(defaultRowHeight)
        ).map((height, rowIndex) => {
          if (rowIndex === element.tableData.length - 1) return null;
          const style = getResizeHandleStyle("row", rowIndex);
          return (
            <Group key={`row-resize-${rowIndex}`}>
              <Rect
                {...style}
                onMouseEnter={() =>
                  setHoveredBorder({ type: "row", index: rowIndex })
                }
                onMouseLeave={() =>
                  !isResizing.current && setHoveredBorder(null)
                }
                onMouseDown={(e) => startResize(e, "row", rowIndex)}
              />
              {hoveredBorder?.type === "row" &&
                hoveredBorder.index === rowIndex && (
                  <>
                    <Rect
                      x={0}
                      y={style.y + 14}
                      width={element.width}
                      height={2}
                      fill="#4285f4"
                    />
                    <Rect
                      x={0}
                      y={style.y + 13}
                      width={element.width}
                      height={4}
                      fill="rgba(66, 133, 244, 0.2)"
                    />
                  </>
                )}
            </Group>
          );
        })}
      </>
    );
  }
);

// Define the table component
const TableComponent = observer(({ element, store }) => {
  const isResizing = React.useRef(false);
  const resizeDirection = React.useRef(null);
  const resizeStart = React.useRef({ x: 0, y: 0, width: 0, height: 0 });

  const handleCellClick = (row, col) => {
    if (
      !element.tableData ||
      !element.tableData[row] ||
      !element.tableData[row][col]
    ) {
      console.error("Invalid cell data:", {
        row,
        col,
        tableData: element.tableData,
      });
      return;
    }

    store.selectElements([element]);
    element.set({
      editingCell: { row, col },
    });
  };

  const handleMouseEnterCell = (row, col) => {
    element.set({ highlightedCell: { row, col } });
  };

  const handleMouseLeaveCell = () => {
    element.set({ highlightedCell: null });
  };

  const startResize = (event, direction) => {
    isResizing.current = true;
    resizeDirection.current = direction;
    resizeStart.current = {
      x: event.evt.clientX,
      y: event.evt.clientY,
      width: element.width,
      height: element.height,
      x0: element.x,
      y0: element.y,
    };
    event.evt.stopPropagation();
  };

  const handleResize = (event) => {
    if (!isResizing.current) return;

    const deltaX = event.evt.clientX - resizeStart.current.x;
    const deltaY = event.evt.clientY - resizeStart.current.y;
    let newWidth = resizeStart.current.width;
    let newHeight = resizeStart.current.height;
    let newX = resizeStart.current.x0;
    let newY = resizeStart.current.y0;

    switch (resizeDirection.current) {
      case "e":
        newWidth = Math.max(50, resizeStart.current.width + deltaX);
        break;
      case "s":
        newHeight = Math.max(30, resizeStart.current.height + deltaY);
        break;
      case "se":
        newWidth = Math.max(50, resizeStart.current.width + deltaX);
        newHeight = Math.max(30, resizeStart.current.height + deltaY);
        break;
      case "w":
        const widthChange = Math.min(deltaX, resizeStart.current.width - 50);
        newWidth = resizeStart.current.width - widthChange;
        newX = resizeStart.current.x0 + widthChange;
        break;
      case "n":
        const heightChange = Math.min(deltaY, resizeStart.current.height - 30);
        newHeight = resizeStart.current.height - heightChange;
        newY = resizeStart.current.y0 + heightChange;
        break;
      default:
        break;
    }

    element.set({
      width: newWidth,
      height: newHeight,
      x: newX,
      y: newY,
    });
  };

  const stopResize = () => {
    isResizing.current = false;
    resizeDirection.current = null;
  };

  const startDrag = (event) => {
    element.set({ isDragging: true });
  };
  
    const stopDrag = () => {
      element.set({ isDragging: false });
    };

  const handleDrag = (event) => {
    if (!element.isDragging) return;
    element.set({
      x: event.target.x(),
      y: event.target.y(),
    });
  };

  return (
    <Group
      x={element.x}
      y={element.y}
      rotation={element.rotation}
      draggable={!element.locked}
      onDragStart={startDrag}
      onDragMove={handleDrag}
      onDragEnd={stopDrag}
    >
      {/* Drag Handle */}
      <Group>
        <Rect
          x={element.width / 2 - 30}
          y={-20}
          width={60}
          height={15}
          fill="rgba(0, 0, 0, 0.2)"
          cornerRadius={5}
          onMouseDown={startDrag}
          onMouseUp={stopDrag}
        />
        <Text
          x={element.width / 2 - 30}
          y={-17}
          width={60}
          height={15}
          text="DRAG"
          fontSize={10}
          fill="white"
          align="center"
        />
      </Group>

      {/* Table Content */}
      <TableContent
        element={element}
        onCellClick={handleCellClick}
        onMouseEnter={handleMouseEnterCell}
        onMouseLeave={handleMouseLeaveCell}
      />
    </Group>
  );
});

// Create a named export
export const CustomTable = TableComponent;

// Register the component with Polotno
unstable_registerShapeComponent("custom-table", CustomTable);

// Export default
export default CustomTable;
