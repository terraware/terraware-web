import { useState } from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import strings from 'src/strings';
import { PlantingSite } from 'src/types/Tracking';
import ZoneInstructionsModal from './ZoneInstructionsModal';

export type PlantingSiteBoundaryProps = {
  onChange: (id: string, value: unknown) => void;
  site: PlantingSite;
};

export default function PlantingSiteBoundary(props: PlantingSiteBoundaryProps): JSX.Element {
  const theme = useTheme();
  // this is a placeholder for the instructions modal trigger
  const [showModal, setShowModal] = useState<boolean>(true);

  const onClose = () => {
    setShowModal(false);
  };

  return (
    <Box display='flex' flexDirection='column'>
      <ZoneInstructionsModal open={showModal} onClose={onClose} />
      <Typography fontSize='20px' fontWeight={600} lineHeight='28px' color={theme.palette.TwClrTxt}>
        {strings.SITE_ZONE_BOUNDARIES}
      </Typography>
      {[strings.SITE_ZONE_BOUNDARIES_DESCRIPTION_0, strings.SITE_ZONE_BOUNDARIES_DESCRIPTION_1].map(
        (description: string, index: number) => (
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
        )
      )}
    </Box>
  );
}
