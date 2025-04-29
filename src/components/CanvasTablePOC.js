"use client";

import React, { useState, useRef } from 'react';

export const CanvasTablePOC = () => {
  const [tableData, setTableData] = useState([
    [{ text: 'Row 1, Cell 1', bold: false, italic: false }, { text: 'Row 1, Cell 2', bold: false, italic: false }],
    [{ text: 'Row 2, Cell 1', bold: false, italic: false }, { text: 'Row 2, Cell 2', bold: false, italic: false }],
  ]);
  const [tablePosition, setTablePosition] = useState({ top: 50, left: 50, width: 300, height: 150 });
  const [isEditing, setIsEditing] = useState(null);
  const [cellPadding, setCellPadding] = useState(8);
  const [cellBorderWidth, setCellBorderWidth] = useState(1);
  const [cellBorderColor, setCellBorderColor] = useState('#ccc');
  const [highlightedCell, setHighlightedCell] = useState(null);
  const tableRef = useRef(null);
  const isResizing = useRef(false);
  const resizeDirection = useRef(null);
  const resizeStart = useRef({ x: 0, y: 0, width: 0, height: 0 });
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0, top: 0, left: 0 });
  const dragHandleRef = useRef(null); // Ref for the drag handle element

  const handleCellChange = (row, col, newText, bold, italic) => {
    const newTableData = [...tableData];
    newTableData[row][col] = { text: newText, bold, italic };
    setTableData(newTableData);
  };

  const handleCanvasClick = () => {
    setIsEditing(null);
    isDragging.current = false;
  };

  const handleCellClick = (row, col) => {
    setIsEditing({ row, col });
  };

  const toggleBold = (row, col) => {
    const newTableData = [...tableData];
    newTableData[row][col].bold = !newTableData[row][col].bold;
    setTableData(newTableData);
  };

  const toggleItalic = (row, col) => {
    const newTableData = [...tableData];
    newTableData[row][col].italic = !newTableData[row][col].italic;
    setTableData(newTableData);
  };

  const handleMouseEnterCell = (row, col) => {
    setHighlightedCell({ row, col });
  };

  const handleMouseLeaveCell = () => {
    setHighlightedCell(null);
  };

   const startResize = (event, direction) => {
    isResizing.current = true;
    resizeDirection.current = direction;
    resizeStart.current = {
      x: event.clientX,
      y: event.clientY,
      width: tablePosition.width,
      height: tablePosition.height,
      left: tablePosition.left, // Capture initial left
      top: tablePosition.top,   // Capture initial top
    };
    document.addEventListener('mousemove', handleResize);
    document.addEventListener('mouseup', stopResize);
    event.stopPropagation();
  };

  const handleResize = (event) => {
    if (!isResizing.current) return;

    let newWidth = resizeStart.current.width;
    let newHeight = resizeStart.current.height;
    let newLeft = resizeStart.current.left;
    let newTop = resizeStart.current.top;
    const deltaX = event.clientX - resizeStart.current.x;
    const deltaY = event.clientY - resizeStart.current.y;

    switch (resizeDirection.current) {
      case 'e':
        newWidth = resizeStart.current.width + deltaX;
        break;
      case 's':
        newHeight = resizeStart.current.height + deltaY;
        break;
      case 'se':
        newWidth = resizeStart.current.width + deltaX;
        newHeight = resizeStart.current.height + deltaY;
        break;
      case 'w':
        newWidth = resizeStart.current.width - deltaX;
        newLeft = resizeStart.current.left + deltaX;
        break;
      case 'n':
        newHeight = resizeStart.current.height - deltaY;
        newTop = resizeStart.current.top + deltaY;
        break;
      case 'nw':
        newWidth = resizeStart.current.width - deltaX;
        newHeight = resizeStart.current.height - deltaY;
        newLeft = resizeStart.current.left + deltaX;
        newTop = resizeStart.current.top + deltaY;
        break;
      case 'ne':
        newWidth = resizeStart.current.width + deltaX;
        newHeight = resizeStart.current.height - deltaY;
        newTop = resizeStart.current.top + deltaY;
        break;
      case 'sw':
        newWidth = resizeStart.current.width - deltaX;
        newHeight = resizeStart.current.height + deltaY;
        newLeft = resizeStart.current.left + deltaX;
        break;
      default:
        break;
    }

    setTablePosition({
      top: newTop,
      left: newLeft,
      width: Math.max(50, newWidth),
      height: Math.max(30, newHeight),
    });
  };

  const stopResize = () => {
    isResizing.current = false;
    document.removeEventListener('mousemove', handleResize);
    document.removeEventListener('mouseup', stopResize);
  };

  const startDrag = (event) => {
    isDragging.current = true;
    dragStart.current = {
      x: event.clientX,
      y: event.clientY,
      top: tablePosition.top,
      left: tablePosition.left,
    };
    document.addEventListener('mousemove', handleDrag);
    document.addEventListener('mouseup', stopDrag);
    if (document.activeElement && tableRef.current && tableRef.current.contains(document.activeElement)) {
      document.activeElement.blur();
    }
    event.stopPropagation(); // Prevent resizing when dragging
  };

  const handleDrag = (event) => {
    if (!isDragging.current) return;
    const deltaX = event.clientX - dragStart.current.x;
    const deltaY = event.clientY - dragStart.current.y;
    setTablePosition({
      top: dragStart.current.top + deltaY,
      left: dragStart.current.left + deltaX,
      width: tablePosition.width,
      height: tablePosition.height,
    });
  };

  const stopDrag = () => {
    isDragging.current = false;
    document.removeEventListener('mousemove', handleDrag);
    document.removeEventListener('mouseup', stopDrag);
  };

  const renderTableOverlay = () => (
    <div
      ref={tableRef}
      style={{
        position: 'absolute',
        top: `${tablePosition.top}px`,
        left: `${tablePosition.left}px`,
        width: `${tablePosition.width}px`,
        height: `${tablePosition.height}px`,
        borderCollapse: 'collapse',
        // Remove cursor: 'grab' from the main table
      }}
    >
      {/* Drag Handle */}
      <div
        ref={dragHandleRef}
        style={{
          position: 'absolute',
          top: '-20px', // Position above the table
          left: '50%',
          marginLeft: '-30px',
          width: '60px',
          height: '15px',
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
          borderRadius: '5px 5px 0 0',
          cursor: isDragging.current ? 'grabbing' : 'grab',
          textAlign: 'center',
          lineHeight: '15px',
          fontSize: '10px',
          color: 'white',
          userSelect: 'none', // Prevent text selection while dragging
        }}
        onMouseDown={startDrag}
      >
        DRAG
      </div>

      {tableData.map((row, rowIndex) => (
        <div key={rowIndex} style={{ display: 'flex', height: `${100 / tableData.length}%` }}>
          {row.map((cell, colIndex) => (
            <div
              key={colIndex}
              style={{
                border: `${cellBorderWidth}px solid ${cellBorderColor}`,
                padding: `${cellPadding}px`,
                flex: 1,
                textAlign: 'center',
                backgroundColor: highlightedCell?.row === rowIndex && highlightedCell?.col === colIndex ? 'lightblue' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: cell.bold ? 'bold' : 'normal',
                fontStyle: cell.italic ? 'italic' : 'normal',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                cursor: 'text',
              }}
              contentEditable={isEditing && isEditing.row === rowIndex && isEditing.col === colIndex}
              onBlur={(event) => handleCellChange(rowIndex, colIndex, event.target.innerText, tableData[rowIndex][colIndex].bold, tableData[rowIndex][colIndex].italic)}
              onClick={() => handleCellClick(rowIndex, colIndex)}
              onMouseEnter={() => handleMouseEnterCell(rowIndex, colIndex)}
              onMouseLeave={handleMouseLeaveCell}
            >
              {cell.text}
            </div>
          ))}
        </div>
      ))}
      {/* Resize Handles */}
      <div style={resizeHandleStyle('se')} onMouseDown={(e) => startResize(e, 'se')} />
      <div style={resizeHandleStyle('e')} onMouseDown={(e) => startResize(e, 'e')} />
      <div style={resizeHandleStyle('s')} onMouseDown={(e) => startResize(e, 's')} />
      <div style={resizeHandleStyle('w')} onMouseDown={(e) => startResize(e, 'w')} />
      <div style={resizeHandleStyle('n')} onMouseDown={(e) => startResize(e, 'n')} />
      <div style={resizeHandleStyle('nw')} onMouseDown={(e) => startResize(e, 'nw')} />
      <div style={resizeHandleStyle('ne')} onMouseDown={(e) => startResize(e, 'ne')} />
      <div style={resizeHandleStyle('sw')} onMouseDown={(e) => startResize(e, 'sw')} />
    </div>
  );

  const resizeHandleStyle = (direction) => ({
    position: 'absolute',
    width: '10px',
    height: '10px',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    cursor: getHandleCursor(direction),
    zIndex: 1,
    ...getHandlePosition(direction),
  });

  const getHandleCursor = (direction) => {
    switch (direction) {
      case 'se': return 'se-resize';
      case 'e': return 'e-resize';
      case 's': return 's-resize';
      case 'w': return 'w-resize';
      case 'n': return 'n-resize';
      case 'nw': return 'nw-resize';
      case 'ne': return 'ne-resize';
      case 'sw': return 'sw-resize';
      default: return 'default';
    }
  };

  const getHandlePosition = (direction) => {
    switch (direction) {
      case 'se': return { right: '-5px', bottom: '-5px' };
      case 'e': return { right: '-5px', top: '50%', marginTop: '-5px' };
      case 's': return { left: '50%', marginLeft: '-5px', bottom: '-5px' };
      case 'w': return { left: '-5px', top: '50%', marginTop: '-5px' };
      case 'n': return { left: '50%', marginLeft: '-5px', top: '-5px' };
      case 'nw': return { left: '-5px', top: '-5px' };
      case 'ne': return { right: '-5px', top: '-5px' };
      case 'sw': return { left: '-5px', bottom: '-5px' };
      default: return {};
    }
  };

  const renderCanvas = () => (
    <canvas
      ref={(ref) => {
        if (ref) {
          const ctx = ref.getContext('2d');
          ctx.clearRect(0, 0, ref.width, ref.height);
          ctx.font = '16px sans-serif';
          tableData.forEach((row, rowIndex) => {
            row.forEach((cell, colIndex) => {
              const x = tablePosition.left + colIndex * (tablePosition.width / row.length) + cellPadding + cellBorderWidth;
              const y = tablePosition.top + rowIndex * (tablePosition.height / tableData.length) + cellPadding + cellBorderWidth + 16;
              ctx.font = `${cell.italic ? 'italic ' : ''}${cell.bold ? 'bold ' : ''}16px sans-serif`;
              ctx.fillText(cell.text, x, y);
            });
          });
        }
      }}
      width={400}
      height={300}
      style={{ border: '1px solid black', position: 'absolute', top: 0, left: 0, zIndex: -1, backgroundColor: 'white' }}
      onClick={handleCanvasClick}
    />
  );

  return (
    <div style={{ position: 'relative', width: '400px', height: '300px' }}>
      {renderCanvas()}
      {renderTableOverlay()}
      <div style={{ marginTop: '320px' }}>
        <div>
          <label>Padding: </label>
          <input type="number" value={cellPadding} onChange={(e) => setCellPadding(parseInt(e.target.value))} />
        </div>
        <div>
          <label>Border Width: </label>
          <input type="number" value={cellBorderWidth} onChange={(e) => setCellBorderWidth(parseInt(e.target.value))} />
        </div>
        <div>
          <label>Border Color: </label>
          <input type="color" value={cellBorderColor} onChange={(e) => setCellBorderColor(e.target.value)} />
        </div>
        {isEditing && (
          <div>
            <button onClick={() => toggleBold(isEditing.row, isEditing.col)}>
              <strong>B</strong>
            </button>
            <button onClick={() => toggleItalic(isEditing.row, isEditing.col)}>
              <i>I</i>
            </button>
          </div>
        )}
        <button onClick={() => console.log('Current Table Data:', tableData)}>Log Table Data</button>
      </div>
    </div>
  );
};

