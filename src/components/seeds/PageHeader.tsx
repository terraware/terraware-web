import React from 'react';
import Title from '../common/Title';
import { useHistory } from 'react-router-dom';
import useStateLocation, { getLocation } from '../../utils/useStateLocation';
import { SelectedOrgInfo, ServerOrganization } from 'src/types/Organization';
import PageSnackbar from 'src/components/PageSnackbar';
import { ArrowBack } from '@mui/icons-material';
import { Container, Grid, Fab, Box, Typography, Theme, useTheme } from '@mui/material';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme: Theme) => ({
  mainContainer: {
    '&.MuiContainer-root': {
      paddingLeft: 0,
      paddingRight: 0,
    },
  },
  container: {
    maxWidth: '100%',
  },
  pageTitle: {
    fontSize: '24px',
    lineHeight: '32px',
    fontWeight: 600,
  },
  subtitle: {
    fontWeight: 400,
    paddingTop: theme.spacing(1.5),
    fontSize: '14px',
    lineHeight: '20px',
  },
  flex: {
    display: 'flex',
  },
  back: {
    marginTop: theme.spacing(4),
  },
  backIcon: {
    marginRight: theme.spacing(4),
    backgroundColor: theme.palette.common.white,
  },
  mainContent: {
    width: '100%',
  },
}));

interface Props {
  title?: string | string[];
  subtitle?: string | React.ReactNode;
  children?: React.ReactNode;
  rightComponent?: React.ReactNode;
  page?: string;
  parentPage?: string;
  back?: boolean;
  backUrl?: string;
  organization?: ServerOrganization;
  allowAll?: boolean;
  selectedOrgInfo?: SelectedOrgInfo;
  onChangeSelectedOrgInfo?: (selectedValues: SelectedOrgInfo) => void;
  showFacility?: boolean;
  titleClassName?: string;
}

export default function PageHeader({
  title,
  subtitle,
  children,
  rightComponent,
  back,
  backUrl,
  page,
  parentPage,
  organization,
  allowAll,
  selectedOrgInfo,
  onChangeSelectedOrgInfo,
  showFacility,
  titleClassName,
}: Props): JSX.Element {
  const classes = useStyles();
  const theme = useTheme();
  const history = useHistory();
  const location = useStateLocation();

  const getPageHeading = () => {
    if (page && parentPage) {
      return <Title page={page} parentPage={parentPage} />;
    }
  };

  return (
    <Container maxWidth={false} className={classes.mainContainer}>
      <Grid container spacing={0} className={classes.container}>
        {page && parentPage && title && (
          <Grid item xs={12}>
            {getPageHeading()}
          </Grid>
        )}
        <Grid item xs={12} className={classes.flex}>
          {back && (
            <div className={classes.back}>
              <Fab
                id='close'
                size='small'
                aria-label='close'
                className={classes.backIcon}
                onClick={() => {
                  if (backUrl) {
                    history.push(getLocation(backUrl, location));
                  } else {
                    history.go(-1);
                  }
                }}
              >
                <ArrowBack />
              </Fab>
            </div>
          )}
          <div className={classes.mainContent}>
            <Box padding={theme.spacing(0, 3, 3, 3)}>
              <Box display='flex' justifyContent='space-between' alignItems='center'>
                <Typography
                  id='title'
                  variant='h4'
                  className={`${classes.pageTitle} ${titleClassName}`}
                  sx={{ fontSize: '24px', lineHeight: '32px', fontWeight: 600 }}
                >
                  {title || getPageHeading()}
                </Typography>
                {!!rightComponent && <div>{rightComponent}</div>}
              </Box>
              <Typography id='subtitle' variant='h6' className={classes.subtitle}>
                {subtitle}
              </Typography>
            </Box>
            <PageSnackbar />
            {children}
          </div>
        </Grid>
      </Grid>
    </Container>
  );
}
