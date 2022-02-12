import React, { useState } from 'react';
import Container from '@material-ui/core/Container';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import AddNewOrganizationModal from 'src/components/AddNewOrganizationModal';
import EmptyStateContent, { ListItemContent } from 'src/components/emptyStatePages/EmptyStateContent';
import landingPageStrings from 'src/strings/landingPage';
import strings from 'src/strings';
import dictionary from 'src/strings/dictionary';

const useStyles = makeStyles((theme) =>
  createStyles({
    mainContainer: {
      marginBottom: theme.spacing(8),
      marginTop: `max(15vh, ${theme.spacing(8)}px)`,
      maxWidth: '1500px',
    },
  })
);

const EMPTY_STATE_CONTENT_STYLES = {
  titleFontSize: '28px',
  titleLineHeight: '36px',
  subtitleFontSize: '20px',
  subtitleLineHeight: '28px',
  listContainerVerticalMargin: '48px',
};

const LIST_ITEM_CONTENT: ListItemContent[] = [
  { icon: 'organization', title: strings.ORGANIZATION, description: landingPageStrings.DESCRIPTION_ORGANIZATION },
  { icon: 'project', title: strings.PROJECTS, description: landingPageStrings.NO_PROJECTS_DESCRIPTION_PROJECTS },
  { icon: 'sites', title: strings.SITES, description: landingPageStrings.NO_PROJECTS_DESCRIPTION_SITES },
  { icon: 'people', title: strings.PEOPLE, description: landingPageStrings.NO_PROJECTS_DESCRIPTION_PEOPLE },
  { icon: 'species2', title: strings.SPECIES, description: landingPageStrings.DESCRIPTION_SPECIES },
];

type LandingPageProps = {
  reloadOrganizationData: () => void;
};

export default function NoOrgLandingPage(props: LandingPageProps): JSX.Element {
  const classes = useStyles();
  const [isOrgModalOpen, setIsOrgModalOpen] = useState<boolean>(false);

  return (
    <main>
      <Container className={classes.mainContainer}>
        <AddNewOrganizationModal
          open={isOrgModalOpen}
          onCancel={() => setIsOrgModalOpen(false)}
          reloadOrganizationData={props.reloadOrganizationData}
        />
        <EmptyStateContent
          title={landingPageStrings.TITLE_WELCOME}
          subtitle={landingPageStrings.SUBTITLE_GET_STARTED}
          listItems={LIST_ITEM_CONTENT}
          buttonText={dictionary.CREATE_ORGANIZATION}
          onClickButton={() => setIsOrgModalOpen(true)}
          footnote={landingPageStrings.FOOTNOTE_WAIT_FOR_INVITATION}
          styles={EMPTY_STATE_CONTENT_STYLES}
        />
      </Container>
    </main>
  );
}
