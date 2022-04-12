import React from 'react';
import { Grid } from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { IconName } from 'src/components/common/icon/icons';
import PageCard from 'src/components/common/PageCard';
import dictionary from 'src/strings/dictionary';
import strings from 'src/strings/contactUsPage';
import { TERRAWARE_SUPPORT_LINK } from 'src/constants';
import TfMain from './common/TfMain';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    title: {
      fontSize: '24px',
      fontWeight: 600,
      lineHeight: '32px',
      margin: '0 0 12px 0',
    },
    mainGrid: {
      display: 'flex',
      margin: 0,
      width: '100%',

      '& .MuiGrid-item:first-child': {
        paddingLeft: 0,
      },

      '& .MuiGrid-item:last-child': {
        paddingRight: 0,
      },
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
    link: TERRAWARE_SUPPORT_LINK,
  },
  {
    icon: 'sparkles',
    title: strings.TITLE_REQUEST_FEATURE,
    description: strings.DESCRIPTION_REQUEST_FEATURE,
    buttonText: dictionary.REQUEST_FEATURE,
    link: TERRAWARE_SUPPORT_LINK,
  },
];

export default function ContactUs(): JSX.Element {
  const classes = useStyles();

  return (
    <TfMain>
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
    </TfMain>
  );
}
