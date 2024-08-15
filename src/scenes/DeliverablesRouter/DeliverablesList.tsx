import React, { useCallback, useMemo, useState } from 'react';

import { Grid, Typography } from '@mui/material';
import { Dropdown, DropdownItem, Separator } from '@terraware/web-components';

import DeliverablesTable from 'src/components/DeliverablesTable';
import PageHeader from 'src/components/PageHeader';
import PageHeaderWrapper from 'src/components/common/PageHeaderWrapper';
import { FilterConfig } from 'src/components/common/SearchFiltersWrapperV2';
import TfMain from 'src/components/common/TfMain';
import { useLocalization, useOrganization } from 'src/providers';
import { useParticipantData } from 'src/providers/Participant/ParticipantContext';
import strings from 'src/strings';
import theme from 'src/theme';
import { ListDeliverablesElement } from 'src/types/Deliverables';
import { SearchNodePayload } from 'src/types/Search';
import {
  SearchAndSortFn,
  SearchNodeModifyConfig,
  SearchOrderConfig,
  searchAndSort as genericSearchAndSort,
  modifySearchNode,
} from 'src/utils/searchAndSort';

const DeliverablesList = (): JSX.Element => {
  const { activeLocale } = useLocalization();
  const { selectedOrganization } = useOrganization();
  const { participantProjects, currentParticipantProject, moduleProjects, setCurrentParticipantProject } =
    useParticipantData();
  const [allSelected, setAllSelected] = useState(false);

  const extraTableFilters: SearchNodePayload[] = useMemo(
    () =>
      !allSelected && currentParticipantProject?.id
        ? [
            {
              operation: 'field',
              field: 'projectId',
              type: 'Exact',
              values: [`${currentParticipantProject.id}`],
            },
          ]
        : [],
    [allSelected, currentParticipantProject]
  );

  const filterModifiers = useCallback(
    (filters: FilterConfig[]) =>
      filters.map((filter: FilterConfig) => {
        if (filter.field !== 'status') {
          return filter;
        }

        // In the participant view, "needs translation" needs to be "in review", so we will remove "needs translation" as an option
        return {
          ...filter,
          options: filter.options.filter((option) => option !== 'Needs Translation'),
        };
      }),
    []
  );

  const searchAndSort: SearchAndSortFn<ListDeliverablesElement> = useCallback(
    (results: ListDeliverablesElement[], search?: SearchNodePayload, sortOrderConfig?: SearchOrderConfig) => {
      // In the participant view, "needs translation" needs to be "in review", so we will coerce results with "needs translation"
      // into the filter rules for "in review"
      // We need to find the search node payload that contains the "status" filter and add "needs translation" as a search value
      const modifyStatus: SearchNodeModifyConfig = {
        field: 'status',
        operation: 'APPEND',
        values: ['Needs Translation'],
        condition: (values) => values.includes('In Review'),
      };

      const modifiedSearch = modifySearchNode(modifyStatus, search);
      return genericSearchAndSort(results, modifiedSearch, sortOrderConfig);
    },
    []
  );

  const options: DropdownItem[] = useMemo(() => {
    const optionsToReturn = moduleProjects?.map((project) => ({
      label: project.name,
      value: project.id,
    }));
    optionsToReturn.push({
      label: strings.ALL,
      value: -1,
    });
    return optionsToReturn;
  }, [moduleProjects]);

  const selectStyles = {
    arrow: {
      height: '32px',
    },
    input: {
      fontSize: '24px',
      fontWeight: '600',
      lineHeight: '32px',
    },
    inputContainer: {
      border: 0,
      backgroundColor: 'initial',
    },
  };

  const onProjectChange = (newValue: string) => {
    if (newValue.toString() === '-1') {
      setAllSelected(true);
    } else {
      setCurrentParticipantProject(newValue);
      setAllSelected(false);
    }
  };

  const PageHeaderLeftComponent = useMemo(
    () =>
      activeLocale ? (
        <>
          <Grid container sx={{ marginTop: theme.spacing(0.5) }}>
            <Grid item>
              <Separator height={'40px'} />
            </Grid>
            <Grid item>
              {options?.length > 1 ? (
                <Dropdown
                  onChange={onProjectChange}
                  options={options}
                  selectStyles={selectStyles}
                  selectedValue={allSelected ? -1 : currentParticipantProject?.id}
                />
              ) : (
                <Typography sx={selectStyles.input}>{options[0].label}</Typography>
              )}
            </Grid>
          </Grid>
        </>
      ) : null,
    [activeLocale, participantProjects, currentParticipantProject, allSelected]
  );

  return (
    <TfMain>
      <PageHeaderWrapper>
        <PageHeader title={strings.DELIVERABLES} leftComponent={PageHeaderLeftComponent} />
      </PageHeaderWrapper>

      <DeliverablesTable
        extraTableFilters={extraTableFilters}
        filterModifiers={filterModifiers}
        organizationId={selectedOrganization.id}
        searchAndSort={searchAndSort}
        tableId={'participantDeliverablesTable'}
      />
    </TfMain>
  );
};

export default DeliverablesList;
