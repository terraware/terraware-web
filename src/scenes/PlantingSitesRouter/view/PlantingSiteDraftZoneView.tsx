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
import { useGetDraftPlantingSiteQuery } from 'src/queries/generated/draftPlantingSites';
import strings from 'src/strings';
import { toDraft } from 'src/utils/draftPlantingSiteUtils';

const columns = (): TableColumnType[] => [
  {
    key: 'fullName',
    name: strings.SUBZONE,
    type: 'string',
  },
];

export default function PlantingSiteDraftZoneView(): JSX.Element | undefined {
  const { activeLocale } = useLocalization();
  const [search, setSearch] = useState<string>('');

  const { plantingSiteId, zoneId } = useParams<{ plantingSiteId: string; zoneId: string }>();

  const { data: result, isLoading } = useGetDraftPlantingSiteQuery(Number(plantingSiteId));
  const site = useMemo(() => (result?.site ? toDraft(result.site) : undefined), [result?.site]);

  const plantingZone = useMemo(() => {
    return site?.plantingZones?.find((zone) => zone.id === Number(zoneId));
  }, [site, zoneId]);

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
    if (isLoading) {
      return;
    }

    if (!site || !plantingSiteId) {
      navigate(APP_PATHS.PLANTING_SITES);
    } else if (!plantingZone) {
      navigate(APP_PATHS.PLANTING_SITES_DRAFT_VIEW.replace(':plantingSiteId', plantingSiteId));
    }
  }, [isLoading, site, plantingSiteId, plantingZone, navigate]);

  if (isLoading || !site || !plantingZone) {
    return <BusySpinner />;
  }

  return (
    <Page crumbs={crumbs} title={plantingZone?.name ?? ''}>
      <Card flushMobile style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <Search {...searchProps} />
        <Box>
          <Table
            id='planting-site-zone-details-table'
            columns={columns}
            rows={plantingZone?.plantingSubzones ?? []}
            orderBy='fullName'
          />
        </Box>
      </Card>
    </Page>
  );
}
