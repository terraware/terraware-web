import React, { ReactNode, useEffect, useMemo } from 'react';

import { TableColumnType } from '@terraware/web-components';

import Page from 'src/components/Page';
import ClientSideFilterTable from 'src/components/Tables/ClientSideFilterTable';
import { FilterConfig } from 'src/components/common/SearchFiltersWrapperV2';
import Button from 'src/components/common/button/Button';
import useNavigateTo from 'src/hooks/useNavigateTo';
import { useLocalization, useUser } from 'src/providers';
import { useListFundingEntitiesQuery } from 'src/queries/funder/fundingEntities';
import strings from 'src/strings';
import { SearchSortOrder } from 'src/types/Search';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import useSnackbar from 'src/utils/useSnackbar';

import FundingEntitiesCellRenderer from './FundingEntitiesCellRenderer';

const fuzzySearchColumns = ['name'];

const columns = (activeLocale: string | null): TableColumnType[] =>
  activeLocale
    ? [
        { key: 'name', name: strings.FUNDING_ENTITY_NAME, type: 'string' },
        { key: 'projects', name: strings.PROJECT_OR_PROJECTS, type: 'string' },
      ]
    : [];

const FundingEntitiesListView = () => {
  const snackbar = useSnackbar();
  const { activeLocale } = useLocalization();
  const { isAllowed } = useUser();
  const { isMobile } = useDeviceInfo();
  const { goToNewFundingEntity } = useNavigateTo();
  const { data: fundingEntities, error } = useListFundingEntitiesQuery();

  const defaultSortOrder: SearchSortOrder = {
    field: 'name',
    direction: 'Ascending',
  };

  useEffect(() => {
    if (error) {
      snackbar.toastError(strings.GENERIC_ERROR);
    }
  }, [error, snackbar]);

  const allProjects = useMemo<Record<string, string>>(
    () =>
      (fundingEntities || []).reduce(
        (record, entity) => {
          entity?.projects?.forEach((project) => {
            if (project.projectId !== undefined) {
              record[project.projectId] = project.dealName || '';
            }
          });
          return record;
        },
        {} as Record<string, string>
      ),
    [fundingEntities]
  );

  const featuredFilters: FilterConfig[] = useMemo(
    () => [
      {
        field: 'projects.projectId',
        id: 'projects.projectId',
        label: strings.PROJECT,
        options: Object.entries(allProjects)
          .sort((a, b) => a[1].toLowerCase().localeCompare(b[1].toLowerCase(), activeLocale || undefined))
          .map((entry) => entry[0]),
        pillValueRenderer: (values: (string | number | null)[]) => {
          return values.map((value) => allProjects[value || ''] || '').join(', ');
        },
        renderOption: (id: string | number) => allProjects[id] || '',
      },
    ],
    [allProjects, activeLocale]
  );

  const actionMenus = useMemo<ReactNode | null>(() => {
    const canCreateFundingEntities = isAllowed('MANAGE_FUNDING_ENTITIES');

    if (!activeLocale || !canCreateFundingEntities) {
      return null;
    }

    return (
      <Button
        icon='plus'
        id='new-funding-entity'
        onClick={goToNewFundingEntity}
        priority='primary'
        label={isMobile ? '' : strings.ADD_FUNDING_ENTITY}
        size='medium'
      />
    );
  }, [activeLocale, goToNewFundingEntity, isAllowed, isMobile]);

  return (
    <Page title={strings.FUNDING_ENTITIES} rightComponent={actionMenus}>
      <ClientSideFilterTable
        columns={columns}
        defaultSortOrder={defaultSortOrder}
        fuzzySearchColumns={fuzzySearchColumns}
        featuredFilters={featuredFilters}
        id='fundingEntitiesTable'
        rows={fundingEntities ?? []}
        isClickable={() => false}
        showTopBar
        Renderer={FundingEntitiesCellRenderer}
      />
    </Page>
  );
};

export default FundingEntitiesListView;
