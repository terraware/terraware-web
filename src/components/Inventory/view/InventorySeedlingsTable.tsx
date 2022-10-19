import { Typography } from '@mui/material';

interface InventorySeedslingsTableProps {
  speciesId: number;
}

export default function InventorySeedslingsTable(props: InventorySeedslingsTableProps): JSX.Element {
  const { speciesId } = props;

  return <Typography>Inventory seedslings table for species-id {speciesId} coming soon!</Typography>;
}
