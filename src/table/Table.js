"use client";
import React, {useMemo, useEffect, useRef} from "react";
import clsx from "clsx";
import {useTable, useBlockLayout, useResizeColumns, useSortBy} from "react-table";
import Cell from "./Cell";
import Header from "./Header";
import PlusIcon from "./img/Plus";
import FloatingColorPicker from "./FloatingColorPicker";

const defaultColumn = {
  minWidth: 50,
  width: 150,
  maxWidth: 400,
  Cell: Cell,
  Header: Header,
  sortType: "alphanumericFalsyLast"
};

export default function Table({
  columns, 
  data, 
  dispatch: dataDispatch, 
  skipReset,
  headerColor = "#e6f7ff",
  rowColors = {},
  columnColors = {},
  cellColors = {}
}) {
  const sortTypes = useMemo(
    () => ({
      alphanumericFalsyLast(rowA, rowB, columnId, desc) {
        if (!rowA.values[columnId] && !rowB.values[columnId]) {
          return 0;
        }

        if (!rowA.values[columnId]) {
          return desc ? -1 : 1;
        }

        if (!rowB.values[columnId]) {
          return desc ? 1 : -1;
        }

        return isNaN(rowA.values[columnId])
          ? rowA.values[columnId].localeCompare(rowB.values[columnId])
          : rowA.values[columnId] - rowB.values[columnId];
      }
    }),
    []
  );

  const {getTableProps, getTableBodyProps, headerGroups, rows, prepareRow} = useTable(
    {
      columns,
      data,
      defaultColumn,
      dataDispatch,
      autoResetSortBy: !skipReset,
      autoResetFilters: !skipReset,
      autoResetRowState: !skipReset,
      sortTypes,
      cellColors,
      initialState: {
        cellColors
      }
    },
    useBlockLayout,
    useResizeColumns,
    useSortBy
  );

  useEffect(() => {
    const handleResize = (column) => {
      if (column.originalWidth !== column.totalWidth) {
        setTimeout(() => {
          dataDispatch({
            type: "update_column_width",
            columnId: column.id,
            width: column.totalWidth
          });
        }, 250);
      }
    };

    headerGroups.forEach(headerGroup => {
      headerGroup.headers.forEach(header => {
        if (header.isResizing) {
          handleResize(header);
        }
      });
    });
  }, [isTableResizing, dataDispatch]);

  function isTableResizing() {
    for (let headerGroup of headerGroups) {
      for (let column of headerGroup.headers) {
        if (column.isResizing) {
          return true;
        }
      }
    }

    return false;

  }

  const handleColorChange = (color) => {
    const selection = window.getSelection();
    if (selection && selection.toString()) {
      const range = selection.getRangeAt(0);
      const cells = document.querySelectorAll('.td-content');
      cells.forEach(cell => {
        if (range.intersectsNode(cell)) {
          const cellId = cell.dataset.columnId;
          const rowIndex = parseInt(cell.dataset.rowIndex);
          if (cellId && !isNaN(rowIndex)) {
            dataDispatch({
              type: "update_cell_color",
              columnId: cellId,
              rowIndex: rowIndex,
              color: color.hex
            });
          }
        }
      });
    }
  };

  return (
    <div className="table-container" style={{ position: 'relative' }}>
      <div {...getTableProps()} className="table">
        <div>
          {headerGroups.map((headerGroup) => (
            <div {...headerGroup.getHeaderGroupProps()} className='tr'>
              {headerGroup.headers.map((column) => (
                <div key={column.id}>
                  {column.render("Header", { 
                    headerColor,
                    columnColor: columnColors[column.id]
                  })}
                </div>
              ))}
            </div>
          ))}
        </div>
        <div {...getTableBodyProps()}>
          {rows.map((row, i) => {
            prepareRow(row);
            return (
              <div {...row.getRowProps()} className='tr'>
                {row.cells.map((cell) => (
                  <div {...cell.getCellProps()} className='td'>
                    {cell.render("Cell", { 
                      rowColor: rowColors[i],
                      columnColor: columnColors[cell.column.id],
                      cellColor: cellColors[`${i}-${cell.column.id}`],
                      dataDispatch
                    })}
                  </div>
                ))}
              </div>
            );
          })}
          <div className='tr add-row' onClick={() => dataDispatch({type: "add_row"})}>
            <span className='svg-icon svg-gray' style={{marginRight: 4}}>
              <PlusIcon />
            </span>
            New
          </div>
        </div>
      </div>
      <FloatingColorPicker onColorChange={handleColorChange} />
    </div>
  );
}

