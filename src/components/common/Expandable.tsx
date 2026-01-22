import React, { type JSX, useEffect, useState } from 'react';

import { Box, IconButton, useTheme } from '@mui/material';

import useDeviceInfo from 'src/utils/useDeviceInfo';

import Icon from '../common/icon/Icon';

type ExpandableProps = {
  title: React.ReactNode;
  children: React.ReactNode;
  opened: boolean;
  disabled?: boolean;
};

export default function Expandable(props: ExpandableProps): JSX.Element {
  const theme = useTheme();
  const { isMobile } = useDeviceInfo();
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
    <Box
      sx={{
        borderRadius: '16px',
        backgroundColor: theme.palette.TwClrBg,
        width: isMobile ? '100%' : '584px',
        padding: theme.spacing(3),
        ...(disabled ? { opacity: 0.4 } : {}),
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingLeft: `${theme.spacing(2)}px`,
        }}
      >
        <span>{title}</span>
        <IconButton
          onClick={() => setOpen(!open)}
          disabled={disabled}
          disableRipple
          sx={{
            '&.MuiIconButton-root:hover': {
              backgroundColor: 'transparent',
            },
          }}
        >
          <Icon name={open ? 'chevronUp' : 'chevronDown'} style={{ fill: theme.palette.TwClrIcn }} />
        </IconButton>
      </Box>
      {open && <div>{children}</div>}
    </Box>
  );
}
