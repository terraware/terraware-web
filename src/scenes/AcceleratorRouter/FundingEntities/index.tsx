import React, { useEffect, useMemo, useState } from 'react';

import { TableColumnType } from '@terraware/web-components';

import Page from 'src/components/Page';
import ClientSideFilterTable from 'src/components/Tables/ClientSideFilterTable';
import { FilterConfig } from 'src/components/common/SearchFiltersWrapperV2';
import { useLocalization } from 'src/providers';
import { requestFundingEntities } from 'src/redux/features/funder/fundingEntitiesAsyncThunks';
import { selectFundingEntitiesRequest } from 'src/redux/features/funder/fundingEntitiesSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { FundingEntity } from 'src/types/FundingEntity';
import { SearchSortOrder } from 'src/types/Search';
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

const FundingEntitiesView = () => {
  const dispatch = useAppDispatch();
  const [listRequestId, setListRequestId] = useState('');
  const listRequest = useAppSelector(selectFundingEntitiesRequest(listRequestId));
  const [fundingEntities, setFundingEntities] = useState<FundingEntity[]>([]);
  const snackbar = useSnackbar();
  const { activeLocale } = useLocalization();

  const defaultSortOrder: SearchSortOrder = {
    field: 'name',
    direction: 'Ascending',
  };

  useEffect(() => {
    if (activeLocale) {
      const request = dispatch(requestFundingEntities());
      setListRequestId(request.requestId);
    }
  }, [activeLocale]);

  useEffect(() => {
    if (!listRequest) {
      return;
    }

    if (listRequest.status === 'success' && listRequest.data?.fundingEntities) {
      setFundingEntities(listRequest.data.fundingEntities);
    } else if (listRequest.status === 'error') {
      snackbar.toastError(strings.GENERIC_ERROR);
    }
  }, [listRequest, snackbar]);

  const allProjects = useMemo<Record<string, string>>(
    () =>
      (fundingEntities || []).reduce(
        (record, entity) => {
          entity?.projects?.forEach((project) => (record[project.id] = project.name));
          return record;
        },
        {} as Record<string, string>
      ),
    [fundingEntities]
  );

  const featuredFilters: FilterConfig[] = useMemo(
    () => [
      {
        field: 'projects_id',
        id: 'projects_id',
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
    [allProjects, fundingEntities]
  );

  return (
    <Page title={strings.FUNDING_ENTITIES}>
      <ClientSideFilterTable
        columns={columns}
        defaultSortOrder={defaultSortOrder}
        fuzzySearchColumns={fuzzySearchColumns}
        featuredFilters={featuredFilters}
        id='fundingEntitiesTable'
        rows={fundingEntities}
        isClickable={() => false}
        showTopBar
        Renderer={FundingEntitiesCellRenderer}
      />
    </Page>
  );
};

export default FundingEntitiesView;
