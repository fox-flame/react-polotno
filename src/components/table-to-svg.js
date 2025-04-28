import * as svg from "polotno/utils/svg";

// Function to calculate relative luminance of a color
function getColorBrightness(hexColor) {
  // Remove # if present
  const color = hexColor.replace('#', '');
  
  // Convert to RGB
  const r = parseInt(color.substr(0, 2), 16);
  const g = parseInt(color.substr(2, 2), 16);
  const b = parseInt(color.substr(4, 2), 16);
  
  // Calculate relative luminance
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

function generateTableSVGString(
  columns, 
  data, 
  headerColor = "#e6f7ff", 
  rowColors = {}, 
  columnColors = {},
  cellColors = {}
) {
  columns = columns.slice(0, columns.length - 1);
  const baseRowHeight = 25;
  const lineHeight = 14;
  const padding = 2;
  
  // Ensure all columns have width and minWidth
  const normalizedColumns = columns.map(col => ({
    ...col,
    width: col.width || 150,
    minWidth: col.minWidth || 50
  }));
  
  const tableWidth = normalizedColumns.reduce(
    (acc, curr) => acc + curr.width,
    0
  );

  // Calculate dynamic row heights based on content
  const rowHeights = data.map((row, rowIndex) => {
    let maxLines = 1;
    // Ensure row is an array and handle the data structure
    const rowData = Array.isArray(row) ? row : Object.values(row);
    rowData.forEach((cell, cellIndex) => {
      if (cell && normalizedColumns[cellIndex]) {
        // Convert HTML divs to line breaks and remove other HTML
        const cellContent = String(cell)
          .replace(/<div>/g, '\n')
          .replace(/<\/div>/g, '')
          .replace(/<br\s*\/?>/g, '\n')
          .replace(/&nbsp;/g, ' ');
        const cleanContent = cellContent.replace(/<[^>]*>/g, '');
        
        // Count actual lines from content
        const lines = cleanContent.split('\n').filter(line => line.trim().length > 0);
        maxLines = Math.max(maxLines, lines.length);
      }
    });
    // Calculate height based on actual content height
    return Math.max(baseRowHeight, (maxLines * lineHeight) + (padding * 2));
  });

  const tableHeight = baseRowHeight + rowHeights.reduce((acc, height) => acc + height, 0);

  let svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="${tableWidth}" height="${tableHeight}">`;

  const drawLine = (x1, y1, x2, y2) => {
    svgString += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="black" stroke-width="1" />`;
  };

  const drawRect = (x1, y1, x2, y2, fillColor) => {
    svgString += `<rect x="${x1}" y="${y1}" height="${y2 - y1}" width="${
      x2 - x1
    }" fill="${fillColor}"/>`;
  };

  const getTextColor = (backgroundColor) => {
    if (backgroundColor === "transparent") return "#424242";
    return getColorBrightness(backgroundColor) > 0.5 ? "#424242" : "#ffffff";
  };

  const renderRow = (row, rowIndex) => {
    let xPosition = 0;
    const currentRowHeight = rowIndex === 0 ? baseRowHeight : rowHeights[rowIndex - 1];
    let yOffset = 0;
    
    // Calculate yOffset based on previous rows
    for (let i = 0; i < rowIndex; i++) {
      yOffset += i === 0 ? baseRowHeight : rowHeights[i - 1];
    }

    row.forEach((cell, cellIndex) => {
      const col = normalizedColumns[cellIndex];
      const columnId = col.id;
      const cellKey = `${rowIndex - 1}-${columnId}`;
      const cellColor = cellColors[cellKey] || "transparent";
      const rowColor = rowColors[rowIndex - 1] || "transparent";
      const columnColor = columnColors[columnId] || "transparent";
      const finalColor = cellColor !== "transparent" ? cellColor :
                        rowColor !== "transparent" ? rowColor : 
                        columnColor !== "transparent" ? columnColor : 
                        rowIndex === 0 ? headerColor : "transparent";

      if (rowIndex === 0) {
        drawLine(xPosition, 0, xPosition, tableHeight);
        const finalXPosition = xPosition + col.width;
        drawRect(xPosition, 0, finalXPosition, baseRowHeight, headerColor);
      } else {
        const finalXPosition = xPosition + col.width;
        drawRect(xPosition, yOffset, finalXPosition, yOffset + currentRowHeight, finalColor);
      }
      
      const textColor = getTextColor(finalColor);
      const cellWidth = col.width;
      
      // Convert HTML divs to line breaks and handle text content
      const cellContent = cell ? String(cell)
        .replace(/<div>/g, '\n')
        .replace(/<\/div>/g, '')
        .replace(/<br\s*\/?>/g, '\n')  // Handle <br> tags
        .replace(/&nbsp;/g, ' ')       // Handle non-breaking spaces
        : "";
      
      // Remove any remaining HTML tags and get clean text
      const cleanContent = cellContent.replace(/<[^>]*>/g, '');
      
      // Split into lines and handle word wrapping
      const lines = cleanContent.split('\n').map(line => line.trim()).filter(line => line.length > 0);
      
      if (lines.length === 0) {
        return;
      }
      
      const maxWidth = cellWidth - (padding * 2);
      const charWidth = 7;
      
      // Process each line for word wrapping
      const wrappedLines = [];
      lines.forEach(line => {
        const words = line.split(/\s+/).filter(word => word.length > 0);
        let currentLine = '';
        
        words.forEach(word => {
          const testLine = currentLine ? `${currentLine} ${word}` : word;
          if (testLine.length * charWidth <= maxWidth) {
            currentLine = testLine;
          } else {
            if (currentLine) wrappedLines.push(currentLine);
            currentLine = word;
          }
        });
        if (currentLine) wrappedLines.push(currentLine);
      });
      
      wrappedLines.forEach((line, lineIndex) => {
        const escapedLine = line.replace(/&/g, '&amp;')
                              .replace(/</g, '&lt;')
                              .replace(/>/g, '&gt;')
                              .replace(/"/g, '&quot;')
                              .replace(/'/g, '&#039;');
        
        svgString += `<text x="${xPosition + padding}" y="${
          yOffset + (lineIndex * lineHeight) + padding + (lineHeight / 2)
        }" font-size="14" fill="${textColor}" dominant-baseline="middle">${escapedLine}</text>`;
      });
      
      xPosition += cellWidth;
    });
    drawLine(xPosition, 0, xPosition, tableHeight);
    drawLine(0, yOffset, tableWidth, yOffset);
    if (rowIndex === data.length) {
      drawLine(0, yOffset + currentRowHeight, tableWidth, yOffset + currentRowHeight);
    }
  };

  // Render header row
  renderRow(
    normalizedColumns.map((col) => col.label),
    0
  );

  // Render data rows
  data.forEach((dataRow, rowIndex) => {
    const row = normalizedColumns.map((col) => dataRow[col.accessor]);
    renderRow(row, rowIndex + 1);
  });

  svgString += "</svg>";

  return { svgString, ratio: tableWidth / tableHeight };
}

// create svg image for QR code for input text
export function getTableURL({ 
  columns = [], 
  data = [], 
  headerColor = "#e6f7ff", 
  rowColors = {}, 
  columnColors = {},
  cellColors = {}
}) {
  const { svgString, ratio } = generateTableSVGString(
    columns, 
    data, 
    headerColor, 
    rowColors, 
    columnColors,
    cellColors
  );
  return { src: svg.svgToURL(svgString), ratio };
}
