import React, { type JSX, useCallback, useEffect, useMemo, useState } from 'react';

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
import { MinimalStratum } from 'src/types/Tracking';
import useSnackbar from 'src/utils/useSnackbar';

import StepTitleDescription, { Description } from './StepTitleDescription';
import { OnValidate } from './types';
import useMapStyle from './useMapStyle';
import {
  IdGenerator,
  cutOverlappingBoundaries,
  defaultStratumPayload,
  emptyBoundary,
  getLatestFeature,
  stratumNameGenerator,
  stratumToFeature,
  toStratumFeature,
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
 *   A callback function which accepts new cut stratum geometries,
 *   and should return a version of the draft planting site accounting
 *   for the potentially new stratum boundaries.
 */
const createDraftSiteWith = (site: DraftPlantingSite) => (cutStrata: GeometryFeature[]) => ({
  ...site,
  strata: cutStrata.map((stratum, index) =>
    defaultStratumPayload({
      boundary: toMultiPolygon(stratum.geometry) as MultiPolygon,
      id: index,
      name: stratumNameGenerator(new Set<string>(), strings.STRATUM),
      targetPlantingDensity: stratum.properties?.targetPlantingDensity ?? 1500,
    })
  ),
});

// create stratum feature collections from the site
const featureSiteStrata = (site: DraftPlantingSite): FeatureCollection | undefined => {
  if (site.strata) {
    const features = site.strata.map(stratumToFeature);
    return { type: 'FeatureCollection', features };
  } else {
    return undefined;
  }
};

// data type for undo/redo state
// needs to capture stratum edit boundary, error annotations and strata created
type Stack = {
  editableBoundary?: FeatureCollection;
  errorAnnotations?: Feature[];
  fixedBoundaries?: FeatureCollection;
};

export default function Strata({ onValidate, site }: StrataProps): JSX.Element {
  const [strataData, setStrataData, undo, redo] = useUndoRedoState<Stack>({
    editableBoundary: emptyBoundary(),
    errorAnnotations: [],
    fixedBoundaries: featureSiteStrata(site),
  });
  const [overridePopupInfo, setOverridePopupInfo] = useState<PopupInfo | undefined>();
  const theme = useTheme();
  const mapStyles = useMapStyle(theme);
  const snackbar = useSnackbar();
  const getRenderAttributes = useRenderAttributes();
  const activeLocale = useLocalization();

  const strata = useMemo<FeatureCollection | undefined>(
    () => strataData?.fixedBoundaries,
    [strataData?.fixedBoundaries]
  );

  useEffect(() => {
    if (onValidate) {
      const missingStrata = strata === undefined;
      const strataTooSmall = !!strataData?.errorAnnotations?.length;
      // check for missing stratum names
      const missingStratumNames =
        !missingStrata && strata.features.some((stratum) => !stratum?.properties?.name?.trim());
      const missingData = (missingStrata || missingStratumNames) && !onValidate.isSaveAndClose;

      if (strataTooSmall || missingData) {
        snackbar.toastError(
          strataTooSmall ? strings.SITE_STRATUM_BOUNDARIES_TOO_SMALL : strings.SITE_STRATUM_NAMES_MISSING
        );
        onValidate.apply(true);
        return;
      }

      // populates strata
      const _strata = strata?.features
        .map((stratum, index) => {
          const { geometry, properties } = stratum;
          const multiPolygon = toMultiPolygon(geometry);

          if (multiPolygon) {
            return defaultStratumPayload({
              boundary: multiPolygon,
              id: properties?.id ?? index,
              name: properties?.name ?? '',
              targetPlantingDensity: properties?.targetPlantingDensity ?? 1500,
            });
          } else {
            return undefined;
          }
        })
        .filter((stratum) => !!stratum) as MinimalStratum[] | undefined;

      const numStrata = _strata?.length ?? 0;

      // callback with status of error and completion of this step
      const completed = numStrata > 1;
      const data = _strata ? { strata: _strata } : undefined;
      onValidate.apply(data === undefined, data, completed);
    }
  }, [onValidate, snackbar, strata, strataData?.errorAnnotations]);

  const readOnlyBoundary = useMemo<RenderableReadOnlyBoundary[] | undefined>(() => {
    if (!strata?.features) {
      return undefined;
    }

    const idGenerator = IdGenerator(strata.features);

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
          features: strata.features.map((feature: Feature) => toStratumFeature(feature, idGenerator)),
        },
        id: 'stratum',
        isInteractive: true,
        renderProperties: {
          ...getRenderAttributes('draft-stratum'),
          annotation: {
            textField: 'name',
            textColor: theme.palette.TwClrBaseWhite as string,
            textSize: 16,
          },
        },
      },
    ];
  }, [getRenderAttributes, site.boundary, site.exclusion, site.id, theme.palette.TwClrBaseWhite, strata]);

  const description = useMemo<Description[]>(
    () =>
      activeLocale
        ? [
            { text: strings.SITE_STRATUM_BOUNDARIES_DESCRIPTION_0 },
            {
              text: strings.SITE_STRATUM_BOUNDARIES_DESCRIPTION_1,
              hasTutorial: true,
              handlePrefix: (prefix: string) =>
                strings.formatString(prefix, <MapIcon centerAligned={true} icon='slice' />) as JSX.Element[],
            },
            {
              text: strings.SITE_STRATUM_BOUNDARIES_SIZE,
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
      strings.ADDING_STRATUM_BOUNDARIES_INSTRUCTIONS_DESCRIPTION,
      <MapIcon centerAligned icon='slice' />
    ) as JSX.Element[];
  }, [activeLocale]);

  const onEditableBoundaryChanged = async (editableBoundary?: FeatureCollection) => {
    // pick the latest geometry that was drawn
    const cutWithFeature = getLatestFeature(strataData?.editableBoundary, editableBoundary);

    // update state with cut strata on success
    const onSuccess = (cutStrata: GeometryFeature[]) => {
      // if it is feasible to cut strata without making them too small, create new fixed stratum boundaries and clear the cut geometry
      const idGenerator = IdGenerator(cutStrata);
      const usedNames: Set<string> = new Set(
        (strata?.features ?? []).map((f) => f.properties?.name).filter((name) => !!name)
      );
      const strataWithIds = cutStrata.map((stratum) => {
        if (!stratum.properties?.name) {
          const stratumName = stratumNameGenerator(usedNames, strings.STRATUM);
          stratum.properties = { ...stratum.properties, name: stratumName };
          usedNames.add(stratumName);
        }
        return toStratumFeature(stratum, idGenerator);
      }) as GeometryFeature[];

      setStrataData({
        editableBoundary: emptyBoundary(),
        errorAnnotations: [],
        fixedBoundaries: {
          type: 'FeatureCollection',
          features: strataWithIds,
        },
      });

      const leftMostNewStratum = leftMostFeature(
        strataWithIds.filter((unused, index) => cutStrata[index].id === undefined)
      );

      if (leftMostNewStratum) {
        const { feature: stratum, center: mid } = leftMostNewStratum;
        setOverridePopupInfo({
          id: stratum.id,
          lng: mid[0],
          lat: mid[1],
          properties: stratum.properties,
          sourceId: 'stratum',
        });
      } else {
        setOverridePopupInfo(undefined);
      }
    };

    // update state with error annotations and keep existing editable boundary so user can edit/correct it
    const onError = (errors: Feature[]) => {
      // no strata were cut either because there were no overlaps or they could have been too small
      // set error annotations that were created and keep the cut geometry in case user wants to re-edit the geometry
      setStrataData((prev) => ({
        ...prev,
        editableBoundary: cutWithFeature ? { type: 'FeatureCollection', features: [cutWithFeature] } : emptyBoundary(),
        errorAnnotations: errors,
      }));
    };

    await cutOverlappingBoundaries(
      {
        cutWithFeature,
        errorCheckLevel: 'stratum',
        createDraftSiteWith: createDraftSiteWith(site),
        source: strata,
      },
      onSuccess,
      onError
    );

    return;
  };

  // Pick the first stratum, we won't have overlapping strata.
  const featureSelectorOnClick = useCallback(
    (features: LayerFeature[]) => features.find((feature) => feature.layer?.source === 'stratum'),
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
          if (!strata) {
            return;
          }
          const updatedStrata = { ...strata };
          const stratum = updatedStrata.features.find((f) => f.id === properties.id);
          if (!stratum) {
            return;
          }
          if (!stratum.properties) {
            stratum.properties = {};
          }
          stratum.properties.name = nameVal;
          stratum.properties.targetPlantingDensity = targetPlantingDensityVal;
          setStrataData((prev) => ({
            ...prev,
            fixedBoundaries: updatedStrata,
          }));
          close();
        };

        const stratumNamesInUse = new Set(
          strata?.features
            .filter((feature) => feature.properties && feature.properties.id !== id)
            .map((feature) => (feature.properties && feature.properties.name) || '') ?? []
        );

        return (
          <TooltipContents
            name={name}
            onClose={close}
            onUpdate={onUpdate}
            targetPlantingDensity={targetPlantingDensity}
            stratumNamesInUse={stratumNamesInUse}
          />
        );
      },
    }),
    [mapStyles.box, mapStyles.tooltip, setStrataData, strata]
  );

  return (
    <Box display='flex' flexDirection='column' flexGrow={1}>
      <StepTitleDescription
        description={description}
        dontShowAgainPreferenceName='dont-show-site-stratum-boundaries-instructions'
        title={strings.ADDING_STRATUM_BOUNDARIES}
        tutorialDescription={tutorialDescription}
        tutorialDocLinkKey='planting_site_create_stratum_boundary_instructions_video'
        tutorialTitle={strings.ADDING_STRATUM_BOUNDARIES}
      />
      <EditableMap
        editableBoundary={strataData?.editableBoundary}
        errorAnnotations={strataData?.errorAnnotations}
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
  stratumNamesInUse: Set<string>;
};

const TooltipContents = ({
  name,
  onClose,
  onUpdate,
  targetPlantingDensity,
  stratumNamesInUse,
}: TooltipContentsProps): JSX.Element => {
  const [stratumName, setStratumName] = useState<string>(name ?? '');
  const [density, setDensity] = useState<number>(targetPlantingDensity);
  const [nameError, setNameError] = useState<string>('');
  const [densityError, setDensityError] = useState<string>('');
  const [validate, setValidate] = useState<boolean>(false);
  const theme = useTheme();

  const validateInput = useCallback((): boolean => {
    let hasNameErrors = true;
    let hasDensityErrors = true;

    if (!stratumName) {
      setNameError(strings.REQUIRED_FIELD);
    } else if (stratumNamesInUse.has(stratumName)) {
      setNameError(strings.STRATUM_NAME_IN_USE);
    } else if (stratumName.length > 15) {
      setNameError(strings.STRATUM_NAME_MAXIMUM_LENGTH);
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
  }, [density, stratumName, stratumNamesInUse]);

  const save = () => {
    if (!validate) {
      setValidate(true);
    }

    if (validateInput()) {
      onUpdate(stratumName, density);
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
      title={strings.STRATUM}
    >
      <Box display='flex' flexDirection='column' padding={theme.spacing(2)}>
        <Typography>{strings.PLANTING_SITE_STRATUM_NAME_HELP}</Typography>
        <Textfield
          autoFocus
          label={strings.NAME}
          id='stratum-name'
          type='text'
          onChange={(value) => setStratumName(value as string)}
          value={stratumName}
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
