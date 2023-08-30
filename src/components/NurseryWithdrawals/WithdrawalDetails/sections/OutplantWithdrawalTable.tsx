import { useEffect, useMemo, useState } from 'react';
import { TableColumnType } from '@terraware/web-components';
import strings from 'src/strings';
import { Delivery } from 'src/types/Tracking';
import { Species } from 'src/types/Species';
import Table from 'src/components/common/table';
import { useUser } from 'src/providers';
import { useNumberFormatter } from 'src/utils/useNumber';

type OutplantWithdrawalTableProps = {
  species: Species[];
  subzoneNames: Record<number, string>;
  delivery?: Delivery;
};

const columns = (): TableColumnType[] => [
  { key: 'species', name: strings.SPECIES, type: 'string' },
  { key: 'to_subzone', name: strings.TO_SUBZONE, type: 'string' },
  { key: 'quantity', name: strings.QUANTITY, type: 'string' },
];

export default function OutplantWithdrawalTable({
  species,
  subzoneNames,
  delivery,
}: OutplantWithdrawalTableProps): JSX.Element {
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
    const speciesSubzoneMap: Record<number, Record<number, number>> = {};
    const rows: { [p: string]: unknown }[] = [];
    for (const sp of speciesList) {
      // for each species add the number of plants in each subzone for delivery type plantings
      speciesSubzoneMap[sp] = {};
      delivery?.plantings
        ?.filter((pl) => pl.speciesId === sp && pl.type === 'Delivery')
        .forEach((pl) => {
          const subzone = pl.plantingSubzoneId ?? -1;
          if (!speciesSubzoneMap[sp][subzone]) {
            speciesSubzoneMap[sp][subzone] = pl.numPlants;
            return;
          }
          speciesSubzoneMap[sp][subzone] += pl.numPlants;
        });

      // transform into table rows
      for (const subzoneKey of Object.keys(speciesSubzoneMap[sp])) {
        const subzone = Number(subzoneKey);
        rows.push({
          species: species?.find((x) => x?.id === sp)?.scientificName ?? '',
          to_subzone: subzone > -1 ? subzoneNames[subzone] ?? subzone?.toString() : '',
          quantity: numericFormatter.format(speciesSubzoneMap[sp][subzone]),
        });
      }
    }

    setRowData(rows);
  }, [delivery, species, subzoneNames, numericFormatter]);

  return <Table id='outplant-withdrawal-table' columns={columns} rows={rowData} orderBy={'name'} />;
}
