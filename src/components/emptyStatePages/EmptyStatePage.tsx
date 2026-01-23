import React, { type JSX, useEffect, useState } from 'react';

import { Box, Container, useTheme } from '@mui/material';

import PageHeader from 'src/components/PageHeader';
import EmptyMessage from 'src/components/common/EmptyMessage';
import { IconName } from 'src/components/common/icon/icons';
import EmptyStateContent, { ListItemContent } from 'src/components/emptyStatePages/EmptyStateContent';
import { APP_PATHS } from 'src/constants';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useOrganization } from 'src/providers/hooks';
import ImportInventoryModal, { downloadInventoryCsvTemplate } from 'src/scenes/InventoryRouter/ImportInventoryModal';
import PlantingSiteTypeSelect from 'src/scenes/PlantingSitesRouter/edit/PlantingSiteTypeSelect';
import strings from 'src/strings';
import { isContributor } from 'src/utils/organization';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import useQuery from 'src/utils/useQuery';
import useSnackbar from 'src/utils/useSnackbar';

import ImportSpeciesModal, { downloadCsvTemplate } from '../../scenes/Species/ImportSpeciesModal';
import TfMain from '../common/TfMain';

type PageContent = {
  title1?: string;
  title2: string;
  subtitle: string;
  listItems: ListItemContent[];
  buttonText?: string;
  buttonIcon?: IconName;
  linkLocation?: string;
};

type EmptyStatePageProps = {
  pageName: 'Species' | 'SeedBanks' | 'Nurseries' | 'Inventory' | 'PlantingSites' | 'Projects';
  reloadData?: () => void;
};

export default function EmptyStatePage({ pageName, reloadData }: EmptyStatePageProps): JSX.Element {
  const { selectedOrganization } = useOrganization();
  const { isMobile } = useDeviceInfo();
  const theme = useTheme();
  const navigate = useSyncNavigate();
  const snackbar = useSnackbar();

  const goToNewLocation = () => {
    const newLocation = {
      pathname: content.linkLocation,
    };
    navigate(newLocation);
  };

  const downloadCsvTemplateHandler = () => {
    void downloadCsvTemplate();
  };

  const downloadInventoryCsvTemplateHandler = () => {
    void downloadInventoryCsvTemplate();
  };

  const [importSpeciesModalOpened, setImportSpeciesModalOpened] = useState(false);
  const [importInventoryModalOpened, setImportInventoryModalOpened] = useState(false);
  const [plantingSiteTypeSelectOpen, setPlantingSiteTypeSelectOpen] = useState(false);
  const query = useQuery();

  useEffect(() => {
    if (query.get('new')) {
      setPlantingSiteTypeSelectOpen(true);
    }
  }, [query]);

  const NO_SPECIES_CONTENT: PageContent = {
    title1: strings.SPECIES,
    title2: strings.ADD_SPECIES,
    subtitle: strings.NO_SPECIES_DESCRIPTION,
    listItems: [
      {
        icon: 'uploadCloud',
        title: strings.IMPORT_SPECIES_LIST,
        description: strings.IMPORT_SPECIES_DESCRIPTION,
        buttonText: strings.IMPORT_SPECIES,
        buttonIcon: 'iconImport',
        onClickButton: () => {
          setImportSpeciesModalOpened(true);
        },
        linkText: strings.DOWNLOAD_CSV_TEMPLATE,
        onLinkClick: downloadCsvTemplateHandler,
      },
      {
        icon: 'edit',
        title: strings.ADD_MANUALLY,
        description: strings.ADD_SPECIES_MANUALLY_DESCRIPTION,
        buttonText: strings.ADD_SPECIES,
        buttonIcon: 'plus',
        onClickButton: () => {
          navigate(APP_PATHS.SPECIES_NEW);
        },
      },
    ],
  };

  const NO_INVENTORY_CONTENT: PageContent = {
    title2: strings.ADD_INVENTORY,
    subtitle: strings.NO_INVENTORY_DESCRIPTION,
    listItems: [
      {
        icon: 'uploadCloud',
        title: strings.IMPORT_INVENTORY,
        description: strings.IMPORT_INVENTORY_DESCRIPTION,
        buttonText: strings.IMPORT_INVENTORY,
        buttonIcon: 'iconImport',
        onClickButton: () => {
          setImportInventoryModalOpened(true);
        },
        linkText: strings.DOWNLOAD_CSV_TEMPLATE,
        onLinkClick: downloadInventoryCsvTemplateHandler,
      },
      {
        icon: 'edit',
        title: strings.ADD_MANUALLY,
        description: strings.ADD_INVENTORY_MANUALLY_DESCRIPTION,
        buttonText: strings.ADD_INVENTORY,
        buttonIcon: 'plus',
        onClickButton: () => {
          navigate(APP_PATHS.INVENTORY_NEW);
        },
      },
    ],
  };

  const NO_SPECIES_CONTRIBUTOR_CONTENT: PageContent = {
    title1: strings.SPECIES,
    title2: strings.REACH_OUT_TO_ADMIN_TITLE,
    subtitle: strings.NO_SPECIES_CONTRIBUTOR_MSG,
    listItems: [],
  };

  const NO_PLANTING_SITES_CONTENT: PageContent = {
    title1: strings.PLANTING_SITES,
    title2: strings.ADD_A_PLANTING_SITE,
    subtitle: strings.ADD_A_PLANTING_SITE_SUBTITLE,
    listItems: [
      {
        icon: 'blobbyIconSite',
        buttonText: strings.ADD_PLANTING_SITE,
        buttonIcon: 'plus',
        onClickButton: () => {
          setPlantingSiteTypeSelectOpen(true);
        },
      },
    ],
  };

  const NO_SEEDBANKS_CONTENT: PageContent = {
    title1: strings.SEED_BANKS,
    title2: strings.ADD_A_SEED_BANK,
    subtitle: strings.ADD_SEED_BANK_SUBTITLE,
    listItems: [
      {
        icon: 'blobbyIconSeedBank',
        title: '',
        description: '',
      },
    ],
    buttonText: strings.ADD_SEED_BANK,
    buttonIcon: 'plus',
    linkLocation: APP_PATHS.SEED_BANKS_NEW,
  };

  const NO_NURSERIES_CONTENT: PageContent = {
    title1: strings.NURSERIES,
    title2: strings.ADD_A_NURSERY,
    subtitle: strings.ADD_NURSERY_SUBTITLE,
    listItems: [
      {
        icon: 'blobbyIconNursery',
      },
    ],
    buttonText: strings.ADD_NURSERY,
    buttonIcon: 'plus',
    linkLocation: APP_PATHS.NURSERIES_NEW,
  };

  const NO_PROJECTS_CONTENT: PageContent = {
    title1: strings.PROJECTS,
    title2: strings.ADD_A_PROJECT,
    subtitle: strings.ADD_PROJECT_SUBTITLE,
    listItems: [
      {
        icon: 'blobbyIconFolder',
      },
    ],
    buttonText: strings.ADD_PROJECT,
    buttonIcon: 'plus',
    linkLocation: APP_PATHS.PROJECTS_NEW,
  };

  const pageContent = (): PageContent => {
    const contributor = isContributor(selectedOrganization);

    switch (pageName) {
      case 'Species':
        return contributor ? NO_SPECIES_CONTRIBUTOR_CONTENT : NO_SPECIES_CONTENT;
      case 'SeedBanks':
        return NO_SEEDBANKS_CONTENT;
      case 'Nurseries':
        return NO_NURSERIES_CONTENT;
      case 'Inventory':
        return NO_INVENTORY_CONTENT;
      case 'PlantingSites':
        return NO_PLANTING_SITES_CONTENT;
      case 'Projects':
        return NO_PROJECTS_CONTENT;
      default:
        return NO_SEEDBANKS_CONTENT;
    }
  };

  const content = pageContent();

  const onCloseImportSpeciesModal = (saved: boolean, snackbarMessage?: string) => {
    if (saved) {
      if (reloadData) {
        reloadData();
      }
      navigate({ pathname: APP_PATHS.SPECIES, search: '?checkData' });
    }
    setImportSpeciesModalOpened(false);
    if (snackbarMessage) {
      snackbar.toastSuccess(snackbarMessage);
    }
  };

  const onCloseImportInventoryModal = (saved: boolean, snackbarMessage?: string) => {
    if (saved) {
      if (reloadData) {
        reloadData();
      }
      navigate(APP_PATHS.INVENTORY);
    }
    setImportInventoryModalOpened(false);
    if (snackbarMessage) {
      snackbar.toastSuccess(snackbarMessage);
    }
  };

  const spacer = () => {
    return <Box sx={{ padding: theme.spacing(3) }} />;
  };

  return (
    <TfMain>
      {selectedOrganization && (
        <>
          <ImportSpeciesModal open={importSpeciesModalOpened} onClose={onCloseImportSpeciesModal} />
          <ImportInventoryModal open={importInventoryModalOpened} onClose={onCloseImportInventoryModal} />
        </>
      )}
      {plantingSiteTypeSelectOpen && <PlantingSiteTypeSelect onClose={() => setPlantingSiteTypeSelectOpen(false)} />}
      {content.title1 && (
        <>
          <PageHeader title={content.title1} subtitle='' />
          {!isMobile && spacer()}
        </>
      )}
      {content.listItems.length === 0 && content.linkLocation === undefined ? (
        <EmptyMessage
          title={content.title2}
          text={content.subtitle}
          sx={{
            margin: '0 auto',
            marginTop: '10%',
            maxWidth: '800px',
            width: isMobile ? 'auto' : '800px',
          }}
        />
      ) : (
        <Container sx={{ marginBottom: theme.spacing(8), padding: '0' }}>
          <Box
            sx={{
              background: theme.palette.TwClrBg,
              borderRadius: '24px',
              margin: 'auto',
              marginTop: `max(10vh, ${theme.spacing(8)}px)`,
              maxWidth: '800px',
              padding: '24px',
            }}
          >
            <EmptyStateContent
              title={content.title2}
              subtitle={content.subtitle}
              listItems={content.listItems}
              buttonText={content.buttonText}
              buttonIcon={content.buttonIcon}
              onClickButton={goToNewLocation}
            />
          </Box>
        </Container>
      )}
    </TfMain>
  );
}
