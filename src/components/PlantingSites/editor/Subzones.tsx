import { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { Feature, FeatureCollection } from 'geojson';
import { Textfield } from '@terraware/web-components';
import strings from 'src/strings';
import { PlantingSite } from 'src/types/Tracking';
import {
  GeometryFeature,
  MapEntityOptions,
  MapPopupRenderer,
  MapSourceProperties,
  PopupInfo,
  ReadOnlyBoundary,
  RenderableReadOnlyBoundary,
} from 'src/types/Map';
import MapIcon from 'src/components/Map/MapIcon';
import useRenderAttributes from 'src/components/Map/useRenderAttributes';
import { cutPolygons, leftMostFeature } from 'src/components/Map/utils';
import { MapTooltipDialog } from 'src/components/Map/MapRenderUtils';
import EditableMap, { LayerFeature } from 'src/components/Map/EditableMapV2';
import StepTitleDescription, { Description } from './StepTitleDescription';
import {
  IdGenerator,
  plantingSubzoneToFeature,
  plantingZoneToFeature,
  toIdentifiableFeature,
  toZoneFeature,
} from './utils';
import useStyles from './useMapStyle';

export type SubzonesProps = {
  onChange: (id: string, value: unknown) => void;
  onValidate?: (hasErrors: boolean, isOptionalStepCompleted?: boolean) => void;
  site: PlantingSite;
};

export default function Subzones({ onValidate, site }: SubzonesProps): JSX.Element {
  const [selectedZone, setSelectedZone] = useState<number | undefined>();
  const [zones, setZones] = useState<FeatureCollection | undefined>();
  // map of zone id to subzones
  const [subzones, setSubzones] = useState<Record<number, FeatureCollection>>({});
  const [overridePopupInfo, setOverridePopupInfo] = useState<PopupInfo | undefined>();
  const classes = useStyles();
  const theme = useTheme();
  const getRenderAttributes = useRenderAttributes();

  useEffect(() => {
    if (site.plantingZones) {
      const subzonesMap: Record<number, FeatureCollection> = {};
      const features = site.plantingZones.map((zone) => {
        const zoneFeature = plantingZoneToFeature(zone);
        subzonesMap[zone.id] = {
          type: 'FeatureCollection',
          features: zone.plantingSubzones.map(plantingSubzoneToFeature),
        };
        return zoneFeature;
      });
      setZones({ type: 'FeatureCollection', features });
      setSubzones(subzonesMap);
    }
  }, [site.plantingZones]);

  useEffect(() => {
    // TODO
    onValidate?.(false);
  }, [onValidate]);

  const readOnlyBoundary = useMemo<RenderableReadOnlyBoundary[] | undefined>(() => {
    if (!zones) {
      return undefined;
    }

    const zoneIdGenerator = IdGenerator(zones.features);
    const subzoneIdGenerator = IdGenerator(
      site.id === -1 ? [] : Object.values(subzones).flatMap((subzone) => subzone.features)
    );

    const zonesData: RenderableReadOnlyBoundary = {
      featureCollection: {
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
      featureCollection: {
        type: 'FeatureCollection',
        features: Object.keys(subzones ?? []).flatMap((key: string) => {
          const zoneId = Number(key);
          const data = subzones[zoneId];
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
  const onEditableBoundaryChanged = useCallback(
    (featureCollection?: FeatureCollection, isUndoRedo?: boolean) => {
      if (isUndoRedo || !zones || selectedZone === undefined || !subzones[selectedZone]) {
        return;
      }

      const cutWith = featureCollection?.features?.[0]?.geometry;
      if (cutWith) {
        const cutSubzones = cutPolygons(subzones[selectedZone].features! as GeometryFeature[], cutWith);

        if (cutSubzones) {
          const idGenerator = IdGenerator(Object.values(subzones).flatMap((sz) => sz.features));
          const subzonesWithIds = cutSubzones.map((subzone) =>
            toIdentifiableFeature(subzone, idGenerator, { parentId: selectedZone })
          ) as GeometryFeature[];

          setSubzones((current) => ({
            ...current,
            [selectedZone]: {
              type: 'FeatureCollection',
              features: subzonesWithIds,
            },
          }));

          const leftMostNewSubzone = leftMostFeature(
            subzonesWithIds.filter((_, index) => cutSubzones[index].id === undefined)
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
    },
    [selectedZone, setSubzones, subzones, zones]
  );

  const onUndoRedoReadOnlyBoundary = useCallback(
    (updatedData?: ReadOnlyBoundary[]) => {
      const zonesData = updatedData?.find((data: ReadOnlyBoundary) => data.id === 'zone');
      const subzonesData = updatedData?.find((data: ReadOnlyBoundary) => data.id === 'subzone');

      setZones(zonesData?.featureCollection);
      setSelectedZone(zonesData?.selectedId);

      const subzoneFeatures: Feature[] = subzonesData?.featureCollection?.features ?? [];
      setSubzones(
        // set map of zone id to subzone features
        subzoneFeatures.reduce(
          (acc, feature) => {
            const parentId = feature.properties!.parentId;
            if (!acc[parentId]) {
              acc[parentId] = { type: 'FeatureCollection', features: [] };
            }
            acc[parentId].features.push(feature);
            return acc;
          },
          {} as Record<number, FeatureCollection>
        )
      );
    },
    [setSubzones, setZones]
  );

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
      }
      // select the subzone under the click
      return subzone;
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
          setSubzones((currentValue: Record<number, FeatureCollection>) => {
            const newValue = { ...currentValue };
            const subzone =
              selectedZone !== undefined
                ? newValue[selectedZone].features.find((f) => f.id === properties.id)
                : undefined;
            if (subzone?.properties) {
              subzone.properties.name = nameVal;
            }
            return newValue;
          });
          close();
        };

        const subzoneNamesInUse = new Set<string>(); // TODO

        return (
          <TooltipContents name={name} onClose={close} onUpdate={onUpdate} subzoneNamesInUse={subzoneNamesInUse} />
        );
      },
    }),
    [classes.box, classes.tooltip, selectedZone]
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
