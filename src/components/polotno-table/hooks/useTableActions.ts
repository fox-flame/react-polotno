import { useCallback } from "react";

export function useTableActions(element: any) {
  // Get the first selected cell for reference
  const getSelectedCellIndices = useCallback((): [number, number] | null => {
    if (element?.selectedCells?.length === 0) return null;
    const cell = element?.selectedCells?.[0];
    if (!cell || !cell.includes(",")) return null;
    const [row, col] = cell.split(",").map(Number);
    return [row, col];
  }, [element]);

  // Get unique rows and columns from selected cells
  const getSelectedRowsAndCols = useCallback(() => {
    const rows = new Set<number>();
    const cols = new Set<number>();
    element.selectedCells.forEach((cell: string) => {
      const [row, col] = cell.split(",").map(Number);
      rows.add(row);
      cols.add(col);
    });
    return {
      rows: Array.from(rows).sort((a, b) => a - b),
      cols: Array.from(cols).sort((a, b) => a - b),
    };
  }, [element]);

  // Table structure operations
  const handleAddRow = useCallback(() => element.addRow(), [element]);
  const handleRemoveRow = useCallback(() => {
    const { rows } = getSelectedRowsAndCols();
    if (rows.length > 0) {
      [...rows].reverse().forEach((rowIndex) => {
        element.removeRow(rowIndex);
      });
    }
  }, [element, getSelectedRowsAndCols]);
  const handleAddColumn = useCallback(() => element.addColumn(), [element]);
  const handleRemoveColumn = useCallback(() => {
    const { cols } = getSelectedRowsAndCols();
    if (cols.length > 0) {
      [...cols].reverse().forEach((colIndex) => {
        element.removeColumn(colIndex);
      });
    }
  }, [element, getSelectedRowsAndCols]);

  // Position-specific operations
  const handleInsertRowAbove = useCallback((rowIndex: number) => {
    element.addRow(rowIndex);
  }, [element]);
  const handleInsertRowBelow = useCallback((rowIndex: number) => {
    element.addRow(rowIndex + 1);
  }, [element]);
  const handleDeleteRow = useCallback((rowIndex: number) => {
    element.removeRow(rowIndex);
  }, [element]);
  const handleInsertColumnLeft = useCallback((colIndex: number) => {
    element.addColumn(colIndex);
  }, [element]);
  const handleInsertColumnRight = useCallback((colIndex: number) => {
    element.addColumn(colIndex + 1);
  }, [element]);
  const handleDeleteColumn = useCallback((colIndex: number) => {
    element.removeColumn(colIndex);
  }, [element]);

  // Cell formatting operations
  const handleCellBackgroundChange = useCallback((color: string) => {
    element.setStyleForSelectedCells({ backgroundColor: color });
  }, [element]);
  const handleTextColorChange = useCallback((color: string) => {
    element.setStyleForSelectedCells({ textColor: color });
  }, [element]);
  const handleCellPaddingChange = useCallback((padding: number) => {
    element.set({ cellPadding: padding });
  }, [element]);
  const handleBorderWidthChange = useCallback((width: number) => {
    element.set({ borderWidth: width });
  }, [element]);
  const handleBorderColorChange = useCallback((color: string) => {
    element.set({ borderColor: color });
  }, [element]);

  // Text formatting operations
  const handleTextBold = useCallback(() => {
    const selectedIndices = getSelectedCellIndices();
    if (!selectedIndices) return;
    const [row, col] = selectedIndices;
    const currentStyle = element.getCellStyle(row, col);
    const isBold = currentStyle.fontWeight === "bold";
    element.setStyleForSelectedCells({
      fontWeight: isBold ? "normal" : "bold",
    });
  }, [element, getSelectedCellIndices]);
  const handleTextItalic = useCallback(() => {
    const selectedIndices = getSelectedCellIndices();
    if (!selectedIndices) return;
    const [row, col] = selectedIndices;
    const currentStyle = element.getCellStyle(row, col);
    const isItalic = currentStyle.fontStyle === "italic";
    element.setStyleForSelectedCells({
      fontStyle: isItalic ? "normal" : "italic",
    });
  }, [element, getSelectedCellIndices]);
  const handleTextUnderline = useCallback(() => {
    const selectedIndices = getSelectedCellIndices();
    if (!selectedIndices) return;
    const [row, col] = selectedIndices;
    const currentStyle = element.getCellStyle(row, col);
    const isUnderlined = currentStyle.textDecoration === "underline";
    element.setStyleForSelectedCells({
      textDecoration: isUnderlined ? "none" : "underline",
    });
  }, [element, getSelectedCellIndices]);
  const handleTextAlign = useCallback((align: "left" | "center" | "right") => {
    element.setStyleForSelectedCells({ textAlign: align });
  }, [element]);
  const handleFontSizeChange = useCallback((size: number) => {
    element.setStyleForSelectedCells({ fontSize: size });
  }, [element]);

  // Helper to determine if a style is active
  const isStyleActive = useCallback((styleKey: string, value: string): boolean => {
    const selectedIndices = getSelectedCellIndices();
    if (!selectedIndices) return false;
    const [row, col] = selectedIndices;
    const style = element.getCellStyle(row, col);
    return style[styleKey] === value;
  }, [element, getSelectedCellIndices]);

  return {
    getSelectedCellIndices,
    getSelectedRowsAndCols,
    handleAddRow,
    handleRemoveRow,
    handleAddColumn,
    handleRemoveColumn,
    handleInsertRowAbove,
    handleInsertRowBelow,
    handleDeleteRow,
    handleInsertColumnLeft,
    handleInsertColumnRight,
    handleDeleteColumn,
    handleCellBackgroundChange,
    handleTextColorChange,
    handleCellPaddingChange,
    handleBorderWidthChange,
    handleBorderColorChange,
    handleTextBold,
    handleTextItalic,
    handleTextUnderline,
    handleTextAlign,
    handleFontSizeChange,
    isStyleActive,
  };
} 