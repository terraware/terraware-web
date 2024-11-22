import React, { useCallback, useEffect, useState } from 'react';

import Database from 'src/components/seeds/database';
import { defaultPreset as DefaultColumns } from 'src/components/seeds/database/columns';
import { useOrganization, useUser } from 'src/providers';
import { selectSpecies } from 'src/redux/features/species/speciesSelectors';
import { requestSpecies } from 'src/redux/features/species/speciesThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { DEFAULT_SEED_SEARCH_FILTERS, DEFAULT_SEED_SEARCH_SORT_ORDER } from 'src/services/SeedBankService';
import { SearchCriteria, SearchSortOrder } from 'src/types/Search';
import { isPlaceholderOrg, selectedOrgHasFacilityType } from 'src/utils/organization';

interface AccessionsViewProps {
  setWithdrawalCreated: (value: boolean) => void;
}

const AccessionsView = ({}: AccessionsViewProps) => {
  const dispatch = useAppDispatch();
  const { userPreferences } = useUser();
  const { selectedOrganization, reloadOrganizations, orgPreferences } = useOrganization();
  const preferredWeightSystem = userPreferences.preferredWeightSystem as string;

  const species = useAppSelector(selectSpecies);

  // seedSearchCriteria describes which criteria to apply when searching accession data.
  const [seedSearchCriteria, setSeedSearchCriteria] = useState<SearchCriteria>(DEFAULT_SEED_SEARCH_FILTERS);

  // seedSearchSort describes which sort criterion to apply when searching accession data.
  const [seedSearchSort, setSeedSearchSort] = useState<SearchSortOrder>(DEFAULT_SEED_SEARCH_SORT_ORDER);

  // seedSearchColumns describes which accession columns to request when searching accession data.
  const [seedSearchColumns, setSeedSearchColumns] = useState<string[]>(DefaultColumns(preferredWeightSystem).fields);

  /*
   * accessionsDisplayColumns describes which columns are displayed in the accessions list, and in which order.
   * Differs from seedSearchSelectedColumns because the order matters. Also, sometimes the two lists won't have
   * exactly the same columns. E.g. if the user adds the Withdrawal -> "Seeds Withdrawn" column,
   * then seedSearchSelectedColumns will contain withdrawalQuantity and withdrawalUnits but this list will only
   * contain withdrawalQuantity.
   */
  const [accessionsDisplayColumns, setAccessionsDisplayColumns] = useState<string[]>(
    DefaultColumns(preferredWeightSystem).fields
  );

  const setDefaults = useCallback(() => {
    if (!isPlaceholderOrg(selectedOrganization.id)) {
      const savedColumns = orgPreferences.accessionsColumns ? (orgPreferences.accessionsColumns as string[]) : [];
      const defaultColumns = savedColumns.length ? savedColumns : DefaultColumns(preferredWeightSystem).fields;
      setAccessionsDisplayColumns(defaultColumns);
    }
  }, [orgPreferences.accessionsColumns, preferredWeightSystem, selectedOrganization.id]);

  useEffect(() => {
    setDefaults();
  }, [setDefaults]);

  useEffect(() => {
    if (!species && selectedOrganization.id !== -1) {
      void dispatch(requestSpecies(selectedOrganization.id));
    }
  }, [dispatch, selectedOrganization.id, species]);

  return (
    <Database
      searchCriteria={seedSearchCriteria}
      setSearchCriteria={setSeedSearchCriteria}
      searchSortOrder={seedSearchSort}
      setSearchSortOrder={setSeedSearchSort}
      searchColumns={seedSearchColumns}
      setSearchColumns={setSeedSearchColumns}
      displayColumnNames={accessionsDisplayColumns}
      setDisplayColumnNames={setAccessionsDisplayColumns}
      hasSeedBanks={selectedOrgHasFacilityType(selectedOrganization, 'Seed Bank')}
      hasSpecies={(species || []).length > 0}
      reloadData={reloadOrganizations}
    />
  );
};

export default AccessionsView;
