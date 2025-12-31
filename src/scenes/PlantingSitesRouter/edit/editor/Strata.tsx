import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { Textfield } from '@terraware/web-components';
import { Feature, FeatureCollection, MultiPolygon } from 'geojson';

import EditableMap, { LayerFeature } from 'src/components/Map/EditableMapV2';
import MapIcon from 'src/components/Map/MapIcon';
import { MapTooltipDialog } from 'src/components/Map/MapRenderUtils';
import useRenderAttributes from 'src/components/Map/useRenderAttributes';
import { leftMostFeature, toFeature, toMultiPolygon } from 'src/components/Map/utils';
import useUndoRedoState from 'src/hooks/useUndoRedoState';
import { useLocalization } from 'src/providers';
import strings from 'src/strings';
import {
  GeometryFeature,
  MapPopupRenderer,
  MapSourceProperties,
  PopupInfo,
  RenderableReadOnlyBoundary,
} from 'src/types/Map';
import { DraftPlantingSite } from 'src/types/PlantingSite';
import { MinimalPlantingZone } from 'src/types/Tracking';
import useSnackbar from 'src/utils/useSnackbar';

import StepTitleDescription, { Description } from './StepTitleDescription';
import { OnValidate } from './types';
import useMapStyle from './useMapStyle';
import {
  IdGenerator,
  cutOverlappingBoundaries,
  defaultZonePayload,
  emptyBoundary,
  getLatestFeature,
  plantingZoneToFeature,
  toZoneFeature,
  zoneNameGenerator,
} from './utils';

export type StrataProps = {
  onValidate?: OnValidate;
  site: DraftPlantingSite;
};

/**
 * Create a draft site with edited polygons, for error checking.
 * @param site
 *   Site is the original draft site this worflow started with.
 * @return a callback function (using above params in the closure)
 *   A callback function which accepts new cut zone geometries,
 *   and should return a version of the draft planting site accounting
 *   for the potentially new zone boundaries.
 */
const createDraftSiteWith = (site: DraftPlantingSite) => (cutZones: GeometryFeature[]) => ({
  ...site,
  plantingZones: cutZones.map((zone, index) =>
    defaultZonePayload({
      boundary: toMultiPolygon(zone.geometry) as MultiPolygon,
      id: index,
      name: zoneNameGenerator(new Set<string>(), strings.ZONE),
      targetPlantingDensity: zone.properties?.targetPlantingDensity ?? 1500,
    })
  ),
});

// create zone feature collections from the site
const featureSiteZones = (site: DraftPlantingSite): FeatureCollection | undefined => {
  if (site.plantingZones) {
    const features = site.plantingZones.map(plantingZoneToFeature);
    return { type: 'FeatureCollection', features };
  } else {
    return undefined;
  }
};

// data type for undo/redo state
// needs to capture zone edit boundary, error annotations and zones created
type Stack = {
  editableBoundary?: FeatureCollection;
  errorAnnotations?: Feature[];
  fixedBoundaries?: FeatureCollection;
};

export default function Strata({ onValidate, site }: StrataProps): JSX.Element {
  const [zonesData, setZonesData, undo, redo] = useUndoRedoState<Stack>({
    editableBoundary: emptyBoundary(),
    errorAnnotations: [],
    fixedBoundaries: featureSiteZones(site),
  });
  const [overridePopupInfo, setOverridePopupInfo] = useState<PopupInfo | undefined>();
  const theme = useTheme();
  const mapStyles = useMapStyle(theme);
  const snackbar = useSnackbar();
  const getRenderAttributes = useRenderAttributes();
  const activeLocale = useLocalization();

  const zones = useMemo<FeatureCollection | undefined>(() => zonesData?.fixedBoundaries, [zonesData?.fixedBoundaries]);

  useEffect(() => {
    if (onValidate) {
      const missingZones = zones === undefined;
      const zonesTooSmall = !!zonesData?.errorAnnotations?.length;
      // check for missing zone names
      const missingZoneNames = !missingZones && zones.features.some((zone) => !zone?.properties?.name?.trim());
      const missingData = (missingZones || missingZoneNames) && !onValidate.isSaveAndClose;

      if (zonesTooSmall || missingData) {
        snackbar.toastError(zonesTooSmall ? strings.SITE_ZONE_BOUNDARIES_TOO_SMALL : strings.SITE_ZONE_NAMES_MISSING);
        onValidate.apply(true);
        return;
      }

      // populates zones
      const plantingZones = zones?.features
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
        .filter((zone) => !!zone) as MinimalPlantingZone[] | undefined;

      const numZones = plantingZones?.length ?? 0;

      // callback with status of error and completion of this step
      const completed = numZones > 1;
      const data = plantingZones ? { plantingZones } : undefined;
      onValidate.apply(data === undefined, data, completed);
    }
  }, [onValidate, snackbar, zones, zonesData?.errorAnnotations]);

  const readOnlyBoundary = useMemo<RenderableReadOnlyBoundary[] | undefined>(() => {
    if (!zones?.features) {
      return undefined;
    }

    const idGenerator = IdGenerator(zones.features);

    const exclusionsBoundary: RenderableReadOnlyBoundary[] = site.exclusion
      ? [
          {
            data: { type: 'FeatureCollection', features: [toFeature(site.exclusion, {}, 0)] },
            id: 'exclusions',
            renderProperties: getRenderAttributes('exclusions'),
          },
        ]
      : [];

    return [
      ...exclusionsBoundary,
      {
        data: { type: 'FeatureCollection', features: [toFeature(site.boundary!, {}, site.id)] },
        id: 'site',
        renderProperties: getRenderAttributes('site'),
      },
      {
        data: {
          type: 'FeatureCollection',
          features: zones.features.map((feature: Feature) => toZoneFeature(feature, idGenerator)),
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
    () =>
      activeLocale
        ? [
            { text: strings.SITE_ZONE_BOUNDARIES_DESCRIPTION_0 },
            {
              text: strings.SITE_ZONE_BOUNDARIES_DESCRIPTION_1,
              hasTutorial: true,
              handlePrefix: (prefix: string) =>
                strings.formatString(prefix, <MapIcon centerAligned={true} icon='slice' />) as JSX.Element[],
            },
            {
              text: strings.SITE_ZONE_BOUNDARIES_SIZE,
              isBold: true,
            },
          ]
        : [],
    [activeLocale]
  );

  const tutorialDescription = useMemo(() => {
    if (!activeLocale) {
      return '';
    }
    return strings.formatString(
      strings.ADDING_ZONE_BOUNDARIES_INSTRUCTIONS_DESCRIPTION,
      <MapIcon centerAligned icon='slice' />
    ) as JSX.Element[];
  }, [activeLocale]);

  const onEditableBoundaryChanged = async (editableBoundary?: FeatureCollection) => {
    // pick the latest geometry that was drawn
    const cutWithFeature = getLatestFeature(zonesData?.editableBoundary, editableBoundary);

    // update state with cut zones on success
    const onSuccess = (cutZones: GeometryFeature[]) => {
      // if it is feasible to cut zones without making them too small, create new fixed zone boundaries and clear the cut geometry
      const idGenerator = IdGenerator(cutZones);
      const usedNames: Set<string> = new Set(
        (zones?.features ?? []).map((f) => f.properties?.name).filter((name) => !!name)
      );
      const zonesWithIds = cutZones.map((zone) => {
        if (!zone.properties?.name) {
          const zoneName = zoneNameGenerator(usedNames, strings.ZONE);
          zone.properties = { ...zone.properties, name: zoneName };
          usedNames.add(zoneName);
        }
        return toZoneFeature(zone, idGenerator);
      }) as GeometryFeature[];

      setZonesData({
        editableBoundary: emptyBoundary(),
        errorAnnotations: [],
        fixedBoundaries: {
          type: 'FeatureCollection',
          features: zonesWithIds,
        },
      });

      const leftMostNewZone = leftMostFeature(zonesWithIds.filter((unused, index) => cutZones[index].id === undefined));

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
    };

    // update state with error annotations and keep existing editable boundary so user can edit/correct it
    const onError = (errors: Feature[]) => {
      // no zones were cut either because there were no overlaps or they could have been too small
      // set error annotations that were created and keep the cut geometry in case user wants to re-edit the geometry
      setZonesData((prev) => ({
        ...prev,
        editableBoundary: cutWithFeature ? { type: 'FeatureCollection', features: [cutWithFeature] } : emptyBoundary(),
        errorAnnotations: errors,
      }));
    };

    await cutOverlappingBoundaries(
      {
        cutWithFeature,
        errorCheckLevel: 'zone',
        createDraftSiteWith: createDraftSiteWith(site),
        source: zones,
      },
      onSuccess,
      onError
    );

    return;
  };

  // Pick the first zone, we won't have overlapping zones.
  const featureSelectorOnClick = useCallback(
    (features: LayerFeature[]) => features.find((feature) => feature.layer?.source === 'zone'),
    []
  );

  const popupRenderer = useMemo(
    (): MapPopupRenderer => ({
      sx: [mapStyles.tooltip, mapStyles.box],
      render: (properties: MapSourceProperties, onClose?: () => void): JSX.Element | null => {
        const { id, name, targetPlantingDensity } = properties;

        const close = () => {
          setOverridePopupInfo(undefined);
          onClose?.();
        };

        const onUpdate = (nameVal: string, targetPlantingDensityVal: number) => {
          if (!zones) {
            return;
          }
          const updatedZones = { ...zones };
          const zone = updatedZones.features.find((f) => f.id === properties.id);
          if (!zone) {
            return;
          }
          if (!zone.properties) {
            zone.properties = {};
          }
          zone.properties.name = nameVal;
          zone.properties.targetPlantingDensity = targetPlantingDensityVal;
          setZonesData((prev) => ({
            ...prev,
            fixeBoundaries: updatedZones,
          }));
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
    [mapStyles.box, mapStyles.tooltip, setZonesData, zones]
  );

  return (
    <Box display='flex' flexDirection='column' flexGrow={1}>
      <StepTitleDescription
        description={description}
        dontShowAgainPreferenceName='dont-show-site-zone-boundaries-instructions'
        title={strings.ADDING_ZONE_BOUNDARIES}
        tutorialDescription={tutorialDescription}
        tutorialDocLinkKey='planting_site_create_zone_boundary_instructions_video'
        tutorialTitle={strings.ADDING_ZONE_BOUNDARIES}
      />
      <EditableMap
        editableBoundary={zonesData?.editableBoundary}
        errorAnnotations={zonesData?.errorAnnotations}
        featureSelectorOnClick={featureSelectorOnClick}
        isSliceTool
        onEditableBoundaryChanged={(editableBoundary) => void onEditableBoundaryChanged(editableBoundary)}
        onRedo={redo}
        onUndo={undo}
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
      onUpdate(zoneName, density);
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
          autoFocus
          label={strings.NAME}
          id='zone-name'
          type='text'
          onChange={(value) => setZoneName(value as string)}
          value={zoneName}
          errorText={nameError}
          sx={{ marginTop: theme.spacing(1.5) }}
        />
        <Textfield
          label={strings.TARGET_PLANTING_DENSITY}
          id='target-planting-density'
          type='number'
          onChange={(value) => setDensity(value as number)}
          value={density}
          errorText={densityError}
          sx={{ marginTop: theme.spacing(1.5) }}
        />
      </Box>
    </MapTooltipDialog>
  );
};
