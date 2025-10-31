import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MapRef } from 'react-map-gl/mapbox';

import { Box, SxProps, Theme, Typography, useTheme } from '@mui/material';
import { Swiper as SwiperType } from 'swiper';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Mousewheel, Navigation, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import useProjectReports from 'src/hooks/useProjectReports';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useLocalization } from 'src/providers';
import { ACCELERATOR_REPORT_PHOTO_ENDPOINT } from 'src/services/AcceleratorReportService';
import { ACTIVITY_MEDIA_FILE_ENDPOINT } from 'src/services/ActivityService';
import { AcceleratorReport } from 'src/types/AcceleratorReport';
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

const getReportMetrics = (strings: any) => [
  {
    metric: strings.HECTARES_PLANTED,
    formatter: (value: number) => strings.formatString(strings.X_HA, value),
  },
  { metric: strings.SPECIES_PLANTED, formatter: (value: number) => value },
  { metric: strings.TREES_PLANTED, formatter: (value: number) => value },
];

type ActivityHighlightsViewProps = {
  activities: Activity[];
  projectId: number;
  selectedQuarter?: string;
};

type ActivityHighlightSlide = {
  activity?: Activity;
  coverPhoto?: ActivityMediaFile;
  coverPhotoURL?: string;
  description?: string;
  report?: AcceleratorReport;
  title: string;
};

const ActivityHighlightsView = ({ activities, projectId, selectedQuarter }: ActivityHighlightsViewProps) => {
  const { activeLocale, strings } = useLocalization();
  const theme = useTheme();
  const mapDrawerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapRef | null>(null);
  const query = useQuery();
  const location = useStateLocation();
  const navigate = useSyncNavigate();
  const { scrollToTop } = useMapDrawer(mapDrawerRef);
  const { fitBounds } = useMapUtils(mapRef);
  const { acceleratorReports } = useProjectReports(projectId);

  const selectedQuarterReport = useMemo(() => {
    if (acceleratorReports.length === 0 || !selectedQuarter) {
      return undefined;
    }

    // filter by selectedQuarter
    const quarterReports = acceleratorReports.filter((report) => {
      if (report.status !== 'Submitted') {
        return false;
      }
      const year = report.endDate.split('-')[0];
      const reportQuarterYear = `${report.quarter} ${year}`;
      return reportQuarterYear === selectedQuarter;
    });

    if (quarterReports.length === 0) {
      return undefined;
    }

    const sorted = [...quarterReports].sort((a, b) => b.endDate.localeCompare(a.endDate, activeLocale || undefined));
    return sorted[0];
  }, [acceleratorReports, activeLocale, selectedQuarter]);
  const [focusedFileId, setFocusedFileId] = useState<number | undefined>(undefined);
  const [hoveredFileId, setHoveredFileId] = useState<number | undefined>(undefined);
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);
  const [swiper, setSwiper] = useState<SwiperType | null>(null);

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

    if (selectedQuarterReport) {
      const firstSlide: ActivityHighlightSlide = {
        coverPhotoURL: selectedQuarterReport.photos.length
          ? ACCELERATOR_REPORT_PHOTO_ENDPOINT.replace('{projectId}', projectId?.toString())
              .replace('{reportId}', selectedQuarterReport.id.toString())
              .replace('{fileId}', selectedQuarterReport.photos[0].fileId.toString())
          : undefined,
        description: selectedQuarterReport.highlights,
        report: selectedQuarterReport,
        title: `${selectedQuarterReport.quarter} ${selectedQuarterReport.endDate.split('-')[0]}`,
      };
      _slides.push(firstSlide);
    }

    for (const activity of activities) {
      const title = activityTypeLabel(activity.type, strings);
      const description = activity.description;
      const coverPhoto = activity.media.find((file) => file.isCoverPhoto && !file.isHiddenOnMap);
      const coverPhotoURL = coverPhoto
        ? `${ACTIVITY_MEDIA_FILE_ENDPOINT.replace('{activityId}', activity.id.toString()).replace(
            '{fileId}',
            coverPhoto.fileId.toString()
          )}`
        : undefined;

      _slides.push({ activity, coverPhoto, coverPhotoURL, description, title });
    }

    return _slides;
  }, [activities, projectId, selectedQuarterReport, strings]);

  const currentSlide = slides[currentSlideIndex];

  const activitiesVisibleOnMap = useMemo(
    () =>
      currentSlide.activity
        ? [
            {
              ...currentSlide.activity,
              media: currentSlide.activity.media.filter((item) => item.isCoverPhoto),
            },
          ]
        : activities.map((activity) => ({
            ...activity,
            media: activity.media.filter((item) => item.isCoverPhoto),
          })),
    [activities, currentSlide.activity]
  );

  const onSlideChange = useCallback((_swiper: any) => {
    setCurrentSlideIndex(_swiper.realIndex);
  }, []);

  const onActivityMarkerClick = useCallback(
    (activityId: number) => {
      const targetSlideIndex = slides.findIndex((slide) => slide.activity?.id === activityId);
      if (swiper && targetSlideIndex !== -1 && slides[targetSlideIndex]) {
        // use slideToLoop for loop mode
        swiper.slideToLoop(targetSlideIndex);
      }
    },
    [slides, swiper]
  );

  return (
    <Box sx={{ '& .map-drawer--body': { paddingBottom: 0, paddingTop: 0 } }}>
      <MapSplitView
        activities={activitiesVisibleOnMap}
        drawerRef={mapDrawerRef}
        heightOffsetPx={HEIGHT_OFFSET_PX}
        mapRef={mapRef}
        onActivityMarkerClick={onActivityMarkerClick}
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
              onSlideChange={onSlideChange}
              onSwiper={setSwiper}
              pagination={{ clickable: true }}
              slidesPerView={1}
              spaceBetween={30}
              style={{ height: '100%', width: '100%' }}
            >
              {slides.map((slide, index) => (
                <SwiperSlide key={index} style={{ position: 'relative' }}>
                  <Box sx={carouselSlideContentStyles(slide.coverPhotoURL)}>
                    <Box
                      sx={carouselSlideCardStyles}
                      onClick={slide.activity ? onClickSlide(slide.activity.id) : undefined}
                    >
                      <Box sx={carouselSlideCardMetadataStyles(theme)}>
                        {slide.activity?.date && <Typography>{slide.activity.date}</Typography>}
                        <Box
                          display='flex'
                          sx={{
                            alignItems: {
                              xs: 'flex-start',
                              sm: 'center',
                            },
                            flexDirection: {
                              xs: 'column',
                              sm: 'row',
                            },
                          }}
                        >
                          {slide.report && (
                            <Typography
                              fontSize='24px'
                              fontWeight={600}
                              lineHeight='32px'
                              marginRight='10px'
                              sx={{
                                marginBottom: {
                                  xs: '8px',
                                  sm: 0,
                                },
                              }}
                            >
                              {strings.QUARTERLY_HIGHLIGHTS}
                            </Typography>
                          )}
                          <Typography
                            color={theme.palette.TwClrTxtBrand}
                            fontSize='24px'
                            fontWeight={600}
                            lineHeight='32px'
                          >
                            {slide.title}
                          </Typography>
                        </Box>
                      </Box>

                      {slide.report && (
                        <Box
                          sx={{
                            display: 'flex',
                            flexDirection: {
                              xs: 'column',
                              sm: 'row',
                            },
                            gap: 2,
                            flexWrap: 'wrap',
                          }}
                        >
                          {getReportMetrics(strings).map(({ metric, formatter }) => {
                            const value =
                              slide.report?.systemMetrics.find((sm) => sm.metric === metric)?.systemValue || 0;

                            return (
                              <Box key={metric}>
                                <Typography fontWeight={600}>{metric}</Typography>
                                <Typography fontSize='24px' fontWeight={600}>
                                  {formatter(value)}
                                </Typography>
                              </Box>
                            );
                          })}
                        </Box>
                      )}

                      {slide.description && <Typography>{slide.description}</Typography>}
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
