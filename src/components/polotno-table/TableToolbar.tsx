"use client";
import React, { useState } from "react";
import { observer } from "mobx-react-lite";
import { 
  NumericInput, 
  Button, 
  Card, 
  H5, 
  Label, 
  Switch, 
  Slider, 
  Colors,
  Tooltip,
  Popover,
  Menu,
  MenuItem,
  Divider,
  Classes,
  ControlGroup,
  ButtonGroup} from '@blueprintjs/core';
import ColorPicker from "polotno/toolbar/color-picker";
import { useTableActions } from "./hooks/useTableActions";

const TableToolbar = observer(({ store }: { store: any }) => {
  const element = store.selectedElements[0];

  const [showRowOperations, setShowRowOperations] = useState(false);
  const [showColumnOperations, setShowColumnOperations] = useState(false);
  const [selectedRowForOps, setSelectedRowForOps] = useState<number | null>(
    null
  );
  const [selectedColForOps, setSelectedColForOps] = useState<number | null>(
    null
  );

  // Use the custom hook for all table actions
  const {
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
  } = useTableActions(element);

  // Determine if the cell has a specific style applied
  const isBold = isStyleActive("fontWeight", "bold");
  const isItalic = isStyleActive("fontStyle", "italic");
  const isUnderlined = isStyleActive("textDecoration", "underline");

  // Get active text alignment
  const getTextAlign = (): "left" | "center" | "right" => {
    const selectedIndices = getSelectedCellIndices();
    if (!selectedIndices) return "left";
    const [row, col] = selectedIndices;
    const style = element.getCellStyle(row, col);
    return (style.textAlign as "left" | "center" | "right") || "left";
  };

  // Get the font size
  const getFontSize = (): number => {
    const selectedIndices = getSelectedCellIndices();
    if (!selectedIndices) return 14;
    const [row, col] = selectedIndices;
    const style = element.getCellStyle(row, col);
    return style.fontSize || 14;
  };

  // Get the text color
  const getTextColor = (): string => {
    const selectedIndices = getSelectedCellIndices();
    if (!selectedIndices) return "#000000";
    const [row, col] = selectedIndices;
    const style = element.getCellStyle(row, col);
    return style.textColor || "#000000";
  };

  // Get cell background color
  const getCellBackgroundColor = (): string => {
    const selectedIndices = getSelectedCellIndices();
    if (!selectedIndices) return "#ffffff";
    const [row, col] = selectedIndices;
    const style = element.getCellStyle(row, col);
    return style.backgroundColor || "#ffffff";
  };

  console.log("element", element);

  return (
    <div className="bp4-elevation-1" style={{ 
      padding: '16px', 
      borderRadius: '4px',
      backgroundColor: Colors.WHITE
    }}>
      {/* Table Structure Controls */}
      <Card className="bp4-elevation-2" style={{ 
        marginBottom: '16px',
        backgroundColor: Colors.LIGHT_GRAY5
      }}>
      <H5 className={Classes.HEADING} style={{ 
          marginBottom: '16px',
          color: Colors.DARK_GRAY1
        }}>Table Structure</H5>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <Label className={Classes.TEXT_MUTED} style={{ marginBottom: 4 }}>Rows</Label>
            <ButtonGroup>
              <Tooltip content="Remove selected row" position="bottom">
                <Button
                  icon="minus"
                  onClick={handleRemoveRow}
                  disabled={element.rows <= 1}
                  minimal
                />
              </Tooltip>
              <Tooltip content="Add new row" position="bottom">
                <Button
                  icon="plus"
                  onClick={handleAddRow}
                  minimal
                />
              </Tooltip>
              <Popover
                content={
                  <Menu>
                    <MenuItem
                      icon="arrow-up"
                      text="Insert Above"
                      onClick={() => handleInsertRowAbove(selectedRowForOps!)}
                    />
                    <MenuItem
                      icon="arrow-down"
                      text="Insert Below"
                      onClick={() => handleInsertRowBelow(selectedRowForOps!)}
                    />
                    <Divider />
                    <MenuItem
                      icon="trash"
                      text="Delete Row"
                      intent="danger"
                      onClick={() => handleDeleteRow(selectedRowForOps!)}
                      disabled={element.rows <= 1}
                    />
                  </Menu>
                }
                position="bottom"
                minimal
              >
                <Button icon="more" minimal />
              </Popover>
            </ButtonGroup>
          </div>
          <div>
            <Label className={Classes.TEXT_MUTED} style={{ marginBottom: 4 }}>Columns</Label>
            <ButtonGroup>
              <Tooltip content="Remove selected column" position="bottom">
                <Button
                  icon="minus"
                  onClick={handleRemoveColumn}
                  disabled={element.columns <= 1}
                  minimal
                />
              </Tooltip>
              <Tooltip content="Add new column" position="bottom">
                <Button
                  icon="plus"
                  onClick={handleAddColumn}
                  minimal
                />
              </Tooltip>
              <Popover
                content={
                  <Menu>
                    <MenuItem
                      icon="arrow-left"
                      text="Insert Left"
                      onClick={() => handleInsertColumnLeft(selectedColForOps!)}
                    />
                    <MenuItem
                      icon="arrow-right"
                      text="Insert Right"
                      onClick={() => handleInsertColumnRight(selectedColForOps!)}
                    />
                    <Divider />
                    <MenuItem
                      icon="trash"
                      text="Delete Column"
                      intent="danger"
                      onClick={() => handleDeleteColumn(selectedColForOps!)}
                      disabled={element.columns <= 1}
                    />
                  </Menu>
                }
                position="bottom"
                minimal
              >
                <Button icon="more" minimal />
              </Popover>
            </ButtonGroup>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Label className={Classes.TEXT_MUTED} style={{ marginBottom: 0, marginRight: 8 }}>Header Row</Label>
            <Switch
              checked={element.headerRow}
              onChange={(e) => element.set({ headerRow: e.currentTarget.checked })}
              large
              style={{ margin: 0 }}
            />
          </div>
        </div>
      </Card>

      {/* Cell Styling Controls */}
      <Card className="bp4-elevation-2" style={{ 
        marginBottom: '16px',
        backgroundColor: Colors.LIGHT_GRAY5
      }}>
        <H5 className={Classes.HEADING} style={{ 
          marginBottom: '16px',
          color: Colors.DARK_GRAY1
        }}>Cell Styling</H5>
        <ControlGroup fill={true} vertical={true} style={{ gap: '16px' }}>
          {element.selectedCells.length > 0 && (
            <div>
              <Label className={Classes.TEXT_MUTED}>Cell Background</Label>
              <ControlGroup>
                <ColorPicker
                  value={element.selectedCells.length === 1
                    ? element.cellBackgrounds?.[element.selectedCells[0]] || Colors.WHITE
                    : Colors.WHITE}
                  onChange={(color) => {
                    const newBackgrounds = { ...element.cellBackgrounds };
                    element.selectedCells.forEach((cellKey: any) => {
                      newBackgrounds[cellKey] = color;
                    });
                    element.set({ cellBackgrounds: newBackgrounds });
                  }}
                  store={store}
                />
              </ControlGroup>
            </div>
          )}

          <div>
            <Label className={Classes.TEXT_MUTED}>Cell Padding</Label>
            <ControlGroup>
              <Slider
                min={0}
                max={20}
                value={element.cellPadding}
                onChange={(value) => handleCellPaddingChange(value)}
                labelRenderer={false}
                className={Classes.FILL}
              />
              <NumericInput
                value={element.cellPadding}
                onValueChange={(value) => handleCellPaddingChange(value)}
                min={0}
                max={20}
                buttonPosition="none"
                style={{ width: '60px' }}
              />
            </ControlGroup>
          </div>

          <div>
            <Label className={Classes.TEXT_MUTED}>Border Width</Label>
            <ControlGroup>
              <Slider
                min={0}
                max={5}
                value={element.borderWidth}
                onChange={(value) => handleBorderWidthChange(value)}
                labelRenderer={false}
                className={Classes.FILL}
              />
              <NumericInput
                value={element.borderWidth}
                onValueChange={(value) => handleBorderWidthChange(value)}
                min={0}
                max={5}
                buttonPosition="none"
                style={{ width: '60px' }}
              />
            </ControlGroup>
          </div>

          <div>
            <Label className={Classes.TEXT_MUTED}>Border Color</Label>
            <ControlGroup>
              <ColorPicker
                value={element.borderColor}
                onChange={handleBorderColorChange}
                store={store}
              />
            </ControlGroup>
          </div>
        </ControlGroup>
      </Card>

      {/* Text Formatting Controls */}
      <Card className="bp4-elevation-2" style={{ 
        backgroundColor: Colors.LIGHT_GRAY5
      }}>
        <H5 className={Classes.HEADING} style={{ 
          marginBottom: '16px',
          color: Colors.DARK_GRAY1
        }}>Text Formatting</H5>
        <ControlGroup fill={true} vertical={true} style={{ gap: '16px' }}>
          <div>
            <Label className={Classes.TEXT_MUTED}>Text Style</Label>
            <ButtonGroup>
              <Tooltip content="Bold" position="bottom">
                <Button
                  icon="bold"
                  active={isBold}
                  onClick={handleTextBold}
                  minimal
                />
              </Tooltip>
              <Tooltip content="Italic" position="bottom">
                <Button
                  icon="italic"
                  active={isItalic}
                  onClick={handleTextItalic}
                  minimal
                />
              </Tooltip>
              <Tooltip content="Underline" position="bottom">
                <Button
                  icon="underline"
                  active={isUnderlined}
                  onClick={handleTextUnderline}
                  minimal
                />
              </Tooltip>
            </ButtonGroup>
          </div>

          <div>
            <Label className={Classes.TEXT_MUTED}>Text Alignment</Label>
            <ButtonGroup>
              <Tooltip content="Align Left" position="bottom">
                <Button
                  icon="align-left"
                  active={getTextAlign() === "left"}
                  onClick={() => handleTextAlign("left")}
                  minimal
                />
              </Tooltip>
              <Tooltip content="Align Center" position="bottom">
                <Button
                  icon="align-center"
                  active={getTextAlign() === "center"}
                  onClick={() => handleTextAlign("center")}
                  minimal
                />
              </Tooltip>
              <Tooltip content="Align Right" position="bottom">
                <Button
                  icon="align-right"
                  active={getTextAlign() === "right"}
                  onClick={() => handleTextAlign("right")}
                  minimal
                />
              </Tooltip>
            </ButtonGroup>
          </div>

          <div>
            <Label className={Classes.TEXT_MUTED}>Font Size</Label>
            <ControlGroup>
              <Slider
                min={8}
                max={40}
                value={getFontSize()}
                onChange={(value) => handleFontSizeChange(value)}
                labelRenderer={false}
                className={Classes.FILL}
              />
              <NumericInput
                value={getFontSize()}
                onValueChange={(value) => handleFontSizeChange(value)}
                min={8}
                max={40}
                buttonPosition="none"
                style={{ width: '60px' }}
              />
            </ControlGroup>
          </div>

          <div>
            <Label className={Classes.TEXT_MUTED}>Text Color</Label>
            <ControlGroup>
              <ColorPicker
                value={getTextColor()}
                onChange={handleTextColorChange}
                store={store}
              />
            </ControlGroup>
          </div>
        </ControlGroup>
      </Card>
    </div>
  );
});

export default TableToolbar;

// unstable_registerToolbarComponent("table", TableToolbar);
