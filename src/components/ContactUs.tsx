import React from 'react';
import { Grid } from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { IconName } from 'src/components/common/icon/icons';
import PageCard from 'src/components/common/PageCard';
import dictionary from 'src/strings/dictionary';
import strings from 'src/strings/contactUsPage';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    main: {
      backgroundColor: '#FFFFFF',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      padding: '12px 12px',
    },
    title: {
      fontSize: '24px',
      fontWeight: 600,
      lineHeight: '32px',
      margin: '12px',
    },
    mainGrid: {
      display: 'flex',
      margin: 0,
      width: '100%',
    },
  })
);

type ListItemContent = {
  icon: IconName;
  title: string;
  description: string;
  buttonText: string;
  link: string;
};

/*TODO USE CORRECT LINKS HERE */
const listItemContent: ListItemContent[] = [
  {
    icon: 'bug',
    title: strings.TITLE_REPORT_PROBLEM,
    description: strings.DESCRIPTION_REPORT_PROBLEM,
    buttonText: dictionary.REPORT_PROBLEM,
    link: 'https://www.terraformation.com/contact-us/terraware-support',
  },
  {
    icon: 'sparkles',
    title: strings.TITLE_REQUEST_FEATURE,
    description: strings.DESCRIPTION_REQUEST_FEATURE,
    buttonText: dictionary.REQUEST_FEATURE,
    link: 'https://www.terraformation.com/contact-us/terraware-support',
  },
  {
    icon: 'touchscreen',
    title: strings.TITLE_TEST_APP,
    description: strings.DESCRIPTION_TEST_APP,
    buttonText: dictionary.REQUEST_MOBILE_APP,
    link: 'https://www.terraformation.com/contact-us/terraware-support',
  },
];

export default function ContactUs(): JSX.Element {
  const classes = useStyles();

  return (
    <main className={classes.main}>
      <h1 className={classes.title}>{dictionary.CONTACT_US}</h1>
      <Grid container spacing={3} className={classes.mainGrid}>
        {listItemContent.map((item) => {
          return (
            <Grid key={item.title} item xs={4}>
              <PageCard
                name={item.title}
                isNameBold={true}
                icon={item.icon}
                description={item.description}
                link={item.link}
                linkText={item.buttonText}
                linkStyle={'button'}
              />
            </Grid>
          );
        })}
      </Grid>
    </main>
  );
}
