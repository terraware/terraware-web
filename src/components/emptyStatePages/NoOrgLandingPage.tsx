import React, { useState } from 'react';
import AddNewOrganizationModal from 'src/components/AddNewOrganizationModal';
import EmptyStateContent, { ListItemContent } from 'src/components/emptyStatePages/EmptyStateContent';
import landingPageStrings from 'src/strings/noOrgLandingPage';
import strings from 'src/strings';
import dictionary from 'src/strings/dictionary';
import { Container, Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import PageSnackbar from 'src/components/PageSnackbar';
import useDeviceInfo from 'src/utils/useDeviceInfo';

interface StyleProps {
  isMobile?: boolean;
}

const useStyles = makeStyles((theme: Theme) => ({
  main: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    minHeight: '100vh',
    padding: '88px 24px 24px',
    [theme.breakpoints.down('xl')]: {
      background:
        'url(/assets/home-bg-right-layer-z4.svg) no-repeat 753px 100%/auto 285px, ' +
        'url(/assets/home-bg-left-layer-z4.svg) no-repeat 0 100%/auto 295px, ' +
        'url(/assets/home-bg-water-z2.svg) repeat-x 0 100%/auto 180px, ' +
        'url(/assets/home-bg-left-z4.svg) no-repeat 0 100%/auto 295px, ' +
        'url(/assets/home-bg-right-z3.svg) no-repeat 911px 100%/auto 400px, ' +
        'linear-gradient(180deg, #FBF9F9 0%, #EFF5EF 100%) no-repeat 0 0/auto',
    },
    [theme.breakpoints.up('xl')]: {
      background:
        'url(/assets/home-bg-right-layer-z4.svg) no-repeat 100% 100%/auto 285px, ' +
        'url(/assets/home-bg-left-layer-z4.svg) no-repeat 0 100%/auto 295px, ' +
        'url(/assets/home-bg-water-z2.svg) repeat-x 0 100%/auto 180px, ' +
        'url(/assets/home-bg-left-z4.svg) no-repeat 0 100%/auto 295px, ' +
        'url(/assets/home-bg-right-z3.svg) no-repeat 100% 100%/auto 400px, ' +
        'linear-gradient(180deg, #FBF9F9 0%, #EFF5EF 100%) no-repeat 0 0/auto',
    },
  },
  mainContainer: {
    background: theme.palette.TwClrBg,
    borderRadius: '24px',
    margin: 'auto',
    maxWidth: '900px',
    padding: (props: StyleProps) => (props.isMobile ? '24px 26px' : '40px 26px'),
  },
}));

const EMPTY_STATE_CONTENT_STYLES = {
  titleFontSize: '28px',
  titleLineHeight: '36px',
  subtitleFontSize: '20px',
  subtitleLineHeight: '28px',
  listContainerVerticalMargin: '48px',
};

const LIST_ITEM_CONTENT: ListItemContent[] = [
  { icon: 'organization', title: strings.ORGANIZATION, description: landingPageStrings.DESCRIPTION_ORGANIZATION },
  { icon: 'people', title: strings.PEOPLE, description: landingPageStrings.DESCRIPTION_PEOPLE },
  { icon: 'species2', title: strings.SPECIES, description: landingPageStrings.DESCRIPTION_SPECIES },
];

type LandingPageProps = {
  reloadOrganizationData: (selectedOrgId?: number) => void;
};

export default function NoOrgLandingPage(props: LandingPageProps): JSX.Element {
  const { isMobile } = useDeviceInfo();
  const classes = useStyles({ isMobile });
  const [isOrgModalOpen, setIsOrgModalOpen] = useState<boolean>(false);

  return (
    <main className={classes.main}>
      <Container className={classes.mainContainer}>
        <PageSnackbar />
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
          footnote={[
            landingPageStrings.FOOTNOTE_WAIT_FOR_INVITATION_1,
            landingPageStrings.FOOTNOTE_WAIT_FOR_INVITATION_2,
          ]}
          styles={EMPTY_STATE_CONTENT_STYLES}
        />
      </Container>
    </main>
  );
}
