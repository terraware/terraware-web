import { useCallback, useEffect, useState } from 'react';
import { SearchResponseElement } from 'src/types/Search';
import SeedBankService from 'src/services/SeedBankService';
import { useOrganization } from 'src/providers';
import strings from 'src/strings';

const SEARCH_FIELDS_ACCESSIONS = ['id', 'accessionNumber', 'speciesName'];
export type SearchResponseAccession = {
  id: string;
  accessionNumber: string;
  speciesName: string;
};

export const useAccessions = (record?: { accessionId?: number }, excludeUsedUp?: boolean) => {
  const { selectedOrganization } = useOrganization();

  const [availableAccessions, setAvailableAccessions] = useState<SearchResponseAccession[]>();
  const [selectedAccession, setSelectedAccession] = useState<SearchResponseAccession>();

  const initAccessions = useCallback(async () => {
    const results: SearchResponseElement[] | null = await SeedBankService.searchAccessions({
      organizationId: selectedOrganization.id,
      fields: SEARCH_FIELDS_ACCESSIONS,
      searchCriteria: excludeUsedUp
        ? {
            excludeUsedUp: {
              operation: 'not',
              child: {
                operation: 'field',
                field: 'state',
                type: 'Exact',
                values: [strings.USED_UP],
              },
            },
          }
        : undefined,
    });

    if (!results?.length) {
      return;
    }

    setAvailableAccessions(results as SearchResponseAccession[]);
  }, [selectedOrganization.id, excludeUsedUp]);

  useEffect(() => {
    if (availableAccessions && record?.accessionId) {
      setSelectedAccession(availableAccessions.find((accession) => accession.id === `${record.accessionId}`));
    }
  }, [availableAccessions, record?.accessionId]);

  useEffect(() => {
    if (!availableAccessions) {
      void initAccessions();
    }
  }, [availableAccessions, initAccessions]);

  return { availableAccessions, selectedAccession };
};
