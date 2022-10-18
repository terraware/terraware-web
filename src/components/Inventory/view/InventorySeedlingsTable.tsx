import { Typography } from '@mui/material';
import { SpeciesInventorySummary } from 'src/api/types/inventory';

interface InventorySeedslingsTableProps {
  summary: SpeciesInventorySummary;
}

export default function InventorySeedslingsTable(props: InventorySeedslingsTableProps): JSX.Element {
  const { summary } = props;

  return <Typography>Inventory seedslings table for species-id {summary.speciesId} coming soon!</Typography>;
}
