import React, { useState } from 'react';
import { useHistory } from 'react-router';
import EmptyStateContent, { ListItemContent } from 'src/components/emptyStatePages/EmptyStateContent';
import PageHeader from 'src/components/seeds/PageHeader';
import { APP_PATHS } from 'src/constants';
import strings from 'src/strings';
import emptyStateStrings from 'src/strings/emptyStatePages';
import dictionary from 'src/strings/dictionary';
import AddSpeciesModal from '../Species/AddSpeciesModal';
import { useSetRecoilState } from 'recoil';
import { ServerOrganization } from 'src/types/Organization';
import ImportSpeciesModal, { downloadCsvTemplate } from '../Species/ImportSpeciesModal';
import TfMain from '../common/TfMain';
import speciesAtom from 'src/state/species';
import { Container, Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import useSnackbar from 'src/utils/useSnackbar';
import { IconName } from 'src/components/common/icon/icons';
import { isContributor } from 'src/utils/organization';
import emptyMessageStrings from 'src/strings/emptyMessageModal';
import EmptyMessage from 'src/components/common/EmptyMessage';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import ImportInventoryModal, { downloadInventoryCsvTemplate } from '../Inventory/ImportInventoryModal';

interface StyleProps {
  isMobile: boolean;
}

const useStyles = makeStyles((theme: Theme) => ({
  mainContainer: {
    padding: '24px',
    marginBottom: theme.spacing(8),
  },
  content: {
    border: `1px solid ${theme.palette.TwClrBrdrTertiary}`,
    borderRadius: '8px',
    margin: 'auto',
    marginTop: `max(10vh, ${theme.spacing(8)}px)`,
    maxWidth: '800px',
  },
  message: {
    margin: '0 auto',
    marginTop: '10%',
    maxWidth: '800px',
    width: (props: StyleProps) => (props.isMobile ? 'auto' : '800px'),
  },
}));

export const EMPTY_STATE_CONTENT_STYLES = {
  titleFontSize: '20px',
  titleLineHeight: '28px',
  subtitleFontSize: '16px',
  subtitleLineHeight: '24px',
  listContainerVerticalMargin: '24px',
};

type PageContent = {
  title1?: string;
  title2: string;
  subtitle: string;
  listItems: ListItemContent[];
  buttonText?: string;
  buttonIcon?: IconName;
  linkLocation?: string;
};

const NO_SEEDBANKS_CONTENT: PageContent = {
  title1: strings.SEED_BANKS,
  title2: strings.ADD_A_SEED_BANK,
  subtitle: emptyStateStrings.ADD_SEED_BANK_SUBTITLE,
  listItems: [
    {
      icon: 'blobbyIconSeedBank',
      title: strings.SEED_BANK_SETUP,
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
  subtitle: emptyStateStrings.ADD_NURSERY_SUBTITLE,
  listItems: [
    {
      icon: 'blobbyIconNursery',
      title: strings.INVENTORY_DATA,
      description: strings.INVENTORY_DATA_DESCRIPTION,
    },
  ],
  buttonText: strings.ADD_NURSERY,
  buttonIcon: 'plus',
  linkLocation: APP_PATHS.NURSERIES_NEW,
};

const NO_PLANTING_SITES_CONTENT: PageContent = {
  title2: strings.ADD_A_PLANTING_SITE,
  subtitle: strings.ADD_A_PLANTING_SITE_SUBTITLE,
  listItems: [
    {
      icon: 'blobbyIconSite',
    },
  ],
  buttonText: strings.ADD_PLANTING_SITE,
  buttonIcon: 'plus',
  linkLocation: APP_PATHS.PLANTING_SITES_NEW,
};

type EmptyStatePageProps = {
  pageName: 'Species' | 'SeedBanks' | 'Nurseries' | 'Inventory' | 'PlantingSites';
  organization?: ServerOrganization;
  reloadData?: () => void;
};

export default function EmptyStatePage({ pageName, organization, reloadData }: EmptyStatePageProps): JSX.Element {
  const { isMobile } = useDeviceInfo();
  const classes = useStyles({ isMobile });
  const history = useHistory();
  const snackbar = useSnackbar();
  const setSpeciesState = useSetRecoilState(speciesAtom);

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

  const NO_SPECIES_CONTENT: PageContent = {
    title1: strings.SPECIES,
    title2: strings.ADD_SPECIES,
    subtitle: emptyStateStrings.NO_SPECIES_DESCRIPTION,
    listItems: [
      {
        icon: 'uploadCloud',
        title: dictionary.IMPORT_SPECIES_LIST,
        description: emptyStateStrings.IMPORT_SPECIES_DESCRIPTION,
        buttonText: strings.IMPORT_SPECIES,
        buttonIcon: 'iconImport',
        onClickButton: () => {
          setImportSpeciesModalOpened(true);
        },
        linkText: emptyStateStrings.DOWNLOAD_CSV_TEMPLATE,
        onLinkClick: downloadCsvTemplateHandler,
      },
      {
        icon: 'edit',
        title: dictionary.ADD_MANUALLY,
        description: emptyStateStrings.ADD_SPECIES_MANUALLY_DESCRIPTION,
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
    subtitle: emptyStateStrings.NO_INVENTORY_DESCRIPTION,
    listItems: [
      {
        icon: 'uploadCloud',
        title: strings.IMPORT_INVENTORY,
        description: emptyStateStrings.IMPORT_INVENTORY_DESCRIPTION,
        buttonText: strings.IMPORT_INVENTORY,
        buttonIcon: 'iconImport',
        onClickButton: () => {
          setImportInventoryModalOpened(true);
        },
        linkText: emptyStateStrings.DOWNLOAD_CSV_TEMPLATE,
        onLinkClick: downloadInventoryCsvTemplateHandler,
      },
      {
        icon: 'edit',
        title: dictionary.ADD_MANUALLY,
        description: emptyStateStrings.ADD_INVENTORY_MANUALLY_DESCRIPTION,
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
    title2: emptyMessageStrings.REACH_OUT_TO_ADMIN_TITLE,
    subtitle: emptyMessageStrings.NO_SPECIES_CONTRIBUTOR_MSG,
    listItems: [],
  };

  const pageContent = (): PageContent => {
    const contributor = organization && isContributor(organization);

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
      setSpeciesState({ checkData: true });
      history.push(APP_PATHS.SPECIES);
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
      setSpeciesState({ checkData: true });
      history.push(APP_PATHS.SPECIES);
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

  return (
    <TfMain>
      {organization && (
        <>
          <AddSpeciesModal open={addSpeciesModalOpened} onClose={onCloseEditSpeciesModal} organization={organization} />
          <ImportSpeciesModal
            open={importSpeciesModalOpened}
            onClose={onCloseImportSpeciesModal}
            organization={organization}
          />
          <ImportInventoryModal
            open={importInventoryModalOpened}
            onClose={onCloseImportInventoryModal}
            organization={organization}
          />
        </>
      )}
      {content.title1 && <PageHeader title={content.title1} subtitle='' />}
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
              styles={EMPTY_STATE_CONTENT_STYLES}
            />
          </div>
        </Container>
      )}
    </TfMain>
  );
}
