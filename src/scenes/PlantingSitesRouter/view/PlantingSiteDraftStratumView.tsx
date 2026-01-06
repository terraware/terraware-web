import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';

import { Box } from '@mui/material';
import { BusySpinner, TableColumnType } from '@terraware/web-components';

import { Crumb } from 'src/components/BreadCrumbs';
import Page from 'src/components/Page';
import Card from 'src/components/common/Card';
import Search, { SearchProps } from 'src/components/common/SearchFiltersWrapper';
import Table from 'src/components/common/table';
import { APP_PATHS } from 'src/constants';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useLocalization } from 'src/providers';
import useDraftPlantingSiteGet from 'src/scenes/PlantingSitesRouter/hooks/useDraftPlantingSiteGet';
import strings from 'src/strings';

const columns = (): TableColumnType[] => [
  {
    key: 'name',
    name: strings.SUBSTRATUM,
    type: 'string',
  },
];

export default function PlantingSiteDraftStratumView(): JSX.Element | undefined {
  const { activeLocale } = useLocalization();
  const [search, setSearch] = useState<string>('');

  const { plantingSiteId, stratumId } = useParams<{ plantingSiteId: string; stratumId: string }>();
  const { site, status } = useDraftPlantingSiteGet({ draftId: Number(plantingSiteId) });

  const stratum = useMemo(() => {
    return site?.strata?.find((_stratum) => _stratum.id === Number(stratumId));
  }, [site, stratumId]);

  const navigate = useSyncNavigate();

  const searchProps = useMemo<SearchProps>(
    () => ({
      search,
      onSearch: (value: string) => setSearch(value),
    }),
    [search]
  );

  const crumbs: Crumb[] = useMemo(
    () => [
      {
        name: strings.PLANTING_SITES,
        to: APP_PATHS.PLANTING_SITES,
      },
      {
        name: activeLocale && site?.name ? `${site.name} (${strings.DRAFT})` : '',
        to: `/draft/${plantingSiteId}`,
      },
    ],
    [activeLocale, site?.name, plantingSiteId]
  );

  useEffect(() => {
    if (status === 'pending') {
      return;
    }

    if (!site || !plantingSiteId) {
      navigate(APP_PATHS.PLANTING_SITES);
    } else if (!stratum) {
      navigate(APP_PATHS.PLANTING_SITES_DRAFT_VIEW.replace(':plantingSiteId', plantingSiteId));
    }
  }, [status, site, plantingSiteId, stratum, navigate]);

  if (status === 'pending' || !site || !stratum) {
    return <BusySpinner />;
  }

  return (
    <Page crumbs={crumbs} title={stratum?.name ?? ''}>
      <Card flushMobile style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <Search {...searchProps} />
        <Box>
          <Table
            id='planting-site-stratum-details-table'
            columns={columns}
            rows={stratum?.substrata ?? []}
            orderBy='name'
          />
        </Box>
      </Card>
    </Page>
  );
}
