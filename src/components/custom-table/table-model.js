import { unstable_registerShapeModel } from 'polotno/config';
import { types } from 'mobx-state-tree';

// Define the cell model
const CellModel = types.model('Cell', {
  text: types.string,
  bold: types.boolean,
  italic: types.boolean,
});

// Define the row model
const RowModel = types.array(CellModel);

// Define the table data model
const TableDataModel = types.array(RowModel);

// Define the table model
const TableModel = types.model('Table', {
  type: types.literal('custom-table'),
  tableData: TableDataModel,
  cellPadding: types.number,
  cellBorderWidth: types.number,
  cellBorderColor: types.string,
  width: types.number,
  height: types.number,
});

unstable_registerShapeModel(
  {
    type: 'custom-table',
    tableData: types.frozen([
      [
        { text: 'Row 1, Cell 1', bold: false, italic: false },
        { text: 'Row 1, Cell 2', bold: false, italic: false }
      ],
      [
        { text: 'Row 2, Cell 1', bold: false, italic: false },
        { text: 'Row 2, Cell 2', bold: false, italic: false }
      ]
    ]),
    cellPadding: types.number,
    cellBorderWidth: types.number,
    cellBorderColor: types.string,
    width: types.number,
    height: types.number,
  },
  (tableModel) => {
    return tableModel.actions((self) => {
      return {
        updateCell(row, col, data) {
          const newTableData = [...self.tableData];
          if (!newTableData[row]) {
            newTableData[row] = [];
          }
          newTableData[row][col] = { ...newTableData[row][col], ...data };
          self.tableData = newTableData;
        },
        setCellPadding(padding) {
          self.cellPadding = padding;
        },
        setCellBorderWidth(width) {
          self.cellBorderWidth = width;
        },
        setCellBorderColor(color) {
          self.cellBorderColor = color;
        },
      };
    });
  }
); 