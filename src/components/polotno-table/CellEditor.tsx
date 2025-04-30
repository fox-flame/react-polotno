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
      if (!element.store) return { x: 0, y: 0, width: 0, height: 0 };
      
      const scale = element.store.scale;
      const stagePos = { 
        x: element.store.x || 0,
        y: element.store.y || 0
      };

      let x = 0;
      let y = 0;

      // Get default sizes if not set
      const columnWidths = element.columnWidths?.length 
        ? element.columnWidths 
        : Array(element.columns).fill(element.width / element.columns);
      const rowHeights = element.rowHeights?.length
        ? element.rowHeights
        : Array(element.rows).fill(element.height / element.rows);

      // Calculate cell position
      for (let i = 0; i < col; i++) {
        x += columnWidths[i];
      }
      for (let i = 0; i < row; i++) {
        y += rowHeights[i];
      }

      // Adjust for element position and stage transform
      x = x + element.x;
      y = y + element.y;

      // Convert to screen coordinates if store and page are available
      if (element.store?.selectedPage) {
        const screenPoint = element.store.selectedPage.screenPointFromCanvas({ x, y });
        x = screenPoint.x;
        y = screenPoint.y;
      } else {
        // Fallback to basic transform
        x = x * (element.store?.scale || 1) + (element.store?.x || 0);
        y = y * (element.store?.scale || 1) + (element.store?.y || 0);
      }

      return {
        x,
        y,
        width: columnWidths[col] * scale,
        height: rowHeights[row] * scale,
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
