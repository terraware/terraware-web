import React, { useMemo } from 'react';

import { TableColumnType } from '@terraware/web-components';

import Table from 'src/components/common/table';
import { useUser } from 'src/providers';
import strings from 'src/strings';
import { Species } from 'src/types/Species';
import { Delivery } from 'src/types/Tracking';
import { useNumberFormatter } from 'src/utils/useNumberFormatter';

type OutplantReassignmentTableProps = {
  species: Species[];
  substratumNames: Record<number, string>;
  delivery?: Delivery;
  withdrawalNotes?: string;
};

const columns = (): TableColumnType[] => [
  { key: 'species', name: strings.SPECIES, type: 'string' },
  { key: 'from_substratum', name: strings.FROM_SUBSTRATUM, type: 'string' },
  { key: 'to_substratum', name: strings.TO_SUBSTRATUM, type: 'string' },
  { key: 'original_qty', name: strings.ORIGINAL_QTY, type: 'string' },
  { key: 'final_qty', name: strings.FINAL_QTY, type: 'string' },
  { key: 'notes', name: strings.NOTES, type: 'string' },
];

export default function OutplantReassignmentTable({
  delivery,
  species,
  substratumNames,
  withdrawalNotes,
}: OutplantReassignmentTableProps): JSX.Element {
  const { user } = useUser();
  const numberFormatter = useNumberFormatter(user?.locale);

  const rowData = useMemo(() => {
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
          from_substratum: '',
          to_substratum: deliveryPlanting.substratumId ? substratumNames[deliveryPlanting.substratumId] : '',
          original_qty: numberFormatter.format(deliveryPlanting.numPlants),
          final_qty: numberFormatter.format(deliveryPlanting.numPlants + reassignmentFromPlanting.numPlants),
          notes: withdrawalNotes ?? '',
        });
        rows.push({
          species: speciesName,
          from_substratum: deliveryPlanting.substratumId ? substratumNames[deliveryPlanting.substratumId] : '',
          to_substratum: reassignmentToPlanting.substratumId
            ? substratumNames[reassignmentToPlanting.substratumId]
            : '',
          original_qty: '0',
          final_qty: numberFormatter.format(reassignmentToPlanting.numPlants),
          notes: reassignmentToPlanting.notes ?? '',
        });
      }
    }

    return rows;
  }, [delivery, species, substratumNames, withdrawalNotes, numberFormatter]);

  return <Table id='outplant-reassignment-table' columns={columns} rows={rowData} orderBy={'name'} />;
}
