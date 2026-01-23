import React, { type JSX } from 'react';

import { Box, SxProps, Typography, useTheme } from '@mui/material';

import strings from 'src/strings';
import { getRgbaFromHex } from 'src/utils/color';
import useDeviceInfo from 'src/utils/useDeviceInfo';

import Icon from './icon/Icon';
import { IconName } from './icon/icons';

export type View = 'list' | 'map';

export type ListMapSelectorProps = {
  defaultView: View;
  view: View;
  onView: (view: View) => void;
};

export default function ListMapSelector({ defaultView, view, onView }: ListMapSelectorProps): JSX.Element {
  const { isMobile } = useDeviceInfo();
  const theme = useTheme();

  const boxStyles: SxProps = {
    display: 'inline-flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
  };

  const renderSelector = (selectorView: View) => {
    const iconName: IconName = selectorView === 'list' ? 'iconList' : 'iconTreasureMap';
    const title: string = selectorView === 'list' ? strings.LIST : strings.MAP;
    const isSelected = view === selectorView;
    return (
      <Box
        width={isMobile ? '32px' : 'auto'}
        minWidth={isMobile ? '32px' : '67px'}
        borderRadius={theme.spacing(0.75)}
        padding={theme.spacing(0.5)}
        gap={theme.spacing(0.75)}
        sx={{
          ...boxStyles,
          background: isSelected ? theme.palette.TwClrBaseWhite : 'transparent',
          boxShadow: isSelected
            ? `0.0px 2.0px 4.0px 0px ${getRgbaFromHex(theme.palette.TwClrBaseGray800 as string, 0.2)}`
            : 'none',
          cursor: 'pointer',
        }}
        onClick={() => onView(selectorView)}
      >
        <Icon name={iconName} size='medium' fillColor={theme.palette.TwClrBaseGray500} />
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
      justifyContent='space-between'
      minWidth={isMobile ? '76px' : '152px'}
      borderRadius={theme.spacing(1)}
      padding={theme.spacing(0.5)}
      marginTop={isMobile ? 1 : 0}
      gap={theme.spacing(0.5)}
      style={{ backgroundColor: theme.palette.TwClrBgSecondary }}
      sx={boxStyles}
    >
      {renderSelector(defaultView === 'list' ? 'list' : 'map')}
      {renderSelector(defaultView !== 'list' ? 'list' : 'map')}
    </Box>
  );
}
