import { Box, Theme, Typography, useTheme } from '@mui/material';
import React from 'react';
import Icon from './icon/Icon';
import { IconName } from './icon/icons';
import Button from 'src/components/common/button/Button';
import { makeStyles } from '@mui/styles';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import stopPropagation from 'src/utils/stopPropagationEvent';
import Link from './Link';

export type LinkStyle = 'plain' | 'button';

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    background: theme.palette.TwClrBg,
    borderRadius: '24px',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    padding: '24px',
    '&.min-height': {
      minHeight: '220px',
    },
  },
  title: {
    display: 'flex',
    paddingBottom: '16px',
    alignItems: 'center',
  },
  bold: {
    fontWeight: 600,
  },
  icon: {
    fill: theme.palette.TwClrIcnSecondary,
  },
  titleText: {
    fontSize: '20px',
    lineHeight: '28px',
    paddingLeft: '10px',
    fontWeight: 600,
  },
  description: {
    fontSize: '16px',
    lineHeight: '24px',
    height: '100%',
    fontWeight: 400,
  },
  link: {
    display: 'block',
    fontSize: '16px',
  },
  buttonLink: {
    fontSize: '14px',
    lineHeight: '20px',
    marginLeft: 'auto',
    marginTop: '14px',
    maxWidth: 'fit-content',
  },
}));

export interface PageCardProps {
  name: string;
  isNameBold?: boolean;
  icon: IconName;
  description: string;
  linkText: string;
  link: string;
  linkStyle: LinkStyle;
}

export default function PageCard(props: PageCardProps): JSX.Element {
  const { name, isNameBold, icon, description, linkText, link, linkStyle } = props;
  const classes = useStyles({ linkStyle });
  const theme = useTheme();
  const { isMobile } = useDeviceInfo();

  const stopBubblingEvent = (event?: React.MouseEvent) => {
    if (event) {
      stopPropagation(event);
    }
  };

  return (
    <Box className={`${classes.container} ${isMobile ? '' : 'min-height'}`}>
      <div className={classes.title}>
        <Icon name={icon} size='medium' className={classes.icon} />
        <Typography
          component='p'
          className={`${classes.titleText} ${isNameBold ? classes.bold : ''}`}
          sx={{ fontSize: '20px', lineHeight: '28px', paddingLeft: '10px', fontWeight: 600 }}
        >
          {name}
        </Typography>
      </div>
      <Typography
        component='p'
        variant='h6'
        className={classes.description}
        sx={{ fontSize: '16px', fontWeight: 400, lineHeight: '24px', height: '100%', color: theme.palette.TwClrTxt }}
      >
        {description}
      </Typography>
      {linkStyle === 'plain' && (
        <Box onClick={stopBubblingEvent} marginTop='28px'>
          <Link className={classes.link} to={link}>
            {linkText}
          </Link>
        </Box>
      )}
      {linkStyle === 'button' && (
        <Button
          priority='secondary'
          label={linkText}
          className={classes.buttonLink}
          onClick={() => window.open(link, '_blank')}
        />
      )}
    </Box>
  );
}
