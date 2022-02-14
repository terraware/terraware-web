import React from 'react';
import { useHistory } from 'react-router';
import Container from '@material-ui/core/Container';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import EmptyStateContent, { ListItemContent } from 'src/components/emptyStatePages/EmptyStateContent';
import PageHeader from 'src/components/seeds/PageHeader';
import strings from 'src/strings';
import dict from 'src/strings/dictionary';
import emptyStateStrings from 'src/strings/emptyStatePages';
import dictionary from 'src/strings/dictionary';

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
  buttonText: string;
  linkLocation: string;
};

const NO_PROJECTS_CONTENT: PageContent = {
  title1: strings.PROJECTS,
  title2: dict.CREATE_A_PROJECT,
  subtitle: emptyStateStrings.NO_PROJECTS_SUBTITLE,
  listItems: [
    { icon: 'project', title: dict.PROJECT_PROFILE, description: emptyStateStrings.NO_PROJECTS_DESCRIPTION_PROJECTS },
    { icon: 'people', title: strings.PEOPLE, description: emptyStateStrings.NO_PROJECTS_DESCRIPTION_PEOPLE },
    { icon: 'sites', title: strings.SITES, description: emptyStateStrings.NO_PROJECTS_DESCRIPTION_SITES },
  ],
  buttonText: strings.ADD_PROJECT,
  linkLocation: `/projects/new`,
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
  linkLocation: `/sites/new`,
};

type EmptyStatePageProps = {
  pageName: 'Projects' | 'Sites';
};

export default function EmptyStatePage({ pageName }: EmptyStatePageProps): JSX.Element {
  const classes = useStyles();
  const history = useHistory();
  const pageContent = pageName === 'Projects' ? NO_PROJECTS_CONTENT : NO_SITES_CONTENT;

  const goToNewLocation = () => {
    const newLocation = {
      pathname: pageContent.linkLocation,
    };
    history.push(newLocation);
  };

  return (
    <main>
      <Container className={classes.mainContainer}>
        <PageHeader title={pageContent.title1} subtitle='' />
        <div className={classes.content}>
          <EmptyStateContent
            title={pageContent.title2}
            subtitle={pageContent.subtitle}
            listItems={pageContent.listItems}
            buttonText={pageContent.buttonText}
            onClickButton={goToNewLocation}
            styles={EMPTY_STATE_CONTENT_STYLES}
          />
        </div>
      </Container>
    </main>
  );
}
