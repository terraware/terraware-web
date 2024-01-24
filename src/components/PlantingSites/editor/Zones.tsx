import { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { Feature, FeatureCollection } from 'geojson';
import { Textfield } from '@terraware/web-components';
import strings from 'src/strings';
import { PlantingSite } from 'src/types/Tracking';
import {
  GeometryFeature,
  MapPopupRenderer,
  MapSourceProperties,
  PopupInfo,
  ReadOnlyBoundary,
  RenderableReadOnlyBoundary,
} from 'src/types/Map';
import EditableMap, { LayerFeature } from 'src/components/Map/EditableMapV2';
import { cutPolygons, leftMostFeature, toFeature, toMultiPolygon } from 'src/components/Map/utils';
import useRenderAttributes from 'src/components/Map/useRenderAttributes';
import MapIcon from 'src/components/Map/MapIcon';
import { MapTooltipDialog } from 'src/components/Map/MapRenderUtils';
import StepTitleDescription, { Description } from './StepTitleDescription';
import { defaultZonePayload, IdGenerator, plantingZoneToFeature, toZoneFeature } from './utils';
import useStyles from './useMapStyle';

export type ZonesProps = {
  onChange: (id: string, value: unknown) => void;
  onValidate?: (hasErrors: boolean, isOptionalStepCompleted?: boolean) => void;
  site: PlantingSite;
};

export default function Zones({ onChange, onValidate, site }: ZonesProps): JSX.Element {
  const [zones, setZones] = useState<FeatureCollection | undefined>();
  const [overridePopupInfo, setOverridePopupInfo] = useState<PopupInfo | undefined>();
  const classes = useStyles();
  const theme = useTheme();
  const getRenderAttributes = useRenderAttributes();

  useEffect(() => {
    if (site.plantingZones) {
      const features = site.plantingZones.map(plantingZoneToFeature);
      setZones({ type: 'FeatureCollection', features });
    }
  }, [site.plantingZones]);

  useEffect(() => {
    // TODO: use new BE API when it is ready, to populate the zones for creation with
    // right now this onChange does nothing but allow us to move to next phase of subzones cutting
    if (onValidate) {
      let numZones = 0;
      if (zones) {
        const plantingZones = zones.features
          .map((zone, index) => {
            const { geometry, properties } = zone;
            const multiPolygon = toMultiPolygon(geometry);

            if (multiPolygon) {
              return defaultZonePayload({
                boundary: multiPolygon,
                id: properties?.id ?? index,
                name: properties?.name ?? '',
                targetPlantingDensity: properties?.targetPlantingDensity ?? 1500,
              });
            } else {
              return undefined;
            }
          })
          .filter((data) => !!data);
        onChange('plantingZones', plantingZones);
        numZones = plantingZones.length;
      }
      onValidate(zones === undefined, numZones > 1);
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
        renderProperties: {
          ...getRenderAttributes('draft-zone'),
          annotation: {
            textField: 'name',
            textColor: theme.palette.TwClrBaseWhite as string,
            textSize: 16,
          },
        },
      },
    ];
  }, [getRenderAttributes, site.boundary, site.exclusion, site.id, theme.palette.TwClrBaseWhite, zones]);

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
              properties: zone.properties,
              sourceId: 'zone',
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

  // Pick the first zone, we won't have overlapping zones.
  const featureSelectorOnClick = useCallback(
    (features: LayerFeature[]) => features.find((feature) => feature.layer?.source === 'zone'),
    []
  );

  const popupRenderer = useMemo(
    (): MapPopupRenderer => ({
      className: `${classes.tooltip} ${classes.box}`,
      render: (properties: MapSourceProperties, onClose?: () => void): JSX.Element | null => {
        const { id, name, targetPlantingDensity } = properties;

        const close = () => {
          onClose?.();
        };

        const onUpdate = (nameVal: string, targetPlantingDensityVal: number) => {
          setZones((currentValue) => {
            if (!currentValue) {
              return currentValue;
            }
            const newValue = { ...currentValue };
            const zone = newValue.features.find((f) => f.id === properties.id);
            if (zone?.properties) {
              zone.properties.name = nameVal;
              zone.properties.targetPlantingDensity = targetPlantingDensityVal;
            }
            return newValue;
          });
          close();
        };

        const zoneNamesInUse = new Set(
          zones?.features
            .filter((feature) => feature.properties && feature.properties.id !== id)
            .map((feature) => (feature.properties && feature.properties.name) || '') ?? []
        );

        return (
          <TooltipContents
            name={name}
            onClose={close}
            onUpdate={onUpdate}
            targetPlantingDensity={targetPlantingDensity}
            zoneNamesInUse={zoneNamesInUse}
          />
        );
      },
    }),
    [classes.box, classes.tooltip, zones?.features]
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
        featureSelectorOnClick={featureSelectorOnClick}
        onEditableBoundaryChanged={onEditableBoundaryChanged}
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
  targetPlantingDensity: number;
  zoneNamesInUse: Set<string>;
};

const TooltipContents = ({
  name,
  onClose,
  onUpdate,
  targetPlantingDensity,
  zoneNamesInUse,
}: TooltipContentsProps): JSX.Element => {
  const [zoneName, setZoneName] = useState<string>(name ?? '');
  const [density, setDensity] = useState<number>(targetPlantingDensity);
  const [nameError, setNameError] = useState<string>('');
  const [densityError, setDensityError] = useState<string>('');
  const [validate, setValidate] = useState<boolean>(false);
  const theme = useTheme();
  const classes = useStyles();

  const validateInput = useCallback((): boolean => {
    let hasNameErrors = true;
    let hasDensityErrors = true;

    if (!zoneName) {
      setNameError(strings.REQUIRED_FIELD);
    } else if (zoneNamesInUse.has(zoneName)) {
      setNameError(strings.ZONE_NAME_IN_USE);
    } else if (zoneName.length > 15) {
      setNameError(strings.ZONE_NAME_MAXIMUM_LENGTH);
    } else {
      setNameError('');
      hasNameErrors = false;
    }

    if (!density) {
      setDensityError(strings.REQUIRED_FIELD);
    } else if (Number(density) <= 0) {
      setDensityError(strings.INVALID_VALUE);
    } else {
      setDensityError('');
      hasDensityErrors = false;
    }

    return !(hasNameErrors || hasDensityErrors);
  }, [density, zoneName, zoneNamesInUse]);

  const save = () => {
    if (!validate) {
      setValidate(true);
    }

    if (validateInput()) {
      onUpdate(zoneName, density as number);
    }
  };

  useEffect(() => {
    if (validate) {
      validateInput();
    }
  }, [validate, validateInput]);

  return (
    <MapTooltipDialog
      cancelButton={{ title: strings.CANCEL, onClick: onClose }}
      onClose={onClose}
      saveButton={{ title: strings.SAVE, onClick: save }}
      title={strings.ZONE}
    >
      <Box display='flex' flexDirection='column' padding={theme.spacing(2)}>
        <Typography>{strings.PLANTING_SITE_ZONE_NAME_HELP}</Typography>
        <Textfield
          autoFocus={true}
          className={classes.textInput}
          label={strings.NAME}
          id='zone-name'
          type='text'
          onChange={(value) => setZoneName(value as string)}
          value={zoneName}
          errorText={nameError}
        />
        <Textfield
          className={classes.textInput}
          label={strings.TARGET_PLANTING_DENSITY}
          id='target-planting-density'
          type='number'
          onChange={(value) => setDensity(value as number)}
          value={density}
          errorText={densityError}
        />
      </Box>
    </MapTooltipDialog>
  );
};
