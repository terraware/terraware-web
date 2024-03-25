import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';

import { Box, Grid, Typography, useTheme } from '@mui/material';
import { TableColumnType } from '@terraware/web-components';
import { useDeviceInfo } from '@terraware/web-components/utils';

import Page from 'src/components/Page';
import Card from 'src/components/common/Card';
import Button from 'src/components/common/button/Button';
import Table from 'src/components/common/table';
import { APP_PATHS } from 'src/constants';
import { useLocalization, useUser } from 'src/providers';
import { requestCohorts } from 'src/redux/features/cohorts/cohortsAsyncThunks';
import { selectCohorts } from 'src/redux/features/cohorts/cohortsSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';

import CohortCellRenderer from './CohortCellRenderer';

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
  const { activeLocale } = useLocalization();
  const { isMobile } = useDeviceInfo();
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
    <Page
      title={strings.COHORTS}
      rightComponent={
        canCreateCohorts && (
          <>
            {isMobile ? (
              <Button id='new-cohort' icon='plus' onClick={goToNewCohort} size='medium' priority='secondary' />
            ) : (
              <Button
                id='new-cohort'
                label={strings.ADD_COHORT}
                icon='plus'
                onClick={goToNewCohort}
                size='medium'
                priority='secondary'
              />
            )}
          </>
        )
      }
      contentStyle={{ display: 'flex', flexGrow: 1, flexDirection: 'column' }}
    >
      <Card flushMobile>
        <Grid container>
          <Grid item xs={12}>
            <Grid container spacing={4}>
              <Grid item xs={12}>
                {!cohorts?.length ? (
                  <EmptyState onClick={goToNewCohort} />
                ) : (
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
    </Page>
  );
};

export default CohortListView;

const EmptyState = ({ onClick }: { onClick: () => void }): JSX.Element => {
  const theme = useTheme();
  const { isAllowed } = useUser();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 0,
        margin: 'auto',
        padding: theme.spacing(3, 3, 8),
        textAlign: 'center',
      }}
    >
      <Typography
        color={theme.palette.TwClrTxt}
        fontSize='16px'
        fontWeight={400}
        lineHeight='24px'
        marginBottom={theme.spacing(2)}
      >
        {strings.COHORTS_EMPTY_STATE}
      </Typography>
      {isAllowed('CREATE_COHORTS') && (
        <Box sx={{ margin: 'auto' }}>
          <Button icon='plus' id='new-cohort' label={strings.ADD_COHORT} onClick={onClick} size='medium' />
        </Box>
      )}
    </Box>
  );
};
