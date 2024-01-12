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

export type MapIconProps = {
  icon: MapIconType;
};

export default function MapIcon({ icon }: MapIconProps): JSX.Element {
  const classes = useStyles();

  if (icon === 'polygon') {
    return <button className={`mapbox-gl-draw_polygon mapbox-gl-draw_ctrl-draw-btn ${classes.icon}`} />;
  }

  if (icon === 'trash') {
    return <button className={`mapbox-gl-draw_trash mapbox-gl-draw_ctrl-draw-btn ${classes.icon}`} />;
  }

  // TODO, use slice icon asset
  return <button className={`mapbox-gl-draw_line mapbox-gl-draw_ctrl-draw-btn ${classes.icon}`} />;
}
