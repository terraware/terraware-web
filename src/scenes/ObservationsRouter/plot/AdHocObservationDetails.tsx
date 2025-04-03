import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { Box, Grid, Typography, useTheme } from '@mui/material';
import { Button, Message, Textfield } from '@terraware/web-components';
import { getDateDisplayValue } from '@terraware/web-components/utils';
import _ from 'lodash';

import Card from 'src/components/common/Card';
import OptionsMenu from 'src/components/common/OptionsMenu';
import { APP_PATHS } from 'src/constants';
import { useLocalization, useOrganization } from 'src/providers';
import { selectAdHocObservationsResults } from 'src/redux/features/observations/observationsSelectors';
import { getConditionString } from 'src/redux/features/observations/utils';
import { selectMergeOtherSpecies, selectSpecies } from 'src/redux/features/species/speciesSelectors';
import {
  MergeOtherSpeciesRequestData,
  requestMergeOtherSpecies,
  requestSpecies,
} from 'src/redux/features/species/speciesThunks';
import { selectPlantingSite } from 'src/redux/features/tracking/trackingSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { useSpecies } from 'src/scenes/InventoryRouter/form/useSpecies';
import DetailsPage from 'src/scenes/ObservationsRouter/common/DetailsPage';
import MergedSuccessMessage from 'src/scenes/ObservationsRouter/common/MergedSuccessMessage';
import SpeciesMortalityRateChart from 'src/scenes/ObservationsRouter/common/SpeciesMortalityRateChart';
import SpeciesTotalPlantsChart from 'src/scenes/ObservationsRouter/common/SpeciesTotalPlantsChart';
import MatchSpeciesModal, {
  MergeOtherSpeciesPayloadPartial,
} from 'src/scenes/ObservationsRouter/details/MatchSpeciesModal';
import strings from 'src/strings';
import { getShortTime } from 'src/utils/dateFormatter';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import useSnackbar from 'src/utils/useSnackbar';
import { useDefaultTimeZone } from 'src/utils/useTimeZoneUtils';

import MonitoringPlotPhotos from './MonitoringPlotPhotos';

type AdHocObservationDetailsProps = {
  reload: () => void;
};

export default function AdHocObservationDetails(props: AdHocObservationDetailsProps): JSX.Element {
  const { reload } = props;
  const { plantingSiteId, observationId, monitoringPlotId } = useParams<{
    plantingSiteId: string;
    observationId: string;
    monitoringPlotId: string;
  }>();
  const defaultTimeZone = useDefaultTimeZone();
  const navigate = useNavigate();
  const theme = useTheme();
  const { isMobile } = useDeviceInfo();
  const { activeLocale } = useLocalization();
  const { selectedOrganization } = useOrganization();
  const allAdHocObservationsResults = useAppSelector(selectAdHocObservationsResults);
  const observation = allAdHocObservationsResults?.find(
    (obsResult) => obsResult?.observationId.toString() === observationId?.toString()
  );
  const { availableSpecies } = useSpecies();
  const dispatch = useAppDispatch();
  const snackbar = useSnackbar();

  const [unrecognizedSpecies, setUnrecognizedSpecies] = useState<string[]>([]);
  const [showPageMessage, setShowPageMessage] = useState(false);
  const [showMatchSpeciesModal, setShowMatchSpeciesModal] = useState(false);
  const [mergeRequestId, setMergeRequestId] = useState<string>('');

  const allSpecies = useAppSelector(selectSpecies);
  const matchResponse = useAppSelector(selectMergeOtherSpecies(mergeRequestId));

  const monitoringPlot = useMemo(() => {
    const speciesToUse = observation?.adHocPlot?.species.map((sp) => {
      const foundSpecies = availableSpecies?.find((aSp) => aSp.id === sp.speciesId);
      return { ...sp, speciesScientificName: foundSpecies?.scientificName || sp.speciesName || '' };
    });

    return { ...observation?.adHocPlot, species: speciesToUse };
  }, [observation?.adHocPlot]);

  const plantingSite = useAppSelector((state) => selectPlantingSite(state, Number(plantingSiteId)));
  const timeZone = plantingSite?.timeZone ?? defaultTimeZone.get().id;

  const gridSize = isMobile ? 12 : 4;

  const data: Record<string, any>[] = useMemo(() => {
    const handleMissingData = (num?: number) => (!monitoringPlot?.completedTime && !num ? '' : num);

    return [
      { label: strings.DATE, value: getDateDisplayValue(monitoringPlot?.completedTime || '', timeZone) },
      {
        label: strings.TIME,
        value: monitoringPlot?.completedTime
          ? getShortTime(
              monitoringPlot?.completedTime,
              activeLocale,
              plantingSite?.timeZone || defaultTimeZone.get().id
            )
          : undefined,
      },
      { label: strings.OBSERVER, value: monitoringPlot?.claimedByName },
      { label: strings.PLOT_SELECTION, value: strings.AD_HOC },
      { label: strings.PLANTS, value: handleMissingData(monitoringPlot?.totalPlants) },
      { label: strings.SPECIES, value: handleMissingData(monitoringPlot?.totalSpecies) },
      { label: strings.PLANTING_DENSITY, value: handleMissingData(monitoringPlot?.plantingDensity) },
      { label: strings.NUMBER_OF_PHOTOS, value: handleMissingData(monitoringPlot?.photos?.length) },
      {
        label: strings.PLOT_CONDITIONS,
        value: monitoringPlot?.conditions?.map((condition) => getConditionString(condition)).join(', ') || '- -',
      },
      { label: strings.FIELD_NOTES, value: monitoringPlot?.notes || '- -', text: true },
    ];
  }, [activeLocale, defaultTimeZone, monitoringPlot, plantingSite]);

  const title = (text: string, marginTop?: number, marginBottom?: number) => (
    <Typography
      fontSize='20px'
      lineHeight='28px'
      fontWeight={600}
      color={theme.palette.TwClrTxt}
      margin={theme.spacing(marginTop ?? 3, 0, marginBottom ?? 2)}
    >
      {text}
    </Typography>
  );

  useEffect(() => {
    if (!monitoringPlot) {
      navigate(APP_PATHS.OBSERVATIONS);
    }
  }, [navigate, monitoringPlot]);

  useEffect(() => {
    if (!allSpecies && selectedOrganization.id !== -1) {
      dispatch(requestSpecies(selectedOrganization.id));
    }
  }, [dispatch, allSpecies, selectedOrganization]);

  useEffect(() => {
    const speciesWithNoIdMap = _.uniqBy(
      (monitoringPlot?.species || []).filter((sp) => !sp.speciesId),
      'speciesName'
    ).map((sp) => sp.speciesName || '');

    setUnrecognizedSpecies(speciesWithNoIdMap);
    if (speciesWithNoIdMap.length > 0) {
      setShowPageMessage(true);
    } else {
      setShowPageMessage(false);
    }
  }, [monitoringPlot]);

  useEffect(() => {
    if (matchResponse?.status === 'success' && matchResponse?.data && matchResponse.data.length > 0) {
      // Force reload page to show updated data
      reload();
      snackbar.toastSuccess([MergedSuccessMessage(matchResponse.data)], strings.SPECIES_MATCHED);
    }
    if (matchResponse?.status === 'error') {
      snackbar.toastError();
    }
  }, [matchResponse, snackbar]);

  const onSaveMergedSpecies = (mergedSpeciesPayloads: MergeOtherSpeciesPayloadPartial[]) => {
    const mergeOtherSpeciesRequestData: MergeOtherSpeciesRequestData[] = mergedSpeciesPayloads
      .filter((sp) => !!sp.otherSpeciesName && !!sp.speciesId)
      .map((sp) => ({
        newName: allSpecies?.find((existing) => existing.id === sp.speciesId)?.scientificName || '',
        otherSpeciesName: sp.otherSpeciesName!,
        speciesId: sp.speciesId!,
      }));

    if (mergeOtherSpeciesRequestData.length > 0) {
      const request = dispatch(
        requestMergeOtherSpecies({
          mergeOtherSpeciesRequestData,
          observationId: Number(observationId),
        })
      );
      setMergeRequestId(request.requestId);
    }

    setShowMatchSpeciesModal(false);
  };

  const pageMessage = (
    <Box key='unrecognized-species-message'>
      <Typography>{strings.UNRECOGNIZED_SPECIES_MESSAGE}</Typography>
      <ul style={{ margin: 0 }}>
        {unrecognizedSpecies?.map((species, index) => <li key={`species-${index}`}>{species}</li>)}
      </ul>
    </Box>
  );

  return (
    <DetailsPage
      title={monitoringPlot?.monitoringPlotNumber?.toString() ?? ''}
      plantingSiteId={plantingSiteId}
      observationId={observationId}
      rightComponent={
        <OptionsMenu
          onOptionItemClick={() => setShowMatchSpeciesModal(true)}
          optionItems={[
            {
              label: strings.MATCH_UNRECOGNIZED_SPECIES,
              value: 'match',
              disabled: (unrecognizedSpecies?.length || 0) === 0,
            },
          ]}
        />
      }
    >
      {showPageMessage && (
        <Box marginTop={1} marginBottom={4} width={'100%'}>
          <Message
            body={pageMessage}
            onClose={() => setShowPageMessage(false)}
            priority='warning'
            showCloseButton
            title={strings.UNRECOGNIZED_SPECIES}
            type='page'
            pageButtons={[
              <Button
                onClick={() => setShowPageMessage(false)}
                label={strings.DISMISS}
                priority='secondary'
                type='passive'
                key='button-1'
                size='small'
              />,
              <Button
                onClick={() => setShowMatchSpeciesModal(true)}
                label={strings.MATCH_SPECIES}
                priority='secondary'
                type='passive'
                key='button-2'
                size='small'
              />,
            ]}
          />
        </Box>
      )}
      {showMatchSpeciesModal && (
        <MatchSpeciesModal
          onClose={() => setShowMatchSpeciesModal(false)}
          onSave={onSaveMergedSpecies}
          unrecognizedSpecies={unrecognizedSpecies || []}
        />
      )}
      <Grid container>
        <Grid item xs={12}>
          <Card flushMobile>
            {title(strings.DETAILS, 1, 0)}
            <Grid container>
              {data.map((datum, index) => (
                <Grid key={index} item xs={gridSize} marginTop={2}>
                  <Textfield
                    id={`plot-observation-${index}`}
                    label={datum.label}
                    value={datum.value}
                    type={datum.text ? 'textarea' : 'text'}
                    preserveNewlines={true}
                    display={true}
                  />
                </Grid>
              ))}
            </Grid>
            {title(strings.NUMBER_OF_LIVE_PLANTS_PER_SPECIES)}
            <Box height='360px'>
              <SpeciesTotalPlantsChart minHeight='360px' species={monitoringPlot?.species} />
            </Box>
            {monitoringPlot?.isPermanent && (
              <>
                {title(strings.MORTALITY_RATE_PER_SPECIES)}
                <Box height='360px'>
                  <SpeciesMortalityRateChart minHeight='360px' species={monitoringPlot?.species} />
                </Box>
              </>
            )}
            {title(strings.PHOTOS)}
            <MonitoringPlotPhotos
              observationId={Number(observationId)}
              monitoringPlotId={Number(monitoringPlotId)}
              photos={monitoringPlot?.photos}
            />
          </Card>
        </Grid>
      </Grid>
    </DetailsPage>
  );
}
