import { Box, Typography } from '@mui/material';
import strings from 'src/strings';
import Photos from './sections/Photos';

type NurseryTransferContentProps = {};

export default function NurseryTransferContent(props: NurseryTransferContentProps): JSX.Element {
  return (
    <Box display='flex' flexDirection='column'>
      <Typography fontSize='20px' fontWeight={600}>
        {strings.DETAILS}
      </Typography>
      <Photos />
    </Box>
  );
}
