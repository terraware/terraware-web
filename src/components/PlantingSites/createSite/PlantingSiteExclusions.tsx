import { Box, Typography, useTheme } from '@mui/material';
import strings from 'src/strings';
import { PlantingSite } from 'src/types/Tracking';

export type PlantingSiteInclusionsProps = {
  onChange: (id: string, value: unknown) => void;
  site: PlantingSite;
};

export default function PlantingSiteInclusions(props: PlantingSiteInclusionsProps): JSX.Element {
  const theme = useTheme();

  return (
    <Box display='flex' flexDirection='column'>
      <Typography fontSize='20px' fontWeight={600} lineHeight='28px' color={theme.palette.TwClrTxt}>
        {strings.SITE_EXCLUSION_AREAS_OPTIONAL}
      </Typography>
      {[
        strings.SITE_EXCLUSION_AREAS_DESCRIPTION_0,
        strings.SITE_EXCLUSION_AREAS_DESCRIPTION_1,
        strings.SITE_EXCLUSION_AREAS_DESCRIPTION_2,
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
