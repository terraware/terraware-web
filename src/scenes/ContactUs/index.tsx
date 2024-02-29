import React from 'react';
import { Grid } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { IconName } from 'src/components/common/icon/icons';
import PageCard from 'src/components/common/PageCard';
import TfMain from 'src/components/common/TfMain';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import PageSnackbar from 'src/components/PageSnackbar';
import strings from 'src/strings';
import getHelpEmail from 'src/components/common/HelpEmail';
import { useDocLinks } from 'src/docLinks';
import { useAppSelector } from 'src/redux/store';
import { selectAppVersion } from 'src/redux/features/appVersion/appVersionSelectors';

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
export default function ContactUsView(): JSX.Element {
  const classes = useStyles();
  const { isMobile } = useDeviceInfo();
  const docLinks = useDocLinks();
  const appVersion = useAppSelector(selectAppVersion);

  /*TODO USE CORRECT LINKS HERE */
  const listItemContent: ListItemContent[] = [
    {
      icon: 'bug',
      title: strings.TITLE_REPORT_PROBLEM,
      description: strings.formatString(strings.DESCRIPTION_REPORT_PROBLEM, <i>"{appVersion || 'n/a'}"</i>) as string,
      buttonText: strings.REPORT_PROBLEM,
      link: `${docLinks.report_a_problem}?build=${appVersion || ''}`,
    },
    {
      icon: 'sparkles',
      title: strings.TITLE_REQUEST_FEATURE,
      description: strings.DESCRIPTION_REQUEST_FEATURE,
      buttonText: strings.REQUEST_FEATURE,
      link: docLinks.request_a_feature,
    },
    {
      icon: 'mail',
      title: strings.CONTACT_US,
      description: strings.formatString(strings.CONTACT_US_DESCRIPTION, getHelpEmail()) as string,
      buttonText: strings.CONTACT_US,
      link: docLinks.contact_us,
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
