import { Species } from 'src/types/Species';
import { Delivery } from 'src/types/Tracking';
import { TableColumnType } from '@terraware/web-components';
import strings from 'src/strings';
import { useEffect, useState } from 'react';
import Table from 'src/components/common/table';

type OutplantReassignmentTableProps = {
  species: Species[];
  plotNames: Record<number, string>;
  delivery?: Delivery;
  withdrawalNotes?: string;
};

export default function OutplantReassignmentTable({
  delivery,
  species,
  plotNames,
  withdrawalNotes,
}: OutplantReassignmentTableProps): JSX.Element {
  const [rowData, setRowData] = useState<{ [p: string]: unknown }[]>([]);
  const columns: TableColumnType[] = [
    { key: 'species', name: strings.SPECIES, type: 'string' },
    { key: 'from_plot', name: strings.FROM_PLOT, type: 'string' },
    { key: 'to_plot', name: strings.TO_PLOT, type: 'string' },
    { key: 'original_qty', name: strings.ORIGINAL_QTY, type: 'string' },
    { key: 'final_qty', name: strings.FINAL_QTY, type: 'string' },
    { key: 'notes', name: strings.NOTES, type: 'string' },
  ];

  useEffect(() => {
    // get list of distinct species
    const speciesList =
      delivery?.plantings?.reduce<number[]>(
        (acc, pl) => (acc.includes(pl.speciesId) ? acc : [...acc, pl.speciesId]),
        []
      ) ?? [];
    const rows: { [p: string]: unknown }[] = [];
    for (const sp of speciesList) {
      const speciesName = species?.find((x) => x?.id === sp)?.scientificName ?? '';
      const plantings = delivery?.plantings?.filter((pl) => pl.speciesId === sp);
      const deliveryPlanting = plantings?.find((pl) => pl.type === 'Delivery');
      const reassignmentFromPlanting = plantings?.find((pl) => pl.type === 'Reassignment From');
      const reassignmentToPlanting = plantings?.find((pl) => pl.type === 'Reassignment To');

      // if reassignment plantings are found, create table rows
      if (deliveryPlanting && reassignmentFromPlanting && reassignmentToPlanting) {
        rows.push({
          species: speciesName,
          from_plot: '',
          to_plot: deliveryPlanting.plotId ? plotNames[deliveryPlanting.plotId] : '',
          original_qty: deliveryPlanting.numPlants.toString(),
          final_qty: (deliveryPlanting.numPlants + reassignmentFromPlanting.numPlants).toString(),
          notes: withdrawalNotes ?? '',
        });
        rows.push({
          species: speciesName,
          from_plot: deliveryPlanting.plotId ? plotNames[deliveryPlanting.plotId] : '',
          to_plot: reassignmentToPlanting.plotId ? plotNames[reassignmentToPlanting.plotId] : '',
          original_qty: '0',
          final_qty: reassignmentToPlanting.numPlants.toString(),
          notes: reassignmentToPlanting.notes ?? '',
        });
      }
    }

    setRowData(rows);
  }, [delivery, species, plotNames, withdrawalNotes]);

  return <Table id='outplant-reassignment-table' columns={columns} rows={rowData} orderBy={'name'} />;
}
