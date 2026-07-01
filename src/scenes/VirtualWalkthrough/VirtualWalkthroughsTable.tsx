import React, { type JSX, useCallback, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';

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
import { API_PATHS } from 'src/constants';
import useTableState from 'src/hooks/useTableState';
import { useLocalization } from 'src/providers';
import {
  useDeleteObservationSplatMutation,
  useSetObservationSplatNeedsAttentionMutation,
} from 'src/queries/generated/observationSplats';
import { useLazyGetObservationMediaStreamQuery } from 'src/queries/generated/observations';
import { useLazyGetOrganizationMediaFileStreamQuery } from 'src/queries/generated/organizationMedia';
import {
  useDeleteOrganizationSplatMutation,
  useSetOrganizationSplatNeedsAttentionMutation,
} from 'src/queries/generated/organizationSplats';
import { OrganizationVirtualWalkthrough } from 'src/queries/search/virtualWalkthroughs';

type VirtualWalkthroughsTableProps = {
  mediaFiles: OrganizationVirtualWalkthrough[];
  onAddToMap: (file: OrganizationVirtualWalkthrough) => void;
  organizationId: number;
};

export default function VirtualWalkthroughsTable({
  mediaFiles,
  onAddToMap,
  organizationId,
}: VirtualWalkthroughsTableProps): JSX.Element {
  const theme = useTheme();
  const [, setSearchParams] = useSearchParams();
  const [deleteOrganizationSplat] = useDeleteOrganizationSplatMutation();
  const [deleteObservationSplat] = useDeleteObservationSplatMutation();
  const [setOrgSplatNeedsAttention] = useSetOrganizationSplatNeedsAttentionMutation();
  const [setObsSplatNeedsAttention] = useSetObservationSplatNeedsAttentionMutation();
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

  const handleOpenWalkthrough = useCallback(
    (fileId: number) => {
      setSearchParams((prev) => {
        const p = new URLSearchParams(prev);
        p.set('virtualWalkthrough', fileId.toString());
        return p;
      });
    },
    [setSearchParams]
  );

  const ThumbnailCell = useCallback(
    ({ cell }: { cell: MRT_Cell<OrganizationVirtualWalkthrough> }) => {
      const file = cell.row.original;
      if (file.splatStatus === 'Preparing' || file.splatStatus === 'Errored') {
        return null;
      }
      const fileId = cell.getValue<number>();
      const isReady = file.splatStatus === 'Ready';

      let thumbnailSrc: string;
      if (file.type === 'Plot') {
        if (!file.observationId || !file.monitoringPlotId) {
          return null;
        }
        thumbnailSrc = `${API_PATHS.OBSERVATION_PLOT_PHOTO.replace('{observationId}', String(file.observationId))
          .replace('{monitoringPlotId}', String(file.monitoringPlotId))
          .replace('{fileId}', String(fileId))}?maxWidth=64&maxHeight=40`;
      } else {
        thumbnailSrc = `${API_PATHS.ORGANIZATION_MEDIA_THUMBNAIL.replace('{organizationId}', String(organizationId)).replace('{fileId}', String(fileId))}?maxWidth=64&maxHeight=40`;
      }

      return (
        <Box
          onClick={isReady ? () => handleOpenWalkthrough(fileId) : undefined}
          sx={{
            borderRadius: '4px',
            cursor: isReady ? 'pointer' : 'default',
            display: 'inline-block',
            position: 'relative',
            '&:hover .icon360-overlay': { display: 'flex' },
          }}
        >
          <Box
            component='img'
            src={thumbnailSrc}
            alt={strings.THUMBNAIL}
            sx={{ borderRadius: '4px', display: 'block', height: 40, objectFit: 'cover', width: 64 }}
          />
          {isReady && (
            <Box
              className='icon360-overlay'
              sx={{
                alignItems: 'center',
                bottom: 0,
                display: 'none',
                justifyContent: 'center',
                left: 0,
                position: 'absolute',
                right: 0,
                top: 0,
              }}
            >
              <Box component='img' src='/assets/360icon.svg' alt='' sx={{ height: 32, width: 32 }} />
            </Box>
          )}
        </Box>
      );
    },
    [handleOpenWalkthrough, organizationId, strings]
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

  const setNeedsAttention = useCallback(
    (file: OrganizationVirtualWalkthrough, needsAttention: boolean) => {
      if (file.type === 'Plot' && file.observationId !== undefined) {
        void setObsSplatNeedsAttention({
          observationId: file.observationId,
          fileId: file.fileId,
          setSplatNeedsAttentionRequestPayload: { needsAttention },
        });
      } else {
        void setOrgSplatNeedsAttention({
          organizationId,
          fileId: file.fileId,
          setSplatNeedsAttentionRequestPayload: { needsAttention },
        });
      }
    },
    [organizationId, setObsSplatNeedsAttention, setOrgSplatNeedsAttention]
  );

  const deleteSplat = useCallback(
    (file: OrganizationVirtualWalkthrough) => {
      if (file.type === 'Plot' && file.observationId !== undefined) {
        void deleteObservationSplat({
          observationId: file.observationId,
          fileId: file.fileId,
        });
      } else {
        void deleteOrganizationSplat({
          organizationId,
          fileId: file.fileId,
        });
      }
    },
    [deleteObservationSplat, deleteOrganizationSplat, organizationId]
  );

  const FlagCell = useCallback(
    ({ cell }: { cell: MRT_Cell<OrganizationVirtualWalkthrough> }) => {
      const file = cell.row.original;
      if (file.needsAttention) {
        return <Link onClick={() => setNeedsAttention(file, false)}>{strings.UNDO_NEEDS_ATTENTION}</Link>;
      }
      if (file.splatStatus === 'Ready') {
        return <Link onClick={() => setNeedsAttention(file, true)}>{strings.MARK_AS_NEEDS_ATTENTION}</Link>;
      }
      return null;
    },
    [setNeedsAttention, strings]
  );

  const LocationCell = useCallback(
    ({ cell }: { cell: MRT_Cell<OrganizationVirtualWalkthrough> }) => {
      const file = cell.row.original;
      if (file.type === 'Plot') {
        return (
          <Typography fontSize='14px'>
            {`${strings.PLOT} ${file.monitoringPlotName ?? file.monitoringPlotId}`}
          </Typography>
        );
      }
      if ((file.splatStatus === 'Ready' || file.splatStatus === 'Preparing') && !file.needsAttention) {
        const handleClick = () => {
          onAddToMap(file);
          document.getElementById('map-container')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        };
        if (file.latitude !== undefined && file.longitude !== undefined) {
          return <Link onClick={handleClick}>{strings.UPDATE_LOCATION}</Link>;
        }
        return <Link onClick={handleClick}>{strings.ADD_TO_MAP}</Link>;
      }
      return <Box />;
    },
    [onAddToMap, strings]
  );

  const RemoveCell = useCallback(
    ({ cell }: { cell: MRT_Cell<OrganizationVirtualWalkthrough> }) => {
      const file = cell.row.original;
      return (
        <Link onClick={() => deleteSplat(file)} style={{ color: theme.palette.TwClrTxtDanger }}>
          {strings.REMOVE}
        </Link>
      );
    },
    [theme.palette.TwClrTxtDanger, strings.REMOVE, deleteSplat]
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
