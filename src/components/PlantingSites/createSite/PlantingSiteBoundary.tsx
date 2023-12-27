import { useState } from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import strings from 'src/strings';
import { PlantingSite } from 'src/types/Tracking';
import BoundaryInstructionsModal from './BoundaryInstructionsModal';

export type PlantingSiteBoundaryProps = {
  onChange: (id: string, value: unknown) => void;
  site: PlantingSite;
};

export default function PlantingSiteBoundary(props: PlantingSiteBoundaryProps): JSX.Element {
  const theme = useTheme();
  // this is a placeholder for the instructions modal trigger
  const [showModal, setShowModal] = useState<boolean>(true);
  const [dontShowModalAgain, setDontShowModalAgain] = useState<boolean>(false);

  const onClose = (dontShowAgain?: boolean) => {
    setShowModal(false);
    if (dontShowAgain) {
      setDontShowModalAgain(true);
    }
  };

  return (
    <Box display='flex' flexDirection='column'>
      <BoundaryInstructionsModal force={dontShowModalAgain === true} open={showModal} onClose={onClose} />
      <Typography fontSize='20px' fontWeight={600} lineHeight='28px' color={theme.palette.TwClrTxt}>
        {strings.SITE_BOUNDARY}
      </Typography>
      {[
        strings.SITE_BOUNDARY_DESCRIPTION_0,
        strings.SITE_BOUNDARY_DESCRIPTION_1,
        strings.SITE_BOUNDARY_DESCRIPTION_2,
      ].map((description: string, index: number) => (
        <Typography
          key={index}
          fontSize='14px'
          fontWeight={400}
          lineHeight='20px'
          color={theme.palette.TwClrTxt}
          margin={theme.spacing(1, 0)}
        >
          {description}
        </Typography>
      ))}
    </Box>
  );
}
