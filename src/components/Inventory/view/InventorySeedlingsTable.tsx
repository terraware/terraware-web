import { Typography } from '@mui/material';
import { SpeciesInventory } from 'src/api/inventory/search';

interface InventorySeedslingsTableProps {
  inventory: SpeciesInventory;
}

export default function InventorySeedslingsTable(props: InventorySeedslingsTableProps): JSX.Element {
  const { inventory } = props;

  return <Typography>Inventory seedslings table for species-id {inventory.species_id} coming soon!</Typography>;
}
