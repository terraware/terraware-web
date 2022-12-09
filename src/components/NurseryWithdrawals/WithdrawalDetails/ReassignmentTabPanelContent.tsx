import { Box, Typography } from '@mui/material';
import strings from 'src/strings';
import ReassignmentTable from './sections/ReassignmentTable';

type ReassignmentTabPanelContentProps = {};

export default function ReassignmentTabPanelContent(props: ReassignmentTabPanelContentProps): JSX.Element {
  return (
    <Box display='flex' flexDirection='column'>
      <Typography fontSize='20px' fontWeight={600}>
        {strings.REASSIGNMENT}
      </Typography>
      <ReassignmentTable />
    </Box>
  );
}
