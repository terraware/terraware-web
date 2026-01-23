import React, { type JSX, useCallback, useState } from 'react';

import { Popover, Typography, useTheme } from '@mui/material';
import { Icon } from '@terraware/web-components';

import { useMapPortalContainer } from 'src/components/Map/MapRenderUtils';
import { useLocalization } from 'src/providers';
import { ACTIVITY_TYPES, activityTypeColor, activityTypeLabel } from 'src/types/Activity';

export default function ColorKeyControl(): JSX.Element | null {
  const theme = useTheme();
  const mapPortalContainer = useMapPortalContainer();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { strings } = useLocalization();

  const handleClick = (event?: React.MouseEvent<HTMLButtonElement, MouseEvent> | undefined) => {
    setAnchorEl(event?.currentTarget ?? null);
  };

  const handleControlClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  if (mapPortalContainer) {
    return null;
  }

  return (
    <>
      <Popover
        id='color-key-popover'
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleControlClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        sx={{
          '& .MuiPaper-root': {
            padding: theme.spacing(1),
            borderRadius: '8px',
            overflow: 'visible',
          },
        }}
      >
        <table>
          <thead>
            <tr>
              <th>
                <Typography fontSize={'10px'} fontWeight={600} textAlign={'left'}>
                  {strings.COLOR}
                </Typography>
              </th>
              <th>
                <Typography fontSize={'10px'} fontWeight={600} textAlign={'left'}>
                  {strings.KEY}
                </Typography>
              </th>
            </tr>
          </thead>
          <tbody>
            {ACTIVITY_TYPES.map((activityType) => (
              <tr key={activityType}>
                <td style={{ display: 'flex', height: '20px', alignItems: 'center' }}>
                  <Icon name='iconPhoto' fillColor={activityTypeColor(activityType)} />
                </td>
                <td>
                  <Typography fontSize={'12px'}>{activityTypeLabel(activityType, strings)}</Typography>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Popover>
      <button
        onClick={handleClick}
        style={{
          border: 'none',
          borderRadius: '4px',
          backgroundColor: theme.palette.TwClrBg,
          cursor: 'pointer',
          height: '28px',
          minWidth: '28px',
          display: 'flex',
          alignItems: 'center',
          padding: `0 ${theme.spacing(0.5)}`,
          fontSize: '12px',
          fontWeight: 500,
        }}
      >
        {strings.SHOW_COLOR_KEY}
      </button>
    </>
  );
}
