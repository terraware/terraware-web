import { Table, TableColumnType } from '@terraware/web-components';
import { useEffect, useState } from 'react';
import strings from 'src/strings';
import { Delivery } from 'src/api/types/tracking';
import { Species } from 'src/types/Species';

const columns: TableColumnType[] = [
  { key: 'species', name: strings.SPECIES, type: 'string' },
  { key: 'to_plot', name: strings.TO_PLOT, type: 'string' },
  { key: 'quantity', name: strings.QUANTITY, type: 'string' },
];

type SpeciesTableSectionProps = {
  species: Species[];
  delivery?: Delivery;
};

export default function SpeciesTable({ species, delivery }: SpeciesTableSectionProps): JSX.Element {
  const [rowData, setRowData] = useState<{ [p: string]: unknown }[]>([]);

  useEffect(() => {
    const rows: { [p: string]: unknown }[] = [];
    delivery?.plantings?.forEach((planting) => {
      rows.push({
        species: species?.find((sp) => sp?.id === planting?.speciesId)?.scientificName ?? '',
        to_plot: planting.plotId?.toString(),
        quantity: planting.numPlants.toString(),
      });
    });
    setRowData(rows);
  }, [delivery, species]);

  return <Table id='withdrawal-details-species' columns={columns} rows={rowData} orderBy={'name'} />;
}
