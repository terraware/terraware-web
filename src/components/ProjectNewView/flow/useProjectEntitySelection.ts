import { useEffect, useState } from 'react';

import { FlowStates } from 'src/components/ProjectNewView';
import { DEFAULT_SEARCH_DEBOUNCE_MS } from 'src/constants';
import { useOrganization } from 'src/providers';
import { AccessionState } from 'src/types/Accession';
import { FieldNodePayload, SearchNodePayload, SearchResponseElement, SearchSortOrder } from 'src/types/Search';
import useDebounce from 'src/utils/useDebounce';
import useForm from 'src/utils/useForm';

interface UseProjectEntitySelectionProps<T extends SearchResponseElement> {
  currentFlowState: FlowStates;
  thisFlowState: FlowStates;
  setHasEntities: (value: boolean) => void;
  setProjectEntities: (value: T[]) => void;
  onNext: () => void;
  getSearchResults: (
    organizationId: number,
    searchFields: (FieldNodePayload | SearchNodePayload)[],
    searchSortOrder?: SearchSortOrder,
    filters?: ProjectEntityFilters
  ) => Promise<T[] | null>;
  getSearchFields: (debouncedSearchTerm: string) => (FieldNodePayload | SearchNodePayload)[];
}

export type ProjectEntityFilters = {
  projectIds?: number[];
  statuses?: AccessionState[];
  nurseryIds?: number[];
};

export const useProjectEntitySelection = <T extends SearchResponseElement>({
  currentFlowState,
  thisFlowState,
  setHasEntities,
  setProjectEntities,
  onNext,
  getSearchResults,
  getSearchFields,
}: UseProjectEntitySelectionProps<T>) => {
  const { selectedOrganization } = useOrganization();

  const [entities, setEntities] = useState<T[]>([]);
  const [selectedRows, setSelectedRows] = useState<T[]>([]);
  const [showAssignmentWarning, setShowAssignmentWarning] = useState<boolean>(false);
  const [temporalSearchValue, setTemporalSearchValue] = useState<string | null>(null);
  const [searchSortOrder, setSearchSortOrder] = useState<SearchSortOrder>();
  const [filters, setFilters] = useForm<ProjectEntityFilters>({});
  const [isSearchDirty, setIsSearchDirty] = useForm<boolean>(false);

  const debouncedSearchTerm = useDebounce(temporalSearchValue, DEFAULT_SEARCH_DEBOUNCE_MS);

  useEffect(() => {
    if (selectedOrganization.id !== -1) {
      const populate = async () => {
        const searchResponse = await getSearchResults(
          selectedOrganization.id,
          getSearchFields(debouncedSearchTerm || ''),
          searchSortOrder,
          filters
        );

        if (searchResponse) {
          setEntities(searchResponse);

          if (searchResponse.find((element) => !!element.project_name)) {
            setShowAssignmentWarning(true);
          }
        }

        if (!isSearchDirty && !searchResponse) {
          setHasEntities(false);
          return;
        }
      };

      void populate();
    }
  }, [
    getSearchFields,
    debouncedSearchTerm,
    getSearchResults,
    setHasEntities,
    selectedOrganization.id,
    searchSortOrder,
    filters,
    isSearchDirty,
  ]);

  useEffect(() => {
    if (currentFlowState === thisFlowState && !isSearchDirty && entities.length === 0) {
      onNext();
    }
  }, [entities, currentFlowState, thisFlowState, temporalSearchValue, onNext, isSearchDirty]);

  useEffect(() => {
    setProjectEntities(selectedRows);
  }, [setProjectEntities, selectedRows]);

  const _setTemporalSearchValue = (value: string) => {
    setIsSearchDirty(true);
    setTemporalSearchValue(value);
  };

  const _setFilters = (value: ProjectEntityFilters) => {
    setIsSearchDirty(true);
    setFilters({ ...filters, ...value });
  };

  return {
    entities,
    selectedRows,
    setSelectedRows,
    showAssignmentWarning,
    setShowAssignmentWarning,
    temporalSearchValue,
    setTemporalSearchValue: _setTemporalSearchValue,
    filters,
    setFilters: _setFilters,
    setSearchSortOrder,
  };
};
