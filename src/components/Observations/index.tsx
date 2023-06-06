import { useEffect } from 'react';
import { CircularProgress } from '@mui/material';
import useSnackbar from 'src/utils/useSnackbar';
import { useOrganization } from 'src/providers/hooks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { requestObservationsResults } from 'src/redux/features/observations/observationsThunks';
import { requestSpecies } from 'src/redux/features/species/speciesThunks';
import { requestPlantingSites } from 'src/redux/features/tracking/trackingThunks';
import { selectObservationsResultsError, selectObservationsResults } from 'src/redux/features/observations/observationsSelectors';
import { selectSpecies } from 'src/redux/features/species/speciesSelectors';
import { selectPlantingSites } from 'src/redux/features/tracking/trackingSelectors';
import ObservationsHome from './ObservationsHome';

/**
 * This page will route to the correct component based on url params
 * eg. /observations or /observations/<planting-site-id> goes to <ObservationsHome />
 *     /observations/<planting-site-id>/<observation-id> will go to drilled down components (TODO)
 * Having this wrapper component allows us to pre-request data for all the views without being redundant.
 */
export default function Observations(): JSX.Element {
  const { selectedOrganization } = useOrganization();
  const snackbar = useSnackbar();
  const dispatch = useAppDispatch();
  const observationsResultsError = useAppSelector(selectObservationsResultsError);
  const observationResults = useAppSelector(selectObservationResults);
  const species = useAppSelector(selectSpecies);
  const plantingSites = useAppSelector(selectPlantingSites);

  useEffect(() => {
    if (species === undefined) {
      dispatch(requestSpecies(selectedOrganization.id));
    }
  }, [dispatch, selectedOrganization.id, species]);

  useEffect(() => {
    if (plantingSites === undefined) {
      dispatch(requestPlantingSites(selectedOrganization.id));
    }
  }, [dispatch, selectedOrganization.id, plantingSites]);

  useEffect(() => {
    if (species !== undefined && plantingSites !== undefined && observationResults === undefined) {
      dispatch(requestObservationResults(selectedOrganization.id));
    }
  }, [dispatch, selectedOrganization.id, species, plantingSites]);

  useEffect(() => {
  }, [

  if (

  return (
    <ObservationsHome />
  );
}
