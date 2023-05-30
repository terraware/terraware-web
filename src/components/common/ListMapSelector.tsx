import React from 'react';
import { Box, Theme, Typography, useTheme } from '@mui/material';
import strings from 'src/strings';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import Icon from './icon/Icon';
import { IconName } from './icon/icons';
import Button from 'src/components/common/button/Button';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme: Theme) => ({
  selected: {
  },
  deselected: {
  },
  disabled: {
  },
}));

export type View = 'list' | 'map' | undefined;

export type ListMapSelectorProps = {
  view: View;
  onView: (view: View) => void;
  listDisabled?: boolean;
  mapDisabled?: boolean;
};

export default function ListMapSelector({
  view,
  onView,
  listDisabled,
  mapDisabled,
}: ListMapSelectorProps): JSX.Element {
  const classes = useStyles();
  const { isMobile } = useDeviceInfo();

  return (
    <Box
      display='flex'
    >
      <Box>
      </Box>   
      <Box>
      </Box>   
    </Box>
  );
}
