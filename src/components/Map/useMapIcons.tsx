import { useMemo } from 'react';
import { Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme: Theme) => ({
  icon: {
    backgroundColor: theme.palette.TwClrBaseWhite,
    border: `1px solid ${theme.palette.TwClrBgTertiary}`,
    borderRadius: theme.spacing(0.5),
    margin: theme.spacing(0, 0.5),
    width: '20px',
    height: '20px',
  },
}));

export type MapIconType = 'polygon' | 'slice' | 'trash';

type MapIcons = Record<MapIconType, JSX.Element>;

export default function useMapIcons(): MapIcons {
  const classes = useStyles();

  const icons: MapIcons = useMemo<MapIcons>(() => {
    const polygon = <button className={`mapbox-gl-draw_polygon mapbox-gl-draw_ctrl-draw-btn ${classes.icon}`} />;
    const slice = <button className={`mapbox-gl-draw_line mapbox-gl-draw_ctrl-draw-btn ${classes.icon}`} />;
    const trash = <button className={`mapbox-gl-draw_trash mapbox-gl-draw_ctrl-draw-btn ${classes.icon}`} />;

    return { polygon, slice, trash };
  }, [classes]);

  return icons;
}
