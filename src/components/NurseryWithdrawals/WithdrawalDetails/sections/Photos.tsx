import { Box, Typography } from '@mui/material';
import strings from 'src/strings';

type PhotosSectionProps = {};

export default function Photos(props: PhotosSectionProps): JSX.Element {
  return (
    <>
      <Typography fontSize='20px' fontWeight={600}>
        {strings.PHOTOS}
      </Typography>
      <Box>(Photos go here)</Box>
    </>
  );
}
