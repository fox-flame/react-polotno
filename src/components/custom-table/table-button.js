"use client";

import React from 'react';
import { observer } from 'mobx-react-lite';
import { Button } from '@blueprintjs/core';

export const TableButton = observer(({ store }) => {
  const handleClick = () => {
    console.log('Table button clicked');
    const page = store.activePage;
    console.log('Selected page:', page);
    
    if (page) {
      try {
        const element = {
          type: 'custom-table',
          x: 50,
          y: 50,
          width: 300,
          height: 150,
          cellPadding: 8,
          cellBorderWidth: 1,
          cellBorderColor: '#ccc',
          tableData: [
            [
              { text: 'Row 1, Cell 1', bold: false, italic: false },
              { text: 'Row 1, Cell 2', bold: false, italic: false }
            ],
            [
              { text: 'Row 2, Cell 1', bold: false, italic: false },
              { text: 'Row 2, Cell 2', bold: false, italic: false }
            ]
          ]
        };
        console.log('Adding element:', element);
        page.addElement(element);
        console.log('Element added successfully');
      } catch (error) {
        console.error('Error adding table element:', error);
      }
    } else {
      console.warn('No page selected');
    }
  };

  return (
    <Button
      icon="th"
      minimal
      onClick={handleClick}
      title="Add Table"
    />
  );
});

