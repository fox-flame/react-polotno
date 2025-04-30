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

  // Get pointer position for initial placement
  const pointerPosition = store.activeStage?.getPointerPosition() || { x: 50, y: 50 };

  // Add a new table element with all required props
  const element = page.addElement({
    type: "table",
    x: pointerPosition.x - 200, // Center the table on pointer
    y: pointerPosition.y - 100,
    width: 400,
    height: 200,
    rows: 3,
    columns: 4,
    cellPadding: 8,
    borderWidth: 1,
    borderColor: "#dddddd",
    headerRow: true,
    data: [
      ["Header 1", "Header 2", "Header 3", "Header 4"],
      ["Cell 1,1", "Cell 1,2", "Cell 1,3", "Cell 1,4"],
      ["Cell 2,1", "Cell 2,2", "Cell 2,3", "Cell 2,4"],
    ],
    cellStyles: {},
    selectedCells: [],
    draggable: true,
  });

  // Select the element for immediate dragging
  store.selectElements([element]);
};
