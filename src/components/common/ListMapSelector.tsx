import React from 'react';
import { Box, Theme, Typography, useTheme } from '@mui/material';
import strings from 'src/strings';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import Icon from './icon/Icon';
import { IconName } from './icon/icons';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme: Theme) => ({
  icon: {
    '& path': {
      fill: theme.palette.TwClrBaseGray500,
    },
  },
  box: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
}));

export type View = 'list' | 'map';

export type ListMapSelectorProps = {
  view: View;
  onView: (view: View) => void;
};

export default function ListMapSelector({ view, onView }: ListMapSelectorProps): JSX.Element {
  const classes = useStyles();
  const { isMobile } = useDeviceInfo();
  const theme = useTheme();

  const renderSelector = (iconName: IconName, title: string, selectorView: View) => (
    <Box
      className={classes.box}
      width={isMobile ? '32px' : '67px'}
      borderRadius='6px'
      padding='4px'
      gap='6px'
      sx={{
        background: view === selectorView ? theme.palette.TwClrBaseWhite : 'transparent',
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

  return (
    <Box
      className={classes.box}
      justifyContent='space-between'
      width={isMobile ? '76px' : '152px'}
      borderRadius='8px'
      padding='4px'
      gap='4px'
      style={{ backgroundColor: theme.palette.TwClrBgSecondary }}
    >
      {renderSelector('iconList', strings.LIST, 'list')}
      {renderSelector('iconTreasureMap', strings.MAP, 'map')}
    </Box>
  );
}
