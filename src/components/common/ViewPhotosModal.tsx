import React, { useEffect, useRef, useState } from 'react';
import strings from 'src/strings';
import Button from 'src/components/common/button/Button';
import DialogBox from 'src/components/common/DialogBox/DialogBox';
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';
import { Box } from '@mui/material';

export interface ViewPhotosDialogProps {
  open: boolean;
  onClose: () => void;
  photosUrls: string[];
  selectedSlide: number;
}

export default function ViewPhotosDialog(props: ViewPhotosDialogProps): JSX.Element {
  const { onClose, open, photosUrls, selectedSlide } = props;
  const [isPreviousDisabled, setIsPreviousDisabled] = useState(false);
  const [isNextDisabled, setIsNextDisabled] = useState(false);

  const myCarousel = useRef<Carousel>(null);
  const responsive = {
    mobile: {
      breakpoint: { max: 4000, min: 0 },
      items: 1,
    },
  };

  const disableButtons = () => {
    if (myCarousel.current) {
      if (myCarousel.current.state.currentSlide + 1 >= photosUrls.length) {
        setIsNextDisabled(true);
      } else {
        setIsNextDisabled(false);
      }
      if (myCarousel.current.state.currentSlide - 1 < 0) {
        setIsPreviousDisabled(true);
      } else {
        setIsPreviousDisabled(false);
      }
    }
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
          disabled={isPreviousDisabled}
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
          disabled={isNextDisabled}
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
        <Carousel
          responsive={responsive}
          ref={myCarousel}
          showDots={true}
          arrows={false}
          ssr={true}
          afterChange={disableButtons}
        >
          {photosUrls.map((url, i) => (
            <div key={`photo-${i}-container`}>
              <a href={url} target='blank'>
                <img src={`${url}?maxHeight=500`} alt='' />
              </a>
            </div>
          ))}
        </Carousel>
      </Box>
    </DialogBox>
  );
}
