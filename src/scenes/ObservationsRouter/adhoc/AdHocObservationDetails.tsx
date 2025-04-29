import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';

import { Box, Grid, Typography, useTheme } from '@mui/material';
import { Textfield } from '@terraware/web-components';
import { getDateDisplayValue } from '@terraware/web-components/utils';
import _ from 'lodash';

import Card from 'src/components/common/Card';
import OptionsMenu from 'src/components/common/OptionsMenu';
import { APP_PATHS } from 'src/constants';
import { useLocalization, useOrganization } from 'src/providers';
import { selectAdHocObservationsResults } from 'src/redux/features/observations/observationsSelectors';
import { getConditionString } from 'src/redux/features/observations/utils';
import { selectSpecies } from 'src/redux/features/species/speciesSelectors';
import { requestSpecies } from 'src/redux/features/species/speciesThunks';
import { selectPlantingSite } from 'src/redux/features/tracking/trackingSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { useSpecies } from 'src/scenes/InventoryRouter/form/useSpecies';
import DetailsPage from 'src/scenes/ObservationsRouter/common/DetailsPage';
import MatchSpeciesModal from 'src/scenes/ObservationsRouter/common/MatchSpeciesModal';
import MonitoringPlotPhotos from 'src/scenes/ObservationsRouter/common/MonitoringPlotPhotos';
import SpeciesMortalityRateChart from 'src/scenes/ObservationsRouter/common/SpeciesMortalityRateChart';
import SpeciesTotalPlantsChart from 'src/scenes/ObservationsRouter/common/SpeciesTotalPlantsChart';
import UnrecognizedSpeciesPageMessage from 'src/scenes/ObservationsRouter/common/UnrecognizedSpeciesPageMessage';
import { useOnSaveMergedSpecies } from 'src/scenes/ObservationsRouter/common/useOnSaveMergedSpecies';
import strings from 'src/strings';
import { getShortTime } from 'src/utils/dateFormatter';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import { useDefaultTimeZone } from 'src/utils/useTimeZoneUtils';

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

  const [unrecognizedSpecies, setUnrecognizedSpecies] = useState<string[]>([]);
  const [showPageMessage, setShowPageMessage] = useState(false);
  const [showMatchSpeciesModal, setShowMatchSpeciesModal] = useState(false);

  const speciesResponse = useAppSelector(selectSpecies(selectedOrganization.id));

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
    if (!speciesResponse?.data?.species && selectedOrganization.id !== -1) {
      dispatch(requestSpecies(selectedOrganization.id));
    }
  }, [dispatch, speciesResponse?.data?.species, selectedOrganization]);

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

  const onSaveMergedSpecies = useOnSaveMergedSpecies({ observationId, reload, setShowMatchSpeciesModal });

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
        <UnrecognizedSpeciesPageMessage
          setShowMatchSpeciesModal={setShowMatchSpeciesModal}
          setShowPageMessage={setShowPageMessage}
          unrecognizedSpecies={unrecognizedSpecies || []}
        />
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
