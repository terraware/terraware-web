import React, { type JSX, useCallback, useMemo, useRef, useState } from 'react';

import { Box, Container, Grid, Typography, useTheme } from '@mui/material';
import { Button, DropdownItem, Tabs } from '@terraware/web-components';

import PageSnackbar from 'src/components/PageSnackbar';
import EmptyMessage from 'src/components/common/EmptyMessage';
import { downloadCsvTemplateHandler } from 'src/components/common/ImportModal';
import OptionsMenu from 'src/components/common/OptionsMenu';
import PageHeaderWrapper from 'src/components/common/PageHeaderWrapper';
import TfMain from 'src/components/common/TfMain';
import { APP_PATHS } from 'src/constants';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useLocalization, useOrganization } from 'src/providers';
import NurseryInventoryService, { SearchInventoryParams } from 'src/services/NurseryInventoryService';
import { isAdmin } from 'src/utils/organization';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import useStickyTabs from 'src/utils/useStickyTabs';

import DownloadReportModal from './DownloadReportModal';
import ImportInventoryModal from './ImportInventoryModal';
import InventoryListByBatch from './InventoryListByBatch';
import InventoryListByNursery from './InventoryListByNursery';
import InventoryListBySpecies from './InventoryListBySpecies';

export const InventoryListTypes: Record<string, string> = {
  BATCHES_BY_SPECIES: 'batches_by_species',
  BATCHES_BY_NURSERY: 'batches_by_nursery',
  BATCHES_BY_BATCH: 'batches_by_batch',
} as const;

type InventoryListTypeKeys = keyof typeof InventoryListTypes;
export type InventoryListType = (typeof InventoryListTypes)[InventoryListTypeKeys];

export type FacilityName = {
  facility_name: string;
};

export type SpeciesName = {
  species_scientificName: string;
};

export type InventoryResult = {
  facility_id: string;
  species_id: string;
  species_scientificName: string;
  species_commonName?: string;
  germinatingQuantity: string;
  hardeningOffQuantity: string;
  activeGrowthQuantity: string;
  readyQuantity: string;
  totalQuantity: string;
  facilityInventories: FacilityName[];
};

export type SpeciesInventoryResult = {
  id: string;
  scientificName: string;
  commonName?: string;
  inventory?: {
    'germinatingQuantity(raw)': string;
    'hardeningOffQuantity(raw)': string;
    'readyQuantity(raw)': string;
    'activeGrowthQuantity(raw)': string;
    'totalQuantity(raw)': string;
    facilityInventories: FacilityName[];
  };
};

export type FacilitySpeciesInventoryResult = {
  facility_id: string;
  facility_name: string;
  germinatingQuantity: string;
  hardeningOffQuantity: string;
  readyQuantity: string;
  activeGrowthQuantity: string;
  totalQuantity: string;
  'totalQuantity(raw)': string;
  facilityInventories?: {
    species_id: string;
    species_scientificName: string;
    batches: {
      id: string;
    }[];
  }[];
};

export type InventoryResultWithFacilityNames = Omit<InventoryResult, 'facilityInventories'> & {
  facilityInventories: string;
};

export type InventoryResultWithBatchNumber = Omit<InventoryResult, 'facilityInventories'> & {
  batchId: string;
  batchNumber: string;
  facility_name_noLink: string;
  species_scientificName_noLink: string;
};

export type FacilityInventoryResult = {
  facility_id: string;
  facility_name: string;
  species_id: string;
  species_scientificName: string;
  species_commonName?: string;
  'germinatingQuantity(raw)': string;
  'hardeningOffQuantity(raw)': string;
  'readyQuantity(raw)': string;
  'activeGrowthQuantity(raw)': string;
  'totalQuantity(raw)': string;
};

export type BatchInventoryResult = {
  id: string;
  batchNumber: string;
  facility_id: string;
  facility_name: string;
  species_id: string;
  species_scientificName: string;
  species_commonName?: string;
  germinatingQuantity: string;
  hardeningOffQuantity: string;
  activeGrowthQuantity: string;
  readyQuantity: string;
  subLocations: string;
  totalQuantity: string;
  'germinatingQuantity(raw)': string;
  'hardeningOffQuantity(raw)': string;
  'readyQuantity(raw)': string;
  'activeGrowthQuantity(raw)': string;
  'totalQuantity(raw)': string;
};

type InventoryProps = {
  hasNurseries: boolean;
  hasSpecies: boolean;
};

export default function InventoryV2View(props: InventoryProps): JSX.Element {
  const { activeLocale, strings } = useLocalization();
  const { selectedOrganization } = useOrganization();
  const { isMobile } = useDeviceInfo();
  const theme = useTheme();
  const navigate = useSyncNavigate();
  const { hasNurseries, hasSpecies } = props;
  const [importInventoryModalOpen, setImportInventoryModalOpen] = useState(false);
  const contentRef = useRef(null);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportData, setReportData] = useState<SearchInventoryParams>();

  const messageStyles = {
    margin: '0 auto',
    maxWidth: '800px',
    padding: '48px',
    width: isMobile ? 'auto' : '800px',
  };

  const goTo = useCallback(
    (appPath: string) => {
      navigate({ pathname: appPath });
    },
    [navigate]
  );

  const onCloseDownloadReportModal = useCallback(() => {
    setReportModalOpen(false);
  }, [setReportModalOpen]);

  const onDownloadReport = useCallback(() => {
    setReportModalOpen(true);
  }, [setReportModalOpen]);

  const isOnboarded = hasNurseries && hasSpecies;

  const onOptionItemClick = useCallback(
    (optionItem: DropdownItem) => {
      if (optionItem.value === 'import') {
        setImportInventoryModalOpen(true);
      }
      if (optionItem.value === 'export') {
        onDownloadReport();
      }
    },
    [onDownloadReport, setImportInventoryModalOpen]
  );

  const importInventory = () => {
    setImportInventoryModalOpen(true);
  };

  const getEmptyState = () => {
    const emptyState = [];

    if (!hasNurseries) {
      emptyState.push({
        title: strings.ADD_NURSERIES,
        text: strings.INVENTORY_ONBOARDING_NURSERIES_MSG,
        buttonText: strings.GO_TO_NURSERIES,
        onClick: () => goTo(APP_PATHS.NURSERIES),
      });
    }

    if (!hasSpecies) {
      emptyState.push({
        title: strings.CREATE_SPECIES_LIST,
        text: strings.INVENTORY_ONBOARDING_SPECIES_MSG,
        buttonText: strings.GO_TO_SPECIES,
        onClick: () => goTo(APP_PATHS.SPECIES),
        disabled: !hasNurseries,
        altItem: {
          title: strings.IMPORT_INVENTORY_ALT_TITLE,
          text: strings.IMPORT_INVENTORY_WITH_TEMPLATE,
          linkText: strings.DOWNLOAD_THE_CSV_TEMPLATE,
          onLinkClick: () => downloadCsvTemplateHandler(NurseryInventoryService.downloadInventoryTemplate),
          buttonText: strings.IMPORT_INVENTORY,
          onClick: () => importInventory(),
        },
      });
    }

    return emptyState;
  };

  const tabs = useMemo(() => {
    if (!activeLocale || !isOnboarded) {
      return [];
    }

    return [
      {
        id: InventoryListTypes.BATCHES_BY_SPECIES,
        label: strings.BY_SPECIES,
        children: <InventoryListBySpecies setReportData={setReportData} />,
      },
      {
        id: InventoryListTypes.BATCHES_BY_NURSERY,
        label: strings.BY_NURSERY,
        children: <InventoryListByNursery setReportData={setReportData} />,
      },
      {
        id: InventoryListTypes.BATCHES_BY_BATCH,
        label: strings.BY_BATCH,
        children: <InventoryListByBatch setReportData={setReportData} />,
      },
    ];
  }, [activeLocale, isOnboarded, strings, setReportData]);

  const { activeTab, onChangeTab } = useStickyTabs({
    defaultTab: InventoryListTypes.BATCHES_BY_SPECIES,
    tabs,
    viewIdentifier: 'inventory',
  });

  const onCloseImportInventoryModal = useCallback(() => setImportInventoryModalOpen(false), []);

  const navigateToInventoryCreateView = useCallback(() => goTo(APP_PATHS.INVENTORY_NEW), [goTo]);

  return (
    <TfMain>
      <ImportInventoryModal open={importInventoryModalOpen} onClose={onCloseImportInventoryModal} />
      {reportData && (
        <DownloadReportModal
          reportData={reportData}
          open={reportModalOpen}
          onClose={onCloseDownloadReportModal}
          tab={activeTab}
        />
      )}
      <PageHeaderWrapper nextElement={contentRef.current}>
        <Box sx={{ paddingBottom: theme.spacing(4), paddingLeft: theme.spacing(3) }}>
          <Grid container>
            <Grid item xs={6}>
              <Typography fontSize='24px' fontWeight={600}>
                {strings.INVENTORY}
              </Typography>
              <Typography
                sx={{
                  fontWeight: 400,
                  paddingTop: theme.spacing(1.5),
                  fontSize: '14px',
                  lineHeight: '20px',
                }}
              >
                {strings.INVENTORY_PAGE_DESCRIPTION}
              </Typography>
            </Grid>
            {isOnboarded ? (
              <Grid item xs={6} sx={{ textAlign: 'right' }}>
                {isMobile ? (
                  <Button id='new-inventory' icon='plus' onClick={navigateToInventoryCreateView} size='medium' />
                ) : (
                  <>
                    <Box sx={{ display: 'inline', paddingLeft: 1 }}>
                      <Button
                        id='new-inventory'
                        icon='plus'
                        label={strings.ADD_INVENTORY}
                        onClick={navigateToInventoryCreateView}
                        size='medium'
                      />
                    </Box>
                    <OptionsMenu
                      onOptionItemClick={onOptionItemClick}
                      optionItems={[
                        { label: strings.IMPORT, value: 'import' },
                        { label: strings.EXPORT, value: 'export' },
                      ]}
                    />
                  </>
                )}
              </Grid>
            ) : null}
          </Grid>
        </Box>
      </PageHeaderWrapper>
      <PageSnackbar />
      <Box
        ref={contentRef}
        display='flex'
        flexDirection='column'
        flexGrow={1}
        sx={{
          '& .MuiTabPanel-root[hidden]': {
            flexGrow: 0,
          },
          '& .MuiTabPanel-root': {
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 1,
          },
          '& >.MuiBox-root': {
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 1,
          },
        }}
      >
        {isOnboarded ? (
          <Tabs activeTab={activeTab} onChangeTab={onChangeTab} tabs={tabs} />
        ) : (
          <Container maxWidth={false} sx={{ padding: '32px 0' }}>
            {!isMobile && <Grid item xs={12} padding={theme.spacing(3)} />}
            {isAdmin(selectedOrganization) ? (
              <EmptyMessage title={strings.ONBOARDING_ADMIN_TITLE} rowItems={getEmptyState()} sx={messageStyles} />
            ) : (
              <EmptyMessage
                title={strings.REACH_OUT_TO_ADMIN_TITLE}
                text={strings.NO_NURSERIES_NON_ADMIN_MSG}
                sx={messageStyles}
              />
            )}
          </Container>
        )}
      </Box>
    </TfMain>
  );
}
