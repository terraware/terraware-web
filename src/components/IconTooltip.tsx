import { Theme, Tooltip, TooltipProps } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { IconName } from '@terraware/web-components';

import Icon from './common/icon/Icon';
import useDeviceInfo from 'src/utils/useDeviceInfo';

const useStyles = makeStyles((theme: Theme) => ({
  arrow: {
    color: '#3A4445',
    marginLeft: '3px',
    marginTop: '-1px',
  },
  icon: {
    fill: '#3A4445',
    verticalAlign: 'text-top',
  },
  tooltip: {
    backgroundColor: '#3A4445',
    borderRadius: '8px',
    padding: '8px',
    '& a': {
      color: '#fff',
    },
  },
}));

type IconTooltipProps = {
  iconName?: IconName;
  placement?: TooltipProps['placement'];
  title: TooltipProps['title'];
};

export default function IconTooltip({
  iconName = 'info',
  placement = 'top-start',
  title,
}: IconTooltipProps): JSX.Element {
  const { isMobile } = useDeviceInfo();
  const classes = useStyles();

  return (
    <Tooltip
      arrow
      classes={{
        arrow: classes.arrow,
        tooltip: classes.tooltip,
      }}
      placement={placement}
      sx={{
        maxWidth: isMobile ? '342px' : '464px',
      }}
      title={title}
    >
      <span>
        <Icon name={iconName} className={classes.icon} />
      </span>
    </Tooltip>
  );
}
