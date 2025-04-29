import React from 'react';
import { observer } from 'mobx-react-lite';
import { unstable_registerToolbarComponent } from 'polotno/config';
import { NumericInput, Navbar, Alignment, Button } from '@blueprintjs/core';

const TableToolbar = observer(({ store }) => {
  const element = store.selectedElements[0];

  if (!element || element.type !== 'custom-table') {
    return null;
  }

  return (
    <Navbar.Group align={Alignment.LEFT}>
      <NumericInput
        onValueChange={(padding) => {
          element.setCellPadding(padding);
        }}
        value={element.cellPadding}
        style={{ width: '50px', marginRight: '10px' }}
        min={0}
        max={20}
        label="Padding"
      />
      <NumericInput
        onValueChange={(width) => {
          element.setCellBorderWidth(width);
        }}
        value={element.cellBorderWidth}
        style={{ width: '50px', marginRight: '10px' }}
        min={0}
        max={5}
        label="Border"
      />
      <input
        type="color"
        value={element.cellBorderColor}
        onChange={(e) => {
          element.setCellBorderColor(e.target.value);
        }}
        style={{ width: '30px', height: '30px', marginRight: '10px' }}
      />
      <Button
        icon="bold"
        minimal
        onClick={() => {
          const selectedCell = element.selectedCell;
          if (selectedCell) {
            element.updateCell(selectedCell.row, selectedCell.col, {
              bold: !element.tableData[selectedCell.row][selectedCell.col].bold,
            });
          }
        }}
      />
      <Button
        icon="italic"
        minimal
        onClick={() => {
          const selectedCell = element.selectedCell;
          if (selectedCell) {
            element.updateCell(selectedCell.row, selectedCell.col, {
              italic: !element.tableData[selectedCell.row][selectedCell.col].italic,
            });
          }
        }}
      />
    </Navbar.Group>
  );
});

unstable_registerToolbarComponent('custom-table', TableToolbar); 