import React, { useCallback, useEffect, useState } from 'react';
import { defaultPreset as DefaultColumns } from 'src/components/seeds/database/columns';
import Database from 'src/components/seeds/database';
import { SearchCriteria, SearchSortOrder } from 'src/types/Search';
import { DEFAULT_SEED_SEARCH_FILTERS, DEFAULT_SEED_SEARCH_SORT_ORDER } from 'src/services/SeedBankService';
import { useOrganization, useUser } from 'src/providers';
import { requestSpecies } from 'src/redux/features/species/speciesThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { selectSpecies } from 'src/redux/features/species/speciesSelectors';
import { isPlaceholderOrg, selectedOrgHasFacilityType } from 'src/providers/contexts';

interface AccessionsViewProps {
  setWithdrawalCreated: (value: boolean) => void;
}

const AccessionsView = ({ setWithdrawalCreated }: AccessionsViewProps) => {
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
    if (!species) {
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
