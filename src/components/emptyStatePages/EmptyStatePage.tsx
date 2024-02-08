import React, { useState } from 'react';
import { useHistory } from 'react-router';
import EmptyStateContent, { ListItemContent } from 'src/components/emptyStatePages/EmptyStateContent';
import PageHeader from 'src/components/seeds/PageHeader';
import { APP_PATHS } from 'src/constants';
import strings from 'src/strings';
import AddSpeciesModal from '../../scenes/Species/AddSpeciesModal';
import ImportSpeciesModal, { downloadCsvTemplate } from '../../scenes/Species/ImportSpeciesModal';
import TfMain from '../common/TfMain';
import { Container, Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import useSnackbar from 'src/utils/useSnackbar';
import { IconName } from 'src/components/common/icon/icons';
import { isContributor } from 'src/utils/organization';
import EmptyMessage from 'src/components/common/EmptyMessage';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import ImportInventoryModal, { downloadInventoryCsvTemplate } from 'src/scenes/InventoryRouter/ImportInventoryModal';
import PlantingSiteTypeSelect from 'src/scenes/PlantingSitesRouter/edit/PlantingSiteTypeSelect';
import { useOrganization } from 'src/providers/hooks';

interface StyleProps {
  isMobile: boolean;
}

const useStyles = makeStyles((theme: Theme) => ({
  mainContainer: {
    marginBottom: theme.spacing(8),
    padding: '0',
  },
  content: {
    background: theme.palette.TwClrBg,
    borderRadius: '24px',
    margin: 'auto',
    marginTop: `max(10vh, ${theme.spacing(8)}px)`,
    maxWidth: '800px',
    padding: '24px',
  },
  message: {
    margin: '0 auto',
    marginTop: '10%',
    maxWidth: '800px',
    width: (props: StyleProps) => (props.isMobile ? 'auto' : '800px'),
  },
  spacer: {
    padding: theme.spacing(3),
  },
}));

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
  backgroundImageVisible?: boolean;
  pageName: 'Species' | 'SeedBanks' | 'Nurseries' | 'Inventory' | 'PlantingSites' | 'Projects';
  reloadData?: () => void;
};

export default function EmptyStatePage({
  backgroundImageVisible = true,
  pageName,
  reloadData,
}: EmptyStatePageProps): JSX.Element {
  const { selectedOrganization } = useOrganization();
  const { isMobile } = useDeviceInfo();
  const classes = useStyles({ isMobile });
  const history = useHistory();
  const snackbar = useSnackbar();

  const goToNewLocation = () => {
    const newLocation = {
      pathname: content.linkLocation,
    };
    history.push(newLocation);
  };

  const downloadCsvTemplateHandler = () => {
    downloadCsvTemplate();
  };

  const downloadInventoryCsvTemplateHandler = () => {
    downloadInventoryCsvTemplate();
  };

  const [addSpeciesModalOpened, setAddSpeciesModalOpened] = useState(false);
  const [importSpeciesModalOpened, setImportSpeciesModalOpened] = useState(false);
  const [importInventoryModalOpened, setImportInventoryModalOpened] = useState(false);
  const [plantingSiteTypeSelectOpen, setPlantingSiteTypeSelectOpen] = useState(false);

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
          setAddSpeciesModalOpened(true);
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
          history.push(APP_PATHS.INVENTORY_NEW);
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
    const contributor = selectedOrganization && isContributor(selectedOrganization);

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

  const onCloseEditSpeciesModal = (saved: boolean, snackbarMessage?: string) => {
    if (saved) {
      if (reloadData) {
        reloadData();
      }
      history.push({ pathname: APP_PATHS.SPECIES, search: '?checkData' });
    }
    setAddSpeciesModalOpened(false);
    if (snackbarMessage) {
      snackbar.toastSuccess(snackbarMessage);
    }
  };

  const onCloseImportSpeciesModal = (saved: boolean, snackbarMessage?: string) => {
    if (saved) {
      if (reloadData) {
        reloadData();
      }
      history.push({ pathname: APP_PATHS.SPECIES, search: '?checkData' });
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
      history.push(APP_PATHS.INVENTORY);
    }
    setImportInventoryModalOpened(false);
    if (snackbarMessage) {
      snackbar.toastSuccess(snackbarMessage);
    }
  };

  const spacer = () => {
    return <div className={classes.spacer} />;
  };

  return (
    <TfMain backgroundImageVisible={backgroundImageVisible}>
      {selectedOrganization && (
        <>
          <AddSpeciesModal open={addSpeciesModalOpened} onClose={onCloseEditSpeciesModal} />
          <ImportSpeciesModal open={importSpeciesModalOpened} onClose={onCloseImportSpeciesModal} />
          <ImportInventoryModal open={importInventoryModalOpened} onClose={onCloseImportInventoryModal} />
        </>
      )}
      <PlantingSiteTypeSelect open={plantingSiteTypeSelectOpen} onClose={() => setPlantingSiteTypeSelectOpen(false)} />
      {content.title1 && (
        <>
          <PageHeader title={content.title1} subtitle='' />
          {!isMobile && spacer()}
        </>
      )}
      {content.listItems.length === 0 && content.linkLocation === undefined ? (
        <EmptyMessage className={classes.message} title={content.title2} text={content.subtitle} />
      ) : (
        <Container className={classes.mainContainer}>
          <div className={classes.content}>
            <EmptyStateContent
              title={content.title2}
              subtitle={content.subtitle}
              listItems={content.listItems}
              buttonText={content.buttonText}
              buttonIcon={content.buttonIcon}
              onClickButton={goToNewLocation}
            />
          </div>
        </Container>
      )}
    </TfMain>
  );
}
