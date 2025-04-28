import { useState, useReducer } from "react";
import { shortId } from "./utils";

export function useTable(data) {
  const [rows, dispatch] = useReducer((state, action) => {
    switch (action.type) {
      case "update_cell":
        return state.map((row, index) => {
          if (index === action.rowIndex) {
            return {
              ...row,
              [action.columnId]: action.value
            };
          }
          return row;
        });
      case "update_cell_color":
        return state.map((row, index) => {
          if (index === action.rowIndex) {
            return {
              ...row,
              [`${action.columnId}_color`]: action.color
            };
          }
          return row;
        });
      case "update_column_color":
        return state.map(row => ({
          ...row,
          [`${action.columnId}_header_color`]: action.color
        }));
      case "add_row":
        return [...state, { id: shortId() }];
      case "delete_row":
        return state.filter((row, index) => index !== action.rowIndex);
      case "add_column_to_left":
        const newLeftId = shortId();
        return state.map((row) => {
          const entries = Object.entries(row);
          const index = entries.findIndex(([key]) => key === action.columnId);
          if (index === -1) return row;
          return {
            ...row,
            [newLeftId]: ""
          };
        });
      case "add_column_to_right":
        const newRightId = shortId();
        return state.map((row) => {
          const entries = Object.entries(row);
          const index = entries.findIndex(([key]) => key === action.columnId);
          if (index === -1) return row;
          return {
            ...row,
            [newRightId]: ""
          };
        });
      case "delete_column":
        return state.map((row) => {
          const { [action.columnId]: _, ...rest } = row;
          return rest;
        });
      case "update_column_type":
        return state;
      case "update_column_header":
        return state;
      default:
        return state;
    }
  }, data);

  return [{ rows }, dispatch];
} 