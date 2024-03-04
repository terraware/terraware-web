import React, { useEffect, useRef } from 'react';
import { useHistory } from 'react-router-dom';

import { Grid, useTheme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { TableColumnType } from '@terraware/web-components';
import { useDeviceInfo } from '@terraware/web-components/utils';

import PageSnackbar from 'src/components/PageSnackbar';
import Card from 'src/components/common/Card';
import PageHeaderWrapper from 'src/components/common/PageHeaderWrapper';
import Button from 'src/components/common/button/Button';
import Table from 'src/components/common/table';
import { APP_PATHS } from 'src/constants';
import { useLocalization, useUser } from 'src/providers';
import { requestCohorts } from 'src/redux/features/cohorts/cohortsAsyncThunks';
import { selectCohorts } from 'src/redux/features/cohorts/cohortsSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';

import AcceleratorMain from './AcceleratorMain';
import CohortCellRenderer from './CohortCellRenderer';

const useStyles = makeStyles(() => ({
  title: {
    margin: 0,
    fontSize: '24px',
    fontWeight: 600,
  },
  centered: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginBottom: '32px',
  },
}));

const columns = (activeLocale: string | null): TableColumnType[] =>
  activeLocale
    ? [
        {
          key: 'name',
          name: strings.NAME,
          type: 'string',
        },
        {
          key: 'phase',
          name: strings.PHASE,
          type: 'string',
        },
      ]
    : [];

const CohortListView = () => {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const { activeLocale } = useLocalization();
  const { isMobile } = useDeviceInfo();
  const contentRef = useRef(null);
  const classes = useStyles();
  const history = useHistory();
  const { isAllowed } = useUser();
  const canCreateCohorts = isAllowed('CREATE_COHORTS');

  const cohorts = useAppSelector(selectCohorts);

  const goToNewCohort = () => {
    const newProjectLocation = {
      pathname: APP_PATHS.ACCELERATOR_COHORTS_NEW,
    };
    history.push(newProjectLocation);
  };

  useEffect(() => {
    dispatch(requestCohorts({ locale: activeLocale }));
  }, [dispatch, activeLocale]);

  return (
    <AcceleratorMain>
      <PageHeaderWrapper nextElement={contentRef.current}>
        <Grid container paddingBottom={theme.spacing(4)} paddingLeft={isMobile ? 0 : theme.spacing(3)}>
          <Grid item xs={8}>
            <h1 className={classes.title}>{strings.COHORTS}</h1>
          </Grid>
          {canCreateCohorts && (
            <Grid item xs={4} className={classes.centered}>
              {isMobile ? (
                <Button id='new-cohort' icon='plus' onClick={goToNewCohort} size='medium' />
              ) : (
                <Button id='new-cohort' label={strings.ADD_COHORT} icon='plus' onClick={goToNewCohort} size='medium' />
              )}
            </Grid>
          )}
          <PageSnackbar />
        </Grid>
      </PageHeaderWrapper>

      <Card flushMobile>
        <Grid container ref={contentRef}>
          <Grid item xs={12}>
            <Grid container spacing={4}>
              <Grid item xs={12}>
                {cohorts && (
                  <Table
                    id='cohorts-table'
                    columns={() => columns(activeLocale)}
                    rows={cohorts}
                    orderBy='name'
                    Renderer={CohortCellRenderer}
                  />
                )}
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Card>
    </AcceleratorMain>
  );
};

export default CohortListView;
