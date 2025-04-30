"use client";
import React, { forwardRef, useRef, useEffect } from "react";
import { Html } from "react-konva-utils";

interface RichTextEditorProps {
  x: number;
  y: number;
  width: number;
  height: number;
  initialText: string;
  onChange: (text: string) => void;
  onBlur: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  editorRef: React.RefObject<HTMLDivElement>;
  element: any;
  row: number;
  col: number;
}

const RichTextEditor = forwardRef<HTMLDivElement, RichTextEditorProps>(
  (
    {
      x,
      y,
      width,
      height,
      initialText,
      onChange,
      onBlur,
      onKeyDown,
      editorRef,
      element,
      row,
      col,
    },
    ref
  ) => {
    // Get cell style for the current cell
    const cellStyle = element.getCellStyle(row, col);

    // Apply cell styles to the editor
    const getEditorStyle = () => {
      return {
        width: `${width}px`,
        height: `${height}px`,
        border: "none",
        padding: "4px",
        fontFamily: "Arial, sans-serif",
        fontSize: `${cellStyle.fontSize || 14}px`,
        fontWeight: cellStyle.fontWeight || "normal",
        fontStyle: cellStyle.fontStyle || "normal",
        textDecoration: cellStyle.textDecoration || "none",
        color: cellStyle.textColor || "#000000",
        textAlign: cellStyle.textAlign || "left",
        backgroundColor: "transparent",
        outline: "none",
        resize: "none",
        overflow: "auto",
      };
    };

    // Handle content change
    const handleChange = (e: React.ChangeEvent<HTMLDivElement>) => {
      onChange(e.target.innerText);
    };

    useEffect(() => {
      // Set initial content
      if (editorRef.current) {
        editorRef.current.innerText = initialText;

        // Set cursor to end of text
        const range = document.createRange();
        const sel = window.getSelection();

        if (editorRef.current.childNodes[0]) {
          range.setStart(editorRef.current.childNodes[0], initialText.length);
          range.collapse(true);

          sel?.removeAllRanges();
          sel?.addRange(range);
        }
      }
    }, [initialText, editorRef]);

    return (
      <Html
        divProps={{
          style: {
            position: "fixed",
            left: x + 'px',
            top: y + 'px',
            width: width + 'px',
            height: height + 'px',
            zIndex: 1000,
          },
        }}
      >
        <div
          ref={editorRef}
          contentEditable
          style={{
            width: "100%",
            height: "100%",
            border: "none",
            padding: "4px",
            fontFamily: "Arial, sans-serif",
            fontSize: `${cellStyle.fontSize || 14}px`,
            fontWeight: cellStyle.fontWeight || "normal",
            fontStyle: cellStyle.fontStyle || "normal",
            textDecoration: cellStyle.textDecoration || "none",
            color: cellStyle.textColor || "#000000",
            textAlign: cellStyle.textAlign || "left",
            backgroundColor: "white",
            outline: "none",
            resize: "none",
            overflow: "hidden",
            position: "absolute",
            top: 0,
            left: 0,
            boxSizing: "border-box",
          }}
          onInput={handleChange}
          onBlur={onBlur}
          onKeyDown={onKeyDown}
        />
      </Html>
    );
  }
);

export default RichTextEditor;
