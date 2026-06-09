import React, { CSSProperties, type JSX, useCallback, useEffect, useMemo, useState } from 'react';

import { Box, Grid, IconButton, SxProps, Theme, Typography, useTheme } from '@mui/material';
import MuxPlayer from '@mux/mux-player-react';
import { Button, DialogBox, Icon } from '@terraware/web-components';
import { DateTime } from 'luxon';

import BreadCrumbs, { Crumb } from 'src/components/BreadCrumbs';
import ImageLightbox from 'src/components/common/ImageLightbox';
import Link from 'src/components/common/Link';
import { APP_PATHS } from 'src/constants';
import useAcceleratorConsole from 'src/hooks/useAcceleratorConsole';
import useFunderPortal from 'src/hooks/useFunderPortal';
import useNavigateTo from 'src/hooks/useNavigateTo';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useLocalization, useOrganization, useUser } from 'src/providers';
import {
  useAdminPublishActivityMutation,
  useLazyGetActivityMediaQuery,
  useLazyGetActivityMediaStream1Query,
} from 'src/queries/generated/activities';
import {
  useLazyGetActivityMedia1Query,
  useLazyGetActivityMediaStreamQuery,
} from 'src/queries/generated/funderActivities';
import { useGetObservationResultsQuery } from 'src/queries/generated/observations';
import { useGetProjectQuery } from 'src/queries/generated/projects';
import { requestGetUser } from 'src/redux/features/user/usersAsyncThunks';
import { selectUser } from 'src/redux/features/user/usersSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { ACTIVITY_MEDIA_FILE_ENDPOINT } from 'src/services/ActivityService';
import { FUNDER_ACTIVITY_MEDIA_FILE_ENDPOINT } from 'src/services/funder/FunderActivityService';
import { ActivityMediaFile, activityTypeLabel } from 'src/types/Activity';
import { getObsPhotoTypeLabel, isObservationActivity } from 'src/utils/activityUtils';
import { getObservationSpeciesLivePlantsCount } from 'src/utils/observation';
import useQuery from 'src/utils/useQuery';
import useSnackbar from 'src/utils/useSnackbar';
import useStateLocation, { getLocation } from 'src/utils/useStateLocation';

import ActivityStatusBadges from './ActivityStatusBadges';
import ObservationStatsPanel from './ObservationStatsPanel';
import { TypedActivity } from './types';

type ActivityMediaItemProps = {
  activity: TypedActivity;
  focusedFileId?: number;
  hoveredFileId?: number;
  mediaFile: ActivityMediaFile;
  onClickMediaItem: (fileId: number) => () => void;
  setHoverFileCallback: (fileId: number, hover: boolean) => () => void;
  setLightboxImageId: (fileId: number | undefined) => void;
};

const ActivityMediaItem = ({
  activity,
  focusedFileId,
  hoveredFileId,
  mediaFile,
  onClickMediaItem,
  setHoverFileCallback,
  setLightboxImageId,
}: ActivityMediaItemProps): JSX.Element => {
  const { strings } = useLocalization();
  const theme = useTheme();

  const [isPreconditionFailedError, setIsPreconditionFailedError] = useState<boolean>(false);

  const [getActivityMedia] = useLazyGetActivityMediaQuery();
  const [getFunderActivityMedia] = useLazyGetActivityMedia1Query();

  const imageStyles: CSSProperties = useMemo(
    () => ({
      aspectRatio: 4 / 3,
      backgroundColor: theme.palette.TwClrBgSecondary,
      borderColor:
        hoveredFileId === mediaFile.fileId || focusedFileId === mediaFile.fileId ? '#CC79A7' : theme.palette.TwClrBg,
      borderStyle: 'solid',
      borderWidth: '4px',
      boxSizing: 'content-box',
      objectFit: 'cover',
      transition: 'border 0.2s ease-in-out',
      width: '100%',
    }),
    [focusedFileId, hoveredFileId, mediaFile.fileId, theme.palette.TwClrBg, theme.palette.TwClrBgSecondary]
  );

  const infoPanelStyles: SxProps<Theme> = useMemo(
    () => ({
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      bottom: '10px',
      color: '#fff',
      cursor: 'pointer',
      left: '4px',
      opacity: 0,
      padding: theme.spacing(1),
      position: 'absolute',
      transition: 'opacity 0.2s ease-in-out',
      userSelect: 'none',
      width: '100%',
      zIndex: 1,
    }),
    [theme]
  );

  const captionStyles: SxProps<Theme> = useMemo(
    () => ({
      fontSize: '16px',
      lineHeight: '16px',
      marginTop: theme.spacing(1),
      whiteSpace: 'normal',
      wordWrap: 'break-word',
    }),
    [theme]
  );

  const iconButtonStyles: SxProps<Theme> = useMemo(
    () => ({
      backgroundColor: '#fff',
      borderRadius: '4px',
      height: '24px',
      padding: 0,
      position: 'absolute',
      right: theme.spacing(1),
      top: theme.spacing(2),
      width: '24px',
      zIndex: 2,
      '&:hover': { backgroundColor: '#eee' },
    }),
    [theme]
  );

  const playButtonOverlayStyles: SxProps<Theme> = useMemo(
    () => ({
      cursor: 'pointer',
      height: '80px',
      left: '50%',
      position: 'absolute',
      top: '50%',
      transform: 'translate(-50%, -50%)',
      transition: 'transform 0.2s ease-in-out',
      width: '80px',
      zIndex: 1,
      '&:hover': {
        transform: 'translate(-50%, -50%) scale(1.1)',
      },
    }),
    []
  );

  const processingFallbackStyles: SxProps<Theme> = useMemo(
    () => ({
      alignItems: 'center',
      aspectRatio: 4 / 3,
      backgroundColor: theme.palette.TwClrBaseGray100,
      borderColor: theme.palette.TwClrBg,
      borderStyle: 'solid',
      borderWidth: '4px',
      boxSizing: 'content-box',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      textAlign: 'center',
      width: '100%',
    }),
    [theme]
  );

  const imageSrc = useMemo(() => {
    const baseUrl = activity.type === 'funder' ? FUNDER_ACTIVITY_MEDIA_FILE_ENDPOINT : ACTIVITY_MEDIA_FILE_ENDPOINT;
    return baseUrl
      .replace('{activityId}', activity.payload.id.toString())
      .replace('{fileId}', mediaFile.fileId.toString());
  }, [activity, mediaFile.fileId]);

  const mediaItemHoverCallback = useCallback(
    (hovered: boolean) => () => {
      if (mediaFile.geolocation && !mediaFile.isHiddenOnMap) {
        setHoverFileCallback(mediaFile.fileId, hovered);
      }
    },
    [mediaFile, setHoverFileCallback]
  );

  const onClickDownload = useCallback(
    (event?: React.MouseEvent<HTMLButtonElement, MouseEvent> | undefined) => {
      event?.stopPropagation();

      const baseUrl = activity.type === 'funder' ? FUNDER_ACTIVITY_MEDIA_FILE_ENDPOINT : ACTIVITY_MEDIA_FILE_ENDPOINT;
      const imageURL = `${baseUrl
        .replace('{activityId}', activity.payload.id.toString())
        .replace('{fileId}', mediaFile.fileId.toString())}?raw=true`;

      const link = document.createElement('a');
      link.href = imageURL;
      link.download = mediaFile.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    [activity.payload.id, activity.type, mediaFile.fileId, mediaFile.fileName]
  );

  const onClickExpand = useCallback(
    (event?: React.MouseEvent<HTMLButtonElement, MouseEvent> | React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      event?.stopPropagation();
      setLightboxImageId(mediaFile.fileId);
    },
    [mediaFile.fileId, setLightboxImageId]
  );

  const obsPhotoTypeLabel = useMemo(() => getObsPhotoTypeLabel(mediaFile, strings), [mediaFile, strings]);

  const handleImageError = useCallback(async () => {
    // only check for 412 error if this is a video
    if (mediaFile.type === 'Video') {
      // request a small version of the image to check the error status code
      const result =
        activity.type === 'funder'
          ? await getFunderActivityMedia({
              activityId: activity.payload.id,
              fileId: mediaFile.fileId,
              maxHeight: 1,
              maxWidth: 1,
            })
          : await getActivityMedia({
              activityId: activity.payload.id,
              fileId: mediaFile.fileId,
              maxHeight: 1,
              maxWidth: 1,
            });

      // check if the error is a 412 (Precondition Failed) - video is still processing
      if ((result.error as { status?: number })?.status === 412) {
        setIsPreconditionFailedError(true);
        setTimeout(() => setIsPreconditionFailedError(false), 60000);
      }
    }
  }, [activity.payload.id, activity.type, getActivityMedia, getFunderActivityMedia, mediaFile.fileId, mediaFile.type]);

  // only show processing fallback if this is a video with a 412 error
  if (mediaFile.type === 'Video' && isPreconditionFailedError) {
    return (
      <Box sx={processingFallbackStyles}>
        <Typography fontSize='14px' fontWeight={600}>
          {strings.VIDEO_PROCESSING}
        </Typography>

        <img alt={strings.LOADING} height='24px' src='/assets/loading.gif' style={{ margin: '24px 0' }} width='24px' />

        <Typography fontSize='12px' fontWeight={400}>
          {strings.YOUR_VIDEO_IS_PROCESSING}
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      display='inline-block'
      position='relative'
      id={`activity-media-item-${mediaFile.fileId}`}
      sx={{ '&:hover .info-panel': { opacity: 1 } }}
      width='100%'
    >
      <img
        alt={mediaFile?.caption}
        onClick={onClickMediaItem(mediaFile.fileId)}
        onError={() => {
          void handleImageError();
        }}
        onMouseEnter={mediaItemHoverCallback(true)}
        onMouseLeave={mediaItemHoverCallback(false)}
        src={imageSrc}
        style={imageStyles}
      />

      {mediaFile.type === 'Video' && (
        <Box onClick={onClickExpand} sx={playButtonOverlayStyles}>
          <img
            alt={strings.PLAY_VIDEO}
            src='/assets/play-button-overlay.svg'
            style={{ width: '100%', height: '100%' }}
          />
        </Box>
      )}

      <Box className='info-panel' onClick={onClickMediaItem(mediaFile.fileId)} sx={infoPanelStyles}>
        <Box alignItems='center' display='flex' justifyContent='space-between'>
          <Typography component='div' fontSize='16px' lineHeight='16px'>
            {activity.payload.date}
          </Typography>
          {mediaFile.observation?.monitoringPlotNumber !== undefined && (
            <Typography component='div' fontSize='16px' lineHeight='16px'>
              {strings.PLOT} {mediaFile.observation.monitoringPlotNumber}
            </Typography>
          )}
        </Box>

        {obsPhotoTypeLabel && (
          <Typography component='div' sx={captionStyles}>
            {obsPhotoTypeLabel}
          </Typography>
        )}

        {mediaFile.caption && (
          <Typography component='div' sx={captionStyles}>
            {mediaFile.caption}
          </Typography>
        )}
      </Box>

      <IconButton
        onClick={onClickDownload}
        sx={[iconButtonStyles, { right: theme.spacing(5) }]}
        title={strings.DOWNLOAD}
      >
        <Icon name='downloadFromTheCloud' />
      </IconButton>

      <IconButton onClick={onClickExpand} sx={iconButtonStyles} title={strings.EXPAND}>
        <Icon name='expand' />
      </IconButton>
    </Box>
  );
};

type ActivityDetailViewProps = {
  activity: TypedActivity;
  focusedFileId?: number;
  hoveredFileId?: number;
  onClickMediaItem: (fileId: number) => () => void;
  projectId: number;
  setHoverFileCallback: (fileId: number, hover: boolean) => () => void;
};

const ActivityDetailView = ({
  activity,
  focusedFileId,
  hoveredFileId,
  onClickMediaItem,
  projectId,
  setHoverFileCallback,
}: ActivityDetailViewProps): JSX.Element => {
  const { strings } = useLocalization();
  const { isAllowed } = useUser();
  const { isAcceleratorRoute } = useAcceleratorConsole();
  const { isFunderRoute } = useFunderPortal();
  const dispatch = useAppDispatch();
  const navigate = useSyncNavigate();
  const query = useQuery();
  const location = useStateLocation();
  const theme = useTheme();
  const { goToAcceleratorActivityEdit, goToActivityEdit } = useNavigateTo();
  const { selectedOrganization, organizations } = useOrganization();

  const verifiedByUser = useAppSelector(
    selectUser(activity.type === 'admin' ? activity.payload.verifiedBy : undefined)
  );
  const isAllowedEditActivities = isAcceleratorRoute
    ? isAllowed('EDIT_ACTIVITIES')
    : isAllowed('EDIT_ACTIVITIES', { organization: selectedOrganization });

  const isObsActivity = useMemo(() => isObservationActivity(activity.payload), [activity.payload]);

  const { data: projectData } = useGetProjectQuery(projectId, {
    skip: !isAcceleratorRoute || !isObsActivity,
  });

  const userHasOrgAccess = useMemo(
    () => !isAcceleratorRoute || organizations.some((org) => org.id === projectData?.project.organizationId),
    [isAcceleratorRoute, organizations, projectData?.project.organizationId]
  );

  // Funder activities include observation stats directly on the payload (no observationId or API call needed)
  const funderObsPayload = activity.type === 'funder' ? activity.payload.observation : undefined;
  const showObsPanel = isObsActivity || funderObsPayload !== undefined;

  const { data: observationResultsData } = useGetObservationResultsQuery(
    { observationId: activity.payload.observation?.observationId as number },
    { skip: !activity.payload.observation?.observationId }
  );

  const observationUrl = useMemo(
    () =>
      isObsActivity && activity.payload.observation?.observationId && userHasOrgAccess
        ? APP_PATHS.OBSERVATION_DETAILS_V2.replace(':observationId', String(activity.payload.observation.observationId))
        : undefined,
    [activity.payload.observation?.observationId, isObsActivity, userHasOrgAccess]
  );

  const obsIsAdHoc = activity.payload.observation?.isAdHoc ?? false;
  const obsPlotNumber = activity.payload.observation?.monitoringPlotNumber;
  const obsCompletedTime =
    funderObsPayload !== undefined ? funderObsPayload.completedTime : observationResultsData?.observation.completedTime;

  const obsCompletedMonthYear = useMemo(() => {
    if (!obsCompletedTime) {
      return undefined;
    }
    const dt = DateTime.fromISO(obsCompletedTime);
    return dt.isValid ? dt.toFormat('LLLL yyyy') : undefined;
  }, [obsCompletedTime]);

  const obsTitle = useMemo(() => {
    if (!showObsPanel) {
      return undefined;
    }
    if (funderObsPayload !== undefined) {
      return obsCompletedMonthYear ? { prefix: `${strings.OBSERVATION}: `, suffix: obsCompletedMonthYear } : undefined;
    }
    if (!isObsActivity) {
      return undefined;
    }
    if (obsIsAdHoc) {
      return obsPlotNumber !== undefined
        ? {
            prefix: `${strings.AD_HOC} ${strings.OBSERVATION}: `,
            suffix: `${strings.PLOT} ${obsPlotNumber}`,
          }
        : undefined;
    }
    return obsCompletedMonthYear ? { prefix: `${strings.OBSERVATION}: `, suffix: obsCompletedMonthYear } : undefined;
  }, [funderObsPayload, isObsActivity, obsCompletedMonthYear, obsIsAdHoc, obsPlotNumber, showObsPanel, strings]);

  const obsSpecies = useMemo(
    () =>
      observationResultsData?.observation.species?.length
        ? observationResultsData.observation.species
        : observationResultsData?.observation.adHocPlot?.species,
    [observationResultsData]
  );

  const obsLivePlants = useMemo(
    () =>
      funderObsPayload !== undefined ? funderObsPayload.livePlants : getObservationSpeciesLivePlantsCount(obsSpecies),
    [funderObsPayload, obsSpecies]
  );

  const obsPlantDensity =
    funderObsPayload !== undefined
      ? funderObsPayload.plantDensity
      : observationResultsData?.observation.plantingDensity ??
        observationResultsData?.observation.adHocPlot?.plantingDensity;

  const obsSurvivalRate =
    funderObsPayload !== undefined
      ? funderObsPayload.survivalRate
      : observationResultsData?.observation.survivalRate ?? observationResultsData?.observation.adHocPlot?.survivalRate;

  const [lightboxMediaFileId, setLightboxMediaFileId] = useState<number | undefined>(undefined);
  const [publishActivityModalOpened, setPublishActivityModalOpened] = useState(false);
  const snackbar = useSnackbar();

  const [getActivityMediaStream, { data: mediaStreamData }] = useLazyGetActivityMediaStream1Query();
  const [getFunderActivityMediaStream, { data: funderMediaStreamData }] = useLazyGetActivityMediaStreamQuery();
  const [publishActivityMutation] = useAdminPublishActivityMutation();

  useEffect(() => {
    if (activity.type === 'admin' && activity?.payload?.verifiedBy && !verifiedByUser) {
      void dispatch(requestGetUser(activity?.payload?.verifiedBy));
    }
  }, [activity, dispatch, verifiedByUser]);

  const verifiedByLabel = useMemo(() => {
    const verifiedByName = verifiedByUser
      ? `${verifiedByUser?.firstName ?? ''} ${verifiedByUser?.lastName ?? ''}`.trim() || verifiedByUser.email
      : '';

    return verifiedByName ? strings.formatString(strings.VERIFIED_BY, verifiedByName) : '';
  }, [strings, verifiedByUser]);

  const activityType = useMemo(
    () => activityTypeLabel(activity.payload.type, strings),
    [activity.payload.type, strings]
  );

  const crumbs: Crumb[] = useMemo(
    () => [
      {
        name: strings.PROJECT_ACTIVITY,
        onClick: () => {
          query.delete('activityId');
          query.delete('highlightActivityId');
          navigate(getLocation(location.pathname, location, query.toString()));
        },
      },
    ],
    [location, navigate, query, strings.PROJECT_ACTIVITY]
  );

  const goToProjectActivityEdit = useCallback(() => {
    if (!projectId || !activity.payload.id) {
      return;
    }

    if (isAcceleratorRoute) {
      goToAcceleratorActivityEdit(projectId, activity.payload.id);
    } else {
      goToActivityEdit(projectId, activity.payload.id);
    }
  }, [activity, goToAcceleratorActivityEdit, goToActivityEdit, isAcceleratorRoute, projectId]);

  const handleCloseLightbox = useCallback(() => {
    setLightboxMediaFileId(undefined);
  }, []);

  const lightboxMediaFile = useMemo(
    () => activity.payload.media.find((item) => item.fileId === lightboxMediaFileId),
    [activity, lightboxMediaFileId]
  );

  const lightboxImageSrc = useMemo(() => {
    const baseUrl = activity.type === 'funder' ? FUNDER_ACTIVITY_MEDIA_FILE_ENDPOINT : ACTIVITY_MEDIA_FILE_ENDPOINT;
    return lightboxMediaFile
      ? baseUrl
          .replace('{activityId}', activity.payload.id.toString())
          .replace('{fileId}', lightboxMediaFile.fileId.toString())
      : '';
  }, [activity, lightboxMediaFile]);

  useEffect(() => {
    if (activity && lightboxMediaFile?.type === 'Video') {
      if (activity.type === 'funder') {
        void getFunderActivityMediaStream({ activityId: activity.payload.id, fileId: lightboxMediaFile.fileId });
      } else {
        void getActivityMediaStream({ activityId: activity.payload.id, fileId: lightboxMediaFile.fileId });
      }
    }
  }, [activity, lightboxMediaFile, getActivityMediaStream, getFunderActivityMediaStream]);

  const mediaStream = useMemo(() => {
    if (!lightboxMediaFileId) {
      return undefined;
    }
    const activeStreamData = activity.type === 'funder' ? funderMediaStreamData : mediaStreamData;
    if (activeStreamData?.playbackId && activeStreamData?.playbackToken) {
      return { playbackId: activeStreamData.playbackId, playbackToken: activeStreamData.playbackToken };
    }
    return undefined;
  }, [lightboxMediaFileId, activity.type, funderMediaStreamData, mediaStreamData]);

  const highlightActivityId = useMemo(() => {
    const activityIdParam = query.get('highlightActivityId');
    return activityIdParam ? Number(activityIdParam) : undefined;
  }, [query]);

  const isActivityEditable = useMemo(() => {
    if (activity.type === 'admin') {
      return true;
    } else if (activity.type === 'base') {
      return !activity.payload.publishedTime;
    } else {
      return false;
    }
  }, [activity]);

  const openPublishActivityModal = useCallback(() => {
    setPublishActivityModalOpened(true);
  }, []);

  const onCloseModal = useCallback(() => {
    setPublishActivityModalOpened(false);
  }, []);

  const publishActivity = useCallback(async () => {
    try {
      await publishActivityMutation(activity.payload.id).unwrap();
      snackbar.toastSuccess(strings.ACTIVITY_PUBLISHED);
      setPublishActivityModalOpened(false);
    } catch {
      snackbar.toastError();
    }
  }, [activity.payload.id, publishActivityMutation, snackbar, strings.ACTIVITY_PUBLISHED]);

  return (
    <Grid container paddingY={theme.spacing(2)} spacing={2} textAlign='left'>
      {publishActivityModalOpened && (
        <DialogBox
          onClose={onCloseModal}
          open={true}
          title={strings.PUBLISH_ACTIVITY}
          size='medium'
          middleButtons={[
            <Button
              id='cancelPublishActivity'
              label={strings.CANCEL}
              priority='secondary'
              type='passive'
              onClick={onCloseModal}
              key='button-1'
            />,
            <Button
              id='publishActivity'
              label={strings.PUBLISH}
              onClick={() => {
                void publishActivity();
              }}
              key='button-2'
              type='destructive'
            />,
          ]}
          message={strings.formatString(strings.PUBLISH_ACTIVITY_MODAL_MESSAGE, activityType, activity.payload.date)}
        />
      )}
      <Grid item md={4} xs={12}>
        {crumbs && (
          <Box marginBottom={theme.spacing(2)}>
            <BreadCrumbs crumbs={crumbs} />
          </Box>
        )}
      </Grid>

      <Grid item md={8} xs={12} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
        {isAllowedEditActivities && !isFunderRoute && (
          <Box display='flex' justifyContent={'end'}>
            <Button
              disabled={!projectId || !isActivityEditable}
              icon='iconEdit'
              label={highlightActivityId ? strings.CLOSE_AND_EDIT : strings.EDIT_ACTIVITY}
              onClick={goToProjectActivityEdit}
              priority={highlightActivityId ? 'secondary' : 'primary'}
              size='medium'
              sx={{ whiteSpace: 'nowrap' }}
            />
            {activity.type === 'admin' && isAcceleratorRoute && (
              <Button
                disabled={!projectId || !activity.payload.verifiedBy}
                label={strings.PUBLISH_ACTIVITY}
                onClick={openPublishActivityModal}
                size='medium'
                sx={{ whiteSpace: 'nowrap' }}
                priority='secondary'
              />
            )}
          </Box>
        )}
      </Grid>

      <Grid item>
        <Box display='flex' flexDirection='row' alignItems='center'>
          <Typography fontSize='24px' fontWeight={600} lineHeight='32px'>
            {obsTitle ? (
              <>
                {obsTitle.prefix}
                {observationUrl ? (
                  <Link to={observationUrl} fontSize='24px' fontWeight={600} lineHeight='32px'>
                    {obsTitle.suffix}
                  </Link>
                ) : (
                  obsTitle.suffix
                )}
              </>
            ) : (
              activityType
            )}
          </Typography>
          <Box paddingX={isAcceleratorRoute ? theme.spacing(3) : theme.spacing(1.5)}>
            {isAcceleratorRoute && <ActivityStatusBadges activity={activity} />}
          </Box>
          {activity.payload.isHighlight && isAcceleratorRoute && (
            <Icon name='star' size='medium' fillColor={theme.palette.TwClrBaseYellow200} />
          )}
        </Box>
      </Grid>

      <Grid item xs={12}>
        <Typography>
          {activity.payload.date} {verifiedByLabel}
        </Typography>
      </Grid>

      {showObsPanel && (
        <ObservationStatsPanel
          livePlants={obsLivePlants}
          plantDensity={obsPlantDensity}
          survivalRate={obsSurvivalRate}
        />
      )}

      <Grid item xs={12}>
        <Typography>{activity.payload.description}</Typography>
      </Grid>

      {activity.payload.media.map((mediaFile, index) => (
        <Grid item key={index} lg={6} xs={12}>
          <ActivityMediaItem
            activity={activity}
            focusedFileId={focusedFileId}
            hoveredFileId={hoveredFileId}
            mediaFile={mediaFile}
            onClickMediaItem={onClickMediaItem}
            setHoverFileCallback={setHoverFileCallback}
            setLightboxImageId={setLightboxMediaFileId}
          />
        </Grid>
      ))}

      <ImageLightbox
        altComponent={
          mediaStream ? (
            <MuxPlayer
              accentColor={theme.palette.TwClrBgBrand}
              autoPlay
              metadata={{
                video_title: `Activity media video (File ID: ${lightboxMediaFile?.fileId ?? '?'}, Activity ID: ${activity.payload.id}, Project ID: ${projectId})`,
              }}
              playbackId={mediaStream.playbackId}
              playbackToken={mediaStream.playbackToken}
              style={{
                aspectRatio: 16 / 9,
                height: '80vh',
                maxWidth: '80vw',
                width: 'auto',
              }}
            />
          ) : undefined
        }
        imageAlt={lightboxMediaFile?.caption}
        imageSrc={lightboxImageSrc}
        isOpen={!!lightboxMediaFileId}
        onClose={handleCloseLightbox}
      />
    </Grid>
  );
};

export default ActivityDetailView;
