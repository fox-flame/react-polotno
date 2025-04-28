"use client";
import React, { useEffect, useReducer, useRef } from "react";
import "./style.css";
import makeData from "./makeData";
import Table from "./Table";
import { randomColor, shortId } from "./utils";
import { grey } from "./colors";
import { Button, FormGroup, Label, Colors } from "@blueprintjs/core";
import { SketchPicker } from 'react-color';

function reducer(state, action) {
  switch (action.type) {
    case "reset": {
      return {
        ...state,
        columns: action.columns,
        data: action.data,
        headerColor: action.headerColor || state.headerColor,
        rowColors: action.rowColors || state.rowColors,
        columnColors: action.columnColors || state.columnColors,
        cellColors: action.cellColors || state.cellColors,
        showHeaderPicker: state.showHeaderPicker
      };
    }
    case "update_column_width": {
      const columnIndex = state.columns.findIndex(
        (column) => column.id === action.columnId
      );
      if (columnIndex === -1) return state;
      
      const newColumns = [...state.columns];
      newColumns[columnIndex] = {
        ...newColumns[columnIndex],
        width: action.width
      };

      return {
        ...state,
        skipReset: true,
        columns: newColumns
      };
    }
    case "add_option_to_column":
      const optionIndex = state.columns.findIndex(
        (column) => column.id === action.columnId
      );
      return {
        ...state,
        skipReset: true,
        columns: [
          ...state.columns.slice(0, optionIndex),
          {
            ...state.columns[optionIndex],
            options: [
              ...state.columns[optionIndex].options,
              { label: action.option, backgroundColor: action.backgroundColor }
            ]
          },
          ...state.columns.slice(optionIndex + 1, state.columns.length)
        ]
      };
    case "add_row":
      return {
        ...state,
        skipReset: true,
        data: [...state.data, {}]
      };
    case "update_column_type":
      const typeIndex = state.columns.findIndex(
        (column) => column.id === action.columnId
      );
      switch (action.dataType) {
        case "number":
          if (state.columns[typeIndex].dataType === "number") {
            return state;
          } else {
            return {
              ...state,
              columns: [
                ...state.columns.slice(0, typeIndex),
                { ...state.columns[typeIndex], dataType: action.dataType },
                ...state.columns.slice(typeIndex + 1, state.columns.length)
              ],
              data: state.data.map((row) => ({
                ...row,
                [action.columnId]: isNaN(row[action.columnId])
                  ? ""
                  : Number.parseInt(row[action.columnId])
              }))
            };
          }
        case "select":
          if (state.columns[typeIndex].dataType === "select") {
            return {
              ...state,
              columns: [
                ...state.columns.slice(0, typeIndex),
                { ...state.columns[typeIndex], dataType: action.dataType },
                ...state.columns.slice(typeIndex + 1, state.columns.length)
              ],
              skipReset: true
            };
          } else {
            let options = [];
            state.data.forEach((row) => {
              if (row[action.columnId]) {
                options.push({
                  label: row[action.columnId],
                  backgroundColor: randomColor()
                });
              }
            });
            return {
              ...state,
              columns: [
                ...state.columns.slice(0, typeIndex),
                {
                  ...state.columns[typeIndex],
                  dataType: action.dataType,
                  options: [...state.columns[typeIndex].options, ...options]
                },
                ...state.columns.slice(typeIndex + 1, state.columns.length)
              ],
              skipReset: true
            };
          }
        case "text":
          if (state.columns[typeIndex].dataType === "text") {
            return state;
          } else if (state.columns[typeIndex].dataType === "select") {
            return {
              ...state,
              skipReset: true,
              columns: [
                ...state.columns.slice(0, typeIndex),
                { ...state.columns[typeIndex], dataType: action.dataType },
                ...state.columns.slice(typeIndex + 1, state.columns.length)
              ]
            };
          } else {
            return {
              ...state,
              skipReset: true,
              columns: [
                ...state.columns.slice(0, typeIndex),
                { ...state.columns[typeIndex], dataType: action.dataType },
                ...state.columns.slice(typeIndex + 1, state.columns.length)
              ],
              data: state.data.map((row) => ({
                ...row,
                [action.columnId]: row[action.columnId] + ""
              }))
            };
          }
        default:
          return state;
      }
    case "update_column_header":
      const index = state.columns.findIndex(
        (column) => column.id === action.columnId
      );
      return {
        ...state,
        skipReset: true,
        columns: [
          ...state.columns.slice(0, index),
          { ...state.columns[index], label: action.label },
          ...state.columns.slice(index + 1, state.columns.length)
        ]
      };
    case "update_cell":
      return {
        ...state,
        skipReset: true,
        data: state.data.map((row, index) => {
          if (index === action.rowIndex) {
            return {
              ...state.data[action.rowIndex],
              [action.columnId]: action.value
            };
          }
          return row;
        })
      };
    case "add_column_to_left":
      const leftIndex = state.columns.findIndex(
        (column) => column.id === action.columnId
      );
      let leftId = shortId();
      return {
        ...state,
        skipReset: true,
        columns: [
          ...state.columns.slice(0, leftIndex),
          {
            id: leftId,
            label: "Column",
            accessor: leftId,
            dataType: "text",
            created: action.focus && true,
            options: [],
            minWidth: 50,
            width: 150
          },
          ...state.columns.slice(leftIndex, state.columns.length)
        ],
        data: state.data.map(row => ({
          ...row,
          [leftId]: ""
        }))
      };
    case "add_column_to_right":
      const rightIndex = state.columns.findIndex(
        (column) => column.id === action.columnId
      );
      const rightId = shortId();
      return {
        ...state,
        skipReset: true,
        columns: [
          ...state.columns.slice(0, rightIndex + 1),
          {
            id: rightId,
            label: "Column",
            accessor: rightId,
            dataType: "text",
            created: action.focus && true,
            options: [],
            minWidth: 50,
            width: 150
          },
          ...state.columns.slice(rightIndex + 1, state.columns.length)
        ],
        data: state.data.map(row => ({
          ...row,
          [rightId]: ""
        }))
      };
    case "delete_column":
      const deleteIndex = state.columns.findIndex(
        (column) => column.id === action.columnId
      );
      return {
        ...state,
        skipReset: true,
        columns: [
          ...state.columns.slice(0, deleteIndex),
          ...state.columns.slice(deleteIndex + 1, state.columns.length)
        ]
      };
    case "enable_reset":
      return {
        ...state,
        skipReset: false
      };
    case "update_header_color":
      return {
        ...state,
        headerColor: action.color
      };
    case "update_row_color":
      return {
        ...state,
        rowColors: {
          ...state.rowColors,
          [action.rowIndex]: action.color
        }
      };
    case "update_column_color":
      return {
        ...state,
        columnColors: {
          ...state.columnColors,
          [action.columnId]: action.color
        }
      };
    case "update_cell_color":
      return {
        ...state,
        cellColors: {
          ...state.cellColors,
          [`${action.rowIndex}-${action.columnId}`]: action.color
        }
      };
    case "show_header_picker":
      return {
        ...state,
        showHeaderPicker: !state.showHeaderPicker
      };
    case "hide_header_picker":
      return {
        ...state,
        showHeaderPicker: false
      };
    default:
      return state;
  }
}

export function TableEditor({ 
  columns = [], 
  data = [], 
  onChange,
  headerColor = "#e6f7ff",
  rowColors = {},
  columnColors = {},
  cellColors = {}
}) {
  const [state, dispatch] = useReducer(reducer, {
    columns,
    data,
    skipReset: false,
    headerColor,
    rowColors,
    columnColors,
    cellColors,
    showHeaderPicker: false
  });

  const pickerRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (pickerRef.current && 
          !pickerRef.current.contains(event.target) && 
          !buttonRef.current.contains(event.target)) {
        dispatch({ type: 'hide_header_picker' });
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    dispatch({ 
      type: "reset", 
      data, 
      columns: columns.map(col => ({
        ...col,
        width: col.width || 150,
        minWidth: col.minWidth || 50
      })),
      headerColor,
      rowColors,
      columnColors,
      cellColors
    });
  }, [data, columns, headerColor, rowColors, columnColors, cellColors]);

  useEffect(() => {
    onChange(state);
  }, [state]);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        overflowX: "hidden"
      }}
    >
     <div style={{ marginBottom: "1rem" }}>
            <FormGroup label="Table Styling">
              <div style={{ display: "flex", alignItems: "center", marginBottom: "0.5rem" }}>
                <Label style={{ marginRight: "1rem", minWidth: "100px" }}>Header Color:</Label>
                <div style={{ position: 'relative' }}>
                  <div
                    ref={buttonRef}
                    style={{
                      width: '32px',
                      height: '32px',
                      backgroundColor: state.headerColor,
                      border: '2px solid #fff',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
                    }}
                    onClick={() => dispatch({ type: 'show_header_picker' })}
                  />
                  {state.showHeaderPicker && (
                    <div
                      ref={pickerRef}
                      style={{
                        position: 'absolute',
                        top: '100%',
                        left: '0',
                        marginTop: '8px',
                        zIndex: 1000,
                      }}
                    >
                      <SketchPicker
                        color={state.headerColor}
                        onChange={(color) => {
                          dispatch({ type: 'update_header_color', color: color.hex });
                        }}
                        disableAlpha={true}
                      />
                      <button
                        onClick={() => {
                          dispatch({ type: 'update_header_color', color: undefined });
                          dispatch({ type: 'hide_header_picker' });
                        }}
                        style={{
                          width: '100%',
                          padding: '8px',
                          marginTop: '8px',
                          backgroundColor: '#f5f5f5',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px',
                          userSelect: 'none'
                        }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M19 6L5 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                          <path d="M5 6L19 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                        Reset Color
                      </button>
                    </div>
                  )}
                </div>
              </div>
             
            </FormGroup>
          </div>
      <div style={{ overflow: "auto", display: "flex" }}>
        <div
          style={{
            flex: "1 1 auto",
            padding: "1rem",
            maxWidth: 1000,
            marginLeft: "auto",
            marginRight: "auto"
          }}
        >
         
          <Table
            columns={state.columns}
            data={state.data}
            dispatch={dispatch}
            skipReset={state.skipReset}
            headerColor={state.headerColor}
            rowColors={state.rowColors}
            columnColors={state.columnColors}
            cellColors={state.cellColors}
          />
        </div>
      </div>
    </div>
  );
}
