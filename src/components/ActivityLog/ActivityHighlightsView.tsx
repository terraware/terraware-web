import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MapRef } from 'react-map-gl/mapbox';

import { Box, SxProps, Theme, Typography, useTheme } from '@mui/material';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Mousewheel, Navigation, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useLocalization } from 'src/providers';
import { ACTIVITY_MEDIA_FILE_ENDPOINT } from 'src/services/ActivityService';
import { Activity, ActivityMediaFile, activityTypeLabel } from 'src/types/Activity';
import useQuery from 'src/utils/useQuery';
import useStateLocation, { getLocation } from 'src/utils/useStateLocation';

import { MapPoint } from '../NewMap/types';
import useMapDrawer from '../NewMap/useMapDrawer';
import useMapUtils from '../NewMap/useMapUtils';
import { getBoundingBoxFromPoints } from '../NewMap/utils';
import ActivityDetailView from './ActivityDetailView';
import MapSplitView from './MapSplitView';

const carouselContainerStyles = {
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  width: '100%',
  '& .swiper-pagination-bullet': {
    height: '12px',
    width: '12px',
  },
  '& .swiper-pagination-bullet.swiper-pagination-bullet-active': {
    backgroundColor: '#000',
  },
  '& .swiper-slide img': {
    display: 'block',
    height: '100%',
    objectFit: 'cover',
    width: '100%',
  },
};

const carouselSlideContentStyles =
  (coverPhotoURL: string | undefined): SxProps<Theme> =>
  () => ({
    alignItems: 'flex-end',
    background: coverPhotoURL
      ? `url(${coverPhotoURL}) center / cover no-repeat, url(/assets/logo-terraformation.svg) center / 33% no-repeat, linear-gradient(180deg, #2C8658 0%, #123624 100%)`
      : 'url(/assets/logo-terraformation.svg) center / 33% no-repeat, linear-gradient(180deg, #2C8658 0%, #123624 100%)',
    borderRadius: '8px',
    bottom: 0,
    color: '#fff',
    display: 'flex',
    fontSize: '24px',
    justifyContent: 'center',
    left: 0,
    padding: '24px',
    position: 'absolute',
    right: '32px',
    top: 0,
  });

const carouselSlideCardStyles = {
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
  borderRadius: '8px',
  color: '#000',
  cursor: 'pointer',
  display: 'flex',
  flexDirection: 'column',
  padding: '16px',
  width: '100%',
};

const carouselSlideCardMetadataStyles: SxProps<Theme> = (theme: Theme) => ({
  borderBottom: `1px solid ${theme.palette.TwClrBrdrTertiary}`,
  display: 'flex',
  flexDirection: 'column',
  marginBottom: '16px',
  padding: '8px 0',
});

const HEIGHT_OFFSET_PX = 204;

const HEIGHT_OFFSET_MOBILE_PX = 240;

type ActivityHighlightsViewProps = {
  activities: Activity[];
  projectId: number;
};

type ActivityHighlightSlide = {
  activity: Activity;
  activityType: string;
  coverPhoto: ActivityMediaFile | undefined;
  coverPhotoURL: string | undefined;
};

const ActivityHighlightsView = ({ activities, projectId }: ActivityHighlightsViewProps) => {
  const { strings } = useLocalization();
  const theme = useTheme();
  const mapDrawerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapRef | null>(null);
  const query = useQuery();
  const location = useStateLocation();
  const navigate = useSyncNavigate();
  const { scrollToTop } = useMapDrawer(mapDrawerRef);
  const { fitBounds } = useMapUtils(mapRef);

  const [focusedFileId, setFocusedFileId] = useState<number | undefined>(undefined);
  const [hoveredFileId, setHoveredFileId] = useState<number | undefined>(undefined);

  const highlightActivityId = useMemo(() => {
    const activityIdParam = query.get('highlightActivityId');
    return activityIdParam ? Number(activityIdParam) : undefined;
  }, [query]);

  const shownActivity = useMemo(
    () => activities.find((activity) => activity.id === highlightActivityId),
    [activities, highlightActivityId]
  );

  useEffect(() => {
    if (!highlightActivityId) {
      // exiting activity detail view, clear focused & hovered states
      setFocusedFileId(undefined);
      setHoveredFileId(undefined);
    }
  }, [highlightActivityId]);

  useEffect(() => {
    if (shownActivity) {
      const points = shownActivity.media
        .map((_media): MapPoint | undefined => {
          if (!_media.isHiddenOnMap && _media.geolocation) {
            return {
              lat: _media.geolocation.coordinates[1],
              lng: _media.geolocation.coordinates[0],
            };
          }
        })
        .filter((point): point is MapPoint => point !== undefined);

      if (points.length > 0) {
        const bbox = getBoundingBoxFromPoints(points);
        fitBounds(bbox);
      }
    }
  }, [fitBounds, shownActivity]);

  const onClickSlide = useCallback(
    (activityId: number) => () => {
      query.set('highlightActivityId', activityId.toString());
      navigate(getLocation(location.pathname, location, query.toString()));
      scrollToTop();
    },
    [location, navigate, query, scrollToTop]
  );

  const setHoverFileCallback = useCallback(
    (fileId: number, hover: boolean) => () => {
      setHoveredFileId(hover ? fileId : undefined);
    },
    []
  );

  const onClickMediaItem = useCallback(
    (fileId: number) => () => {
      if (shownActivity) {
        if (focusedFileId === fileId) {
          setFocusedFileId(undefined);
          return;
        }
        setFocusedFileId(fileId);
      }
    },
    [shownActivity, focusedFileId]
  );

  const slides = useMemo(() => {
    const _slides: ActivityHighlightSlide[] = [];

    for (const activity of activities) {
      const activityType = activityTypeLabel(activity.type, strings);
      const coverPhoto = activity.media.find((file) => file.isCoverPhoto);
      const coverPhotoURL = coverPhoto
        ? `${ACTIVITY_MEDIA_FILE_ENDPOINT.replace('{activityId}', activity.id.toString()).replace(
            '{fileId}',
            coverPhoto.fileId.toString()
          )}`
        : undefined;

      _slides.push({ activity, activityType, coverPhoto, coverPhotoURL });
    }

    return _slides;
  }, [activities, strings]);

  return (
    <Box sx={{ '& .map-drawer--body': { paddingBottom: 0, paddingTop: 0 } }}>
      <MapSplitView
        activities={activities}
        drawerRef={mapDrawerRef}
        heightOffsetPx={HEIGHT_OFFSET_PX}
        mapRef={mapRef}
        projectId={projectId}
      >
        {highlightActivityId && shownActivity ? (
          <ActivityDetailView
            activity={shownActivity}
            focusedFileId={focusedFileId}
            hoveredFileId={hoveredFileId}
            onClickMediaItem={onClickMediaItem}
            projectId={projectId}
            setHoverFileCallback={setHoverFileCallback}
          />
        ) : (
          <Box
            sx={[
              carouselContainerStyles,
              {
                maxHeight: highlightActivityId
                  ? undefined
                  : {
                      xs: `calc(100vh - ${HEIGHT_OFFSET_MOBILE_PX}px)`,
                      md: `calc(100vh - ${HEIGHT_OFFSET_PX}px)`,
                    },
              },
            ]}
          >
            <Swiper
              direction='vertical'
              key={activities.map((a) => a.id).join('-')}
              loop
              modules={[Mousewheel, Navigation, Pagination]}
              mousewheel
              pagination={{ clickable: true }}
              slidesPerView={1}
              spaceBetween={30}
              style={{ height: '100%', width: '100%' }}
            >
              {slides.map((slide, index) => (
                <SwiperSlide key={index} style={{ position: 'relative' }}>
                  <Box sx={carouselSlideContentStyles(slide.coverPhotoURL)}>
                    <Box sx={carouselSlideCardStyles} onClick={onClickSlide(slide.activity.id)}>
                      <Box sx={carouselSlideCardMetadataStyles(theme)}>
                        <Typography>{slide.activity.date}</Typography>
                        <Typography
                          color={theme.palette.TwClrTxtBrand}
                          fontSize='24px'
                          fontWeight={600}
                          lineHeight='32px'
                        >
                          {slide.activityType}
                        </Typography>
                      </Box>
                      <Typography>{slide.activity.description}</Typography>
                    </Box>
                  </Box>
                </SwiperSlide>
              ))}
            </Swiper>
          </Box>
        )}
      </MapSplitView>
    </Box>
  );
};

export default ActivityHighlightsView;
