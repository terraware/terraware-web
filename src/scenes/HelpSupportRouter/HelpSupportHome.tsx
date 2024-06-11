import React, { useMemo } from 'react';

import { Box, Grid, Typography, useTheme } from '@mui/material';
import { Button } from '@terraware/web-components';

import PageSnackbar from 'src/components/PageSnackbar';
import Card from 'src/components/common/Card';
import getHelpEmail from 'src/components/common/HelpEmail';
import TextWithLink from 'src/components/common/TextWithLink';
import TfMain from 'src/components/common/TfMain';
import Icon from 'src/components/common/icon/Icon';
import { IconName } from 'src/components/common/icon/icons';
import { useDocLinks } from 'src/docLinks';
import isEnabled from 'src/features';
import useNavigateTo from 'src/hooks/useNavigateTo';
import { useLocalization } from 'src/providers';
import { selectAppVersion } from 'src/redux/features/appVersion/appVersionSelectors';
import { useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import {
  SupportRequestType,
  getSupportRequestDescription,
  getSupportRequestIconName,
  getSupportRequestName,
} from 'src/types/Support';
import useDeviceInfo from 'src/utils/useDeviceInfo';

import { useSupportData } from './provider/Context';

type ListItemContent = {
  icon?: IconName;
  title: string;
  description: string;
  buttonText: string;
  onClick: () => void;
};
export default function HelpSupportHome(): JSX.Element {
  const { activeLocale } = useLocalization();
  const { isMobile, isDesktop } = useDeviceInfo();
  const docLinks = useDocLinks();
  const appVersion = useAppSelector(selectAppVersion);
  const theme = useTheme();
  const { goToContactUsForm } = useNavigateTo();
  const { types } = useSupportData();
  const featureEnabled = isEnabled('Terraware Support Forms');

  const knowledgeBaseItem: ListItemContent = useMemo(
    () => ({
      icon: 'iconLibrary',
      title: strings.KNOWLEDGE_BASE,
      description: strings.DESCRIPTION_KNOWLEDGE_BASE,
      buttonText: strings.KNOWLEDGE_BASE,
      onClick: () => window.open(docLinks.knowledge_base),
    }),
    [activeLocale]
  );

  const defaultListItems: ListItemContent[] = useMemo(
    () => [
      {
        icon: 'bug',
        title: strings.TITLE_REPORT_PROBLEM,
        description: strings.formatString(
          strings.DESCRIPTION_REPORT_PROBLEM,
          <i>`&quot;`{appVersion || 'n/a'}`&quot;`</i>
        ) as string,
        buttonText: strings.REPORT_PROBLEM,
        onClick: () => window.open(`${docLinks.report_a_problem}?build=${appVersion || ''}`),
      },
      {
        icon: 'sparkles',
        title: strings.TITLE_REQUEST_FEATURE,
        description: strings.DESCRIPTION_REQUEST_FEATURE,
        buttonText: strings.REQUEST_FEATURE,
        onClick: () => window.open(docLinks.request_a_feature),
      },
      {
        icon: 'mail',
        title: strings.CONTACT_US,
        description: strings.formatString(strings.CONTACT_US_DESCRIPTION, getHelpEmail()) as string,
        buttonText: strings.CONTACT_US,
        onClick: () => window.open(docLinks.contact_us),
      },
    ],
    [activeLocale]
  );

  const jiraListItems = useMemo(() => {
    // Set the support request types ordering before filtering out unsupported ones
    const orderedSupportRequestTypes: SupportRequestType[] = ['Bug Report', 'Feature Request', 'Contact Us'];
    return orderedSupportRequestTypes
      .filter((type) => (types ?? []).includes(type))
      .map(
        (type): ListItemContent => ({
          icon: getSupportRequestIconName(type),
          title: getSupportRequestName(type),
          description: getSupportRequestDescription(type),
          buttonText: getSupportRequestName(type),
          onClick: () => goToContactUsForm(type),
        })
      );
  }, [activeLocale, types]);

  const listItemContent = useMemo(() => {
    if (featureEnabled && jiraListItems.length > 0) {
      return [knowledgeBaseItem, ...jiraListItems];
    } else {
      return [knowledgeBaseItem, ...defaultListItems];
    }
  }, [defaultListItems, featureEnabled, jiraListItems, knowledgeBaseItem]);

  return (
    <TfMain>
      <h1
        style={{
          fontSize: '24px',
          fontWeight: 600,
          lineHeight: '32px',
          margin: '0 0 12px 16px',
        }}
      >
        {strings.HELP_SUPPORT}
      </h1>
      <PageSnackbar />
      <Card flushMobile>
        <Grid
          container
          sx={{
            backgroundColor: theme.palette.TwClrBg,
          }}
        >
          <Grid xs={12} paddingBottom={theme.spacing(2)} borderBottom={`1px solid ${theme.palette.TwClrBrdrTertiary}`}>
            <Grid xs={12} sx={{ display: 'flex', alignItems: 'center' }} marginBottom={theme.spacing(1)}>
              <Typography fontSize='20px' fontWeight={600} color={theme.palette.TwClrTxt} sx={{ flexGrow: 1 }}>
                {strings.THANK_YOU_FOR_USING_TERRAWARE}
              </Typography>
            </Grid>

            <Grid xs={12} flexDirection={'column'}>
              <Typography fontSize='16px' display={'inline'}>
                <TextWithLink
                  href={docLinks.terraformation}
                  isExternal={true}
                  text={strings.TERRAWARE_IS_SOFTWARE}
                  fontSize='16px'
                  style={{ position: 'relative', bottom: '1px' }}
                />
                {' ' /* whitespace between the sentences */}
                <TextWithLink
                  href={docLinks.terraformation_software_solutions}
                  isExternal={true}
                  text={strings.FOR_A_FULL_OVERVIEW}
                  fontSize='16px'
                  style={{ position: 'relative', bottom: '1px' }}
                />
              </Typography>
            </Grid>
          </Grid>
          {listItemContent.map((item) => {
            return (
              <Grid key={item.title} item xs={12}>
                <Box
                  sx={{ display: 'flex', alignItems: 'center' }}
                  marginTop={theme.spacing(3)}
                  marginBottom={theme.spacing(2)}
                >
                  {item.icon && <Icon size='medium' name={item.icon} />}
                  <Typography fontSize='20px' fontWeight={600} color={theme.palette.TwClrTxt}>
                    &nbsp;{item.title}
                  </Typography>
                </Box>

                <Grid
                  item
                  xs={isDesktop ? 9 : 12}
                  flexDirection={isMobile ? 'column' : 'row'}
                  display='flex'
                  alignItems='center'
                  justifyContent='space-between'
                >
                  <Box display='flex' alignItems='center' flexShrink='1' flexGrow='0' marginRight={theme.spacing(3)}>
                    <Typography fontSize='16px'>{item.description}</Typography>
                  </Box>
                  <Box
                    display='flex'
                    alignItems='center'
                    justifyContent='right'
                    flexShrink='0'
                    flexGrow='1'
                    marginTop={isMobile ? theme.spacing(1) : 0}
                  >
                    <Button
                      label={item.buttonText}
                      size='medium'
                      onClick={item.onClick}
                      priority='secondary'
                      type='productive'
                    />
                  </Box>
                </Grid>
              </Grid>
            );
          })}
        </Grid>
      </Card>
    </TfMain>
  );
}
