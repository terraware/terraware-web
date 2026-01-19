import React, { type JSX } from 'react';

import './styles.scss';

export type MapDrawerTableRow = {
  key: string;
  value: string;
  url?: string;
};

type MapDrawerTableProps = {
  header?: string;
  rows: MapDrawerTableRow[];
};

const MapDrawerTable = ({ header, rows }: MapDrawerTableProps): JSX.Element => {
  return (
    <table className='map-drawer-table'>
      {header && (
        <thead>
          <tr>
            <th colSpan={2}>{header}</th>
          </tr>
        </thead>
      )}
      <tbody>
        {rows.map((row, idx) => (
          <tr key={`row-${idx}`}>
            <td>{row.key}</td>
            <td>{row.url ? <a href={row.url}>{row.value}</a> : row.value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default MapDrawerTable;
