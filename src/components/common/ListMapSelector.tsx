import React from 'react';

import { Box, Theme, Typography, useTheme } from '@mui/material';
import { makeStyles } from '@mui/styles';

import strings from 'src/strings';
import { getRgbaFromHex } from 'src/utils/color';
import useDeviceInfo from 'src/utils/useDeviceInfo';

import Icon from './icon/Icon';
import { IconName } from './icon/icons';

const useStyles = makeStyles((theme: Theme) => ({
  icon: {
    '& path': {
      fill: theme.palette.TwClrBaseGray500,
    },
  },
  box: {
    display: 'inline-flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
}));

export type View = 'list' | 'map';

export type ListMapSelectorProps = {
  defaultView: View;
  view: View;
  onView: (view: View) => void;
};

export default function ListMapSelector({ defaultView, view, onView }: ListMapSelectorProps): JSX.Element {
  const classes = useStyles();
  const { isMobile } = useDeviceInfo();
  const theme = useTheme();

  const renderSelector = (selectorView: View) => {
    const iconName: IconName = selectorView === 'list' ? 'iconList' : 'iconTreasureMap';
    const title: string = selectorView === 'list' ? strings.LIST : strings.MAP;
    const isSelected = view === selectorView;
    return (
      <Box
        className={classes.box}
        width={isMobile ? '32px' : 'auto'}
        minWidth={isMobile ? '32px' : '67px'}
        borderRadius={theme.spacing(0.75)}
        padding={theme.spacing(0.5)}
        gap={theme.spacing(0.75)}
        sx={{
          background: isSelected ? theme.palette.TwClrBaseWhite : 'transparent',
          boxShadow: isSelected
            ? `0.0px 2.0px 4.0px 0px ${getRgbaFromHex(theme.palette.TwClrBaseGray800 as string, 0.2)}`
            : 'none',
          cursor: 'pointer',
        }}
        onClick={() => onView(selectorView)}
      >
        <Icon name={iconName} size='medium' className={classes.icon} />
        {!isMobile && (
          <Typography
            fontSize='16px'
            fontWeight={400}
            lineHeight='24px'
            textAlign='center'
            color={theme.palette.TwClrTxt}
          >
            {title}
          </Typography>
        )}
      </Box>
    );
  };

  return (
    <Box
      className={classes.box}
      justifyContent='space-between'
      minWidth={isMobile ? '76px' : '152px'}
      borderRadius={theme.spacing(1)}
      padding={theme.spacing(0.5)}
      gap={theme.spacing(0.5)}
      style={{ backgroundColor: theme.palette.TwClrBgSecondary }}
    >
      {renderSelector(defaultView === 'list' ? 'list' : 'map')}
      {renderSelector(defaultView !== 'list' ? 'list' : 'map')}
    </Box>
  );
}
