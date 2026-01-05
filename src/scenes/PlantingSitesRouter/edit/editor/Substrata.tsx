import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { Textfield } from '@terraware/web-components';
import { Feature, FeatureCollection, MultiPolygon } from 'geojson';

import EditableMap, { LayerFeature } from 'src/components/Map/EditableMapV2';
import MapIcon from 'src/components/Map/MapIcon';
import { MapTooltipDialog } from 'src/components/Map/MapRenderUtils';
import useRenderAttributes from 'src/components/Map/useRenderAttributes';
import { leftMostFeature, leftOrderedFeatures, toMultiPolygon } from 'src/components/Map/utils';
import useUndoRedoState from 'src/hooks/useUndoRedoState';
import { useLocalization } from 'src/providers';
import strings from 'src/strings';
import {
  GeometryFeature,
  MapEntityOptions,
  MapPopupRenderer,
  MapSourceProperties,
  PopupInfo,
  RenderableReadOnlyBoundary,
} from 'src/types/Map';
import { DraftPlantingSite } from 'src/types/PlantingSite';
import { MinimalStratum, MinimalSubstratum } from 'src/types/Tracking';
import useSnackbar from 'src/utils/useSnackbar';

import StepTitleDescription, { Description } from './StepTitleDescription';
import { OnValidate } from './types';
import useMapStyle from './useMapStyle';
import {
  IdGenerator,
  cutOverlappingBoundaries,
  emptyBoundary,
  getLatestFeature,
  stratumToFeature,
  substratumNameGenerator,
  substratumToFeature,
  toIdentifiableFeature,
  toStratumFeature,
} from './utils';

export type SubstrataProps = {
  onValidate?: OnValidate;
  site: DraftPlantingSite;
};

/**
 * Create a draft site with edited polygons, for error checking.
 * @param site
 *   Site is the original draft site this worflow started with.
 * @param substrata
 *   Record of stratum id to substrata
 * @param selectedStratum
 *   The stratum for which new substrata will be cut.
 * @return a callback function (using above params in the closure)
 *   A callback function which accepts new cut substratum geometries,
 *   and should return a version of the draft planting site accounting
 *   for the potentially new substratum boundaries.
 */
const createDraftSiteWith =
  (
    site: DraftPlantingSite,
    substrata: Record<number, FeatureCollection> | undefined,
    selectedStratum: number | undefined
  ) =>
  (cutBoundaries: GeometryFeature[]) => ({
    ...site,
    strata: site.strata?.map((stratum) => ({
      ...stratum,
      // re-create substrata from the record of strata to substrata
      // unless this is the selected stratum, in which case use the newly cut boundaries
      substrata:
        (selectedStratum === stratum.id ? cutBoundaries : substrata?.[stratum.id]?.features)?.map(
          (substratum, index) => ({
            boundary: toMultiPolygon(substratum.geometry) as MultiPolygon,
            fullName: `${index}`,
            id: index,
            name: `${index}`, // temporary name just for error checking
            plantingCompleted: false,
          })
        ) ?? [],
    })),
  });

// create substratum feature collections from site, for edit purposes
const featureSiteSubstrata = (site: DraftPlantingSite): Record<number, FeatureCollection> =>
  (site.strata ?? []).reduce(
    (substrataMap, stratum) => {
      substrataMap[stratum.id] = {
        type: 'FeatureCollection',
        features: stratum.substrata.map(substratumToFeature),
      };
      return substrataMap;
    },
    {} as Record<number, FeatureCollection>
  );

// data type for undo/redo state
// needs to capture substratum edit boundary, error annotations and substrata created by stratum
type Stack = {
  editableBoundary?: FeatureCollection;
  errorAnnotations?: Feature[];
  fixedBoundaries?: Record<number, FeatureCollection>;
};

export default function Substrata({ onValidate, site }: SubstrataProps): JSX.Element {
  const [selectedStratum, setSelectedStratum] = useState<number | undefined>(site.strata?.[0]?.id);

  // map of stratum id to substrata
  const [substrataData, setSubstrataData, undo, redo] = useUndoRedoState<Stack>({
    editableBoundary: emptyBoundary(),
    errorAnnotations: [],
    fixedBoundaries: featureSiteSubstrata(site),
  });
  const [overridePopupInfo, setOverridePopupInfo] = useState<PopupInfo | undefined>();
  const theme = useTheme();
  const mapStyles = useMapStyle(theme);
  const getRenderAttributes = useRenderAttributes();
  const snackbar = useSnackbar();
  const { activeLocale } = useLocalization();

  // expose substrata as a constant for easier use
  const substrata = useMemo<Record<number, FeatureCollection> | undefined>(
    () => substrataData?.fixedBoundaries,
    [substrataData?.fixedBoundaries]
  );

  const strata = useMemo<FeatureCollection | undefined>(
    () =>
      !site.strata
        ? undefined
        : {
            type: 'FeatureCollection',
            features: site.strata.map((stratum) => stratumToFeature(stratum)),
          },
    [site]
  );

  useEffect(() => {
    // return if we are not in save flow
    if (!onValidate) {
      return;
    }

    // error out on save if there are substrata with less than minimum boundaries
    const hasSubstratumSizeErrors = !!substrataData?.errorAnnotations?.length;
    if (hasSubstratumSizeErrors) {
      snackbar.toastError(strings.SITE_SUBSTRATUM_BOUNDARIES_TOO_SMALL);
      onValidate.apply(true);
      return;
    }

    // substrata are children of strata, we need to repopuplate strata with new substrata information
    // and update `strata` in the site
    const newStrata: MinimalStratum[] | undefined = site.strata?.map((stratum) => {
      const newSubstrata: MinimalSubstratum[] = (substrata?.[stratum.id]?.features ?? [])
        .map((substratum) => {
          const { geometry, properties } = substratum;
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
        .filter((substratum) => !!substratum) as MinimalSubstratum[];
      return { ...stratum, substrata: newSubstrata };
    });
    const numStrata = site.strata?.length ?? 0;
    const numSubstrata = newStrata?.flatMap((stratum) => stratum.substrata)?.length ?? 0;
    const data = newStrata ? { strata: newStrata } : undefined;
    onValidate.apply(newStrata === undefined, data, numSubstrata > numStrata);
  }, [substrataData?.errorAnnotations, onValidate, site, snackbar, substrata, strata]);

  const readOnlyBoundary = useMemo<RenderableReadOnlyBoundary[] | undefined>(() => {
    if (!strata) {
      return undefined;
    }

    const stratumIdGenerator = IdGenerator(strata.features);
    const substratumIdGenerator = IdGenerator(
      site.id === -1 ? [] : Object.values(substrata ?? {}).flatMap((substratum) => substratum.features)
    );

    const strataData: RenderableReadOnlyBoundary = {
      data: {
        type: 'FeatureCollection',
        features: strata.features.map((feature: Feature) => toStratumFeature(feature, stratumIdGenerator)),
      },
      selectedId: selectedStratum,
      id: 'stratum',
      isInteractive: true,
      renderProperties: {
        ...getRenderAttributes('draft-stratum'),
        annotation: {
          textField: 'name',
          textColor: theme.palette.TwClrBaseWhite as string,
          textSize: 20,
        },
      },
    };

    const substrataBoundaries: RenderableReadOnlyBoundary = {
      data: {
        type: 'FeatureCollection',
        features: Object.keys(substrata ?? {}).flatMap((key: string) => {
          const stratumId = Number(key);
          const data = substrata![stratumId];
          return data.features.map((feature: Feature) =>
            toIdentifiableFeature(feature, substratumIdGenerator, { parentId: stratumId })
          );
        }),
      },
      id: 'substratum',
      isInteractive: true,
      renderProperties: {
        ...getRenderAttributes('draft-substratum'),
        annotation: {
          textField: 'name',
          textColor: theme.palette.TwClrBaseWhite as string,
          textSize: 16,
        },
      },
    };

    return [strataData, substrataBoundaries];
  }, [getRenderAttributes, selectedStratum, site.id, substrata, theme.palette.TwClrBaseWhite, strata]);

  const description = useMemo<Description[]>(
    () =>
      activeLocale
        ? [
            { text: strings.SITE_SUBSTRATUM_BOUNDARIES_DESCRIPTION_0 },
            {
              text: strings.SITE_SUBSTRATUM_BOUNDARIES_DESCRIPTION_1,
              hasTutorial: true,
              handlePrefix: (prefix: string) =>
                strings.formatString(prefix, <MapIcon centerAligned={true} icon='slice' />) as JSX.Element[],
            },
            {
              text: strings.formatString(
                strings.SITE_SUBSTRATUM_BOUNDARIES_SELECTED_STRATUM,
                strata?.features?.find((f) => f.id === selectedStratum)?.properties?.name ?? ''
              ),
              isBold: true,
            },
          ]
        : [],
    [activeLocale, selectedStratum, strata]
  );

  const tutorialDescription = useMemo(() => {
    if (!activeLocale) {
      return '';
    }
    return strings.formatString(
      strings.ADDING_SUBSTRATUM_BOUNDARIES_INSTRUCTIONS_DESCRIPTION,
      <MapIcon centerAligned icon='slice' />
    ) as JSX.Element[];
  }, [activeLocale]);

  // when we have a new polygon, add it to the substrata list after carving out the overlapping region in the stratum.
  const onEditableBoundaryChanged = async (editableBoundary?: FeatureCollection) => {
    // pick the latest geometry that was drawn
    const cutWithFeature = getLatestFeature(substrataData?.editableBoundary, editableBoundary);

    // update state with cut substrata on success
    const onSuccess = (cutSubstrata: GeometryFeature[]) => {
      if (substrata && selectedStratum !== undefined) {
        const usedNames: Set<string> = new Set(
          (substrata[selectedStratum].features ?? []).map((f) => f.properties?.name).filter((name) => !!name)
        );
        const idGenerator = IdGenerator(Object.values(substrata).flatMap((sz) => sz.features));
        const substrataWithIds = leftOrderedFeatures(cutSubstrata).map(({ feature: substratum }) => {
          if (substratum && substratum.properties && !substratum.properties.name) {
            const substratumName = substratumNameGenerator(usedNames, strings.SUBSTRATUM);
            substratum.properties.name = substratumName;
            usedNames.add(substratumName);
          }
          return toIdentifiableFeature(substratum, idGenerator, { parentId: selectedStratum });
        }) as GeometryFeature[];

        setSubstrataData(() => ({
          editableBoundary: emptyBoundary(),
          errorAnnotations: [],
          fixedBoundaries: {
            ...substrata,
            [selectedStratum]: {
              type: 'FeatureCollection',
              features: substrataWithIds,
            },
          },
        }));

        const leftMostNewSubstratum = leftMostFeature(
          substrataWithIds.filter((unused, index) => cutSubstrata[index].id === undefined)
        );

        if (leftMostNewSubstratum) {
          const { feature: substratum, center: mid } = leftMostNewSubstratum;
          setOverridePopupInfo({
            id: substratum.id,
            lng: mid[0],
            lat: mid[1],
            properties: substratum.properties,
            sourceId: 'substratum',
          });
        } else {
          setOverridePopupInfo(undefined);
        }
      }
    };

    // update state with error annotations and keep existing editable boundary so user can edit/correct it
    const onError = (errors: Feature[]) => {
      // no substrata were cut either because there were no overlaps or they could have been too small
      // set error annotations that were created and keep the cut geometry in case user wants to re-edit the geometry
      setSubstrataData((prev) => ({
        ...prev,
        editableBoundary: cutWithFeature ? { type: 'FeatureCollection', features: [cutWithFeature] } : emptyBoundary(),
        errorAnnotations: errors,
      }));
    };

    await cutOverlappingBoundaries(
      {
        cutWithFeature,
        errorCheckLevel: 'substratum',
        createDraftSiteWith: createDraftSiteWith(site, substrata, selectedStratum),
        source: selectedStratum !== undefined ? substrata?.[selectedStratum] : undefined,
      },
      onSuccess,
      onError
    );

    return;
  };

  // If we don't have a selected stratum or clicked stratum is not the last selected stratum, select the stratum.
  // Otherwise select the substratum.
  const featureSelectorOnClick = useCallback(
    (features: LayerFeature[]) => {
      const stratum = features.find((feature) => feature.layer?.source === 'stratum');
      const substratum = features.find((feature) => feature.layer?.source === 'substratum');
      if (!stratum || !stratum.properties) {
        return undefined;
      }
      if (selectedStratum === undefined || selectedStratum !== stratum.properties.id) {
        setSelectedStratum(stratum.properties.id);
        return undefined;
      } else {
        // select the substratum under the click
        return substratum;
      }
    },
    [selectedStratum]
  );

  const popupRenderer = useMemo(
    (): MapPopupRenderer => ({
      sx: [mapStyles.tooltip, mapStyles.box],
      render: (properties: MapSourceProperties, onClose?: () => void): JSX.Element | null => {
        const { id, name } = properties;

        const close = () => {
          setOverridePopupInfo(undefined);
          onClose?.();
        };

        const onUpdate = (nameVal: string) => {
          if (!substrata) {
            return;
          }
          const updatedSubstrata = { ...substrata };
          const substratum =
            selectedStratum !== undefined
              ? updatedSubstrata[selectedStratum].features.find((f) => f.id === properties.id)
              : undefined; // should not happen
          if (!substratum) {
            return;
          }
          if (!substratum.properties) {
            substratum.properties = {};
          }
          substratum.properties.name = nameVal;
          setSubstrataData((prev) => ({ ...prev, fixedBoundaries: updatedSubstrata }));
          close();
        };

        const selectedSubstrata = substrata && selectedStratum ? substrata[selectedStratum] : undefined;
        const substratumNamesInUse = selectedSubstrata
          ? new Set<string>(
              selectedSubstrata.features
                .filter((feature) => feature.properties?.id !== id)
                .map((feature) => feature.properties?.name)
            )
          : new Set<string>();

        return (
          <TooltipContents
            name={name}
            onClose={close}
            onUpdate={onUpdate}
            substratumNamesInUse={substratumNamesInUse}
          />
        );
      },
    }),
    [mapStyles.box, mapStyles.tooltip, selectedStratum, setSubstrataData, substrata]
  );

  const activeContext = useMemo<MapEntityOptions | undefined>(() => {
    if (selectedStratum !== undefined) {
      return { select: [{ sourceId: 'stratum', id: selectedStratum }] };
    } else {
      return undefined;
    }
  }, [selectedStratum]);

  return (
    <Box display='flex' flexDirection='column' flexGrow={1}>
      <StepTitleDescription
        description={description}
        title={strings.SITE_SUBSTRATUM_BOUNDARIES}
        tutorialDescription={tutorialDescription}
        tutorialDocLinkKey='planting_site_create_substratum_boundary_instructions_video'
        tutorialTitle={strings.ADDING_SUBSTRATUM_BOUNDARIES}
      />
      <EditableMap
        activeContext={activeContext}
        editableBoundary={substrataData?.editableBoundary}
        errorAnnotations={substrataData?.errorAnnotations}
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
  onUpdate: (name: string) => void;
  substratumNamesInUse: Set<string>;
};

const TooltipContents = ({ name, onClose, onUpdate, substratumNamesInUse }: TooltipContentsProps): JSX.Element => {
  const [substratumName, setSubstratumName] = useState<string>(name ?? '');
  const [nameError, setNameError] = useState<string>('');
  const [validate, setValidate] = useState<boolean>(false);
  const theme = useTheme();

  const validateInput = useCallback((): boolean => {
    let hasNameErrors = true;

    if (!substratumName) {
      setNameError(strings.REQUIRED_FIELD);
    } else if (substratumNamesInUse.has(substratumName)) {
      setNameError(strings.SUBSTRATUM_NAME_IN_USE);
    } else {
      setNameError('');
      hasNameErrors = false;
    }

    return !hasNameErrors;
  }, [substratumName, substratumNamesInUse]);

  const save = () => {
    if (!validate) {
      setValidate(true);
    }

    if (validateInput()) {
      onUpdate(substratumName);
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
      title={strings.SUBSTRATUM}
    >
      <Box display='flex' flexDirection='column' padding={theme.spacing(2)}>
        <Typography>{strings.PLANTING_SITE_STRATUM_NAME_HELP}</Typography>
        <Textfield
          autoFocus={true}
          label={strings.NAME}
          id='substratum-name'
          type='text'
          onChange={(value) => setSubstratumName(value as string)}
          value={substratumName}
          errorText={nameError}
          sx={{ marginTop: theme.spacing(1.5) }}
        />
      </Box>
    </MapTooltipDialog>
  );
};
