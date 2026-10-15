import React, { type JSX, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Box } from '@mui/material';
import bbox from '@turf/bbox';
import bboxPolygon from '@turf/bbox-polygon';
import centroid from '@turf/centroid';
import { Feature, FeatureCollection, MultiPolygon, Polygon, Position } from 'geojson';
import _ from 'lodash';

import MapIcon from 'src/components/Map/MapIcon';
import { toFeature, unionMultiPolygons } from 'src/components/Map/utils';
import EditableMap from 'src/components/NewMap/EditableMap';
import { useTrackEvent } from 'src/hooks/useTrackEvent';
import useUndoRedoState from 'src/hooks/useUndoRedoState';
import { MIXPANEL_EVENTS } from 'src/mixpanelEvents';
import { useLocalization } from 'src/providers';
import { clearSnackbar } from 'src/redux/features/snackbar/snackbarSlice';
import { useAppDispatch } from 'src/redux/store';
import strings from 'src/strings';
import { BoundarySource, DraftPlantingSite } from 'src/types/PlantingSite';
import { MinimalStratum } from 'src/types/Tracking';
import useSnackbar from 'src/utils/useSnackbar';

import BoundaryMethodChooser, { BoundaryMethod } from './BoundaryMethodChooser';
import DrawingBoundaryStatus from './DrawingBoundaryStatus';
import { useEditorStepperDrawer } from './EditorStepper';
import StepTitleDescription, { Description } from './StepTitleDescription';
import UploadBoundaryModal, { ParsedBoundary, boundaryFileFormatOf, fileSizeKb } from './UploadBoundaryModal';
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

// undo redo stack to capture site boundary, errors, and the file the boundary came from
type Stack = {
  boundarySource?: BoundarySource;
  errorAnnotations?: Feature[];
  siteBoundary?: FeatureCollection;
  uploadedFile?: UploadedBoundaryFile;
  uploadId?: number;
};

const editedBoundarySource = (previous?: BoundarySource): BoundarySource =>
  previous === 'uploaded' || previous === 'uploaded_edited' ? 'uploaded_edited' : 'drawn';

export default function SiteBoundary({ onValidate, onDirtyChange, site }: SiteBoundaryProps): JSX.Element {
  const [siteBoundaryData, setSiteBoundaryData, undo, redo] = useUndoRedoState<Stack>({
    // drafts saved before the source was recorded could only have drawn boundaries
    boundarySource: site.boundary ? site.boundarySource ?? 'drawn' : undefined,
    siteBoundary: featureSiteBoundary(site.id, site.boundary),
  });
  const geometrySnapshot = JSON.stringify({ siteBoundary: siteBoundaryData?.siteBoundary });
  const [initialGeometry] = useState(geometrySnapshot);
  useEffect(() => {
    onDirtyChange?.(geometrySnapshot !== initialGeometry);
  }, [geometrySnapshot, initialGeometry, onDirtyChange]);

  const snackbar = useSnackbar();
  const dispatch = useAppDispatch();
  const { activeLocale } = useLocalization();
  const trackEvent = useTrackEvent();

  const [method, setMethod] = useState<BoundaryMethod | undefined>();
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const lastUploadId = useRef<number>(0);

  const uploadedFile = siteBoundaryData?.uploadedFile;
  const mapKey = siteBoundaryData?.uploadId ?? 0;

  // construct union of multipolygons
  const boundary = useMemo<MultiPolygon | undefined>(
    () => (siteBoundaryData?.siteBoundary && unionMultiPolygons(siteBoundaryData?.siteBoundary)) || undefined,
    [siteBoundaryData?.siteBoundary]
  );

  // undoing past an upload drops the file, leaving either a drawn boundary or nothing to choose from
  const activeMethod =
    method === 'upload' && !uploadedFile && !showUploadModal ? (boundary ? 'draw' : undefined) : method;

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
        const errorText = strings.formatString(strings.SITE_BOUNDING_AREA_TOO_LARGE, Math.round(boundingArea));
        return [
          { ...c, properties: { errorText }, id: 0 },
          { ...bboxPoly, id: 1 },
        ];
      }

      return siteBoundaryData?.errorAnnotations;
    }
    return undefined;
  }, [boundary, boundingArea, boundingAreaTooLarge, siteBoundaryData?.errorAnnotations]);

  const boundarySource = boundary ? siteBoundaryData?.boundarySource : undefined;

  useEffect(() => {
    if (onValidate) {
      if ((!boundary && !onValidate.allowIncomplete) || errorAnnotations?.length) {
        snackbar.toastError(
          errorAnnotations?.length ? strings.SITE_BOUNDARY_ERRORS : strings.SITE_BOUNDARY_ABSENT_WARNING
        );
        onValidate.apply(true);
        return;
      } else if (geometrySnapshot === initialGeometry && site.strata) {
        // keep strata from later steps when the boundary is unchanged
        onValidate.apply(false, { boundary, boundarySource });
      } else {
        // create one stratum per disjoint polygon in the site boundary
        const stratum = createStratumWith(boundary);
        const strata = stratum ? [stratum] : [];
        onValidate.apply(false, { boundary, boundarySource, strata });
      }
    }
  }, [
    boundary,
    boundarySource,
    errorAnnotations,
    geometrySnapshot,
    initialGeometry,
    onValidate,
    site.strata,
    snackbar,
  ]);

  const description = useMemo<Description[]>(() => {
    if (!activeLocale) {
      return [];
    }

    if (uploadedFile) {
      return [
        {
          text: strings.SITE_BOUNDARY_UPLOADED_DESCRIPTION,
          hasTutorial: true,
          handlePrefix: (prefix: string) =>
            strings.formatString(prefix, <MapIcon centerAligned={true} icon='polygon' />) as JSX.Element[],
        },
        { text: strings.SITE_BOUNDARY_BOUNDING_BOX_LIMIT },
      ];
    }

    if (activeMethod === 'draw') {
      return [
        {
          text: strings.SITE_BOUNDARY_DRAWING_DESCRIPTION,
          hasTutorial: true,
          handlePrefix: (prefix: string) =>
            strings.formatString(prefix, <MapIcon centerAligned={true} icon='polygon' />) as JSX.Element[],
        },
        { text: strings.SITE_BOUNDARY_BOUNDING_BOX_LIMIT },
      ];
    }

    const sentences =
      site.siteType === 'detailed'
        ? [strings.SITE_BOUNDARY_UPLOAD_DESCRIPTION, strings.SITE_BOUNDARY_UPLOAD_TUTORIAL]
        : [
            strings.SITE_BOUNDARY_UPLOAD_DESCRIPTION,
            strings.SITE_BOUNDARY_UPLOAD_SIMPLE_SITE_NOTE,
            strings.SITE_BOUNDARY_UPLOAD_TUTORIAL,
          ];
    return [{ text: sentences.join(' '), hasTutorial: true }];
  }, [activeLocale, activeMethod, site.siteType, uploadedFile]);

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
    async (editableBoundary?: FeatureCollection, upload?: Pick<Stack, 'uploadedFile' | 'uploadId'>) => {
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
        boundarySource: !newBoundary
          ? undefined
          : upload
            ? 'uploaded'
            : editedBoundarySource(siteBoundaryData?.boundarySource),
        errorAnnotations: errors,
        siteBoundary: editableBoundary,
        // edits to an uploaded boundary keep its file, but clearing the boundary drops it
        ...(newBoundary ? upload ?? _.pick(siteBoundaryData, ['uploadedFile', 'uploadId']) : {}),
      });
    },
    [setSiteBoundaryData, site, siteBoundaryData]
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
    (parsed: ParsedBoundary, uploaded: File) => {
      const { areaHa, format, numPolygons } = parsed;
      // these are only populated when the file parsed successfully
      if (!parsed.geometry || areaHa === undefined || !format || numPolygons === undefined) {
        return;
      }
      const geometry = parsed.geometry as MultiPolygon | Polygon;

      const file: UploadedBoundaryFile = {
        areaHa,
        boundingAreaHa: boundingAreaHectares(geometry),
        filename: parsed.filename,
        format,
        numPoints: countPositions(geometry),
        numPolygons,
      };
      trackEvent(MIXPANEL_EVENTS.PLANTING_SITE_BOUNDARY_UPLOADED, {
        format: boundaryFileFormatOf(format),
        file_size_kb: fileSizeKb(uploaded.size),
        num_polygons: numPolygons,
        num_vertices: file.numPoints,
        area_ha: Math.round(areaHa * 10) / 10,
        replaced_existing: boundary !== undefined,
      });
      setMethod('upload');
      setShowUploadModal(false);

      if (numPolygons > 1) {
        const combinedMessage = strings.formatString(strings.SITE_BOUNDARY_POLYGONS_COMBINED, numPolygons) as string;
        snackbar.toastInfo(
          site.siteType === 'simple'
            ? `${combinedMessage} ${strings.SITE_BOUNDARY_POLYGONS_COMBINED_DETAILED_SITE_REQUIRED}`
            : combinedMessage,
          undefined,
          { autoHideDuration: null }
        );
      } else {
        dispatch(clearSnackbar({ type: 'toast' }));
      }

      lastUploadId.current += 1;
      void onEditableBoundaryChanged(featureCollectionOf(geometry, site.id), {
        uploadedFile: file,
        uploadId: lastUploadId.current,
      });
    },
    [boundary, dispatch, onEditableBoundaryChanged, site.id, site.siteType, snackbar, trackEvent]
  );

  const onRemoveUploadedFile = useCallback(() => {
    setMethod(undefined);
    dispatch(clearSnackbar({ type: 'toast' }));
    void onEditableBoundaryChanged(undefined);
  }, [dispatch, onEditableBoundaryChanged]);

  const onOpenUploadModal = useCallback(() => setShowUploadModal(true), []);

  const drawerProps = useEditorStepperDrawer(
    <>
      <StepTitleDescription
        description={description}
        dontShowAgainPreferenceName='dont-show-site-boundary-instructions'
        tutorialDescription={tutorialDescription}
        tutorialDocLinkKey='planting_site_create_boundary_instructions_video'
        tutorialTitle={strings.PLANTING_SITE_CREATE_INSTRUCTIONS_TITLE}
      />
      {uploadedFile && (
        <UploadedBoundarySummary file={uploadedFile} onRemove={onRemoveUploadedFile} onReplace={onOpenUploadModal} />
      )}
      {!uploadedFile && activeMethod === 'draw' && <DrawingBoundaryStatus onUploadInstead={onOpenUploadModal} />}
    </>
  );

  return (
    <Box display='flex' flexDirection='column' flexGrow={1}>
      <Box display='flex' flexDirection='column' flexGrow={1}>
        <EditableMap
          key={mapKey}
          {...drawerProps}
          editableBoundary={siteBoundaryData?.siteBoundary}
          errorAnnotations={errorAnnotations}
          onEditableBoundaryChanged={(editableBoundary) => void onEditableBoundaryChanged(editableBoundary)}
          onRedo={redo}
          onUndo={undo}
          overlay={
            <>
              {!boundary && !activeMethod && <BoundaryMethodChooser onSelect={onSelectMethod} />}
              {showUploadModal && <UploadBoundaryModal onClose={onCloseUploadModal} onSuccess={onUploadSuccess} />}
            </>
          }
          showSearchBox
        />
      </Box>
    </Box>
  );
}
