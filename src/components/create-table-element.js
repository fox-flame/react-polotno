import makeData from "../table/makeData";
import { getTableURL } from "./table-to-svg";

export const createTableElement = (store) => {
  const state = makeData(2);
  // add first qr code
  const { src, ratio } = getTableURL({
    ...state,
    headerColor: "#e6f7ff",
    rowColors: {},
    columnColors: {},
  });

  store.activePage.addElement({
    type: "svg",
    name: "table",
    x: store.width / 2 - 300,
    y: store.height / 2 - 300,
    width: 600,
    height: 600 / ratio,
    src,
    custom: {
      isTable: true,
      state: {
        ...state,
        headerColor: "#e6f7ff",
        rowColors: {},
        columnColors: {},
      },
    },
  });
};

// Helper function to add a new table to the canvas
export const handleAddTable = (store) => {
  // Get the active page
  const page = store.activePage;
  if (!page) return;

  // Add a new table element with all required props
  page.addElement({
    id:'cp-custom-table',
    type: "table",
    x: 50, // Center the table on pointer
    y: 50,
    width: 400,
    height: 200,
    rows: 3,
    columns: 3,
    cellPadding: 8,
    borderWidth: 1,
    borderColor: "#dddddd",
    headerRow: true,
    data: [
      ["Header 1", "Header 2", "Header 3"],
      ["Cell 1,1", "Cell 1,2", "Cell 1,3"],
      ["Cell 2,1", "Cell 2,2", "Cell 2,3"],
    ],
    custom: {
      isTable: true,
    },
    cellStyles: {},
    selectedCells: [],
    draggable: true,
  });
};
