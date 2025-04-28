import makeData from "../table/makeData";
import { getTableURL } from "./table-to-svg";

export const createTableElement = (store) => {
  const state = makeData(2);
  // add first qr code
  const { src, ratio } = getTableURL({
    ...state,
    headerColor: "#e6f7ff",
    rowColors: {},
    columnColors: {}
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
        columnColors: {}
      }
    }
  });
};
