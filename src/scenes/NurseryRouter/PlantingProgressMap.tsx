import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Typography, useTheme } from '@mui/material';

import { PlantingSiteMap } from 'src/components/Map';
import { useOrganization } from 'src/providers';
import { usePlantingSiteData } from 'src/providers/Tracking/PlantingSiteContext';
import { requestUpdatePlantingCompleted } from 'src/redux/features/plantings/plantingsAsyncThunks';
import {
  selectStrataHaveStatistics,
  selectUpdatePlantingCompleted,
} from 'src/redux/features/plantings/plantingsSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import StatsWarningDialog from 'src/scenes/NurseryRouter/StatsWarningModal';
import { MapService } from 'src/services';
import strings from 'src/strings';
import { MapData, MapSourceProperties } from 'src/types/Map';
import useSnackbar from 'src/utils/useSnackbar';
import { useDefaultTimeZone } from 'src/utils/useTimeZoneUtils';

import PlantingProgressMapDialog from './PlantingProgressMapDialog';

type PlantingProgressMapProps = {
  plantingSiteId: number;
  reloadTracking: () => void;
};

export default function PlantingProgressMap({ plantingSiteId, reloadTracking }: PlantingProgressMapProps): JSX.Element {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const snackbar = useSnackbar();
  const defaultTimeZone = useDefaultTimeZone();
  const { selectedOrganization } = useOrganization();

  const [mapData, setMapData] = useState<MapData | undefined>();
  const [requestId, setRequestId] = useState<string>('');
  const updateStatus = useAppSelector((state) => selectUpdatePlantingCompleted(state, requestId));
  const [focusEntities, setFocusEntities] = useState<{ sourceId: string; id: number }[]>([]);

  const { plantingSite, setSelectedPlantingSite } = usePlantingSiteData();
  const [zoneIdSelected, setZoneIdSelected] = useState<number>(-1);
  const [statsWarningDialogProps, setStatsWarningDialogProps] = useState<{ id: number; val: boolean } | undefined>();

  const selectedZoneHasStats = useAppSelector((state) =>
    selectStrataHaveStatistics(
      state,
      selectedOrganization?.id || -1,
      { [plantingSiteId]: new Set([zoneIdSelected]) },
      defaultTimeZone.get().id
    )
  );

  useEffect(() => {
    setSelectedPlantingSite(plantingSiteId);
  }, [plantingSiteId, setSelectedPlantingSite]);

  useEffect(() => {
    if (!mapData?.site?.entities || plantingSite?.id !== mapData.site.entities[0]?.id) {
      if (plantingSite?.boundary) {
        setMapData(MapService.getMapDataFromPlantingSite(plantingSite));
        setFocusEntities([{ sourceId: 'sites', id: plantingSite?.id }]);
      } else {
        setMapData(undefined);
        setFocusEntities([]);
      }
    }
  }, [plantingSite, mapData?.site?.entities]);

  const subzonesAreaHa: Record<number, number> = useMemo(() => {
    const result: Record<number, number> = {};
    plantingSite?.strata
      ?.flatMap((zone) => zone.substrata)
      ?.forEach((sz) => {
        result[sz.id] = sz.areaHa;
      });
    return result;
  }, [plantingSite]);

  const subzonesComplete: Record<number, boolean> = useMemo(() => {
    const result: Record<number, boolean> = {};
    plantingSite?.strata
      ?.flatMap((zone) => zone.substrata)
      ?.forEach((sz) => {
        result[sz.id] = sz.plantingCompleted;
      });
    return result;
  }, [plantingSite]);

  useEffect(() => {
    if (updateStatus) {
      if (updateStatus.status === 'error') {
        snackbar.toastError(strings.GENERIC_ERROR);
      } else if (updateStatus.status === 'success') {
        // refresh planting site and observations data
        reloadTracking();
      }
    }
  }, [updateStatus, snackbar, reloadTracking]);

  const completeUpdate = useCallback(
    (id: number, val: boolean) => {
      const request = dispatch(
        requestUpdatePlantingCompleted({
          substratumId: id,
          planting: {
            plantingCompleted: val,
          },
        })
      );
      setRequestId(request.requestId);
      setFocusEntities([]);
    },
    [dispatch]
  );

  const updatePlantingComplete = useCallback(
    (id: number, val: boolean) => {
      if (!selectedZoneHasStats) {
        completeUpdate(id, val);
      } else {
        setStatsWarningDialogProps({ id, val });
        const selectedZone = plantingSite?.strata?.find((zone) => zone.substrata.map((sz) => sz.id).includes(id));
        setZoneIdSelected(selectedZone?.id ?? -1);
      }
    },
    [selectedZoneHasStats, completeUpdate, plantingSite?.strata]
  );

  return mapData ? (
    <>
      <StatsWarningDialog
        open={!!statsWarningDialogProps}
        completeUpdateProps={statsWarningDialogProps}
        onClose={() => setStatsWarningDialogProps(undefined)}
        onSubmit={(completeUpdateProps) => {
          setStatsWarningDialogProps(undefined);
          if (completeUpdateProps) {
            completeUpdate(completeUpdateProps.id, completeUpdateProps.val);
          }
        }}
      />
      <PlantingSiteMap
        mapData={mapData}
        focusEntities={focusEntities}
        contextRenderer={{
          render: (properties: MapSourceProperties) => (
            <PlantingProgressMapDialog
              subzoneId={properties.id}
              subzoneName={properties.fullName}
              subzoneAreaHa={subzonesAreaHa[properties.id]}
              siteName={plantingSite?.name || ''}
              plantingComplete={subzonesComplete[properties.id]}
              onUpdatePlantingComplete={updatePlantingComplete}
              busy={updateStatus?.status === 'pending'}
            />
          ),
          anchor: 'bottom',
          sx: {
            '.mapboxgl-popup .mapboxgl-popup-content': {
              borderRadius: '8px',
              padding: '0',
              minWidth: '320px',
            },
          },
        }}
      />
    </>
  ) : (
    <Typography fontSize='14px' fontWeight={400} color={theme.palette.TwClrTxt} textAlign='center'>
      {strings.NO_MAP_DATA}
    </Typography>
  );
}
