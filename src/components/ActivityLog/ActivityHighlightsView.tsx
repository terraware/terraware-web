import React, { useMemo, useRef } from 'react';
import { MapRef } from 'react-map-gl/mapbox';

import { Box, SxProps, Theme, Typography, useTheme } from '@mui/material';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Mousewheel, Navigation, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import { useLocalization } from 'src/providers';
import { ACTIVITY_MEDIA_FILE_ENDPOINT } from 'src/services/ActivityService';
import { Activity, ActivityMediaFile, activityTypeLabel } from 'src/types/Activity';

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
  (theme: Theme) => ({
    alignItems: 'flex-end',
    backgroundColor: theme.palette.TwClrBgSecondary,
    backgroundImage: coverPhotoURL ? `url(${coverPhotoURL})` : 'linear-gradient(180deg, #2C8658 0%, #123624 100%)',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
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
  backgroundColor: '#fff',
  borderRadius: '8px',
  color: '#000',
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
        <Box
          sx={[
            carouselContainerStyles,
            {
              maxHeight: {
                xs: `calc(100vh - ${HEIGHT_OFFSET_MOBILE_PX}px)`,
                md: `calc(100vh - ${HEIGHT_OFFSET_PX}px)`,
              },
            },
          ]}
        >
          <Swiper
            key={activities.map((a) => a.id).join('-')}
            direction='vertical'
            loop
            modules={[Mousewheel, Navigation, Pagination]}
            mousewheel
            pagination={{ clickable: true }}
            slidesPerView={1}
            spaceBetween={30}
            style={{ height: '100%', width: '100%' }}
          >
            {slides.map((_slide, index) => (
              <SwiperSlide key={index} style={{ position: 'relative' }}>
                <Box sx={carouselSlideContentStyles(_slide.coverPhotoURL)}>
                  <Box sx={carouselSlideCardStyles}>
                    <Box sx={carouselSlideCardMetadataStyles(theme)}>
                      <Typography>{_slide.activity.date}</Typography>
                      <Typography
                        color={theme.palette.TwClrTxtBrand}
                        fontSize='24px'
                        fontWeight={600}
                        lineHeight='32px'
                      >
                        {_slide.activityType}
                      </Typography>
                    </Box>
                    <Typography>{_slide.activity.description}</Typography>
                  </Box>
                </Box>
              </SwiperSlide>
            ))}
          </Swiper>
        </Box>
      </MapSplitView>
    </Box>
  );
};

export default ActivityHighlightsView;
