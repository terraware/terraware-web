import { Box, Container, Grid, Theme, Typography, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';
import strings from 'src/strings';
import { APP_PATHS } from 'src/constants';
import TfMain from 'src/components/common/TfMain';
import PageSnackbar from 'src/components/PageSnackbar';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import ImportInventoryModal from './ImportInventoryModal';
import PageHeaderWrapper from 'src/components/common/PageHeaderWrapper';
import { Button, DropdownItem, Tabs } from '@terraware/web-components';
import OptionsMenu from 'src/components/common/OptionsMenu';
import { makeStyles } from '@mui/styles';
import useQuery from 'src/utils/useQuery';
import useStateLocation, { getLocation } from 'src/utils/useStateLocation';
import { isAdmin } from 'src/utils/organization';
import EmptyMessage from 'src/components/common/EmptyMessage';
import { downloadCsvTemplateHandler } from 'src/components/common/ImportModal';
import NurseryInventoryService, { SearchInventoryParams } from 'src/services/NurseryInventoryService';
import { useOrganization } from 'src/providers';
import InventoryListBySpecies from 'src/components/InventoryV2/InventoryListBySpecies';
import InventoryListByNursery from './InventoryListByNursery';
import DownloadReportModal from './DownloadReportModal';

export type FacilityName = {
  facility_name: string;
};

export type InventoryResult = {
  facility_id: string;
  species_id: string;
  species_scientificName: string;
  species_commonName?: string;
  germinatingQuantity: string;
  notReadyQuantity: string;
  readyQuantity: string;
  totalQuantity: string;
  facilityInventories: FacilityName[];
};

export type InventoryResultWithFacilityNames = Omit<InventoryResult, 'facilityInventories'> & {
  facilityInventories: string;
};

export type InventoryResultWithSpeciesNames = Omit<InventoryResult, 'facilityInventories'> & {
  facility_name: string;
  speciesNames: string;
};

export type FacilityInventoryResult = {
  facility_id: string;
  facility_name: string;
  species_id: string;
  species_scientificName: string;
  species_commonName?: string;
  'germinatingQuantity(raw)': string;
  'readyQuantity(raw)': string;
  'notReadyQuantity(raw)': string;
  'totalQuantity(raw)': string;
};

interface StyleProps {
  isMobile: boolean;
}

const useStyles = makeStyles((theme: Theme) => ({
  tabs: {
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
  },
  mainContainer: {
    padding: '32px 0',
  },
  message: {
    margin: '0 auto',
    maxWidth: '800px',
    padding: '48px',
    width: (props: StyleProps) => (props.isMobile ? 'auto' : '800px'),
  },
  actionMenuIcon: {
    fill: theme.palette.TwClrTxtBrand,
  },
}));

type InventoryProps = {
  hasNurseries: boolean;
  hasSpecies: boolean;
};
export default function Inventory(props: InventoryProps): JSX.Element {
  const { selectedOrganization } = useOrganization();
  const { isMobile } = useDeviceInfo();
  const theme = useTheme();
  const classes = useStyles({ isMobile });
  const history = useHistory();
  const location = useStateLocation();
  const { hasNurseries, hasSpecies } = props;
  const [importInventoryModalOpen, setImportInventoryModalOpen] = useState(false);
  const contentRef = useRef(null);
  const query = useQuery();
  const tab = query.get('tab') || 'batches_by_species';
  const [activeTab, setActiveTab] = useState<string>(tab);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportData, setReportData] = useState<SearchInventoryParams>();

  const onTabChange = useCallback(
    (newTab: string) => {
      query.set('tab', newTab);
      history.push(getLocation(location.pathname, location, query.toString()));
    },
    [query, history, location]
  );

  useEffect(() => {
    setActiveTab(tab);
  }, [tab]);

  const goTo = (appPath: string) => {
    const appPathLocation = {
      pathname: appPath,
    };
    history.push(appPathLocation);
  };

  const onCloseDownloadReportModal = () => {
    setReportModalOpen(false);
  };

  const onDownloadReport = () => {
    setReportModalOpen(true);
  };

  const isOnboarded = hasNurseries && hasSpecies;
  const onOptionItemClick = (optionItem: DropdownItem) => {
    if (optionItem.value === 'import') {
      setImportInventoryModalOpen(true);
    }
    if (optionItem.value === 'export') {
      onDownloadReport();
    }
  };

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

  return (
    <TfMain backgroundImageVisible={!isOnboarded}>
      <ImportInventoryModal open={importInventoryModalOpen} onClose={() => setImportInventoryModalOpen(false)} />
      <DownloadReportModal reportData={reportData} open={reportModalOpen} onClose={onCloseDownloadReportModal} />
      <PageHeaderWrapper nextElement={contentRef.current}>
        <Box sx={{ paddingBottom: theme.spacing(4), paddingLeft: theme.spacing(3) }}>
          <Grid container>
            <Grid item xs={6}>
              <Typography fontSize='24px' fontWeight={600}>
                {strings.INVENTORY}
              </Typography>
            </Grid>
            {isOnboarded ? (
              <Grid item xs={6} sx={{ textAlign: 'right' }}>
                {isMobile ? (
                  <Button id='new-inventory' icon='plus' onClick={() => goTo(APP_PATHS.INVENTORY_NEW)} size='medium' />
                ) : (
                  <>
                    <Box sx={{ display: 'inline', paddingLeft: 1 }}>
                      <Button
                        id='new-inventory'
                        icon='plus'
                        label={strings.ADD_INVENTORY}
                        onClick={() => goTo(APP_PATHS.INVENTORY_NEW)}
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
      <Box ref={contentRef} display='flex' flexDirection='column' flexGrow={1} className={classes.tabs}>
        {isOnboarded ? (
          <Tabs
            activeTab={activeTab}
            onTabChange={onTabChange}
            tabs={[
              {
                id: 'batches_by_species',
                label: strings.BY_SPECIES,
                children: <InventoryListBySpecies setReportData={setReportData} />,
              },
              {
                id: 'batches_by_nursery',
                label: strings.BY_NURSERY,
                children: <InventoryListByNursery setReportData={setReportData} />,
              },
              {
                id: 'batches_by_batch',
                label: strings.BY_BATCH,
                children: 'TODO: Inventory List by Batch',
              },
            ]}
          />
        ) : (
          <Container maxWidth={false} className={classes.mainContainer}>
            {isAdmin(selectedOrganization) ? (
              <EmptyMessage
                className={classes.message}
                title={strings.ONBOARDING_ADMIN_TITLE}
                rowItems={getEmptyState()}
              />
            ) : (
              <EmptyMessage
                className={classes.message}
                title={strings.REACH_OUT_TO_ADMIN_TITLE}
                text={strings.NO_NURSERIES_NON_ADMIN_MSG}
              />
            )}
          </Container>
        )}
      </Box>
    </TfMain>
  );
}
