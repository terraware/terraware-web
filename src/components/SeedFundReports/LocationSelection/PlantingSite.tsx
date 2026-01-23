import React, { type JSX, useEffect, useMemo, useState } from 'react';

import { Box, Grid } from '@mui/material';
import { TableColumnType } from '@terraware/web-components';
import { getDateDisplayValue } from '@terraware/web-components/utils';

import { LocationSectionProps } from 'src/components/SeedFundReports/LocationSelection';
import { InfoField, infoCardStyles } from 'src/components/SeedFundReports/LocationSelection/InfoField';
import PlantingSiteSpeciesCellRenderer from 'src/components/SeedFundReports/LocationSelection/PlantingSitesSpeciesCellRenderer';
import { transformNumericValue } from 'src/components/SeedFundReports/LocationSelection/util';
import OverviewItemCard from 'src/components/common/OverviewItemCard';
import Table from 'src/components/common/table';
import { useSpeciesData } from 'src/providers/Species/SpeciesContext';
import { usePlantingSiteData } from 'src/providers/Tracking/PlantingSiteContext';
import strings from 'src/strings';
import { ReportPlantingSite } from 'src/types/Report';
import { GrowthForm } from 'src/types/Species';
import useDeviceInfo from 'src/utils/useDeviceInfo';

type PlantingSiteSpecies = {
  id: number;
  name: string;
  growthForms?: GrowthForm[];
  mortalityRateInField?: number | undefined;
  mortalityRateInNursery?: number | undefined;
  totalPlanted?: number | undefined;
};

const columns = (): TableColumnType[] => [
  {
    key: 'name',
    name: strings.SPECIES,
    type: 'string',
  },
  {
    key: 'growthForms',
    name: strings.GROWTH_FORM,
    type: 'string',
  },
  {
    key: 'totalPlanted',
    name: strings.TOTAL_PLANTED_REQUIRED,
    type: 'string',
  },
  { key: 'mortalityRateInField', name: strings.MORTALITY_RATE_IN_FIELD_REQUIRED, type: 'string' },
];

const LocationSectionPlantingSite = (props: LocationSectionProps): JSX.Element => {
  const { editable, location, onUpdateLocation, validate } = props;

  const { isMobile } = useDeviceInfo();

  const {
    plantingSite,
    setSelectedPlantingSite,
    plantingSiteReportedPlants,
    currentObservation,
    latestResult,
    nextObservation,
  } = usePlantingSiteData();

  useEffect(() => {
    if (!plantingSite) {
      setSelectedPlantingSite(location.id);
    }
  }, [location, plantingSite, setSelectedPlantingSite]);

  const { species: allSpecies } = useSpeciesData();
  const [plantingSiteSpecies, setPlantingSiteSpecies] = useState<PlantingSiteSpecies[]>([]);
  const [plantingDensity, setPlantingDensity] = useState<Record<string, number | string>>();

  const smallItemGridWidth = () => (isMobile ? 12 : 4);

  useEffect(() => {
    if (plantingSite) {
      const stratumDensities: Record<string, number | string> = {};
      plantingSite.strata?.forEach((stratum) => {
        if (latestResult) {
          const stratumFromObs = latestResult.strata.find((obsStratum) => obsStratum.stratumId === stratum.id);
          stratumDensities[stratum.name] = stratumFromObs?.plantingDensity ?? '';
        }
      });
      setPlantingDensity(stratumDensities);
    }
  }, [plantingSite, latestResult]);

  useEffect(() => {
    if (allSpecies) {
      const psSpecies: PlantingSiteSpecies[] = [];
      (location as ReportPlantingSite).species.forEach((iSpecies) => {
        const foundSpecies = allSpecies.find((serverSpecies) => serverSpecies.id === iSpecies.id);
        if (foundSpecies) {
          psSpecies.push({
            id: iSpecies.id,
            name: foundSpecies.scientificName,
            growthForms: foundSpecies.growthForms,
            mortalityRateInField: iSpecies.mortalityRateInField,
            totalPlanted: iSpecies.totalPlanted,
          });
        }
      });
      setPlantingSiteSpecies(psSpecies);
    }
  }, [allSpecies, location]);

  const onEditPlantingSiteReport = (species: PlantingSiteSpecies, fromColumn?: string, value?: any) => {
    if (fromColumn) {
      const speciesToEditIndex = (location as ReportPlantingSite).species.findIndex(
        (iSpecies) => iSpecies.id === species.id
      );
      const speciesToEdit = (location as ReportPlantingSite).species[speciesToEditIndex];

      const newSpecies = [...(location as ReportPlantingSite).species];
      const speciesModified = {
        ...speciesToEdit,
        [fromColumn as 'mortalityRateInField' | 'totalPlanted']: value,
      };

      newSpecies[speciesToEditIndex] = speciesModified;

      onUpdateLocation('species', newSpecies);
    }
  };

  const estimatedPlants = useMemo(() => {
    return latestResult?.estimatedPlants?.toString();
  }, [latestResult?.estimatedPlants]);

  const livePlants = useMemo(() => {
    return latestResult?.species.reduce((acc, sp) => (acc = acc + sp.permanentLive), 0);
  }, [latestResult]);

  const deadPlants = useMemo(() => {
    return latestResult?.species.reduce((acc, sp) => (acc = acc + sp.totalDead), 0);
  }, [latestResult]);

  const numberOfPlots = useMemo(() => {
    return latestResult?.strata.flatMap((_stratum) =>
      _stratum.substrata.flatMap((substratum) => substratum.monitoringPlots)
    ).length;
  }, [latestResult]);

  const markedAsComplete = useMemo(() => {
    if (plantingSite) {
      const totalArea = plantingSite.areaHa ?? 0;
      const totalPlantedArea =
        plantingSite?.strata
          ?.flatMap((stratum) => stratum.substrata)
          ?.reduce((prev, curr) => (curr.plantingCompleted ? +curr.areaHa + prev : prev), 0) ?? 0;
      const percentagePlanted = totalArea > 0 ? Math.round((totalPlantedArea / totalArea) * 100) : 0;
      return `${percentagePlanted}%`;
    }
    return '0%';
  }, [plantingSite]);

  const plantingDensityForStrata = useMemo(() => {
    const stratumNameWithDensities: string[] = [];
    if (plantingSite && plantingDensity) {
      plantingSite.strata?.reduce((acc, stratum) => {
        if (plantingDensity[stratum.name] !== '') {
          stratumNameWithDensities.push(`${stratum.name}: ${plantingDensity[stratum.name]}`);
        }
        return acc;
      }, stratumNameWithDensities);

      return stratumNameWithDensities.length ? (
        <Box>
          {stratumNameWithDensities.map((_stratumDensity, index) => (
            <Box key={`stratum-${index}`}>{_stratumDensity}</Box>
          ))}
        </Box>
      ) : (
        ''
      );
    }
    return '';
  }, [plantingSite, plantingDensity]);

  const currentNextObservationDates = useMemo(() => {
    if (currentObservation) {
      return `${currentObservation.startDate} - ${currentObservation.endDate}`;
    }
    if (nextObservation) {
      return `${nextObservation.startDate} - ${nextObservation.endDate}`;
    }
    return '';
  }, [currentObservation, nextObservation]);

  const latestObservationDateString = useMemo(() => {
    if (latestResult?.completedTime && plantingSite) {
      const completedDate = getDateDisplayValue(latestResult.completedTime, plantingSite.timeZone);
      return `${latestResult.startDate} - ${completedDate}`;
    }
  }, [latestResult, plantingSite]);

  return (
    <>
      <Grid item xs={smallItemGridWidth()}>
        <InfoField
          id={`${location.id}-planting-site-area`}
          label={strings.TOTAL_PLANTING_SITE_AREA_HA}
          value={(location as ReportPlantingSite).totalPlantingSiteArea ?? ''}
          minNum={0}
          editable={editable}
          onChange={(value) => onUpdateLocation('totalPlantingSiteArea', transformNumericValue(value, { min: 0 }))}
          type='text'
          errorText={
            validate && (location as ReportPlantingSite).totalPlantingSiteArea === undefined
              ? strings.REQUIRED_FIELD
              : ''
          }
          tooltipTitle={strings.REPORT_TOTAL_PLANTING_SITE_AREA_INFO}
        />
      </Grid>

      <Grid item xs={smallItemGridWidth()}>
        <InfoField
          id={`${location.id}-total-planted-area`}
          label={strings.TOTAL_PLANTED_AREA_HA}
          value={(location as ReportPlantingSite).totalPlantedArea ?? ''}
          minNum={0}
          editable={editable}
          onChange={(value) => onUpdateLocation('totalPlantedArea', transformNumericValue(value, { min: 0 }))}
          type='text'
          errorText={
            validate && (location as ReportPlantingSite).totalPlantedArea === undefined ? strings.REQUIRED_FIELD : ''
          }
          tooltipTitle={strings.REPORT_TOTAL_PLANTED_AREA_INFO}
        />
      </Grid>

      <Grid item xs={smallItemGridWidth()} />

      <Grid item xs={smallItemGridWidth()}>
        <InfoField
          id={`${location.id}-total-trees-planted`}
          label={strings.TOTAL_TREES_PLANTED}
          value={(location as ReportPlantingSite).totalTreesPlanted ?? ''}
          minNum={0}
          editable={editable}
          onChange={(value) => onUpdateLocation('totalTreesPlanted', transformNumericValue(value, { min: 0 }))}
          type='text'
          helper={strings.TOTAL_TREES_PLANTED_HELPER_TEXT}
          errorText={
            validate && (location as ReportPlantingSite).totalTreesPlanted === undefined ? strings.REQUIRED_FIELD : ''
          }
          tooltipTitle={strings.REPORT_TOTAL_TREES_PLANTED_INFO}
        />
      </Grid>

      <Grid item xs={smallItemGridWidth()}>
        <InfoField
          id={`${location.id}-total-plants-planted`}
          label={strings.TOTAL_PLANTS_PLANTED_REQUIRED}
          value={(location as ReportPlantingSite).totalPlantsPlanted ?? ''}
          minNum={0}
          editable={editable}
          onChange={(value) => onUpdateLocation('totalPlantsPlanted', transformNumericValue(value, { min: 0 }))}
          type='text'
          helper={strings.TOTAL_PLANTS_PLANTED_HELPER_TEXT}
          errorText={
            validate && (location as ReportPlantingSite).totalPlantsPlanted === undefined ? strings.REQUIRED_FIELD : ''
          }
          tooltipTitle={strings.REPORT_TOTAL_NON_TREES_PLANTED_INFO}
        />
      </Grid>

      <Grid item xs={smallItemGridWidth()}>
        <InfoField
          id={`${location.id}-mortality-rate`}
          label={strings.MORTALITY_RATE_PERCENT_REQUIRED}
          value=''
          minNum={0}
          maxNum={100}
          editable={editable}
          onChange={(value) => onUpdateLocation('mortalityRate', transformNumericValue(value, { min: 0, max: 100 }))}
          type='text'
          errorText={
            validate && (location as ReportPlantingSite).mortalityRate === undefined ? strings.REQUIRED_FIELD : ''
          }
          tooltipTitle={strings.REPORT_MORTALITY_RATE_INFO}
        />
      </Grid>

      {plantingSiteSpecies && (
        <Grid item xs={12} marginBottom={3}>
          <Table
            id='reports-species-table'
            columns={columns}
            rows={plantingSiteSpecies}
            Renderer={PlantingSiteSpeciesCellRenderer({ editMode: editable, validate })}
            showPagination={false}
            onSelect={onEditPlantingSiteReport}
            controlledOnSelect={true}
            orderBy={'species'}
            isClickable={() => false}
          />
        </Grid>
      )}

      {latestResult && (
        <>
          <Grid item xs={smallItemGridWidth()}>
            <OverviewItemCard
              isEditable={false}
              title={strings.MOST_RECENT_OBSERVATION}
              contents={latestObservationDateString}
              sx={infoCardStyles}
            />
          </Grid>
          <Grid item xs={smallItemGridWidth()}>
            <OverviewItemCard
              isEditable={false}
              title={strings.NUMBER_OF_PLOTS_IN_MOST_RECENT_OBSERVATION}
              contents={numberOfPlots}
              sx={infoCardStyles}
            />
          </Grid>
          <Grid item xs={smallItemGridWidth()}>
            <OverviewItemCard
              isEditable={false}
              title={strings.CURRENT_NEXT_OBSERVATION}
              contents={currentNextObservationDates}
              sx={infoCardStyles}
            />
          </Grid>
          <Grid item xs={smallItemGridWidth()}>
            <OverviewItemCard
              isEditable={false}
              title={strings.TOTAL_PLANTS_OBSERVED}
              contents={latestResult?.totalPlants}
              sx={infoCardStyles}
            />
          </Grid>
          <Grid item xs={smallItemGridWidth()}>
            <OverviewItemCard
              isEditable={false}
              title={strings.LIVE_PLANTS_OBSERVED}
              contents={livePlants}
              sx={infoCardStyles}
            />
          </Grid>
          <Grid item xs={smallItemGridWidth()}>
            <OverviewItemCard
              isEditable={false}
              title={strings.DEAD_PLANTS_OBSERVED}
              contents={deadPlants || ''}
              sx={infoCardStyles}
            />
          </Grid>
          <Grid item xs={smallItemGridWidth()}>
            <OverviewItemCard
              isEditable={false}
              title={strings.SPECIES_OBSERVED}
              contents={latestResult?.totalSpecies}
              sx={infoCardStyles}
            />
          </Grid>
          <Grid item xs={smallItemGridWidth()}>
            <OverviewItemCard
              isEditable={false}
              title={strings.MARKED_AS_PLANTING_COMPLETE}
              contents={markedAsComplete}
              sx={infoCardStyles}
            />
          </Grid>
          <Grid item xs={smallItemGridWidth()}>
            <OverviewItemCard
              isEditable={false}
              title={strings.SURVIVAL_RATE}
              contents={latestResult.survivalRate}
              sx={infoCardStyles}
            />
          </Grid>
          {!estimatedPlants && (
            <Grid item xs={smallItemGridWidth()}>
              <OverviewItemCard
                isEditable={false}
                title={strings.PLANTING_PROGRESS_PERCENT}
                contents={plantingSiteReportedPlants?.progressPercent}
                sx={infoCardStyles}
              />
            </Grid>
          )}
          {plantingDensityForStrata && (
            <Grid item xs={smallItemGridWidth()}>
              <OverviewItemCard
                isEditable={false}
                title={strings.PLANT_DENSITY_OF_PLANTED_STRATA}
                contents={plantingDensityForStrata}
                sx={infoCardStyles}
              />
            </Grid>
          )}
          <Grid item xs={smallItemGridWidth()}>
            <OverviewItemCard
              isEditable={false}
              title={strings.EST_TOTAL_PLANTS_PLANT_DENSITY_AREA}
              contents={estimatedPlants}
              sx={infoCardStyles}
            />
          </Grid>
        </>
      )}
    </>
  );
};

export default LocationSectionPlantingSite;
