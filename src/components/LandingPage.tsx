import React, { useState } from 'react';
import Container from '@material-ui/core/Container';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import Button from 'src/components/common/button/Button';
import Icon from 'src/components/common/icon/Icon';
import landingPageString from 'src/strings/landingPage';
import strings from 'src/strings/index';
import { IconName } from './common/icon/icons';
import AddNewOrganizationModal from './AddNewOrganizationModal';

const useStyles = makeStyles((theme) =>
  createStyles({
    mainContainer: {
      fontWeight: 400,
      marginBottom: theme.spacing(8),
      marginTop: `max(15vh, ${theme.spacing(8)}px)`,
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
      margin: `${theme.spacing(6)}px auto`,
      maxWidth: '1200px',
    },
    listItem: {
      flex: '1 1 auto',
      textAlign: 'center',
    },
    listItemIcon: {
      width: '200px',
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
      marginBottom: theme.spacing(3),
    },
    footNote: {
      fontSize: '12px',
      lineHeight: '16px',
      margin: '0 auto',
      maxWidth: '550px',
    },
  })
);

type ListItemContent = {
  icon: IconName;
  title: string;
  description: string;
};

const listItemContent: ListItemContent[] = [
  { icon: 'organization', title: strings.ORGANIZATION, description: landingPageString.DESCRIPTION_ORGANIZATION },
  { icon: 'project', title: strings.PROJECTS, description: landingPageString.DESCRIPTION_PROJECTS },
  { icon: 'sites', title: strings.SITES, description: landingPageString.DESCRIPTION_SITES },
  { icon: 'people', title: strings.PEOPLE, description: landingPageString.DESCRIPTION_PEOPLE },
  { icon: 'species2', title: strings.SPECIES, description: landingPageString.DESCRIPTION_SPECIES },
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
        <h1 className={classes.title}>{landingPageString.TITLE_WELCOME}</h1>
        <p className={classes.subtitle}>{landingPageString.SUBTITLE_GET_STARTED}</p>
        <div className={classes.listContainer}>
          {listItemContent.map((item) => {
            return (
              <div key={item.title} className={classes.listItem}>
                <Icon name={item.icon} className={classes.listItemIcon} />
                <p className={classes.listItemTitle}>{item.title}</p>
                <p className={classes.listItemDescription}>{item.description}</p>
              </div>
            );
          })}
        </div>
        <Button
          className={classes.createOrgButton}
          label={landingPageString.BUTTON_CREATE_ORGANIZATION}
          onClick={() => {
            setIsOrgModalOpen(true);
          }}
        />
        <div className={classes.footNote}>{landingPageString.FOOTNOTE_WAIT_FOR_INVITATION}</div>
      </Container>
    </main>
  );
}
