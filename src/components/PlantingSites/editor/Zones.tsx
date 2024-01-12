import { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, Typography, Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Feature, FeatureCollection } from 'geojson';
import strings from 'src/strings';
import { PlantingSite } from 'src/types/Tracking';
import { GeometryFeature, MapPopupRenderer, MapSourceProperties, PopupInfo, ReadOnlyBoundary } from 'src/types/Map';
import EditableMap, { RenderableReadOnlyBoundary } from 'src/components/Map/EditableMapV2';
import { cutPolygons, leftMostFeature, toFeature, toMultiPolygon } from 'src/components/Map/utils';
import useRenderAttributes from 'src/components/Map/useRenderAttributes';
import MapIcon from 'src/components/Map/MapIcon';
import { MapTooltipDialog, mapTooltipDialogStyle } from 'src/components/Map/MapRenderUtils';
import StepTitleDescription, { Description } from './StepTitleDescription';
import { defaultZonePayload } from './utils';

const useStyles = makeStyles((theme: Theme) => ({
  ...mapTooltipDialogStyle(theme),
}));

export type ZonesProps = {
  onChange: (id: string, value: unknown) => void;
  onValidate?: (hasErrors: boolean, isOptionalStepCompleted?: boolean) => void;
  site: PlantingSite;
};

const IdGenerator = (features: Feature[]): (() => number) => {
  let nextId = 0;
  const ids = features
    .filter((f) => !isNaN(Number(f.id)))
    .map((f) => f.id as number)
    .sort();

  if (ids.length) {
    nextId = ids[ids.length - 1];
  }

  return () => {
    nextId++;
    return nextId;
  };
};

const toZoneFeature = (feature: Feature, idGenerator: () => number) =>
  toFeature(feature.geometry, feature.properties ?? {}, isNaN(Number(feature.id)) ? idGenerator() : feature.id!);

export default function Zones({ onChange, onValidate, site }: ZonesProps): JSX.Element {
  const [zones, setZones] = useState<FeatureCollection | undefined>();
  const [overridePopupInfo, setOverridePopupInfo] = useState<PopupInfo | undefined>();
  const classes = useStyles();
  const getRenderAttributes = useRenderAttributes();

  useEffect(() => {
    if (site.plantingZones) {
      const features = site.plantingZones.map((zone) => {
        const { boundary, id, name, targetPlantingDensity } = zone;
        return toFeature(boundary, { id, name, targetPlantingDensity }, id);
      });
      setZones({ type: 'FeatureCollection', features });
    }
  }, [site.plantingZones]);

  useEffect(() => {
    // TODO: use new BE API when it is ready, to populate the zones for creation with
    // right now this onChange does nothing but allow us to move to next phase of subzones cutting
    if (onValidate) {
      if (zones) {
        onChange(
          'plantingZones',
          zones.features
            .map((zone, index) => {
              const { geometry, properties } = zone;
              const multiPolygon = toMultiPolygon(geometry);

              if (multiPolygon) {
                return defaultZonePayload({
                  boundary: multiPolygon,
                  id: properties?.id ?? index,
                  name: properties?.name ?? '',
                  targetPlantingDensity: properties?.targetPlantingDensity ?? 0,
                });
              } else {
                return undefined;
              }
            })
            .filter((data) => !!data)
        );
      }
      onValidate(zones === undefined);
    }
  }, [onChange, onValidate, zones]);

  const readOnlyBoundary = useMemo<RenderableReadOnlyBoundary[] | undefined>(() => {
    if (!zones?.features) {
      return undefined;
    }

    const idGenerator = IdGenerator(zones.features);

    const exclusionsBoundary: RenderableReadOnlyBoundary[] = site.exclusion
      ? [
          {
            featureCollection: { type: 'FeatureCollection', features: [toFeature(site.exclusion!, {}, 0)] },
            id: 'exclusions',
            renderProperties: getRenderAttributes('exclusions'),
          },
        ]
      : [];

    return [
      ...exclusionsBoundary,
      {
        featureCollection: { type: 'FeatureCollection', features: [toFeature(site.boundary!, {}, site.id)] },
        id: 'site',
        renderProperties: getRenderAttributes('site'),
      },
      {
        featureCollection: {
          type: 'FeatureCollection',
          features: zones!.features.map((feature: Feature) => toZoneFeature(feature, idGenerator)),
        },
        id: 'zone',
        isInteractive: true,
        renderProperties: getRenderAttributes('zone'),
      },
    ];
  }, [getRenderAttributes, site.boundary, site.exclusion, site.id, zones]);

  const description = useMemo<Description[]>(
    () => [
      { text: strings.SITE_ZONE_BOUNDARIES_DESCRIPTION_0 },
      {
        text: strings.SITE_ZONE_BOUNDARIES_DESCRIPTION_1,
        hasTutorial: true,
        handlePrefix: (prefix: string) => strings.formatString(prefix, <MapIcon icon='slice' />) as JSX.Element[],
      },
    ],
    []
  );

  const onEditableBoundaryChanged = useCallback(
    (featureCollection?: FeatureCollection, isUndoRedo?: boolean) => {
      if (isUndoRedo || !zones) {
        return;
      }

      const cutWith = featureCollection?.features?.[0]?.geometry;
      if (cutWith) {
        const cutZones = cutPolygons(zones.features as GeometryFeature[], cutWith);

        if (cutZones) {
          const idGenerator = IdGenerator(cutZones);
          const zonesWithIds = cutZones.map((zone) => toZoneFeature(zone, idGenerator)) as GeometryFeature[];

          setZones({
            type: 'FeatureCollection',
            features: zonesWithIds,
          });

          const leftMostNewZone = leftMostFeature(zonesWithIds.filter((_, index) => cutZones[index].id === undefined));

          if (leftMostNewZone) {
            const { feature: zone, center: mid } = leftMostNewZone;
            setOverridePopupInfo({
              id: zone.id,
              lng: mid[0],
              lat: mid[1],
              properties: { id: zone.id },
              sourceId: 'zone',
              active: true,
            });
          } else {
            setOverridePopupInfo(undefined);
          }
        }
      }
      return;
    },
    [zones, setZones]
  );

  const onUndoRedoReadOnlyBoundary = useCallback(
    (updatedData?: ReadOnlyBoundary[]) => {
      setZones(updatedData?.find((data: ReadOnlyBoundary) => data.id === 'zone')?.featureCollection);
    },
    [setZones]
  );

  const popupRenderer = useMemo(
    (): MapPopupRenderer => ({
      className: classes.tooltip,
      render: (properties: MapSourceProperties, onClose?: () => void): JSX.Element | null => {
        const { name, targetPlantingDensity } = properties;

        const onUpdate = (nameVal: string, targetPlantingDensityVal: number) => {
          // TODO
          return;
        };

        return (
          <TooltipContents
            name={name}
            onClose={() => onClose?.()}
            onUpdate={onUpdate}
            targetPlantingDensity={targetPlantingDensity}
          />
        );
      },
    }),
    [classes.tooltip]
  );

  return (
    <Box display='flex' flexDirection='column' flexGrow={1}>
      <StepTitleDescription
        description={description}
        dontShowAgainPreferenceName='dont-show-site-zone-boundaries-instructions'
        title={strings.SITE_ZONE_BOUNDARIES}
        tutorialDescription={strings.ADDING_ZONE_BOUNDARIES_INSTRUCTIONS_DESCRIPTION}
        tutorialDocLinkKey='planting_site_create_zone_boundary_instructions_video'
        tutorialTitle={strings.ADDING_ZONE_BOUNDARIES}
      />
      <EditableMap
        clearOnEdit
        onEditableBoundaryChanged={onEditableBoundaryChanged}
        onUndoRedoReadOnlyBoundary={onUndoRedoReadOnlyBoundary}
        overridePopupInfo={overridePopupInfo}
        popupRenderer={popupRenderer}
        readOnlyBoundary={readOnlyBoundary}
      />
    </Box>
  );
}

type TooltipContentsProps = {
  name?: string;
  onClose: () => void;
  onUpdate: (name: string, targetPlantingDensity: number) => void;
  targetPlantingDensity?: number;
};

const TooltipContents = ({ name, onClose, onUpdate, targetPlantingDensity }: TooltipContentsProps): JSX.Element => {
  const save = () => {
    return;
  };

  return (
    <MapTooltipDialog
      cancelButton={{ title: strings.CANCEL, onClick: onClose }}
      onClose={onClose}
      saveButton={{ title: strings.SAVE, onClick: save }}
      title={strings.ZONE}
    >
      <Box>
        <Typography>WIP</Typography>
      </Box>
    </MapTooltipDialog>
  );
};
