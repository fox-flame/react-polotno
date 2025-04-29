"use client";
import React from 'react';
import { DownloadButton } from 'polotno/toolbar/download-button';
import { ImportJSONButton } from './table-button';
import { TableButton } from './custom-table/table-button';
export const ActionControls = ({ store }) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <DownloadButton store={store} />
      <ImportJSONButton store={store} />
      <TableButton store={store} />
    </div>
  );  
}; 