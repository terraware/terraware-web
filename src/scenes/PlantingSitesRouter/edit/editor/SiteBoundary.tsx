import React, { type JSX, useCallback, useEffect, useMemo, useState } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { Icon, Message } from '@terraware/web-components';
import bbox from '@turf/bbox';
import bboxPolygon from '@turf/bbox-polygon';
import centroid from '@turf/centroid';
import { Feature, FeatureCollection, MultiPolygon, Polygon, Position } from 'geojson';
import _ from 'lodash';

import { MapEditorMode } from 'src/components/Map/EditableMapDrawV2';
import EditableMap from 'src/components/Map/EditableMapV2';
import MapIcon from 'src/components/Map/MapIcon';
import { toFeature, unionMultiPolygons } from 'src/components/Map/utils';
import { useFeatureEnabled } from 'src/features';
import useUndoRedoState from 'src/hooks/useUndoRedoState';
import { useLocalization } from 'src/providers';
import strings from 'src/strings';
import { DraftPlantingSite } from 'src/types/PlantingSite';
import { MinimalStratum } from 'src/types/Tracking';
import useSnackbar from 'src/utils/useSnackbar';

import BoundaryMethodChooser, { BoundaryMethod } from './BoundaryMethodChooser';
import DrawingBoundaryStatus from './DrawingBoundaryStatus';
import StepTitleDescription, { Description } from './StepTitleDescription';
import UploadBoundaryModal, { ParsedBoundary } from './UploadBoundaryModal';
import UploadedBoundarySummary, { UploadedBoundaryFile } from './UploadedBoundarySummary';
import { OnValidate } from './types';
import { boundingAreaHectares, defaultStratumPayload, findErrors, stratumNameGenerator } from './utils';

export type SiteBoundaryProps = {
  onValidate?: OnValidate;
  onDirtyChange?: (isDirty: boolean) => void;
  site: DraftPlantingSite;
};

// create default strata off the site boundary
const createStratumWith = (boundary?: MultiPolygon): MinimalStratum | undefined => {
  if (!boundary) {
    return undefined;
  }
  const stratumBoundary: MultiPolygon = { type: 'MultiPolygon', coordinates: boundary.coordinates };
  const stratumName = stratumNameGenerator(new Set<string>(), strings.STRATUM);
  return defaultStratumPayload({
    boundary: stratumBoundary,
    id: 0,
    name: stratumName,
    initialPlantingDensity: 1500,
  });
};

const featureSiteBoundary = (id: number, boundary?: MultiPolygon): FeatureCollection | undefined =>
  !boundary
    ? undefined
    : {
        type: 'FeatureCollection',
        features: [toFeature(boundary, {}, id)],
      };

// the parse endpoint hands back a bare geometry; the map works in feature collections
const featureCollectionOf = (geometry: MultiPolygon | Polygon, id: number): FeatureCollection => ({
  type: 'FeatureCollection',
  features: [toFeature(geometry, {}, id)],
});

// number of vertices across every ring of the boundary, which the parse response does not report
const countPositions = (geometry: MultiPolygon | Polygon): number => {
  const rings: Position[][] = geometry.type === 'MultiPolygon' ? geometry.coordinates.flat() : geometry.coordinates;
  return rings.reduce((total, ring) => total + ring.length, 0);
};

// undo redo stack to capture site boundary and errors
type Stack = {
  errorAnnotations?: Feature[];
  siteBoundary?: FeatureCollection;
};

export default function SiteBoundary({ onValidate, onDirtyChange, site }: SiteBoundaryProps): JSX.Element {
  const [siteBoundaryData, setSiteBoundaryData, undo, redo] = useUndoRedoState<Stack>({
    siteBoundary: featureSiteBoundary(site.id, site.boundary),
  });
  const geometrySnapshot = JSON.stringify({ siteBoundary: siteBoundaryData?.siteBoundary });
  const [initialGeometry] = useState(geometrySnapshot);
  useEffect(() => {
    onDirtyChange?.(geometrySnapshot !== initialGeometry);
  }, [geometrySnapshot, initialGeometry, onDirtyChange]);

  const [mode, setMode] = useState<MapEditorMode>();
  const snackbar = useSnackbar();
  const theme = useTheme();
  const { activeLocale } = useLocalization();

  const fileUploadEnabled = useFeatureEnabled('Boundary File Upload');
  const [method, setMethod] = useState<BoundaryMethod | undefined>();
  const [uploadedFile, setUploadedFile] = useState<UploadedBoundaryFile | undefined>();
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  // EditableMap only computes its view state on mount, so remount it to fit an uploaded boundary
  const [mapKey, setMapKey] = useState<number>(0);

  // construct union of multipolygons
  const boundary = useMemo<MultiPolygon | undefined>(
    () => (siteBoundaryData?.siteBoundary && unionMultiPolygons(siteBoundaryData?.siteBoundary)) || undefined,
    [siteBoundaryData?.siteBoundary]
  );

  const boundingArea = useMemo<number>(() => (boundary ? boundingAreaHectares(boundary) : 0), [boundary]);

  // check if bounding area is larger than 20K hectares
  const boundingAreaTooLarge = useMemo<boolean>(() => boundingArea > 20000, [boundingArea]);

  const errorAnnotations = useMemo<Feature[] | undefined>(() => {
    // if bounding area is too large, show error message at center of bounding box, also show the bounding box
    if (boundary) {
      // if bounding area is too large, show that error first and skip other errors to avoid overwhelming user
      if (boundingAreaTooLarge) {
        const bboxPoly = bboxPolygon(bbox(_.cloneDeep(boundary)));
        const c = centroid(bboxPoly);
        const errorText = strings.formatString(strings.SITE_BOUNDING_AREA_TOO_LARGE, boundingArea);
        return [
          { ...c, properties: { errorText }, id: 0 },
          { ...bboxPoly, id: 1 },
        ];
      }

      return siteBoundaryData?.errorAnnotations;
    }
    return undefined;
  }, [boundary, boundingArea, boundingAreaTooLarge, siteBoundaryData?.errorAnnotations]);

  useEffect(() => {
    if (onValidate) {
      if ((!boundary && !onValidate.isSaveAndClose) || errorAnnotations?.length) {
        snackbar.toastError(
          errorAnnotations?.length ? strings.SITE_BOUNDARY_ERRORS : strings.SITE_BOUNDARY_ABSENT_WARNING
        );
        onValidate.apply(true);
        return;
      } else {
        // create one stratum per disjoint polygon in the site boundary
        const stratum = createStratumWith(boundary);
        const strata = stratum ? [stratum] : [];
        onValidate.apply(false, { boundary, strata });
      }
    }
  }, [boundary, errorAnnotations, onValidate, site.id, snackbar]);

  const description = useMemo<Description[]>(() => {
    if (!activeLocale) {
      return [];
    }

    if (fileUploadEnabled) {
      return [
        {
          text:
            site.siteType === 'detailed'
              ? strings.SITE_BOUNDARY_UPLOAD_DESCRIPTION
              : `${strings.SITE_BOUNDARY_UPLOAD_DESCRIPTION} ${strings.SITE_BOUNDARY_UPLOAD_SIMPLE_SITE_NOTE}`,
        },
        { text: strings.SITE_BOUNDARY_UPLOAD_TUTORIAL, hasTutorial: true },
      ];
    }

    const data: Description[] = [
      {
        text:
          site.siteType === 'detailed'
            ? strings.SITE_BOUNDARY_DESCRIPTION_0
            : `${strings.SITE_BOUNDARY_DESCRIPTION_0} ${strings.SITE_BOUNDARY_SIMPLE_SITE_NOTE}`,
      },
      {
        text: strings.SITE_BOUNDARY_DESCRIPTION_1,
        hasTutorial: true,
        handlePrefix: (prefix: string) =>
          strings.formatString(prefix, <MapIcon centerAligned={true} icon='polygon' />) as JSX.Element[],
      },
      { text: strings.SITE_BOUNDARY_DESCRIPTION_2, isBold: true },
    ];

    if (!mode) {
      data.push({ text: strings.LOADING });
    } else if (mode === 'CreatingBoundary') {
      data.push({ text: strings.SITE_BOUNDARY_DESCRIPTION_3 });
    } else if (mode === 'EditingBoundary' || mode === 'BoundarySelected') {
      data.push({
        text: strings.formatString(strings.SITE_BOUNDARY_DESCRIPTION_4, <MapIcon icon='trash' />) as JSX.Element[],
      });
    }

    return data;
  }, [activeLocale, fileUploadEnabled, mode, site.siteType]);

  const tutorialDescription = useMemo(() => {
    if (!activeLocale) {
      return '';
    }
    return strings.formatString(
      strings.PLANTING_SITE_CREATE_INSTRUCTIONS_DESCRIPTION,
      <MapIcon centerAligned icon='polygon' />
    ) as JSX.Element[];
  }, [activeLocale]);

  /**
   * Check for errors and mark annotations.
   */
  const onEditableBoundaryChanged = useCallback(
    async (editableBoundary?: FeatureCollection) => {
      const newBoundary = (editableBoundary && unionMultiPolygons(editableBoundary)) || undefined;
      const stratum = createStratumWith(newBoundary);
      const strata = stratum ? [stratum] : [];
      const errors = await findErrors(
        {
          ...site,
          boundary: newBoundary,
          strata,
        },
        'site_boundary',
        []
      );

      setSiteBoundaryData({
        errorAnnotations: errors,
        siteBoundary: editableBoundary,
      });
    },
    // setSiteBoundaryData is not stable: it closes over the undo/redo stack index, so a callback
    // that pins an older copy will push onto a truncated stack and leave the index out of range
    [setSiteBoundaryData, site]
  );

  const onSelectMethod = useCallback((selected: BoundaryMethod) => {
    setMethod(selected);
    setShowUploadModal(selected === 'upload');
  }, []);

  const onCloseUploadModal = useCallback(() => {
    setShowUploadModal(false);
    setMethod((current) => (current === 'upload' ? undefined : current));
  }, []);

  const onUploadSuccess = useCallback(
    (parsed: ParsedBoundary) => {
      const { areaHa, format, numPolygons } = parsed;
      // these are only populated when the file parsed successfully
      if (!parsed.geometry || areaHa === undefined || !format || numPolygons === undefined) {
        return;
      }
      const geometry = parsed.geometry as MultiPolygon | Polygon;

      setUploadedFile({
        areaHa,
        boundingAreaHa: boundingAreaHectares(geometry),
        filename: parsed.filename,
        format,
        numPoints: countPositions(geometry),
        numPolygons,
      });
      setMethod('upload');
      setShowUploadModal(false);

      // the remount has to wait for the boundary, since EditableMap fits its bounds on mount and
      // applying the boundary is async
      const apply = async () => {
        await onEditableBoundaryChanged(featureCollectionOf(geometry, site.id));
        setMapKey((current) => current + 1);
      };

      void apply();
    },
    [onEditableBoundaryChanged, site.id]
  );

  const onRemoveUploadedFile = useCallback(() => {
    setUploadedFile(undefined);
    setMethod(undefined);
    void onEditableBoundaryChanged(undefined);
  }, [onEditableBoundaryChanged]);

  const onOpenUploadModal = useCallback(() => setShowUploadModal(true), []);

  return (
    <Box display='flex' flexDirection='column' flexGrow={1}>
      <StepTitleDescription
        description={description}
        dontShowAgainPreferenceName='dont-show-site-boundary-instructions'
        minHeight={fileUploadEnabled ? '72px' : '152px'}
        title={strings.SITE_BOUNDARY}
        tutorialDescription={tutorialDescription}
        tutorialDocLinkKey='planting_site_create_boundary_instructions_video'
        tutorialTitle={strings.PLANTING_SITE_CREATE_INSTRUCTIONS_TITLE}
      />
      {fileUploadEnabled && (
        <>
          <Box display='flex' alignItems='center' gap={theme.spacing(0.75)} marginBottom={theme.spacing(2.5)}>
            <Icon name='info' size='small' style={{ fill: theme.palette.TwClrIcnSecondary, flex: 'none' }} />
            <Typography fontSize='12px' fontWeight={400} lineHeight='16px' color={theme.palette.TwClrTxtSecondary}>
              {strings.SITE_BOUNDARY_MAX_BOUNDING_BOX}
            </Typography>
          </Box>
          {uploadedFile && uploadedFile.numPolygons > 1 && (
            <Box marginBottom={theme.spacing(2)}>
              <Message
                body={
                  strings.formatString(
                    strings.SITE_BOUNDARY_POLYGONS_COMBINED,
                    uploadedFile.numPolygons
                  ) as unknown as string
                }
                priority='info'
                type='page'
              />
            </Box>
          )}
          {uploadedFile && (
            <UploadedBoundarySummary
              file={uploadedFile}
              onRemove={onRemoveUploadedFile}
              onReplace={onOpenUploadModal}
            />
          )}
          {!uploadedFile && method === 'draw' && <DrawingBoundaryStatus onUploadInstead={onOpenUploadModal} />}
        </>
      )}
      <Box display='flex' flexDirection='column' flexGrow={1} position='relative'>
        <EditableMap
          key={mapKey}
          editableBoundary={siteBoundaryData?.siteBoundary}
          errorAnnotations={errorAnnotations}
          onEditableBoundaryChanged={(editableBoundary) => void onEditableBoundaryChanged(editableBoundary)}
          onRedo={redo}
          onUndo={undo}
          setMode={setMode}
          showSearchBox
        />
        {fileUploadEnabled && !boundary && !method && <BoundaryMethodChooser onSelect={onSelectMethod} />}
        {fileUploadEnabled && showUploadModal && (
          <UploadBoundaryModal onClose={onCloseUploadModal} onSuccess={onUploadSuccess} />
        )}
      </Box>
    </Box>
  );
}
