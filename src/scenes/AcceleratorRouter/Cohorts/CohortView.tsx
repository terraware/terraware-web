import React, { useCallback, useEffect, useMemo } from 'react';
import { useHistory } from 'react-router';
import { useParams } from 'react-router-dom';

import { Grid, useTheme } from '@mui/material';

import { Crumb } from 'src/components/BreadCrumbs';
import Card from 'src/components/common/Card';
import Button from 'src/components/common/button/Button';
import { APP_PATHS } from 'src/constants';
import { useLocalization, useUser } from 'src/providers';
import { requestCohort } from 'src/redux/features/cohorts/cohortsAsyncThunks';
import { selectCohort } from 'src/redux/features/cohorts/cohortsSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import useStateLocation, { getLocation } from 'src/utils/useStateLocation';

import PageWithModuleTimeline from '../PageWithModuleTimeline';
import CohortFieldDisplay from './CohortField/Display';

// import CohortFieldMeta from './CohortField/Meta';

const CohortView = () => {
  const dispatch = useAppDispatch();
  const history = useHistory();
  const location = useStateLocation();
  const { activeLocale } = useLocalization();
  const { isAllowed } = useUser();
  const theme = useTheme();
  const canEdit = isAllowed('UPDATE_COHORTS');
  const pathParams = useParams<{ cohortId: string }>();
  const cohortId = Number(pathParams.cohortId);

  const cohort = useAppSelector(selectCohort(cohortId));

  useEffect(() => {
    void dispatch(requestCohort({ cohortId }));
  }, [cohortId, dispatch]);

  const goToEditCohort = useCallback(
    () =>
      history.push(getLocation(APP_PATHS.ACCELERATOR_COHORTS_EDIT.replace(':cohortId', pathParams.cohortId), location)),
    [history, location, pathParams.cohortId]
  );

  const rightComponent = useMemo(
    () =>
      activeLocale &&
      canEdit && (
        <Button label={strings.EDIT_COHORT} icon='iconEdit' onClick={goToEditCohort} size='medium' id='editCohort' />
      ),
    [activeLocale, canEdit, goToEditCohort]
  );

  const crumbs: Crumb[] = useMemo(
    () => [
      {
        name: activeLocale ? strings.COHORTS : '',
        to: APP_PATHS.ACCELERATOR_COHORTS,
      },
    ],
    [activeLocale]
  );

  return (
    <PageWithModuleTimeline
      crumbs={crumbs}
      hierarchicalCrumbs={false}
      rightComponent={rightComponent}
      title={cohort?.name || ''}
    >
      {cohort && (
        <>
          <Card
            style={{
              display: 'flex',
              flexDirection: 'column',
              flexGrow: 1,
              marginBottom: theme.spacing(3),
              padding: `${theme.spacing(2)} ${theme.spacing(1)}`,
            }}
          >
            <Grid container>
              <CohortFieldDisplay label={strings.COHORT_NAME} value={cohort.name} rightBorder={true} />
              <CohortFieldDisplay label={strings.PHASE} value={cohort.phase} rightBorder={true} />
            </Grid>

            {/* TODO: uncomment this section once createdTime & modifiedTime are available in Cohort records */}
            {/* <Grid container>
              <CohortFieldMeta
                date={cohort.createdTime}
                dateLabel={strings.CREATED_ON}
                user={cohort.createdBy}
                userLabel={strings.CREATED_BY}
              />
              <CohortFieldMeta
                date={cohort.modifiedTime}
                dateLabel={strings.LAST_MODIFIED_ON}
                user={cohort.modifiedBy}
                userLabel={strings.LAST_MODIFIED_BY}
              />
            </Grid> */}
          </Card>
        </>
      )}
    </PageWithModuleTimeline>
  );
};

export default CohortView;
