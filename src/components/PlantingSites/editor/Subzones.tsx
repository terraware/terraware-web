import { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { Feature, FeatureCollection } from 'geojson';
import { Textfield } from '@terraware/web-components';
import strings from 'src/strings';
import { PlantingSite, PlantingSubzone, PlantingZone } from 'src/types/Tracking';
import useUndoRedoState from 'src/hooks/useUndoRedoState';
import {
  GeometryFeature,
  MapEntityOptions,
  MapPopupRenderer,
  MapSourceProperties,
  PopupInfo,
  RenderableReadOnlyBoundary,
} from 'src/types/Map';
import MapIcon from 'src/components/Map/MapIcon';
import useRenderAttributes from 'src/components/Map/useRenderAttributes';
import { cutPolygons, leftMostFeature, leftOrderedFeatures, toMultiPolygon } from 'src/components/Map/utils';
import { MapTooltipDialog } from 'src/components/Map/MapRenderUtils';
import EditableMap, { LayerFeature } from 'src/components/Map/EditableMapV2';
import StepTitleDescription, { Description } from './StepTitleDescription';
import {
  IdGenerator,
  plantingSubzoneToFeature,
  plantingZoneToFeature,
  subzoneNameGenerator,
  toIdentifiableFeature,
  toZoneFeature,
} from './utils';
import useStyles from './useMapStyle';

export type SubzonesProps = {
  onChange: (id: string, value: unknown) => void;
  onValidate?: (hasErrors: boolean, isOptionalStepCompleted?: boolean) => void;
  site: PlantingSite;
};

const featureSiteSubzones = (site: PlantingSite): Record<number, FeatureCollection> =>
  (site.plantingZones ?? []).reduce(
    (subzonesMap, zone) => {
      subzonesMap[zone.id] = {
        type: 'FeatureCollection',
        features: zone.plantingSubzones.map(plantingSubzoneToFeature),
      };
      return subzonesMap;
    },
    {} as Record<number, FeatureCollection>
  );

export default function Subzones({ onChange, onValidate, site }: SubzonesProps): JSX.Element {
  const [selectedZone, setSelectedZone] = useState<number | undefined>(
    site.plantingZones?.length === 1 ? site.plantingZones?.[0]?.id : undefined
  );

  // map of zone id to subzones
  const [subzones, setSubzones, undo, redo] = useUndoRedoState<Record<number, FeatureCollection>>(
    featureSiteSubzones(site)
  );
  const [overridePopupInfo, setOverridePopupInfo] = useState<PopupInfo | undefined>();
  const classes = useStyles();
  const theme = useTheme();
  const getRenderAttributes = useRenderAttributes();

  const zones = useMemo<FeatureCollection | undefined>(
    () =>
      !site.plantingZones
        ? undefined
        : {
            type: 'FeatureCollection',
            features: site.plantingZones.map((zone) => plantingZoneToFeature(zone)),
          },
    [site]
  );

  useEffect(() => {
    // return if we are not in save flow
    if (!onValidate) {
      return;
    }
    // subzones are children of zones, we need to repopuplate zones with new subzones information
    // and update `plantingZones` in the site
    const numZones = site.plantingZones?.length ?? 0;
    const plantingZones: PlantingZone[] | undefined = site.plantingZones?.map((zone) => {
      const plantingSubzones: PlantingSubzone[] = (subzones?.[zone.id]?.features ?? [])
        .map((subzone) => {
          const { geometry, properties } = subzone;
          const multiPolygon = toMultiPolygon(geometry);
          if (multiPolygon && properties) {
            return {
              areaHa: 0, // TODO update with api requirements when ready, we shouldn't be calculating this on the client
              boundary: multiPolygon,
              fullName: properties.name!,
              id: properties.id!,
              name: properties.name!,
              plantingCompleted: false,
            };
          } else {
            return undefined;
          }
        })
        .filter((subzone) => !!subzone) as PlantingSubzone[];
      return { ...zone, plantingSubzones };
    });
    const numSubzones = plantingZones?.flatMap((zone) => zone.plantingSubzones)?.length ?? 0;
    onChange('plantingZones', plantingZones);
    onValidate(plantingZones === undefined, numSubzones > numZones);
  }, [onChange, onValidate, site, subzones, zones]);

  const readOnlyBoundary = useMemo<RenderableReadOnlyBoundary[] | undefined>(() => {
    if (!zones) {
      return undefined;
    }

    const zoneIdGenerator = IdGenerator(zones.features);
    const subzoneIdGenerator = IdGenerator(
      site.id === -1 ? [] : Object.values(subzones ?? {}).flatMap((subzone) => subzone.features)
    );

    const zonesData: RenderableReadOnlyBoundary = {
      data: {
        type: 'FeatureCollection',
        features: zones!.features.map((feature: Feature) => toZoneFeature(feature, zoneIdGenerator)),
      },
      selectedId: selectedZone,
      id: 'zone',
      isInteractive: true,
      renderProperties: {
        ...getRenderAttributes('draft-zone'),
        annotation: {
          textField: 'name',
          textColor: theme.palette.TwClrBaseWhite as string,
          textSize: 20,
        },
      },
    };

    const subzonesData: RenderableReadOnlyBoundary = {
      data: {
        type: 'FeatureCollection',
        features: Object.keys(subzones ?? {}).flatMap((key: string) => {
          const zoneId = Number(key);
          const data = subzones![zoneId];
          return data!.features.map((feature: Feature) =>
            toIdentifiableFeature(feature, subzoneIdGenerator, { parentId: zoneId })
          );
        }),
      },
      id: 'subzone',
      isInteractive: true,
      renderProperties: {
        ...getRenderAttributes('draft-subzone'),
        annotation: {
          textField: 'name',
          textColor: theme.palette.TwClrBaseWhite as string,
          textSize: 16,
        },
      },
    };

    return [zonesData, subzonesData];
  }, [getRenderAttributes, selectedZone, site.id, subzones, theme.palette.TwClrBaseWhite, zones]);

  const description = useMemo<Description[]>(
    () => [
      { text: strings.SITE_SUBZONE_BOUNDARIES_DESCRIPTION_0 },
      {
        text: strings.SITE_SUBZONE_BOUNDARIES_DESCRIPTION_1,
        hasTutorial: true,
        handlePrefix: (prefix: string) => strings.formatString(prefix, <MapIcon icon='slice' />) as JSX.Element[],
      },
      {
        text:
          selectedZone !== undefined
            ? strings.formatString(
                strings.SITE_SUBZONE_BOUNDARIES_SELECTED_ZONE,
                zones?.features?.find((f) => f.id === selectedZone)?.properties?.name
              )
            : strings.SITE_SUBZONE_BOUNDARIES_SELECT_A_ZONE,
      },
    ],
    [selectedZone, zones]
  );

  // when we have a new polygon, add it to the subzones list after carving out the overlapping region in the zone.
  const onEditableBoundaryChanged = (featureCollection?: FeatureCollection) => {
    if (!zones || selectedZone === undefined || !subzones || !subzones[selectedZone]) {
      return;
    }

    const cutWith = featureCollection?.features?.[0]?.geometry;
    if (cutWith) {
      const cutSubzones = cutPolygons(subzones[selectedZone].features! as GeometryFeature[], cutWith);

      if (cutSubzones && subzones) {
        const usedNames: Set<string> = new Set(
          (subzones[selectedZone].features ?? []).map((f) => f.properties?.name).filter((name) => !!name)
        );
        const idGenerator = IdGenerator(Object.values(subzones).flatMap((sz) => sz.features));
        const subzonesWithIds = leftOrderedFeatures(cutSubzones).map(({ feature: subzone }) => {
          if (subzone && subzone.properties && !subzone.properties.name) {
            const subzoneName = subzoneNameGenerator(usedNames);
            subzone.properties.name = subzoneName;
            usedNames.add(subzoneName);
          }
          return toIdentifiableFeature(subzone, idGenerator, { parentId: selectedZone });
        }) as GeometryFeature[];

        setSubzones({
          ...subzones,
          [selectedZone]: {
            type: 'FeatureCollection',
            features: subzonesWithIds,
          },
        });

        const leftMostNewSubzone = leftMostFeature(
          subzonesWithIds.filter((unused, index) => cutSubzones[index].id === undefined)
        );

        if (leftMostNewSubzone) {
          const { feature: subzone, center: mid } = leftMostNewSubzone;
          setOverridePopupInfo({
            id: subzone.id,
            lng: mid[0],
            lat: mid[1],
            properties: subzone.properties,
            sourceId: 'subzone',
          });
        } else {
          setOverridePopupInfo(undefined);
        }
      }
    }
    return;
  };

  // If we don't have a selected zone or clicked zone is not the last selected zone, select the zone.
  // Otherwise select the subzone.
  const featureSelectorOnClick = useCallback(
    (features: LayerFeature[]) => {
      const zone = features.find((feature) => feature.layer?.source === 'zone');
      const subzone = features.find((feature) => feature.layer?.source === 'subzone');
      if (!zone || !zone.properties) {
        return undefined;
      }
      if (selectedZone === undefined || selectedZone !== zone.properties.id) {
        setSelectedZone(zone.properties.id);
        return undefined;
      } else {
        // select the subzone under the click
        return subzone;
      }
    },
    [selectedZone]
  );

  const popupRenderer = useMemo(
    (): MapPopupRenderer => ({
      className: `${classes.tooltip} ${classes.box}`,
      render: (properties: MapSourceProperties, onClose?: () => void): JSX.Element | null => {
        const { name } = properties;

        const close = () => {
          onClose?.();
        };

        const onUpdate = (nameVal: string) => {
          if (!subzones) {
            return;
          }
          const updatedSubzones = { ...subzones };
          const subzone =
            selectedZone !== undefined
              ? updatedSubzones[selectedZone].features.find((f) => f.id === properties.id)
              : undefined; // should not happen
          if (!subzone) {
            return;
          }
          if (!subzone.properties) {
            subzone.properties = {};
          }
          subzone.properties.name = nameVal;
          setSubzones(updatedSubzones);
          close();
        };

        const subzoneNamesInUse = new Set<string>(); // TODO

        return (
          <TooltipContents name={name} onClose={close} onUpdate={onUpdate} subzoneNamesInUse={subzoneNamesInUse} />
        );
      },
    }),
    [classes.box, classes.tooltip, selectedZone, setSubzones, subzones]
  );

  const activeContext = useMemo<MapEntityOptions | undefined>(() => {
    if (selectedZone !== undefined) {
      return { select: [{ sourceId: 'zone', id: selectedZone }] };
    } else {
      return undefined;
    }
  }, [selectedZone]);

  return (
    <Box display='flex' flexDirection='column' flexGrow={1}>
      <StepTitleDescription
        description={description}
        title={strings.SITE_SUBZONE_BOUNDARIES}
        tutorialDescription={strings.ADDING_SUBZONE_BOUNDARIES_INSTRUCTIONS_DESCRIPTION}
        tutorialDocLinkKey='planting_site_create_subzone_boundary_instructions_video'
        tutorialTitle={strings.ADDING_SUBZONE_BOUNDARIES}
      />
      <EditableMap
        clearOnEdit
        featureSelectorOnClick={featureSelectorOnClick}
        activeContext={activeContext}
        onEditableBoundaryChanged={onEditableBoundaryChanged}
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
  onUpdate: (name: string) => void;
  subzoneNamesInUse: Set<string>;
};

const TooltipContents = ({ name, onClose, onUpdate, subzoneNamesInUse }: TooltipContentsProps): JSX.Element => {
  const [subzoneName, setSubzoneName] = useState<string>(name ?? '');
  const [nameError, setNameError] = useState<string>('');
  const [validate, setValidate] = useState<boolean>(false);
  const theme = useTheme();
  const classes = useStyles();

  const validateInput = useCallback((): boolean => {
    let hasNameErrors = true;

    if (!subzoneName) {
      setNameError(strings.REQUIRED_FIELD);
    } else if (subzoneNamesInUse.has(subzoneName)) {
      setNameError(strings.SUBZONE_NAME_IN_USE);
    } else {
      setNameError('');
      hasNameErrors = false;
    }

    return !hasNameErrors;
  }, [subzoneName, subzoneNamesInUse]);

  const save = () => {
    if (!validate) {
      setValidate(true);
    }

    if (validateInput()) {
      onUpdate(subzoneName);
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
      title={strings.SUBZONE}
    >
      <Box display='flex' flexDirection='column' padding={theme.spacing(2)}>
        <Typography>{strings.PLANTING_SITE_ZONE_NAME_HELP}</Typography>
        <Textfield
          autoFocus={true}
          className={classes.textInput}
          label={strings.NAME}
          id='subzone-name'
          type='text'
          onChange={(value) => setSubzoneName(value as string)}
          value={subzoneName}
          errorText={nameError}
        />
      </Box>
    </MapTooltipDialog>
  );
};
