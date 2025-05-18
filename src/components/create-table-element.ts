// Define some example table templates
export const tableTemplates = [
  {
    name: "Simple 3x3",
    rows: 3,
    columns: 3,
    data: [
      ["Header 1", "Header 2", "Header 3"],
      ["Data 1", "Data 2", "Data 3"],
      ["Data 4", "Data 5", "Data 6"],
    ],
    svgPlaceholder: `
      <svg width="40" height="30" viewBox="0 0 40 30" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="2" width="36" height="26" stroke="#666" stroke-width="1" />
        <line x1="2" y1="8" x2="38" y2="8" stroke="#666" stroke-width="1" />
        <line x1="2" y1="14" x2="38" y2="14" stroke="#666" stroke-width="1" />
        <line x1="14" y1="2" x2="14" y2="28" stroke="#666" stroke-width="1" />
        <line x1="26" y1="2" x2="26" y2="28" stroke="#666" stroke-width="1" />
      </svg>
    `,
  },
  {
    name: "Two Column (4 Rows)",
    rows: 4,
    columns: 2,
    headerRow: true,
    data: [
      ["Item", "Value"],
      ["A", "1"],
      ["B", "2"],
      ["C", "3"],
    ],
    svgPlaceholder: `
      <svg width="30" height="40" viewBox="0 0 30 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="2" width="26" height="36" stroke="#666" stroke-width="1" />
        <rect x="2" y="2" width="26" height="8" fill="#eee" />
        <line x1="2" y1="10" x2="28" y2="10" stroke="#666" stroke-width="1" />
        <line x1="2" y1="18" x2="28" y2="18" stroke="#666" stroke-width="1" />
        <line x1="2" y1="26" x2="28" y2="26" stroke="#666" stroke-width="1" />
        <line x1="2" y1="34" x2="28" y2="34" stroke="#666" stroke-width="1" />
        <line x1="14" y1="2" x2="14" y2="38" stroke="#666" stroke-width="1" />
      </svg>
    `,
  },
  {
    name: "Header 3x4",
    rows: 4,
    columns: 3,
    headerRow: true,
    data: [
      ["Header 1", "Header 2", "Header 3"],
      ["Data 1", "Data 2", "Data 3"],
      ["Data 4", "Data 5", "Data 6"],
      ["Data 7", "Data 8", "Data 9"],
    ],
    svgPlaceholder: `
      <svg width="45" height="35" viewBox="0 0 45 35" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="2" width="41" height="31" stroke="#666" stroke-width="1" />
        <rect x="2" y="2" width="41" height="7.75" fill="#eee" />
        <line x1="2" y1="9.75" x2="43" y2="9.75" stroke="#666" stroke-width="1" />
        <line x1="2" y1="17.5" x2="43" y2="17.5" stroke="#666" stroke-width="1" />
        <line x1="2" y1="25.25" x2="43" y2="25.25" stroke="#666" stroke-width="1" />
        <line x1="15.6667" y1="2" x2="15.6667" y2="33" stroke="#666" stroke-width="1" />
        <line x1="28.3333" y1="2" x2="28.3333" y2="33" stroke="#666" stroke-width="1" />
      </svg>
    `,
  },
  // Add more templates with corresponding SVG representations
];

// Helper function to add a template table to the canvas
export const handleAddTemplateTable = (store: any, template: any) => {
  const page = store.activePage;
  if (!page) return;

  page.addElement({
    type: "table",
    x: template.x || 50, // Center the table on pointer
    y: template.y || 50,
    width: 300, // Adjust as needed
    height: 150, // Adjust as needed
    rows: template.rows,
    columns: template.columns,
    cellPadding: 8,
    borderWidth: 1,
    borderColor: "#dddddd",
    headerRow: template.headerRow !== undefined ? template.headerRow : true,
    data: template.data,
    custom: {
      isTable: true,
    },
    cellStyles: {},
    selectedCells: [],
    draggable: true,
  });
};

// Helper function to add a new table to the canvas
export const handleAddTable = (store: any) => {
  // Get the active page
  const page = store.activePage;
  if (!page) return;

  // Add a new table element with all required props
  page.addElement({
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
