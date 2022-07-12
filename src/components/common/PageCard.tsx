import { Box, Link, Typography } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import React from 'react';
import Icon from './icon/Icon';
import { IconName } from './icon/icons';
import { Link as RouterLink } from 'react-router-dom';
import Button from 'src/components/common/button/Button';

const useStyles = makeStyles((theme) =>
  createStyles({
    container: {
      background: '#ffffff',
      border: '1px solid #A9B7B8',
      borderRadius: '8px',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      minHeight: '220px',
      padding: '24px',
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
      fill: '#708284',
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
    underlinedLink: {
      marginTop: '28px',
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
  })
);

export interface PageCardProps {
  name: string;
  isNameBold?: boolean;
  icon: IconName;
  description: string;
  linkText: string;
  link: string;
  linkStyle: 'underline' | 'button';
}

export default function PageCard(props: PageCardProps): JSX.Element {
  const classes = useStyles();
  const { name, isNameBold, icon, description, linkText, link, linkStyle } = props;

  return (
    <Box className={classes.container}>
      <div className={classes.title}>
        <Icon name={icon} className={classes.icon} />
        <Typography component='p' className={`${classes.titleText} ${isNameBold ? classes.bold : ''}`}>
          {name}
        </Typography>
      </div>
      <Typography component='p' variant='h6' className={classes.description}>
        {description}
      </Typography>
      {linkStyle === 'underline' && (
        <Link className={classes.underlinedLink} component={RouterLink} to={link}>
          {linkText}
        </Link>
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
