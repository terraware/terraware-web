import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { Box, Grid, useTheme } from '@mui/material';

import { Crumb } from 'src/components/BreadCrumbs';
import Page from 'src/components/Page';
import ProjectFieldDisplay from 'src/components/ProjectField/Display';
import Card from 'src/components/common/Card';
import Button from 'src/components/common/button/Button';
import { APP_PATHS } from 'src/constants';
import useListModules from 'src/hooks/useListModules';
import { useLocalization, useUser } from 'src/providers';
import { requestCohort } from 'src/redux/features/cohorts/cohortsAsyncThunks';
import { selectCohort } from 'src/redux/features/cohorts/cohortsSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import CohortModulesTable from 'src/scenes/AcceleratorRouter/Modules/CohortModulesTable';
import strings from 'src/strings';
import { CohortModule } from 'src/types/Module';
import useStateLocation, { getLocation } from 'src/utils/useStateLocation';

const CohortView = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useStateLocation();
  const { activeLocale } = useLocalization();
  const { isAllowed } = useUser();
  const theme = useTheme();
  const canEdit = isAllowed('UPDATE_COHORTS');
  const pathParams = useParams<{ cohortId: string }>();
  const cohortId = Number(pathParams.cohortId);
  const cohort = useAppSelector(selectCohort(cohortId));
  const { modules, listModules, listDeliverables, deliverablesByModuleId } = useListModules();
  const [modulesWithDeliverablesQuantity, setModulesWithDeliverablesQuantity] = useState<CohortModule[]>();

  useEffect(() => {
    if (cohortId) {
      void listDeliverables();
      void dispatch(requestCohort({ cohortId }));
      void listModules({ cohortId });
    }
  }, [cohortId, dispatch]);

  useEffect(() => {
    if (deliverablesByModuleId) {
      const newModules = modules?.map((md) => {
        return { ...md, deliverablesQuantity: deliverablesByModuleId[md.id]?.length || 0 };
      });

      setModulesWithDeliverablesQuantity(newModules);
    }
  }, [modules, deliverablesByModuleId]);

  const goToEditCohort = useCallback(() => {
    if (pathParams.cohortId) {
      navigate(getLocation(APP_PATHS.ACCELERATOR_COHORTS_EDIT.replace(':cohortId', pathParams.cohortId), location));
    }
  }, [navigate, location, pathParams.cohortId]);

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
        name: activeLocale ? strings.OVERVIEW : '',
        to: `${APP_PATHS.ACCELERATOR_OVERVIEW}?tab=cohorts`,
      },
    ],
    [activeLocale]
  );

  if (!cohort) {
    return;
  }

  return (
    <Page crumbs={crumbs} title={cohort?.name || ''} rightComponent={rightComponent}>
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
          <ProjectFieldDisplay label={strings.COHORT_NAME} value={cohort.name} rightBorder={true} />
          <ProjectFieldDisplay label={strings.PHASE} value={cohort.phase} rightBorder={true} />
        </Grid>
        <Box paddingLeft={2} paddingRight={2}>
          <CohortModulesTable
            modules={modulesWithDeliverablesQuantity}
            deliverablesByModuleId={deliverablesByModuleId}
            cohortId={cohortId}
          />
        </Box>
      </Card>
    </Page>
  );
};

export default CohortView;
