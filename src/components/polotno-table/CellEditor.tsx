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
      let x = 0;
      let y = 0;

      // Sum up widths and heights before this cell
      for (let i = 0; i < col; i++) {
        x += element.columnWidths[i];
      }
      for (let i = 0; i < row; i++) {
        y += element.rowHeights[i];
      }

      return {
        x,
        y,
        width: element.columnWidths[col],
        height: element.rowHeights[row],
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
      <Group>
        <Rect
          x={x}
          y={y}
          width={width}
          height={height}
          fill="rgba(255, 255, 255, 0.95)"
          stroke="#3B82F6"
          strokeWidth={2}
          cornerRadius={4}
        />
        <RichTextEditor
          x={x}
          y={y}
          width={width}
          height={height}
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
