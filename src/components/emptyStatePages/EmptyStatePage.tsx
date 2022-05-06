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

const EMPTY_STATE_CONTENT_STYLES = {
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
      buttonText: strings.ADD_PROJECT,
    },
    { icon: 'people', title: strings.PEOPLE, description: emptyStateStrings.NO_PROJECTS_DESCRIPTION_PEOPLE },
    { icon: 'sites', title: strings.SITES, description: emptyStateStrings.NO_PROJECTS_DESCRIPTION_SITES },
  ],
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

type EmptyStatePageProps = {
  pageName: 'Projects' | 'Sites' | 'Species';
  organization?: ServerOrganization;
  reloadData?: () => void;
};

export default function EmptyStatePage({ pageName, organization, reloadData }: EmptyStatePageProps): JSX.Element {
  const classes = useStyles();
  const history = useHistory();
  const setSnackbar = useSetRecoilState(snackbarAtom);

  const goToNewLocation = () => {
    const newLocation = {
      pathname: content.linkLocation,
    };
    history.push(newLocation);
  };

  const [addSpeciesModalOpened, setAddSpeciesModalOpened] = useState(false);

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
          return true;
        },
        linkText: emptyStateStrings.IMPORT_SPECIES_LINK,
        linkPath: '/home',
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

  return (
    <main>
      {organization && (
        <AddSpeciesModal open={addSpeciesModalOpened} onClose={onCloseEditSpeciesModal} organization={organization} />
      )}
      <Container className={classes.mainContainer}>
        <PageHeader title={content.title1} subtitle='' />
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
    </main>
  );
}
