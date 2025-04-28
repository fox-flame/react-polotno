import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnResizeMode,
} from '@tanstack/react-table';
import { useState, useMemo } from 'react';

const defaultColumns = [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ getValue, row: { index }, column: { id }, table }) => {
      const initialValue = getValue();
      const [value, setValue] = useState(initialValue);
      const [isEditing, setIsEditing] = useState(false);

      const onBlur = () => {
        setIsEditing(false);
        table.options.meta?.updateData(index, id, value);
      };

      if (isEditing) {
        return (
          <input
            value={value}
            onChange={e => setValue(e.target.value)}
            onBlur={onBlur}
            autoFocus
            className="w-full p-1 border rounded"
          />
        );
      }

      return (
        <div
          onClick={() => setIsEditing(true)}
          className="cursor-pointer hover:bg-gray-100 p-1"
        >
          {value}
        </div>
      );
    },
  },
  {
    accessorKey: 'age',
    header: 'Age',
    cell: ({ getValue, row: { index }, column: { id }, table }) => {
      const initialValue = getValue();
      const [value, setValue] = useState(initialValue);
      const [isEditing, setIsEditing] = useState(false);

      const onBlur = () => {
        setIsEditing(false);
        table.options.meta?.updateData(index, id, value);
      };

      if (isEditing) {
        return (
          <input
            type="number"
            value={value}
            onChange={e => setValue(e.target.value)}
            onBlur={onBlur}
            autoFocus
            className="w-full p-1 border rounded"
          />
        );
      }

      return (
        <div
          onClick={() => setIsEditing(true)}
          className="cursor-pointer hover:bg-gray-100 p-1"
        >
          {value}
        </div>
      );
    },
  },
  {
    accessorKey: 'email',
    header: 'Email',
    cell: ({ getValue, row: { index }, column: { id }, table }) => {
      const initialValue = getValue();
      const [value, setValue] = useState(initialValue);
      const [isEditing, setIsEditing] = useState(false);

      const onBlur = () => {
        setIsEditing(false);
        table.options.meta?.updateData(index, id, value);
      };

      if (isEditing) {
        return (
          <input
            type="email"
            value={value}
            onChange={e => setValue(e.target.value)}
            onBlur={onBlur}
            autoFocus
            className="w-full p-1 border rounded"
          />
        );
      }

      return (
        <div
          onClick={() => setIsEditing(true)}
          className="cursor-pointer hover:bg-gray-100 p-1"
        >
          {value}
        </div>
      );
    },
  },
];

const TanStackTable = ({ 
  data, 
  columns, 
  headerColor, 
  rowColors, 
  columnColors, 
  cellColors, 
  onChange 
}) => {
  const [columnResizeMode] = useState('onChange');
  const [rowHeights, setRowHeights] = useState({});
  const [tableData, setTableData] = useState(data || [
    { name: 'John Doe', age: 30, email: 'john@example.com' },
    { name: 'Jane Smith', age: 25, email: 'jane@example.com' },
    { name: 'Bob Johnson', age: 35, email: 'bob@example.com' },
  ]);

  const tableColumns = useMemo(() => defaultColumns, [columns]);

  const table = useReactTable({
    data: tableData,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    columnResizeMode,
    meta: {
      updateData: (rowIndex, columnId, value) => {
        setTableData(old => 
          old.map((row, index) => {
            if (index === rowIndex) {
              return {
                ...old[rowIndex],
                [columnId]: value,
              };
            }
            return row;
          })
        );
        if (onChange) {
          onChange(tableData);
        }
      },
    },
  });

  const handleRowResize = (rowId, height) => {
    setRowHeights(prev => ({
      ...prev,
      [rowId]: height,
    }));
  };

  return (
    <div className="p-2">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id} style={{ backgroundColor: headerColor || "#e6f7ff" }}>
                {headerGroup.headers.map(header => (
                  <th
                    key={header.id}
                    className="border p-2 relative"
                    style={{
                      backgroundColor: columnColors?.[header.id] || 'transparent',
                      width: header.getSize(),
                    }}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                    <div
                      onMouseDown={header.getResizeHandler()}
                      onTouchStart={header.getResizeHandler()}
                      className={`absolute right-0 top-0 h-full w-1 bg-blue-500 cursor-col-resize select-none touch-none ${
                        header.column.getIsResizing() ? 'bg-blue-700' : ''
                      }`}
                    />
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map(row => (
              <tr
                key={row.id}
                style={{
                  backgroundColor: rowColors?.[row.id] || 'transparent',
                  height: rowHeights[row.id] || 'auto',
                }}
              >
                {row.getVisibleCells().map(cell => (
                  <td
                    key={cell.id}
                    className="border p-2 relative"
                    style={{
                      backgroundColor: cellColors?.[cell.id] || 'transparent',
                    }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    <div
                      className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500 cursor-row-resize select-none touch-none hover:bg-blue-700"
                      onMouseDown={(e) => {
                        const startY = e.clientY;
                        const startHeight = rowHeights[row.id] || 40;
                        
                        const handleMouseMove = (e) => {
                          const newHeight = startHeight + (e.clientY - startY);
                          handleRowResize(row.id, newHeight);
                        };
                        
                        const handleMouseUp = () => {
                          document.removeEventListener('mousemove', handleMouseMove);
                          document.removeEventListener('mouseup', handleMouseUp);
                        };
                        
                        document.addEventListener('mousemove', handleMouseMove);
                        document.addEventListener('mouseup', handleMouseUp);
                      }}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TanStackTable; 