import React from 'react';

import { Box, CircularProgress, Theme, Typography, useTheme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Button, IconName } from '@terraware/web-components';

const useStyles = makeStyles((theme: Theme) => ({
  spinner: {
    height: '40px',
    width: '40px',
    position: 'relative',
    margin: 'auto',
    '& .MuiCircularProgress-svg': {
      color: theme.palette.TwClrIcnBrand,
      height: '40px',
      width: '40px',
    },
  },
}));

export type SecondaryButtonProps = {
  title?: string;
  icon?: IconName;
  onClick: () => void;
};

export type PageContentProps = {
  title?: string;
  secondaryButton?: SecondaryButtonProps;
  children?: React.ReactNode;
  styles?: Record<string, string | number>;
};

const PageContent = ({ title, secondaryButton, children, styles }: PageContentProps): JSX.Element => {
  const theme = useTheme();
  const classes = useStyles();

  if (!children) {
    return (
      <Box marginTop='32px' display='flex' flexDirection='row' flexGrow={1}>
        <CircularProgress className={classes.spinner} />
      </Box>
    );
  }

  return (
    <Box
      display='flex'
      flexDirection='column'
      flexGrow={1}
      sx={{
        backgroundColor: theme.palette.TwClrBg,
        borderRadius: '16px',
        marginTop: '16px',
        padding: theme.spacing(3),
        minWidth: 'fit-content',
        ...(styles || {}),
      }}
    >
      {(title || secondaryButton) && (
        <Box display='flex' flexDirection='row' justifyContent='space-between' alignItems='center' marginBottom={2}>
          <Typography fontSize='20px' fontWeight={600} color={theme.palette.TwClrTxt}>
            {title ?? ''}
          </Typography>
          {secondaryButton && (
            <Button
              id={`button-${secondaryButton.title}`}
              label={secondaryButton.title}
              onClick={secondaryButton.onClick}
              size='small'
              priority='secondary'
              icon={secondaryButton.icon}
            />
          )}
        </Box>
      )}
      {children}
    </Box>
  );
};

export default PageContent;
