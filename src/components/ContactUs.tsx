import React from 'react';
import { Grid } from '@mui/material';
import { IconName } from 'src/components/common/icon/icons';
import PageCard from 'src/components/common/PageCard';
import { TERRAWARE_SUPPORT_LINK } from 'src/constants';
import TfMain from './common/TfMain';
import { makeStyles } from '@mui/styles';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import PageSnackbar from 'src/components/PageSnackbar';
import strings from 'src/strings';

const useStyles = makeStyles(() => ({
  title: {
    fontSize: '24px',
    fontWeight: 600,
    lineHeight: '32px',
    margin: '0 0 12px 0',
  },
}));

type ListItemContent = {
  icon: IconName;
  title: string;
  description: string;
  buttonText: string;
  link: string;
};
export default function ContactUs(): JSX.Element {
  const classes = useStyles();
  const { isMobile } = useDeviceInfo();

  /*TODO USE CORRECT LINKS HERE */
  const listItemContent: ListItemContent[] = [
    {
      icon: 'bug',
      title: strings.TITLE_REPORT_PROBLEM,
      description: strings.formatString(
        strings.DESCRIPTION_REPORT_PROBLEM,
        <i>"{process.env.REACT_APP_TERRAWARE_FE_BUILD_VERSION || 'n/a'}"</i>
      ) as string,
      buttonText: strings.REPORT_PROBLEM,
      link: TERRAWARE_SUPPORT_LINK,
    },
    {
      icon: 'sparkles',
      title: strings.TITLE_REQUEST_FEATURE,
      description: strings.DESCRIPTION_REQUEST_FEATURE,
      buttonText: strings.REQUEST_FEATURE,
      link: TERRAWARE_SUPPORT_LINK,
    },
  ];

  return (
    <TfMain>
      <h1 className={classes.title}>{strings.CONTACT_US}</h1>
      <PageSnackbar />
      <Grid container spacing={3}>
        {listItemContent.map((item) => {
          return (
            <Grid key={item.title} item xs={isMobile ? 12 : 4}>
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
