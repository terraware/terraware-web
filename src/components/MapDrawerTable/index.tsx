import React, { type JSX } from 'react';

import { Typography } from '@mui/material';

import Link from '../common/Link';
import './styles.scss';

export type MapDrawerTableRow = {
  key: string;
  value: string;
  url?: string;
};

type MapDrawerTableProps = {
  header?: string;
  rows: MapDrawerTableRow[];
  subheader?: string;
  subheaderUrl?: string;
};

const MapDrawerTable = ({ header, subheader, subheaderUrl, rows }: MapDrawerTableProps): JSX.Element => {
  return (
    <table className='map-drawer-table'>
      {header && (
        <thead>
          <tr>
            <th colSpan={2}>
              <div style={{ display: 'flex', flexDirection: 'row' }}>
                {header}
                {subheader && (
                  <div style={{ marginLeft: '10px' }}>
                    {subheaderUrl ? (
                      <Link fontSize={'14px'} fontWeight={400} lineHeight={'20px'} to={subheaderUrl}>
                        {subheader}
                      </Link>
                    ) : (
                      <Typography fontSize={'14px'} fontWeight={400} lineHeight={'20px'}>
                        {subheader}
                      </Typography>
                    )}
                  </div>
                )}
              </div>
            </th>
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
