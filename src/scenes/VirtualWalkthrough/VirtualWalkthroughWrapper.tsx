import React, { useCallback, useEffect, useMemo } from 'react';

import {
  AnnotationIconType,
  AnnotationProps,
  VirtualWalkthroughViewer,
} from '@terraware/web-components/virtualWalkthrough';

import { API_PATHS } from 'src/constants';
import { useUser } from 'src/providers';
import {
  useLazyListSplatDetailsQuery,
  useSetObservationSplatAnnotationsMutation,
} from 'src/queries/generated/observationSplats';
import {
  useLazyGetOrganizationSplatInfoQuery,
  useSetOrganizationSplatAnnotationsMutation,
} from 'src/queries/generated/organizationSplats';

const PLACEHOLDER_IMAGE_URLS = [
  'https://images.unsplash.com/photo-1722444366501-6e5de9e768d1?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8cG9ydHJhaXQlMjBsYW5kc2NhcGV8ZW58MHx8MHx8fDA%3D',
  'https://placehold.co/1080x1920',
  'https://placehold.co/1920x1080',
  'https://placehold.co/800x450',
  'https://placehold.co/450x800',
];

export type VirtualWalkthroughViewerProps = {
  fileId: number;
  observationId?: number;
  organizationId?: number;
  editable?: boolean;
  isFullScreen?: boolean;
  onToggleFullScreen?: () => void;
};

const VirtualWalkthroughWrapper = ({
  fileId,
  observationId,
  organizationId,
  editable = false,
  isFullScreen = false,
  onToggleFullScreen,
}: VirtualWalkthroughViewerProps) => {
  const { isAllowed } = useUser();
  const isSuperAdmin = isAllowed('FREE_FLY_VIRTUAL_WALKTHROUGH');

  const [getOrgSplatInfo, { data: orgData }] = useLazyGetOrganizationSplatInfoQuery();
  const [getObsSplatInfo, { data: obsData }] = useLazyListSplatDetailsQuery();
  const [saveObservationAnnotations] = useSetObservationSplatAnnotationsMutation();
  const [saveOrganizationAnnotations] = useSetOrganizationSplatAnnotationsMutation();

  useEffect(() => {
    if (observationId !== undefined) {
      void getObsSplatInfo({ observationId, fileId });
    } else if (organizationId !== undefined) {
      void getOrgSplatInfo({ organizationId, fileId });
    }
  }, [fileId, getObsSplatInfo, getOrgSplatInfo, observationId, organizationId]);

  const data = observationId !== undefined ? obsData : orgData;

  const splatSrc =
    observationId !== undefined
      ? API_PATHS.OBSERVATION_SPLAT.replace('{observationId}', String(observationId)).replace(
          '{fileId}',
          String(fileId)
        )
      : API_PATHS.ORGANIZATION_SPLAT.replace('{organizationId}', String(organizationId)).replace(
          '{fileId}',
          String(fileId)
        );

  const origin = useMemo<[number, number, number] | undefined>(
    () => (data?.originPosition ? [data.originPosition.x, data.originPosition.y, data.originPosition.z] : undefined),
    [data?.originPosition]
  );

  const cameraPosition = useMemo<[number, number, number] | undefined>(
    () => (data?.cameraPosition ? [data.cameraPosition.x, data.cameraPosition.y, data.cameraPosition.z] : undefined),
    [data?.cameraPosition]
  );

  const sceneBounds = useMemo(
    () =>
      data?.sceneBounds && data.sceneBounds.m !== undefined
        ? { x: data.sceneBounds.x, y: data.sceneBounds.y, z: data.sceneBounds.z, m: data.sceneBounds.m }
        : undefined,
    [data?.sceneBounds]
  );

  const groundPlane = useMemo<[number, number, number][]>(
    () => (data?.groundPlane?.length === 3 ? data.groundPlane.map((p) => [p.x, p.y, p.z]) : []),
    [data?.groundPlane]
  );

  const annotations = useMemo<AnnotationProps[]>(
    () =>
      data?.annotations?.map((annotation, index) => {
        const [firstMedia] = annotation.media;
        const icon: AnnotationIconType = !firstMedia
          ? 'text'
          : firstMedia.contentType.startsWith('image')
            ? 'image'
            : firstMedia.contentType.startsWith('video')
              ? 'video'
              : 'text';

        return {
          ...annotation,
          position: [annotation.position.x, annotation.position.y, annotation.position.z] as [number, number, number],
          cameraPosition: annotation.cameraPosition
            ? ([annotation.cameraPosition.x, annotation.cameraPosition.y, annotation.cameraPosition.z] as [
                number,
                number,
                number,
              ])
            : undefined,
          icon,
          // TODO: replace with actual image urls once retrieval is available
          imageUrls:
            annotation.media.length > 0 ? [PLACEHOLDER_IMAGE_URLS[index % PLACEHOLDER_IMAGE_URLS.length]] : undefined,
        } as AnnotationProps;
      }) ?? [],
    [data?.annotations]
  );

  const handleSaveAnnotations = useCallback(
    async (updatedAnnotations: AnnotationProps[]) => {
      const annotationsPayload = updatedAnnotations.map((annotation) => ({
        ...annotation,
        position: {
          x: annotation.position[0],
          y: annotation.position[1],
          z: annotation.position[2],
        },
        cameraPosition: annotation.cameraPosition
          ? {
              x: annotation.cameraPosition[0],
              y: annotation.cameraPosition[1],
              z: annotation.cameraPosition[2],
            }
          : undefined,
      }));

      if (observationId !== undefined) {
        await saveObservationAnnotations({
          observationId,
          fileId,
          setSplatAnnotationsRequestPayload: { annotations: annotationsPayload },
        });
      } else if (organizationId !== undefined) {
        await saveOrganizationAnnotations({
          organizationId,
          fileId,
          setSplatAnnotationsRequestPayload: { annotations: annotationsPayload },
        });
      }
    },
    [observationId, organizationId, fileId, saveObservationAnnotations, saveOrganizationAnnotations]
  );

  return (
    <VirtualWalkthroughViewer
      splatSrc={splatSrc}
      origin={origin}
      cameraPosition={cameraPosition}
      sceneBounds={sceneBounds}
      groundPlane={groundPlane}
      skyColor={data?.skyColor}
      groundColor={data?.groundColor}
      averageCameraHeight={data?.averageCameraHeight ?? 0}
      annotations={annotations}
      onSaveAnnotations={handleSaveAnnotations}
      editable={editable}
      showFreeFly={isSuperAdmin}
      isFullScreen={isFullScreen}
      onToggleFullScreen={onToggleFullScreen}
    />
  );
};

export default VirtualWalkthroughWrapper;
