import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { selectPlantingSite } from 'src/redux/features/tracking/trackingSelectors';
import { MapService } from 'src/services';
import { MapData, MapSourceProperties } from 'src/types/Map';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { PlantingSiteMap } from 'src/components/Map';
import { Typography, useTheme } from '@mui/material';
import PlantingProgressMapDialog from './PlantingProgressMapDialog';
import { makeStyles } from '@mui/styles';
import { requestPlantingSites, requestSitePopulation } from 'src/redux/features/tracking/trackingThunks';
import { useOrganization } from 'src/providers';
import { selectUpdatePlantingCompleted } from 'src/redux/features/plantings/plantingsSelectors';
import strings from 'src/strings';
import { requestUpdatePlantingCompleted } from 'src/redux/features/plantings/plantingsAsyncThunks';
import useSnackbar from 'src/utils/useSnackbar';

export const useStyles = makeStyles(() => ({
  popup: {
    '& > .mapboxgl-popup-content': {
      borderRadius: '8px',
      padding: '0',
      minWidth: '320px',
    },
  },
}));

type PlantingProgressMapProps = {
  plantingSiteId: number;
};

export default function PlantingProgressMap({ plantingSiteId }: PlantingProgressMapProps): JSX.Element {
  const theme = useTheme();
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const org = useOrganization();
  const plantingSite = useAppSelector((state) => selectPlantingSite(state, plantingSiteId));
  const [mapData, setMapData] = useState<MapData | undefined>();
  const [dispatching, setDispatching] = useState(false);
  const [requestId, setRequestId] = useState<string>('');
  const updateStatus = useAppSelector((state) => selectUpdatePlantingCompleted(state, requestId));
  const [focusEntities, setFocusEntities] = useState<{ sourceId: string; id: number }[]>([]);
  const snackbar = useSnackbar();

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
    setDispatching(false);
  }, [plantingSite, mapData?.site?.entities]);

  const subzonesComplete: Record<number, boolean> = useMemo(() => {
    const result: Record<number, boolean> = {};
    plantingSite?.plantingZones
      ?.flatMap((zone) => zone.plantingSubzones)
      ?.forEach((sz) => {
        result[sz.id] = sz.plantingCompleted;
      });
    return result;
  }, [plantingSite]);

  useEffect(() => {
    dispatch(requestSitePopulation(org.selectedOrganization.id, plantingSiteId));
  }, [dispatch, org.selectedOrganization.id, plantingSiteId]);

  useEffect(() => {
    if (updateStatus) {
      if (updateStatus.status === 'error') {
        snackbar.toastError(strings.GENERIC_ERROR);
      } else if (updateStatus.status === 'success') {
        // refresh planting site data to get new completed state for subzone
        dispatch(requestPlantingSites(org.selectedOrganization.id));
      }
    }
  }, [updateStatus, dispatch, snackbar, org.selectedOrganization.id]);

  const updatePlantingComplete = useCallback(
    (id: number, val: boolean) => {
      // TODO: warn if undoing planting complete will erase statistics
      const request = dispatch(
        requestUpdatePlantingCompleted({
          subzoneId: id,
          planting: {
            plantingCompleted: val,
          },
        })
      );
      setRequestId(request.requestId);
      setFocusEntities([]);
      setDispatching(true);
    },
    [dispatch]
  );

  return mapData ? (
    <PlantingSiteMap
      mapData={mapData}
      focusEntities={focusEntities}
      contextRenderer={{
        render: (properties: MapSourceProperties) => (
          <PlantingProgressMapDialog
            id={properties.id}
            name={properties.fullName}
            plantingComplete={subzonesComplete[properties.id]}
            onUpdatePlantingComplete={updatePlantingComplete}
            busy={dispatching}
          />
        ),
        className: classes.popup,
        anchor: 'bottom',
      }}
    />
  ) : (
    <Typography fontSize='14px' fontWeight={400} color={theme.palette.TwClrTxt}>
      No map data (placeholder).
    </Typography>
  );
}
