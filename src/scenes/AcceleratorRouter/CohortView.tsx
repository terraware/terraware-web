import React, { useCallback, useEffect, useMemo } from 'react';
import { useHistory } from 'react-router';
import { useParams } from 'react-router-dom';

import { Grid } from '@mui/material';

import { Crumb } from 'src/components/BreadCrumbs';
import Page from 'src/components/Page';
import Card from 'src/components/common/Card';
import TextField from 'src/components/common/Textfield/Textfield';
import Button from 'src/components/common/button/Button';
import { APP_PATHS } from 'src/constants';
import { useLocalization, useUser } from 'src/providers';
import { requestCohort } from 'src/redux/features/cohorts/cohortsAsyncThunks';
import { selectCohort } from 'src/redux/features/cohorts/cohortsSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import useStateLocation, { getLocation } from 'src/utils/useStateLocation';

const CohortView = () => {
  const dispatch = useAppDispatch();
  const history = useHistory();
  const location = useStateLocation();
  const { activeLocale } = useLocalization();
  const { isAllowed } = useUser();
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
    <Page crumbs={crumbs} title={cohort?.name || ''} rightComponent={rightComponent}>
      <Card flushMobile style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, borderRadius: '24px' }}>
        <Grid container>
          <Grid item xs={4}>
            <TextField label={strings.NAME} id='name' type='text' value={cohort?.name} display={true} />
          </Grid>
          <Grid item xs={8}>
            <TextField label={strings.PHASE} id='phase' type='text' value={cohort?.phase} display={true} />
          </Grid>
        </Grid>
      </Card>
    </Page>
  );
};

export default CohortView;
