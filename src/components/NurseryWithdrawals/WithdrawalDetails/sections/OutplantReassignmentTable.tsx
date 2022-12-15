import { Box } from '@mui/material';
import { Species } from 'src/types/Species';
import { Delivery } from 'src/api/types/tracking';

type ReassignmentTableSectionProps = {
  species: Species[];
  plotNames: Record<number, string>;
  delivery?: Delivery;
};

export default function OutplantReassignmentTable(props: ReassignmentTableSectionProps): JSX.Element {
  return <Box>Reassignment Table</Box>;
}
