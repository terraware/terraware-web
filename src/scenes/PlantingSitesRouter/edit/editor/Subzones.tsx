import { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { Feature, FeatureCollection } from 'geojson';
import { Textfield } from '@terraware/web-components';
import strings from 'src/strings';
import { MinimalPlantingSubzone, MinimalPlantingZone } from 'src/types/Tracking';
import { DraftPlantingSite } from 'src/types/PlantingSite';
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
import useSnackbar from 'src/utils/useSnackbar';
import { useLocalization } from 'src/providers';
import useRenderAttributes from 'src/components/Map/useRenderAttributes';
import { leftMostFeature, leftOrderedFeatures, toMultiPolygon } from 'src/components/Map/utils';
import { MapTooltipDialog } from 'src/components/Map/MapRenderUtils';
import EditableMap, { LayerFeature } from 'src/components/Map/EditableMapV2';
import StepTitleDescription, { Description } from './StepTitleDescription';
import {
  cutOverlappingBoundaries,
  emptyBoundary,
  getLatestFeature,
  IdGenerator,
  plantingSubzoneToFeature,
  plantingZoneToFeature,
  subzoneNameGenerator,
  toIdentifiableFeature,
  toZoneFeature,
} from './utils';
import useStyles from './useMapStyle';

export type SubzonesProps = {
  onValidate?: (hasErrors: boolean, data?: Partial<DraftPlantingSite>, isOptionalStepCompleted?: boolean) => void;
  site: DraftPlantingSite;
};

const featureSiteSubzones = (site: DraftPlantingSite): Record<number, FeatureCollection> =>
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

// data type for undo/redo state
// needs to capture subzone edit boundary, error annotations and subzones created by zone
type Stack = {
  editableBoundary?: FeatureCollection;
  errorAnnotations?: Feature[];
  fixedBoundaries?: Record<number, FeatureCollection>;
};

export default function Subzones({ onValidate, site }: SubzonesProps): JSX.Element {
  const [selectedZone, setSelectedZone] = useState<number | undefined>(site.plantingZones?.[0]?.id);

  // map of zone id to subzones
  const [subzonesData, setSubzonesData, undo, redo] = useUndoRedoState<Stack>({
    editableBoundary: emptyBoundary(),
    errorAnnotations: [],
    fixedBoundaries: featureSiteSubzones(site),
  });
  const [overridePopupInfo, setOverridePopupInfo] = useState<PopupInfo | undefined>();
  const classes = useStyles();
  const theme = useTheme();
  const getRenderAttributes = useRenderAttributes();
  const snackbar = useSnackbar();
  const { activeLocale } = useLocalization();

  // expose subzones as a constant for easier use
  const subzones = useMemo<Record<number, FeatureCollection> | undefined>(
    () => subzonesData?.fixedBoundaries,
    [subzonesData?.fixedBoundaries]
  );

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

    // error out on save if there are subzones with less than minimum boundaries
    const hasSubzoneSizeErrors = !!subzonesData?.errorAnnotations?.length;
    if (hasSubzoneSizeErrors) {
      snackbar.toastError(strings.SITE_SUBZONE_BOUNDARIES_TOO_SMALL);
      onValidate(hasSubzoneSizeErrors);
      return;
    }

    // subzones are children of zones, we need to repopuplate zones with new subzones information
    // and update `plantingZones` in the site
    const numZones = site.plantingZones?.length ?? 0;
    const plantingZones: MinimalPlantingZone[] | undefined = site.plantingZones?.map((zone) => {
      const plantingSubzones: MinimalPlantingSubzone[] = (subzones?.[zone.id]?.features ?? [])
        .map((subzone) => {
          const { geometry, properties } = subzone;
          const multiPolygon = toMultiPolygon(geometry);
          if (multiPolygon && properties) {
            return {
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
        .filter((subzone) => !!subzone) as MinimalPlantingSubzone[];
      return { ...zone, plantingSubzones };
    });
    const numSubzones = plantingZones?.flatMap((zone) => zone.plantingSubzones)?.length ?? 0;
    const data = plantingZones ? { plantingZones } : undefined;
    onValidate(plantingZones === undefined, data, numSubzones > numZones);
  }, [subzonesData?.errorAnnotations, onValidate, site, snackbar, subzones, zones]);

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

    const subzonesBoundaries: RenderableReadOnlyBoundary = {
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

    return [zonesData, subzonesBoundaries];
  }, [getRenderAttributes, selectedZone, site.id, subzones, theme.palette.TwClrBaseWhite, zones]);

  const description = useMemo<Description[]>(
    () =>
      activeLocale
        ? [
            { text: strings.SITE_SUBZONE_BOUNDARIES_DESCRIPTION_0 },
            {
              text: strings.SITE_SUBZONE_BOUNDARIES_DESCRIPTION_1,
              hasTutorial: true,
              handlePrefix: (prefix: string) => strings.formatString(prefix, <MapIcon icon='slice' />) as JSX.Element[],
            },
            { text: strings.SITE_SUBZONE_BOUNDARIES_SELECT_A_ZONE },
            {
              text: strings.formatString(
                strings.SITE_SUBZONE_BOUNDARIES_SELECTED_ZONE,
                zones?.features?.find((f) => f.id === selectedZone)?.properties?.name ?? ''
              ),
              isBold: true,
            },
          ]
        : [],
    [activeLocale, selectedZone, zones]
  );

  const tutorialDescription = useMemo(() => {
    if (!activeLocale) {
      return '';
    }
    return strings.formatString(
      strings.ADDING_SUBZONE_BOUNDARIES_INSTRUCTIONS_DESCRIPTION,
      <MapIcon centerAligned icon='slice' />
    ) as JSX.Element[];
  }, [activeLocale]);

  // when we have a new polygon, add it to the subzones list after carving out the overlapping region in the zone.
  const onEditableBoundaryChanged = (editableBoundary?: FeatureCollection) => {
    // pick the latest geometry that was drawn
    const cutWithFeature = getLatestFeature(subzonesData?.editableBoundary, editableBoundary);

    // update state with cut subzones on success
    const onSuccess = (cutSubzones: GeometryFeature[]) => {
      if (subzones && selectedZone !== undefined) {
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

        setSubzonesData((prev) => ({
          editableBoundary: emptyBoundary(),
          errorAnnotations: [],
          fixedBoundaries: {
            ...subzones,
            [selectedZone]: {
              type: 'FeatureCollection',
              features: subzonesWithIds,
            },
          },
        }));

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
    };

    // update state with error annotations and keep existing editable boundary so user can edit/correct it
    const onError = (errors: Feature[]) => {
      // no subzones were cut either because there were no overlaps or they could have been too small
      // set error annotations that were created and keep the cut geometry in case user wants to re-edit the geometry
      setSubzonesData((prev) => ({
        ...prev,
        editableBoundary: cutWithFeature ? { type: 'FeatureCollection', features: [cutWithFeature] } : emptyBoundary(),
        errorAnnotations: errors,
      }));
    };

    cutOverlappingBoundaries(
      {
        cutWithFeature,
        errorText: strings.SITE_SUBZONE_BOUNDARY_TOO_SMALL,
        minimumSideDimension: 25,
        source: selectedZone !== undefined ? subzones?.[selectedZone] : undefined,
      },
      onSuccess,
      onError
    );

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
        const { id, name } = properties;

        const close = () => {
          setOverridePopupInfo(undefined);
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
          setSubzonesData((prev) => ({ ...prev, fixedBoundaries: updatedSubzones }));
          close();
        };

        const subzoneNamesInUse = new Set<string>(
          Object.values(subzones || ({} as Record<number, FeatureCollection>))
            .flatMap((featureCollection) => featureCollection.features)
            .filter((feature) => feature.properties?.id !== id)
            .map((feature) => feature.properties?.name)
        );

        return (
          <TooltipContents name={name} onClose={close} onUpdate={onUpdate} subzoneNamesInUse={subzoneNamesInUse} />
        );
      },
    }),
    [classes.box, classes.tooltip, selectedZone, setSubzonesData, subzones]
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
        tutorialDescription={tutorialDescription}
        tutorialDocLinkKey='planting_site_create_subzone_boundary_instructions_video'
        tutorialTitle={strings.ADDING_SUBZONE_BOUNDARIES}
      />
      <EditableMap
        activeContext={activeContext}
        editableBoundary={subzonesData?.editableBoundary}
        errorAnnotations={subzonesData?.errorAnnotations}
        featureSelectorOnClick={featureSelectorOnClick}
        isSliceTool
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
