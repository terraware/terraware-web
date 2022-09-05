import React, { useEffect, useRef } from 'react';
import strings from 'src/strings';
import Button from '../common/button/Button';
import DialogBox from '../common/DialogBox/DialogBox';
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';
import { Box } from '@mui/material';

export interface ViewPhotosDialogProps {
  open: boolean;
  onClose: () => void;
  photosNames: string[];
  accessionId: string;
  selectedSlide: number;
}

export default function ViewPhotosDialog(props: ViewPhotosDialogProps): JSX.Element {
  const { onClose, open, photosNames, accessionId, selectedSlide } = props;

  const myCarousel = useRef<Carousel>(null);
  const responsive = {
    mobile: {
      breakpoint: { max: 4000, min: 0 },
      items: 1,
    },
  };

  useEffect(() => {
    if (myCarousel.current) {
      myCarousel.current.goToSlide(selectedSlide);
    }
  }, [selectedSlide, open]);

  return (
    <DialogBox
      onClose={onClose}
      open={open}
      title={strings.PHOTOS}
      size='large'
      middleButtons={[
        <Button
          label={strings.PREVIOUS_ARROW}
          priority='secondary'
          onClick={() => {
            if (myCarousel.current) {
              const prevSlide = myCarousel.current.state.currentSlide - 1;
              myCarousel.current.previous(prevSlide);
            }
          }}
          key='button-1'
        />,
        <Button
          label={strings.NEXT_ARROW}
          onClick={() => {
            if (myCarousel.current) {
              const nextSlide = myCarousel.current.state.currentSlide + 1;
              myCarousel.current.next(nextSlide);
            }
          }}
          key='button-2'
        />,
      ]}
    >
      <Box
        sx={{
          '& .react-multi-carousel-list': {
            paddingBottom: '20px',
          },
        }}
      >
        <Carousel responsive={responsive} ref={myCarousel} showDots={true} arrows={false} ssr={true}>
          {photosNames.map((photoName, i) => (
            <div key={`photo-${i}-container`}>
              <img src={`/api/v1/seedbank/accessions/${accessionId}/photos/${photoName}?maxHeight=500`} alt='' />
            </div>
          ))}
        </Carousel>
      </Box>
    </DialogBox>
  );
}
