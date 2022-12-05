import { IconButton, Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import React, { useEffect, useState } from 'react';
import Icon from '../common/icon/Icon';
import useDeviceInfo from 'src/utils/useDeviceInfo';

interface StyleProps {
  isMobile: boolean;
}

const useStyles = makeStyles((theme: Theme) => ({
  expandable: {
    borderRadius: '16px',
    backgroundColor: theme.palette.TwClrBg,
    width: (props: StyleProps) => (props.isMobile ? '100%' : '584px'),
    padding: theme.spacing(1),
  },
  disabledExpandable: {
    opacity: 0.4,
  },
  titleExpandable: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: `${theme.spacing(2)}px`,
  },
  icon: {
    fill: theme.palette.TwClrIcn,
  },
}));

type ExpandableProps = {
  title: React.ReactNode;
  children: React.ReactNode;
  opened: boolean;
  disabled?: boolean;
};

export default function Expandable(props: ExpandableProps): JSX.Element {
  const { isMobile } = useDeviceInfo();
  const classes = useStyles({ isMobile });
  const { title, children, opened, disabled } = props;
  const [open, setOpen] = useState<boolean>(false);
  const [lastOpened, setLastOpened] = useState<boolean>(false);

  useEffect(() => {
    if (lastOpened !== opened) {
      setOpen(opened);
      setLastOpened(opened);
    }
  }, [opened, open, setOpen, lastOpened, setLastOpened]);

  return (
    <div className={classes.expandable + ' ' + (disabled ? classes.disabledExpandable : '')}>
      <div className={classes.titleExpandable}>
        <span>{title}</span>
        <IconButton onClick={() => setOpen(!open)} disabled={disabled}>
          <Icon name={open ? 'chevronUp' : 'chevronDown'} className={classes.icon} />
        </IconButton>
      </div>
      {open && <div>{children}</div>}
    </div>
  );
}
