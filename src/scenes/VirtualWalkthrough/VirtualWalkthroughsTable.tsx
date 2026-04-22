import React, { type JSX, useCallback, useMemo, useState } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import MuxPlayer from '@mux/mux-player-react';
import { EditableTable, EditableTableColumn } from '@terraware/web-components';
import {
  MRT_Cell,
  MRT_ShowHideColumnsButton,
  MRT_ToggleDensePaddingButton,
  MRT_ToggleFiltersButton,
  MRT_ToggleFullScreenButton,
  MRT_ToggleGlobalFilterButton,
} from 'material-react-table';

import ImageLightbox from 'src/components/common/ImageLightbox';
import Link from 'src/components/common/Link';
import useTableState from 'src/hooks/useTableState';
import { useLocalization } from 'src/providers';
import { useLazyGetObservationMediaStreamQuery } from 'src/queries/generated/observations';
import {
  useDeleteOrganizationMediaFileMutation,
  useLazyGetOrganizationMediaFileStreamQuery,
} from 'src/queries/generated/organizationMedia';
import { useSetOrganizationSplatNeedsAttentionMutation } from 'src/queries/generated/organizationSplats';
import { OrganizationVirtualWalkthrough } from 'src/queries/search/virtualWalkthroughs';

type VirtualWalkthroughsTableProps = {
  mediaFiles: OrganizationVirtualWalkthrough[];
  organizationId: number;
};

export default function VirtualWalkthroughsTable({
  mediaFiles,
  organizationId,
}: VirtualWalkthroughsTableProps): JSX.Element {
  const theme = useTheme();
  const [deleteMediaFile] = useDeleteOrganizationMediaFileMutation();
  const [setNeedsAttention] = useSetOrganizationSplatNeedsAttentionMutation();
  const [getOrgMediaStream, { data: orgStreamData, isFetching: orgFetching }] =
    useLazyGetOrganizationMediaFileStreamQuery();
  const [getObsMediaStream, { data: obsStreamData, isFetching: obsFetching }] = useLazyGetObservationMediaStreamQuery();
  const [selectedVideoFile, setSelectedVideoFile] = useState<OrganizationVirtualWalkthrough | undefined>(undefined);
  const {
    columnFilters,
    setColumnFilters,
    setShowColumnFilters,
    setShowGlobalFilter,
    showColumnFilters,
    showGlobalFilter,
  } = useTableState('virtual-walkthroughs-table');
  const { strings } = useLocalization();

  const getStatusLabel = useCallback(
    (file: OrganizationVirtualWalkthrough): string => {
      if (file.needsAttention || file.splatStatus === 'Errored') {
        return strings.NEEDS_ATTENTION;
      }
      if (file.splatStatus === 'Preparing') {
        return strings.PROCESSING;
      }
      return strings.SUCCESSFUL;
    },
    [strings]
  );

  const mediaStream = useMemo(() => {
    if (!selectedVideoFile) {
      return undefined;
    }
    const isPlot = selectedVideoFile.type === 'Plot' && selectedVideoFile.observationId;
    const data = isPlot ? obsStreamData : orgStreamData;
    const isFetching = isPlot ? obsFetching : orgFetching;
    if (!data || isFetching) {
      return undefined;
    }
    return { playbackId: data.playbackId, playbackToken: data.playbackToken };
  }, [obsFetching, obsStreamData, orgFetching, orgStreamData, selectedVideoFile]);

  const handleOpenVideo = useCallback(
    (file: OrganizationVirtualWalkthrough) => {
      setSelectedVideoFile(file);
      if (file.type === 'Plot' && file.observationId && file.monitoringPlotId) {
        void getObsMediaStream({
          observationId: file.observationId,
          plotId: file.monitoringPlotId,
          fileId: file.fileId,
        });
      } else {
        void getOrgMediaStream({ organizationId, fileId: file.fileId });
      }
    },
    [getObsMediaStream, getOrgMediaStream, organizationId]
  );

  const handleCloseLightbox = useCallback(() => {
    setSelectedVideoFile(undefined);
  }, []);

  const ThumbnailCell = useCallback(
    ({ cell }: { cell: MRT_Cell<OrganizationVirtualWalkthrough> }) => {
      const file = cell.row.original;
      if (file.type === 'Plot') {
        return null;
      }
      const fileId = cell.getValue<number>();
      return (
        <Box
          component='img'
          src={`/api/v1/organizations/${organizationId}/media/${fileId}/thumbnail?maxWidth=64&maxHeight=40`}
          alt={strings.THUMBNAIL}
          sx={{ borderRadius: '4px', display: 'block', height: 40, objectFit: 'cover', width: 64 }}
        />
      );
    },
    [organizationId, strings]
  );

  const StatusCell = useCallback(
    ({ cell }: { cell: MRT_Cell<OrganizationVirtualWalkthrough> }) => {
      const file = cell.row.original;
      return <Typography fontSize='14px'>{getStatusLabel(file)}</Typography>;
    },
    [getStatusLabel]
  );

  const VideoLinkCell = useCallback(
    ({ cell }: { cell: MRT_Cell<OrganizationVirtualWalkthrough> }) => {
      const file = cell.row.original;
      return <Link onClick={() => handleOpenVideo(file)}>{`media_${file.fileId}`}</Link>;
    },
    [handleOpenVideo]
  );

  const FlagCell = useCallback(
    ({ cell }: { cell: MRT_Cell<OrganizationVirtualWalkthrough> }) => {
      const file = cell.row.original;
      if (file.splatStatus !== 'Ready' || file.needsAttention) {
        return null;
      }
      return (
        <Link
          onClick={() =>
            void setNeedsAttention({
              organizationId,
              fileId: file.fileId,
              setSplatNeedsAttentionRequestPayload: { needsAttention: true },
            })
          }
        >
          {strings.MARK_AS_NEEDS_ATTENTION}
        </Link>
      );
    },
    [organizationId, setNeedsAttention, strings]
  );

  const LocationCell = useCallback(
    ({ cell }: { cell: MRT_Cell<OrganizationVirtualWalkthrough> }) => {
      const file = cell.row.original;
      if (file.latitude !== undefined && file.longitude !== undefined) {
        return <Typography fontSize='14px'>{`${file.latitude.toFixed(4)}, ${file.longitude.toFixed(4)}`}</Typography>;
      }
      if (file.needsAttention) {
        return <Link>{strings.UPDATE_LOCATION}</Link>;
      }
      return <Link>{strings.ADD_TO_MAP}</Link>;
    },
    [strings]
  );

  const RemoveCell = useCallback(
    ({ cell }: { cell: MRT_Cell<OrganizationVirtualWalkthrough> }) => {
      const fileId = cell.getValue<number>();
      return (
        <Link
          onClick={() => void deleteMediaFile({ organizationId, fileId })}
          style={{ color: theme.palette.TwClrTxtDanger }}
        >
          {strings.REMOVE}
        </Link>
      );
    },
    [deleteMediaFile, organizationId, theme, strings]
  );

  const columns = useMemo((): EditableTableColumn<OrganizationVirtualWalkthrough>[] => {
    return [
      {
        id: 'thumbnail',
        header: strings.THUMBNAIL,
        accessorFn: (row) => row.fileId,
        Cell: ThumbnailCell,
      },
      {
        id: 'status',
        header: strings.STATUS,
        accessorFn: (row) => getStatusLabel(row),
        Cell: StatusCell,
      },
      {
        id: 'createdTime',
        header: strings.DATE_UPLOADED,
        accessorFn: (row) => (row.createdTime ? new Date(row.createdTime).toLocaleDateString() : ''),
      },
      {
        id: 'videoLink',
        header: strings.VIDEO_LINK,
        accessorFn: (row) => row.fileId,
        Cell: VideoLinkCell,
      },
      {
        id: 'flag',
        header: strings.FLAG,
        accessorFn: (row) => row.fileId,
        Cell: FlagCell,
      },
      {
        id: 'location',
        header: strings.LOCATION,
        accessorFn: (row) => row.fileId,
        Cell: LocationCell,
      },
      {
        id: 'remove',
        header: strings.REMOVE,
        accessorFn: (row) => row.fileId,
        Cell: RemoveCell,
      },
    ];
  }, [FlagCell, LocationCell, RemoveCell, StatusCell, ThumbnailCell, VideoLinkCell, getStatusLabel, strings]);

  return (
    <>
      <EditableTable
        columns={columns}
        data={mediaFiles}
        clearAllFiltersLabel={strings.CLEAR_ALL_FILTERS}
        enableEditing={false}
        enableSorting={true}
        enableGlobalFilter={true}
        enableColumnFilters={true}
        enableColumnOrdering={false}
        enablePagination={false}
        enableTopToolbar={true}
        enableBottomToolbar={false}
        storageKey='virtual-walkthroughs-table'
        renderToolbarInternalActions={({ table }) => (
          <Box display='flex' gap={0.5}>
            <MRT_ToggleGlobalFilterButton table={table} />
            <MRT_ToggleFiltersButton table={table} />
            <MRT_ShowHideColumnsButton table={table} />
            <MRT_ToggleDensePaddingButton table={table} />
            <MRT_ToggleFullScreenButton table={table} />
          </Box>
        )}
        tableOptions={{
          state: { columnFilters, showColumnFilters, showGlobalFilter },
          onColumnFiltersChange: setColumnFilters,
          onShowColumnFiltersChange: setShowColumnFilters,
          onShowGlobalFilterChange: setShowGlobalFilter,
        }}
      />

      <ImageLightbox
        altComponent={
          mediaStream ? (
            <MuxPlayer
              accentColor={theme.palette.TwClrBgBrand}
              autoPlay
              metadata={{ video_title: `Virtual Walkthrough (File ID: ${selectedVideoFile?.fileId})` }}
              playbackId={mediaStream.playbackId}
              playbackToken={mediaStream.playbackToken}
              style={{ aspectRatio: 16 / 9, height: '80vh', maxWidth: '80vw', width: 'auto' }}
            />
          ) : undefined
        }
        imageSrc=''
        isOpen={!!selectedVideoFile}
        onClose={handleCloseLightbox}
      />
    </>
  );
}
