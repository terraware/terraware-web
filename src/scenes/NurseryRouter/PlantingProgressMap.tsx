import React, { type JSX, useCallback, useEffect, useMemo, useState } from 'react';

import { Typography, useTheme } from '@mui/material';

import { PlantingSiteMap } from 'src/components/Map';
import { useLazyGetPlantingSiteQuery } from 'src/queries/generated/plantingSites';
import { useUpdateSubstrataMutation } from 'src/queries/generated/substrata';
import { MapService } from 'src/services';
import strings from 'src/strings';
import { MapData, MapSourceProperties } from 'src/types/Map';
import useSnackbar from 'src/utils/useSnackbar';

import PlantingProgressMapDialog from './PlantingProgressMapDialog';

type PlantingProgressMapProps = {
  plantingSiteId: number | undefined;
};

export default function PlantingProgressMap({ plantingSiteId }: PlantingProgressMapProps): JSX.Element {
  const theme = useTheme();
  const snackbar = useSnackbar();

  const [getPlantingSite, getPlantingSiteResponse] = useLazyGetPlantingSiteQuery();
  const plantingSite = useMemo(() => getPlantingSiteResponse.currentData?.site, [getPlantingSiteResponse]);

  const [updateSubstratum, updateSubstratumResponse] = useUpdateSubstrataMutation();

  useEffect(() => {
    if (plantingSiteId) {
      void getPlantingSite({ id: plantingSiteId }, true);
    }
  }, [getPlantingSite, plantingSiteId]);

  const [mapData, setMapData] = useState<MapData | undefined>();
  const [focusEntities, setFocusEntities] = useState<{ sourceId: string; id: number }[]>([]);

  useEffect(() => {
    if (!mapData?.site?.entities || plantingSite?.id !== mapData.site.entities[0]?.id) {
      if (plantingSite?.boundary) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMapData(MapService.getMapDataFromPlantingSite(plantingSite));
        setFocusEntities([{ sourceId: 'sites', id: plantingSite?.id }]);
      } else {
        setMapData(undefined);
        setFocusEntities([]);
      }
    }
  }, [plantingSite, mapData?.site?.entities]);

  const substrataAreaHa: Record<number, number> = useMemo(() => {
    const result: Record<number, number> = {};
    plantingSite?.strata
      ?.flatMap((stratum) => stratum.substrata)
      ?.forEach((_substratum) => {
        result[_substratum.id] = _substratum.areaHa;
      });
    return result;
  }, [plantingSite]);

  const substrataComplete: Record<number, boolean> = useMemo(() => {
    const result: Record<number, boolean> = {};
    plantingSite?.strata
      ?.flatMap((stratum) => stratum.substrata)
      ?.forEach((_substratum) => {
        result[_substratum.id] = _substratum.plantingCompleted;
      });
    return result;
  }, [plantingSite]);

  useEffect(() => {
    if (updateSubstratumResponse.isError) {
      snackbar.toastError(strings.GENERIC_ERROR);
    }
  }, [snackbar, updateSubstratumResponse.isError]);

  const completeUpdate = useCallback(
    (substratumId: number, plantingCompleted: boolean) => {
      void updateSubstratum({ id: substratumId, updateSubstratumRequestPayload: { plantingCompleted } });
      setFocusEntities([]);
    },
    [updateSubstratum]
  );

  return mapData ? (
    <PlantingSiteMap
      mapData={mapData}
      focusEntities={focusEntities}
      contextRenderer={{
        render: (properties: MapSourceProperties) =>
          plantingSiteId ? (
            <PlantingProgressMapDialog
              substratumId={properties.id}
              substratumName={properties.name}
              substratumAreaHa={substrataAreaHa[properties.id]}
              siteName={plantingSite?.name || ''}
              plantingComplete={substrataComplete[properties.id]}
              plantingSiteId={plantingSiteId}
              onUpdatePlantingComplete={completeUpdate}
              busy={updateSubstratumResponse.isLoading}
            />
          ) : null,
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
  ) : (
    <Typography fontSize='14px' fontWeight={400} color={theme.palette.TwClrTxt} textAlign='center'>
      {strings.NO_MAP_DATA}
    </Typography>
  );
}
