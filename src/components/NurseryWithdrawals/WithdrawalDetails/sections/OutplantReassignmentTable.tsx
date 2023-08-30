import { useEffect, useMemo, useState } from 'react';
import { Species } from 'src/types/Species';
import { Delivery } from 'src/types/Tracking';
import { TableColumnType } from '@terraware/web-components';
import strings from 'src/strings';
import Table from 'src/components/common/table';
import { useUser } from 'src/providers';
import { useNumberFormatter } from 'src/utils/useNumber';

type OutplantReassignmentTableProps = {
  species: Species[];
  subzoneNames: Record<number, string>;
  delivery?: Delivery;
  withdrawalNotes?: string;
};

const columns = (): TableColumnType[] => [
  { key: 'species', name: strings.SPECIES, type: 'string' },
  { key: 'from_subzone', name: strings.FROM_SUBZONE, type: 'string' },
  { key: 'to_subzone', name: strings.TO_SUBZONE, type: 'string' },
  { key: 'original_qty', name: strings.ORIGINAL_QTY, type: 'string' },
  { key: 'final_qty', name: strings.FINAL_QTY, type: 'string' },
  { key: 'notes', name: strings.NOTES, type: 'string' },
];

export default function OutplantReassignmentTable({
  delivery,
  species,
  subzoneNames,
  withdrawalNotes,
}: OutplantReassignmentTableProps): JSX.Element {
  const { user } = useUser();
  const numberFormatter = useNumberFormatter();
  const numericFormatter = useMemo(() => numberFormatter(user?.locale), [numberFormatter, user?.locale]);

  const [rowData, setRowData] = useState<{ [p: string]: unknown }[]>([]);

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
          from_subzone: '',
          to_subzone: deliveryPlanting.plantingSubzoneId ? subzoneNames[deliveryPlanting.plantingSubzoneId] : '',
          original_qty: numericFormatter.format(deliveryPlanting.numPlants),
          final_qty: numericFormatter.format(deliveryPlanting.numPlants + reassignmentFromPlanting.numPlants),
          notes: withdrawalNotes ?? '',
        });
        rows.push({
          species: speciesName,
          from_subzone: deliveryPlanting.plantingSubzoneId ? subzoneNames[deliveryPlanting.plantingSubzoneId] : '',
          to_subzone: reassignmentToPlanting.plantingSubzoneId
            ? subzoneNames[reassignmentToPlanting.plantingSubzoneId]
            : '',
          original_qty: '0',
          final_qty: numericFormatter.format(reassignmentToPlanting.numPlants),
          notes: reassignmentToPlanting.notes ?? '',
        });
      }
    }

    setRowData(rows);
  }, [delivery, species, subzoneNames, withdrawalNotes, numericFormatter]);

  return <Table id='outplant-reassignment-table' columns={columns} rows={rowData} orderBy={'name'} />;
}
