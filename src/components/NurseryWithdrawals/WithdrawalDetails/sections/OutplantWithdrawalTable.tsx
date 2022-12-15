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
  plotNames: Record<number, string>;
  delivery?: Delivery;
};

export default function OutplantWithdrawalTable({
  species,
  plotNames,
  delivery,
}: SpeciesTableSectionProps): JSX.Element {
  const [rowData, setRowData] = useState<{ [p: string]: unknown }[]>([]);

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
      // for each species add the number of plants in each plot
      speciesPlotMap[sp] = {};
      delivery?.plantings
        ?.filter((pl) => pl.speciesId === sp)
        .forEach((pl) => {
          const plot = pl.plotId ?? -1;
          if (!speciesPlotMap[sp][plot]) {
            speciesPlotMap[sp][plot] = pl.numPlants;
            return;
          }
          switch (pl.type) {
            case 'Reassignment From':
              speciesPlotMap[sp][plot] -= pl.numPlants;
              break;
            case 'Delivery':
            case 'Reassignment To':
            default:
              speciesPlotMap[sp][plot] += pl.numPlants;
              break;
          }
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
  }, [delivery, species]);

  return <Table id='withdrawal-details-species' columns={columns} rows={rowData} orderBy={'name'} />;
}
