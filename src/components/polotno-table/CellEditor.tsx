"use client";
import React, { useState, useEffect, useRef } from "react";
import { observer } from "mobx-react-lite";
import { Group, Rect, Text } from "react-konva";
import RichTextEditor from "./RichTextEditor";

interface CellEditorProps {
  cellKey: string;
  initialText: string;
  element: any;
  onComplete: (row: number, col: number, text: string) => void;
  onCancel: () => void;
}

const CellEditor = observer(
  ({
    cellKey,
    initialText,
    element,
    onComplete,
    onCancel,
  }: CellEditorProps) => {
    const [text, setText] = useState(initialText);
    const editorRef = useRef<HTMLDivElement>(null);
    const [row, col] = cellKey.split(",").map(Number);

    // Calculate position and size for the editor
    const calculateEditorPosition = () => {
      // Element has all details for the table
      const { rows, columns, width, height } = element;

      // Calculate cell sizes based on equal distribution (simplified)
      const cellWidth = width / columns;
      const cellHeight = height / rows;

      // Calculate position
      const x = cellWidth * col;
      const y = cellHeight * row;

      return {
        x,
        y,
        width: cellWidth,
        height: cellHeight,
      };
    };

    const { x, y, width, height } = calculateEditorPosition();

    // Handle editor blur (finish editing)
    const handleBlur = () => {
      onComplete(row, col, text);
    };

    // Handle key down events (Escape to cancel, Enter to complete)
    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onCancel();
      } else if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        onComplete(row, col, text);
      }
    };

    // Focus the editor on mount
    useEffect(() => {
      const editor = editorRef.current;
      if (editor) {
        editor.focus();
      }
    }, []);

    return (
      <Group x={x} y={y}>
        <Rect
          width={width}
          height={height}
          fill="rgba(255, 255, 255, 0.95)"
          stroke="#3B82F6"
          strokeWidth={2}
          cornerRadius={4}
        />
        <RichTextEditor
          x={5}
          y={5}
          width={width - 10}
          height={height - 10}
          initialText={initialText}
          onChange={setText}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          editorRef={editorRef}
          element={element}
          row={row}
          col={col}
        />
      </Group>
    );
  }
);

export default CellEditor;
