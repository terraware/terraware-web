import { Box, Container, Fab, Grid } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import React from 'react';
import Title from '../common/Title';
import { useHistory } from 'react-router-dom';
import useStateLocation, { getLocation } from '../../utils/useStateLocation';
import { SelectedOrgInfo, ServerOrganization } from 'src/types/Organization';

const useStyles = makeStyles((theme) =>
  createStyles({
    mainContainer: {
      paddingLeft: 0,
    },
    container: {
      maxWidth: '100%',
    },
    title: {
      fontSize: '24px',
      lineHeight: '32px',
      fontWeight: '600' as React.CSSProperties['fontWeight'],
    },
    subtitle: {
      fontWeight: '400' as React.CSSProperties['fontWeight'],
      paddingTop: '16px',
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
    rightComponent: {
      paddingTop: '32px',
    },
  })
);

interface Props {
  title?: string | string[];
  subtitle: string | React.ReactNode;
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
}: Props): JSX.Element {
  const classes = useStyles();
  const history = useHistory();
  const location = useStateLocation();

  return (
    <Container maxWidth={false} className={classes.mainContainer}>
      <Grid container spacing={0} className={classes.container}>
        {page && parentPage && (
          <Grid item xs={12}>
            <Title
              page={page}
              parentPage={parentPage}
              organization={organization}
              allowAll={allowAll}
              selectedOrgInfo={selectedOrgInfo}
              onChangeSelectedOrgInfo={onChangeSelectedOrgInfo}
              showFacility={showFacility}
            />
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
                <ArrowBackIcon />
              </Fab>
            </div>
          )}
          <div className={classes.mainContent}>
            <Box display='flex' justifyContent='space-between' alignItems='center'>
              <Typography id='title' variant='h4' className={classes.title}>
                {title}
              </Typography>

              {!!rightComponent && <div className={classes.rightComponent}>{rightComponent}</div>}
            </Box>
            <Typography id='subtitle' variant='h6' className={classes.subtitle}>
              {subtitle}
            </Typography>
            {children}
          </div>
        </Grid>
      </Grid>
    </Container>
  );
}
