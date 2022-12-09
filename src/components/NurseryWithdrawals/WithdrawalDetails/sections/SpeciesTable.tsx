import { Table, TableColumnType } from '@terraware/web-components';
import { useEffect, useState } from 'react';
import strings from 'src/strings';
import { Delivery } from '../../../../api/types/tracking';
import { getSpecies } from '../../../../api/species/species';
import { ServerOrganization } from '../../../../types/Organization';

const columns: TableColumnType[] = [
  { key: 'species', name: strings.SPECIES, type: 'string' },
  { key: 'to_plot', name: strings.TO_PLOT, type: 'string' },
  { key: 'quantity', name: strings.QUANTITY, type: 'string' },
];

type SpeciesTableSectionProps = {
  organization: ServerOrganization;
  delivery?: Delivery;
};

export default function SpeciesTable({ organization, delivery }: SpeciesTableSectionProps): JSX.Element {
  const [rowData, setRowData] = useState<{ [p: string]: unknown }[]>([]);

  useEffect(() => {
    const rows: { [p: string]: unknown }[] = [];
    delivery?.plantings?.forEach(async (planting) => {
      rows.push({
        species: (await getSpecies(planting.speciesId, organization.id.toString()))?.species?.scientificName ?? '',
        to_plot: planting.plotId?.toString(),
        quantity: planting.numPlants.toString(),
      });
    });
    setRowData(rows);
  }, [delivery, organization]);

  return <Table id='withdrawal-details-species' columns={columns} rows={rowData} orderBy={'name'} />;
}
