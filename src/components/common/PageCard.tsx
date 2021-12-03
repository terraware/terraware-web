import { Box, Link, Typography } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import React from 'react';
import Icon from './icon/Icon';
import { IconName } from './icon/icons';
import { Link as RouterLink } from 'react-router-dom';

const useStyles = makeStyles((theme) =>
  createStyles({
    container: {
      border: '1px solid #A9B7B8',
      borderRadius: '8px',
      height: '100%',
      padding: '24px',
    },
    title: {
      display: 'flex',
      paddingBottom: '16px',
      alignItems: 'center',
    },
    icon: {
      fill: '#708284',
    },
    titleText: {
      fontSize: '20px',
      paddingLeft: '10px',
    },
    description: {
      fontSize: '16px',
      lineHeight: '24px',
    },
    link: {
      marginTop: '28px',
      display: 'block',
      fontSize: '16px',
    },
  })
);

export interface PageCardProps {
  name: string;
  icon: IconName;
  description: string;
  link: string;
}

export default function PageCard({ name, icon, description, link }: PageCardProps): JSX.Element {
  const classes = useStyles();

  return (
    <Box className={classes.container}>
      <div className={classes.title}>
        <Icon name={icon} className={classes.icon} />
        <Typography component='p' className={classes.titleText}>
          {name}
        </Typography>
      </div>
      <Typography component='p' variant='h6' className={classes.description}>
        {description}
      </Typography>
      <Link className={classes.link} component={RouterLink} to={link}>
        Go to {name}
      </Link>
    </Box>
  );
}
