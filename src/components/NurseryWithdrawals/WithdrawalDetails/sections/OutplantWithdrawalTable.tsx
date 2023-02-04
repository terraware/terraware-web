import { TableColumnType } from '@terraware/web-components';
import { useEffect, useState } from 'react';
import strings from 'src/strings';
import { Delivery } from 'src/types/Tracking';
import { Species } from 'src/types/Species';
import Table from 'src/components/common/table';

type OutplantWithdrawalTableProps = {
  species: Species[];
  plotNames: Record<number, string>;
  delivery?: Delivery;
};

export default function OutplantWithdrawalTable({
  species,
  plotNames,
  delivery,
}: OutplantWithdrawalTableProps): JSX.Element {
  const [rowData, setRowData] = useState<{ [p: string]: unknown }[]>([]);
  const columns: TableColumnType[] = [
    { key: 'species', name: strings.SPECIES, type: 'string' },
    { key: 'to_plot', name: strings.TO_PLOT, type: 'string' },
    { key: 'quantity', name: strings.QUANTITY, type: 'string' },
  ];

  useEffect(() => {
    // get list of distinct species
    const speciesList =
      delivery?.plantings?.reduce<number[]>(
        (acc, pl) => (acc.includes(pl.speciesId) ? acc : [...acc, pl.speciesId]),
        []
      ) ?? [];
    const speciesPlotMap: Record<number, Record<number, number>> = {};
    const rows: { [p: string]: unknown }[] = [];
    for (const sp of speciesList) {
      // for each species add the number of plants in each plot for delivery type plantings
      speciesPlotMap[sp] = {};
      delivery?.plantings
        ?.filter((pl) => pl.speciesId === sp && pl.type === 'Delivery')
        .forEach((pl) => {
          const plot = pl.plotId ?? -1;
          if (!speciesPlotMap[sp][plot]) {
            speciesPlotMap[sp][plot] = pl.numPlants;
            return;
          }
          speciesPlotMap[sp][plot] += pl.numPlants;
        });

      // transform into table rows
      for (const plotKey of Object.keys(speciesPlotMap[sp])) {
        const plot = Number(plotKey);
        rows.push({
          species: species?.find((x) => x?.id === sp)?.scientificName ?? '',
          to_plot: plot > -1 ? plotNames[plot] ?? plot?.toString() : '',
          quantity: speciesPlotMap[sp][plot].toString(),
        });
      }
    }

    setRowData(rows);
  }, [delivery, species, plotNames]);

  return <Table id='outplant-withdrawal-table' columns={columns} rows={rowData} orderBy={'name'} />;
}
