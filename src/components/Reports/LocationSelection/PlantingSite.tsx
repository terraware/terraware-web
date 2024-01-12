import React, { useEffect, useMemo, useState } from 'react';
import { Box, Grid } from '@mui/material';
import { TableColumnType } from '@terraware/web-components';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import strings from 'src/strings';
import { ReportPlantingSite } from 'src/types/Report';
import { useOrganization } from 'src/providers';
import { SpeciesService } from 'src/services';
import { Species } from 'src/types/Species';
import { useDefaultTimeZone } from 'src/utils/useTimeZoneUtils';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import {
  selectCurrentObservation,
  selectLatestObservation,
  selectNextObservation,
  selectObservation,
} from 'src/redux/features/observations/observationsSelectors';
import { selectPlantingSite, selectSiteReportedPlants } from 'src/redux/features/tracking/trackingSelectors';
import { requestSiteReportedPlants } from 'src/redux/features/tracking/trackingThunks';
import OverviewItemCard from 'src/components/common/OverviewItemCard';
import PlantingSiteSpeciesCellRenderer from 'src/components/Reports/LocationSelection/PlantingSitesSpeciesCellRenderer';
import Table from 'src/components/common/table';
import { InfoField, useInfoCardStyles } from 'src/components/Reports/LocationSelection/InfoField';
import { LocationSectionProps } from 'src/components/Reports/LocationSelection';
import { transformNumericValue } from 'src/components/Reports/LocationSelection/util';

type PlantingSiteSpecies = {
  id: number;
  name: string;
  growthForm?: string;
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
    key: 'growthForm',
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
  const classes = useInfoCardStyles();
  const { selectedOrganization } = useOrganization();
  const dispatch = useAppDispatch();
  const defaultTimeZone = useDefaultTimeZone();

  const defaultTZ = defaultTimeZone.get().id;

  // The calls to satisfy this data are all dispatched in the parent ReportForm component
  const reportedPlants = useAppSelector((state) => selectSiteReportedPlants(state, location.id));
  const plantingSite = useAppSelector((state) => selectPlantingSite(state, location.id));
  const currentObservation = useAppSelector((state) => selectCurrentObservation(state, location.id, defaultTZ));
  const nextObservation = useAppSelector((state) => selectNextObservation(state, location.id, defaultTZ));
  const latestObservation = useAppSelector((state) => selectLatestObservation(state, location.id, defaultTZ));
  const currentObservationData = useAppSelector((state) =>
    selectObservation(state, location.id, Number(currentObservation?.observationId))
  );
  const nextObservationData = useAppSelector((state) =>
    selectObservation(state, location.id, Number(nextObservation?.observationId))
  );

  const [allSpecies, setAllSpecies] = useState<Species[]>();
  const [plantingSiteSpecies, setPlantingSiteSpecies] = useState<PlantingSiteSpecies[]>([]);
  const [plantingDensity, setPlantingDensity] = useState<Record<string, number | string>>();

  const smallItemGridWidth = () => (isMobile ? 12 : 4);

  useEffect(() => {
    if (plantingSite?.id) {
      void dispatch(requestSiteReportedPlants(plantingSite.id));
    }
  }, [plantingSite?.id, dispatch]);

  useEffect(() => {
    if (plantingSite) {
      const zoneDensities: Record<string, number | string> = {};
      plantingSite.plantingZones?.forEach((zone) => {
        if (latestObservation) {
          const zoneFromObs = latestObservation.plantingZones.find((obsZone) => obsZone.plantingZoneId === zone.id);
          zoneDensities[zone.name] = zoneFromObs?.plantingDensity ?? '';
        }
      });
      setPlantingDensity(zoneDensities);
    }
  }, [plantingSite, latestObservation]);

  useEffect(() => {
    const populateSpecies = async () => {
      const response = await SpeciesService.getAllSpecies(selectedOrganization.id);
      if (response.requestSucceeded) {
        setAllSpecies(response.species);
      }
    };

    void populateSpecies();
  }, [selectedOrganization.id, location]);

  useEffect(() => {
    if (allSpecies) {
      const psSpecies: PlantingSiteSpecies[] = [];
      (location as ReportPlantingSite).species.forEach((iSpecies) => {
        const foundSpecies = allSpecies.find((serverSpecies) => serverSpecies.id === iSpecies.id);
        if (foundSpecies) {
          psSpecies.push({
            id: iSpecies.id,
            name: foundSpecies.scientificName,
            growthForm: foundSpecies.growthForm,
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
    return latestObservation?.estimatedPlants?.toString();
  }, [latestObservation?.estimatedPlants]);

  const livePlants = useMemo(() => {
    return latestObservation?.species.reduce((acc, sp) => (acc = acc + sp.permanentLive), 0);
  }, [latestObservation]);

  const deadPlants = useMemo(() => {
    return latestObservation?.species.reduce((acc, sp) => (acc = acc + sp.cumulativeDead), 0);
  }, [latestObservation]);

  const numberOfPlots = useMemo(() => {
    return latestObservation?.plantingZones.flatMap((pz) =>
      pz.plantingSubzones.flatMap((subzone) => subzone.monitoringPlots)
    ).length;
  }, [latestObservation]);

  const markedAsComplete = useMemo(() => {
    if (plantingSite) {
      const totalArea = plantingSite.areaHa ?? 0;
      const totalPlantedArea =
        plantingSite?.plantingZones
          ?.flatMap((zone) => zone.plantingSubzones)
          ?.reduce((prev, curr) => (curr.plantingCompleted ? +curr.areaHa + prev : prev), 0) ?? 0;
      const percentagePlanted = totalArea > 0 ? Math.round((totalPlantedArea / totalArea) * 100) : 0;
      return `${percentagePlanted}%`;
    }
    return '0%';
  }, [plantingSite]);

  const plantingDensityForZones = useMemo(() => {
    const zoneNameWithDensities: string[] = [];
    if (plantingSite && plantingDensity) {
      plantingSite.plantingZones?.reduce((acc, zone) => {
        if (plantingDensity[zone.name] !== '') {
          zoneNameWithDensities.push(`${zone.name}: ${plantingDensity[zone.name]}`);
        }
        return acc;
      }, zoneNameWithDensities);

      return zoneNameWithDensities.length ? (
        <Box>
          {zoneNameWithDensities.map((zd, index) => (
            <Box key={`zone-${index}`}>{zd}</Box>
          ))}
        </Box>
      ) : (
        ''
      );
    }
    return '';
  }, [plantingSite, plantingDensity]);

  const currentNextObservationDates = useMemo(() => {
    if (currentObservationData) {
      return `${currentObservationData.startDate} - ${currentObservationData.endDate}`;
    }
    if (nextObservationData) {
      return `${nextObservationData.startDate} - ${nextObservationData.endDate}`;
    }
    return '';
  }, [currentObservationData, nextObservationData]);

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
            validate && (location as ReportPlantingSite).totalPlantingSiteArea === null ? strings.REQUIRED_FIELD : ''
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
            validate && (location as ReportPlantingSite).totalPlantedArea === null ? strings.REQUIRED_FIELD : ''
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
            validate && (location as ReportPlantingSite).totalTreesPlanted === null ? strings.REQUIRED_FIELD : ''
          }
          tooltipTitle={strings.REPORT_TOTAL_TREES_PLANTED_INFO}
        />
      </Grid>

      <Grid item xs={smallItemGridWidth()}>
        <InfoField
          id={`${location.id}-total-plants-planted`}
          label={strings.TOTAL_PLANTS_PLANTED}
          value={(location as ReportPlantingSite).totalPlantsPlanted ?? ''}
          minNum={0}
          editable={editable}
          onChange={(value) => onUpdateLocation('totalPlantsPlanted', transformNumericValue(value, { min: 0 }))}
          type='text'
          helper={strings.TOTAL_PLANTS_PLANTED_HELPER_TEXT}
          errorText={
            validate && (location as ReportPlantingSite).totalPlantsPlanted === null ? strings.REQUIRED_FIELD : ''
          }
          tooltipTitle={strings.REPORT_TOTAL_NON_TREES_PLANTED_INFO}
        />
      </Grid>

      <Grid item xs={smallItemGridWidth()}>
        <InfoField
          id={`${location.id}-mortality-rate`}
          label={strings.MORTALITY_RATE_PERCENT_REQUIRED}
          value={
            editable
              ? (location as ReportPlantingSite).mortalityRate ?? ''
              : (location as ReportPlantingSite).mortalityRate
              ? `${(location as ReportPlantingSite).mortalityRate}%`
              : ''
          }
          minNum={0}
          maxNum={100}
          editable={editable}
          onChange={(value) => onUpdateLocation('mortalityRate', transformNumericValue(value, { min: 0, max: 100 }))}
          type='text'
          errorText={validate && (location as ReportPlantingSite).mortalityRate === null ? strings.REQUIRED_FIELD : ''}
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

      {latestObservation && (
        <>
          <Grid item xs={smallItemGridWidth()}>
            <OverviewItemCard
              isEditable={false}
              title={strings.MOST_RECENT_OBSERVATION}
              contents={`${latestObservation.startDate} - ${latestObservation.completedDate}`}
              className={classes.infoCardStyle}
            />
          </Grid>
          <Grid item xs={smallItemGridWidth()}>
            <OverviewItemCard
              isEditable={false}
              title={strings.NUMBER_OF_PLOTS_IN_MOST_RECENT_OBSERVATION}
              contents={numberOfPlots || ''}
              className={classes.infoCardStyle}
            />
          </Grid>
          <Grid item xs={smallItemGridWidth()}>
            <OverviewItemCard
              isEditable={false}
              title={strings.CURRENT_NEXT_OBSERVATION}
              contents={currentNextObservationDates}
              className={classes.infoCardStyle}
            />
          </Grid>
          <Grid item xs={smallItemGridWidth()}>
            <OverviewItemCard
              isEditable={false}
              title={strings.TOTAL_PLANTS_OBSERVED}
              contents={latestObservation.totalPlants}
              className={classes.infoCardStyle}
            />
          </Grid>
          <Grid item xs={smallItemGridWidth()}>
            <OverviewItemCard
              isEditable={false}
              title={strings.LIVE_PLANTS_OBSERVED}
              contents={livePlants || ''}
              className={classes.infoCardStyle}
            />
          </Grid>
          <Grid item xs={smallItemGridWidth()}>
            <OverviewItemCard
              isEditable={false}
              title={strings.DEAD_PLANTS_OBSERVED}
              contents={deadPlants || ''}
              className={classes.infoCardStyle}
            />
          </Grid>
          <Grid item xs={smallItemGridWidth()}>
            <OverviewItemCard
              isEditable={false}
              title={strings.SPECIES_OBSERVED}
              contents={latestObservation.totalSpecies}
              className={classes.infoCardStyle}
            />
          </Grid>
          <Grid item xs={smallItemGridWidth()}>
            <OverviewItemCard
              isEditable={false}
              title={strings.MARKED_AS_PLANTING_COMPLETE}
              contents={markedAsComplete}
              className={classes.infoCardStyle}
            />
          </Grid>
          <Grid item xs={smallItemGridWidth()}>
            <OverviewItemCard
              isEditable={false}
              title={strings.MORTALITY_RATE_PERCENT}
              contents={latestObservation.mortalityRate}
              className={classes.infoCardStyle}
            />
          </Grid>
          {!estimatedPlants && (
            <Grid item xs={smallItemGridWidth()}>
              <OverviewItemCard
                isEditable={false}
                title={strings.PLANTING_PROGRESS_PERCENT}
                contents={reportedPlants?.progressPercent || ''}
                className={classes.infoCardStyle}
              />
            </Grid>
          )}
          {plantingDensityForZones && (
            <Grid item xs={smallItemGridWidth()}>
              <OverviewItemCard
                isEditable={false}
                title={strings.PLANTING_DENSITY_OF_PLANTED_ZONES}
                contents={plantingDensityForZones}
                className={classes.infoCardStyle}
              />
            </Grid>
          )}
          <Grid item xs={smallItemGridWidth()}>
            <OverviewItemCard
              isEditable={false}
              title={strings.EST_TOTAL_PLANTS_PLANTING_DENSITY_AREA}
              contents={estimatedPlants ? `${estimatedPlants} ${strings.PLANTS_PER_HECTARE}` : ''}
              className={classes.infoCardStyle}
            />
          </Grid>
        </>
      )}
    </>
  );
};

export default LocationSectionPlantingSite;
