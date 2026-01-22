import React, { CSSProperties, type JSX } from 'react';

import { useTheme } from '@mui/material';
import { Icon } from '@terraware/web-components';

export type MapIconType = 'polygon' | 'slice' | 'trash';

export type MapIconProps = {
  centerAligned?: boolean;
  icon: MapIconType;
};

export default function MapIcon({ centerAligned, icon }: MapIconProps): JSX.Element {
  const theme = useTheme();

  const iconStyles: CSSProperties = {
    backgroundColor: theme.palette.TwClrBaseWhite,
    border: `1px solid ${theme.palette.TwClrBgTertiary}`,
    borderRadius: theme.spacing(0.5),
    margin: theme.spacing(0, 0.5),
    width: '20px',
    height: '20px',
    ...(centerAligned ? { position: 'relative', top: '3px' } : {}),
  };

  if (icon === 'polygon') {
    return <button className={'mapbox-gl-draw_polygon mapbox-gl-draw_ctrl-draw-btn'} style={iconStyles} />;
  }

  if (icon === 'trash') {
    return <button className={'mapbox-gl-draw_trash mapbox-gl-draw_ctrl-draw-btn'} style={iconStyles} />;
  }

  return <Icon name='iconSlice' style={iconStyles} />;
}
