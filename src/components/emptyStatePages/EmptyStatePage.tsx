import React, { useState } from 'react';
import { useHistory } from 'react-router';
import Container from '@material-ui/core/Container';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import EmptyStateContent, { ListItemContent } from 'src/components/emptyStatePages/EmptyStateContent';
import PageHeader from 'src/components/seeds/PageHeader';
import { APP_PATHS } from 'src/constants';
import strings from 'src/strings';
import dict from 'src/strings/dictionary';
import emptyStateStrings from 'src/strings/emptyStatePages';
import dictionary from 'src/strings/dictionary';
import AddSpeciesModal from '../Species/AddSpeciesModal';
import snackbarAtom from 'src/state/snackbar';
import { useSetRecoilState } from 'recoil';
import { ServerOrganization } from 'src/types/Organization';
import ImportSpeciesModal, { downloadCsvTemplate } from '../Species/ImportSpeciesModal';
import TfMain from '../common/TfMain';
import speciesAtom from 'src/state/species';

const useStyles = makeStyles((theme) =>
  createStyles({
    mainContainer: {
      padding: '24px',
      marginBottom: theme.spacing(8),
    },
    content: {
      border: '1px solid #A9B7B8',
      borderRadius: '8px',
      margin: 'auto',
      marginTop: `max(10vh, ${theme.spacing(8)}px)`,
      maxWidth: '800px',
    },
  })
);

export const EMPTY_STATE_CONTENT_STYLES = {
  titleFontSize: '20px',
  titleLineHeight: '28px',
  subtitleFontSize: '16px',
  subtitleLineHeight: '24px',
  listContainerVerticalMargin: '24px',
};

type PageContent = {
  title1: string;
  title2: string;
  subtitle: string;
  listItems: ListItemContent[];
  buttonText?: string;
  linkLocation?: string;
};

const NO_PROJECTS_CONTENT: PageContent = {
  title1: strings.PROJECTS,
  title2: dict.CREATE_A_PROJECT,
  subtitle: emptyStateStrings.NO_PROJECTS_SUBTITLE,
  listItems: [
    {
      icon: 'project',
      title: dict.PROJECT_PROFILE,
      description: emptyStateStrings.NO_PROJECTS_DESCRIPTION_PROJECTS,
    },
    { icon: 'people', title: strings.PEOPLE, description: emptyStateStrings.NO_PROJECTS_DESCRIPTION_PEOPLE },
    { icon: 'sites', title: strings.SITES, description: emptyStateStrings.NO_PROJECTS_DESCRIPTION_SITES },
  ],
  buttonText: strings.ADD_PROJECT,
  linkLocation: APP_PATHS.PROJECTS_NEW,
};

const NO_SITES_CONTENT: PageContent = {
  title1: strings.SITES,
  title2: dict.CREATE_A_SITE,
  subtitle: emptyStateStrings.NO_SITES_SUBTITLE,
  listItems: [
    { icon: 'sites', title: dictionary.SITE_PROFILE, description: emptyStateStrings.NO_SITES_DESCRIPTION_SITES },
    { icon: 'project', title: strings.PROJECT, description: emptyStateStrings.NO_SITES_DESCRIPTION_PROJECTS },
  ],
  buttonText: strings.ADD_SITE,
  linkLocation: APP_PATHS.SITES_NEW,
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
  linkLocation: APP_PATHS.SEED_BANKS_NEW,
};

type EmptyStatePageProps = {
  pageName: 'Projects' | 'Sites' | 'Species' | 'SeedBanks';
  organization?: ServerOrganization;
  reloadData?: () => void;
};

export default function EmptyStatePage({ pageName, organization, reloadData }: EmptyStatePageProps): JSX.Element {
  const classes = useStyles();
  const history = useHistory();
  const setSnackbar = useSetRecoilState(snackbarAtom);
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

  const [addSpeciesModalOpened, setAddSpeciesModalOpened] = useState(false);
  const [importSpeciesModalOpened, setImportSpeciesModalOpened] = useState(false);

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
        onClickButton: () => {
          setImportSpeciesModalOpened(true);
        },
        linkText: emptyStateStrings.IMPORT_SPECIES_LINK,
        onLinkClick: downloadCsvTemplateHandler,
      },
      {
        icon: 'edit',
        title: dictionary.ADD_MANUALLY,
        description: emptyStateStrings.ADD_MANUALLY_DESCRIPTION,
        buttonText: strings.ADD_SPECIES,
        onClickButton: () => {
          setAddSpeciesModalOpened(true);
        },
      },
    ],
  };

  const pageContent = (): PageContent => {
    switch (pageName) {
      case 'Projects':
        return NO_PROJECTS_CONTENT;
      case 'Species':
        return NO_SPECIES_CONTENT;
      case 'SeedBanks':
        return NO_SEEDBANKS_CONTENT;
      default:
        return NO_SITES_CONTENT;
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
      setSnackbar({
        type: 'toast',
        priority: 'success',
        msg: snackbarMessage,
      });
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
      setSnackbar({
        type: 'toast',
        priority: 'success',
        msg: snackbarMessage,
      });
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
        </>
      )}
      <PageHeader title={content.title1} subtitle='' />
      <Container className={classes.mainContainer}>
        <div className={classes.content}>
          <EmptyStateContent
            title={content.title2}
            subtitle={content.subtitle}
            listItems={content.listItems}
            buttonText={content.buttonText}
            onClickButton={goToNewLocation}
            styles={EMPTY_STATE_CONTENT_STYLES}
          />
        </div>
      </Container>
    </TfMain>
  );
}
