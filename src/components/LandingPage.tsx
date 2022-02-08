import React, { useState } from 'react';
import Container from '@material-ui/core/Container';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import Button from 'src/components/common/button/Button';
import Icon from 'src/components/common/icon/Icon';
import moreStrings from 'src/strings/landingPage';
import strings from 'src/strings/index';
import { IconName } from './common/icon/icons';
import AddNewOrganizationModal from './AddNewOrganizationModal';

const useStyles = makeStyles((theme) =>
  createStyles({
    mainContainer: {
      fontWeight: 400,
      marginTop: '15vh',
      marginBottom: theme.spacing(3),
      textAlign: 'center',
    },
    title: {
      fontSize: '28px',
      fontWeight: 600,
      lineHeight: '36px',
    },
    subtitle: {
      fontSize: '20px',
      lineHeight: '28px',
      margin: '0 auto',
      marginBottom: theme.spacing(3),
      maxWidth: '700px',
    },
    listContainer: {
      display: 'flex',
      flexWrap: 'wrap',
      fontSize: '14px',
      justifyContent: 'center',
      lineHeight: '20px',
      margin: 'auto',
      marginTop: theme.spacing(3),
      marginBottom: theme.spacing(3),
      maxWidth: '1200px',
    },
    listItem: {
      flex: '1 1 auto',
      textAlign: 'center',
      margin: '0 12px',
    },
    listItemIcon: {
      width: '110px',
      height: '128px',
    },
    listItemTitle: {
      fontWeight: 'bold',
      lineHeight: '20px',
      margin: '0 auto',
    },
    listItemDescription: {
      margin: '0 auto',
      maxWidth: '200px',
    },
    createOrgButton: {
      marginTop: theme.spacing(3),
      marginBottom: theme.spacing(3),
    },
    footNote: {
      lineHeight: '16px',
      margin: '0 auto',
      maxWidth: '550px',
      size: '12px',
    },
  })
);

type ListItemContent = {
  iconName: IconName;
  sectionName: string;
  description: string;
};

const listItemContent: ListItemContent[] = [
  { iconName: 'organization', sectionName: strings.ORGANIZATION, description: moreStrings.DESCRIPTION_ORGANIZATION },
  { iconName: 'project', sectionName: strings.PROJECTS, description: moreStrings.DESCRIPTION_PROJECTS },
  { iconName: 'sites', sectionName: strings.SITES, description: moreStrings.DESCRIPTION_SITES },
  { iconName: 'people', sectionName: strings.PEOPLE, description: moreStrings.DESCRIPTION_PEOPLE },
  { iconName: 'species2', sectionName: strings.SPECIES, description: moreStrings.DESCRIPTION_SPECIES },
];

type LandingPageProps = {
  reloadOrganizationData: () => void;
};

export default function LandingPage(props: LandingPageProps): JSX.Element {
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
        <h1 className={classes.title}>{moreStrings.TITLE_WELCOME}</h1>
        <p className={classes.subtitle}>{moreStrings.SUBTITLE_GET_STARTED}</p>
        <div className={classes.listContainer}>
          {listItemContent.map((item) => {
            return (
              <div key={item.sectionName} className={classes.listItem}>
                <Icon name={item.iconName} className={classes.listItemIcon} />
                <p className={classes.listItemTitle}>{item.sectionName}</p>
                <p className={classes.listItemDescription}>{item.description}</p>
              </div>
            );
          })}
        </div>
        <Button
          className={classes.createOrgButton}
          label={moreStrings.BUTTON_CREATE_ORGANIZATION}
          onClick={() => {
            setIsOrgModalOpen(true);
          }}
        />
        <div className={classes.footNote}>{moreStrings.FOOTNOTE_WAIT_FOR_INVITATION}</div>
      </Container>
    </main>
  );
}
