import { IconButton, Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import React, { useEffect, useState } from 'react';
import Icon from '../common/icon/Icon';

const useStyles = makeStyles((theme: Theme) => ({
  expandable: {
    borderRadius: '8px',
    border: '1px solid #A9B7B8',
    width: '584px',
    padding: `${theme.spacing(1)}px`,
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
    fill: '#3A4445',
  },
}));

type ExpandableProps = {
  title: React.ReactNode;
  children: React.ReactNode;
  opened: boolean;
  disabled?: boolean;
};

export default function Expandable(props: ExpandableProps): JSX.Element {
  const classes = useStyles();
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
