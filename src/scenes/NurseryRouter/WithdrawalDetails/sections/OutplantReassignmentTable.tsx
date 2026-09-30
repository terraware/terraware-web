import React, { type JSX, useEffect, useMemo } from 'react';

import { TableColumnType } from '@terraware/web-components';

import Table from 'src/components/common/table';
import useOrganizationPlantingSites from 'src/hooks/useOrganizationPlantingSites';
import { useOrganization } from 'src/providers';
import { PlantingPayload } from 'src/queries/generated/nurseryWithdrawals';
import { useLazyListSubstrataQuery } from 'src/queries/search/substrata';
import strings from 'src/strings';
import { Species } from 'src/types/Species';
import { useNumberFormatter } from 'src/utils/useNumberFormatter';

type OutplantReassignmentTableProps = {
  species: Species[];
  plantings?: (PlantingPayload & { plantingSiteId: number })[];
  withdrawalNotes?: string;
};

const columns = (showPlantingSites: boolean): TableColumnType[] => [
  { key: 'species', name: strings.SPECIES, type: 'string' },
  ...(showPlantingSites
    ? [
        { key: 'from_planting_site', name: strings.FROM_PLANTING_SITE, type: 'string' as const },
        { key: 'to_planting_site', name: strings.TO_PLANTING_SITE, type: 'string' as const },
      ]
    : []),
  { key: 'from_substratum', name: strings.FROM_SUBSTRATUM, type: 'string' },
  { key: 'to_substratum', name: strings.TO_SUBSTRATUM, type: 'string' },
  { key: 'original_qty', name: strings.ORIGINAL_QTY, type: 'string' },
  { key: 'final_qty', name: strings.FINAL_QTY, type: 'string' },
  { key: 'notes', name: strings.NOTES, type: 'string' },
];

export default function OutplantReassignmentTable({
  plantings: allPlantings,
  species,
  withdrawalNotes,
}: OutplantReassignmentTableProps): JSX.Element {
  const numberFormatter = useNumberFormatter();
  const { plantingSites } = useOrganizationPlantingSites();
  const showPlantingSites = new Set(allPlantings?.map((planting) => planting.plantingSiteId)).size > 1;

  const { selectedOrganization } = useOrganization();
  const [listSubstrata, listSubstrataResponse] = useLazyListSubstrataQuery();
  const substratumNames = useMemo((): Record<number, string> => {
    if (listSubstrataResponse.currentData) {
      const results = {} as Record<number, string>;
      listSubstrataResponse.currentData.forEach(({ id, name }) => {
        results[id] = name;
      });

      return results;
    } else {
      return {};
    }
  }, [listSubstrataResponse.currentData]);

  useEffect(() => {
    if (selectedOrganization) {
      void listSubstrata(selectedOrganization.id, true);
    }
  }, [listSubstrata, selectedOrganization]);

  const rowData = useMemo(() => {
    // get list of distinct species
    const speciesList =
      allPlantings?.reduce<number[]>((acc, pl) => (acc.includes(pl.speciesId) ? acc : [...acc, pl.speciesId]), []) ??
      [];
    const rows: { [p: string]: unknown }[] = [];
    for (const sp of speciesList) {
      const speciesName = species?.find((x) => x?.id === sp)?.scientificName ?? '';
      const plantings = allPlantings?.filter((pl) => pl.speciesId === sp);
      const deliveryPlanting = plantings?.find((pl) => pl.type === 'Delivery');
      const reassignmentFromPlantings = plantings?.filter((pl) => pl.type === 'Reassignment From') ?? [];
      const reassignmentToPlantings = plantings?.filter((pl) => pl.type === 'Reassignment To') ?? [];

      // if reassignment plantings are found, create table rows
      if (deliveryPlanting && reassignmentFromPlantings.length && reassignmentToPlantings.length) {
        rows.push({
          species: speciesName,
          from_planting_site: '',
          to_planting_site: plantingSites.find((site) => site.id === deliveryPlanting.plantingSiteId)?.name ?? '',
          from_substratum: '',
          to_substratum: deliveryPlanting.substratumId ? substratumNames[deliveryPlanting.substratumId] : '',
          original_qty: numberFormatter.format(deliveryPlanting.numPlants),
          final_qty: numberFormatter.format(
            deliveryPlanting.numPlants +
              reassignmentFromPlantings.reduce((total, planting) => total + planting.numPlants, 0)
          ),
          notes: withdrawalNotes ?? '',
        });
        for (const reassignmentToPlanting of reassignmentToPlantings) {
          rows.push({
            species: speciesName,
            from_planting_site: plantingSites.find((site) => site.id === deliveryPlanting.plantingSiteId)?.name ?? '',
            to_planting_site:
              plantingSites.find((site) => site.id === reassignmentToPlanting.plantingSiteId)?.name ?? '',
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
    }

    return rows;
  }, [allPlantings, species, substratumNames, withdrawalNotes, numberFormatter, plantingSites]);

  return (
    <Table
      id='outplant-reassignment-table'
      columns={() => columns(showPlantingSites)}
      rows={rowData}
      orderBy={'name'}
    />
  );
}
