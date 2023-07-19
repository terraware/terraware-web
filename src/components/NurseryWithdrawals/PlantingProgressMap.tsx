import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { selectPlantingSite } from 'src/redux/features/tracking/trackingSelectors';
import { MapService } from 'src/services';
import { MapData, MapSourceProperties } from 'src/types/Map';
import { useEffect, useMemo, useState } from 'react';
import { PlantingSiteMap } from 'src/components/Map';
import { Typography, useTheme } from '@mui/material';
import PlantingProgressMapDialog from 'src/components/NurseryWithdrawals/PlantingProgressMapDialog';
import { makeStyles } from '@mui/styles';
import { requestSitePopulation } from 'src/redux/features/tracking/trackingThunks';
import { useOrganization } from 'src/providers';

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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [lastPlantingSiteId, setLastPlantingSiteId] = useState<number | undefined>();
  const [focusEntities, setFocusEntities] = useState<{ sourceId: string; id: number }[]>();
  useEffect(() => {
    // set focus entities to the planting site if the planting site id has changed
    setLastPlantingSiteId((last) => {
      if (plantingSiteId !== last) {
        setFocusEntities([{ sourceId: 'sites', id: plantingSiteId }]);
      } else {
        setFocusEntities([]);
      }
      return plantingSiteId;
    });
  }, [plantingSiteId, plantingSite]);

  useEffect(() => {
    if (plantingSite?.boundary) {
      setMapData(MapService.getMapDataFromPlantingSite(plantingSite));
    } else {
      setMapData(undefined);
    }
  }, [plantingSite]);

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
  }, [dispatch, org, plantingSiteId]);

  return mapData ? (
    <PlantingSiteMap
      mapData={mapData}
      focusEntities={focusEntities}
      contextRenderer={{
        render: (properties: MapSourceProperties) => (
          <PlantingProgressMapDialog
            id={properties.id}
            name={properties.name}
            plantingComplete={subzonesComplete[properties.id]}
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
