import React, { useMemo, useRef } from 'react';
import { MapRef } from 'react-map-gl/mapbox';

import { Box } from '@mui/material';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Mousewheel, Navigation, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import { Activity } from 'src/types/Activity';

import MapSplitView from './MapSplitView';

const carouselContainerStyles = {
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

const carouselSlideContentStyles = {
  alignItems: 'center',
  backgroundImage: 'linear-gradient(180deg, #2C8658 0%, #123624 100%)',
  borderRadius: '8px',
  bottom: 0,
  color: '#fff',
  display: 'flex',
  fontSize: '24px',
  justifyContent: 'center',
  left: 0,
  position: 'absolute',
  right: '32px',
  top: 0,
};

type ActivityHighlightsViewProps = {
  activities: Activity[];
  projectId: number;
};

const ActivityHighlightsView = ({ activities, projectId }: ActivityHighlightsViewProps) => {
  const mapDrawerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapRef | null>(null);

  const highlightedActivities = useMemo(() => activities.filter((activity) => activity.isHighlight), [activities]);

  return (
    <MapSplitView
      activities={highlightedActivities}
      drawerRef={mapDrawerRef}
      heightOffsetPx={204}
      mapRef={mapRef}
      projectId={projectId}
    >
      <Box sx={carouselContainerStyles}>
        <Swiper
          direction='vertical'
          loop
          modules={[Mousewheel, Navigation, Pagination]}
          mousewheel
          pagination={{ clickable: true }}
          slidesPerView={1}
          spaceBetween={30}
          style={{ height: '100%', width: '100%' }}
        >
          {Array.from({ length: 9 }, (_, index) => (
            <SwiperSlide key={index} style={{ position: 'relative' }}>
              <Box sx={carouselSlideContentStyles}>Slide {index + 1}</Box>
            </SwiperSlide>
          ))}
        </Swiper>
      </Box>
    </MapSplitView>
  );
};

export default ActivityHighlightsView;
