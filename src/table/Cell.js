"use client";
import React, {useEffect, useState, useRef} from "react";
import { EditableCell } from "./EditableCell";

// Function to calculate relative luminance of a color
function getColorBrightness(hexColor) {
  // Remove # if present
  const color = hexColor.replace('#', '');
  
  // Convert to RGB
  const r = parseInt(color.substr(0, 2), 16);
  const g = parseInt(color.substr(2, 2), 16);
  const b = parseInt(color.substr(4, 2), 16);
  
  // Calculate relative luminance
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

export default function Cell({
  value: initialValue,
  row: { index },
  column: { id, dataType, options },
  dataDispatch,
  rowColor,
  columnColor,
  cellColor
}) {
  const [value, setValue] = useState({value: initialValue, update: false});
  const cellRef = useRef(null);

  useEffect(() => {
    setValue({value: initialValue, update: false});
  }, [initialValue]);

  useEffect(() => {
    if (value.update) {
      dataDispatch({type: "update_cell", columnId: id, rowIndex: index, value: value.value});
      setValue({value: value.value, update: false}); // Reset update flag after dispatch
    }
  }, [value, dataDispatch, id, index]);

  const onChange = (e) => {
    setValue({value: e.target.value, update: true}); // Set update flag immediately
  };

  const onBlur = () => {
    setValue(prev => ({value: prev.value, update: true}));
  };

  // const handleColorChange = (color) => {
  //   // Get all selected cells and update their colors
  //   const selection = window.getSelection();
  //   if (selection && selection.toString()) {
  //     // If there's text selected, update all cells containing selected text
  //     const range = selection.getRangeAt(0);
  //     const cells = document.querySelectorAll('.td-content');
  //     cells.forEach(cell => {
  //       if (range.intersectsNode(cell)) {
  //         const cellId = cell.dataset.columnId;
  //         const rowIndex = parseInt(cell.dataset.rowIndex);
  //         if (cellId && !isNaN(rowIndex)) {
  //           dataDispatch({
  //             type: "update_cell_color",
  //             columnId: cellId,
  //             rowIndex: rowIndex,
  //             color: color.hex
  //           });
  //         }
  //       }
  //     });
  //   } else {
  //     // If no selection, update just this cell
  //     dataDispatch({
  //       type: "update_cell_color",
  //       columnId: id,
  //       rowIndex: index,
  //       color: color.hex
  //     });
  //   }
  // };

  const backgroundColor = cellColor || rowColor || columnColor || "transparent";
  
  // Calculate text color based on background brightness
  const textColor = backgroundColor === "transparent" 
    ? "#424242" 
    : getColorBrightness(backgroundColor) > 0.5 
      ? "#424242" 
      : "#ffffff";

  return (
    <div 
      ref={cellRef}
      className="td-content"
      style={{
        backgroundColor: backgroundColor,
        color: textColor,
        position: 'relative',
        cursor: 'text',
        padding: '4px'
      }}
      data-column-id={id}
      data-row-index={index}
    >
      <EditableCell
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        dataType={dataType}
        options={options}
      />
    </div>
  );
}
