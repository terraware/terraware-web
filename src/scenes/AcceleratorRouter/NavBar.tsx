import React from 'react';
import { useMixpanel } from 'react-mixpanel-browser';
import { useMatch } from 'react-router';

import { NavSection } from '@terraware/web-components';

import LocaleSelector from 'src/components/LocaleSelector';
import NavFooter from 'src/components/common/Navbar/NavFooter';
import NavItem from 'src/components/common/Navbar/NavItem';
import Navbar from 'src/components/common/Navbar/Navbar';
import { APP_PATHS } from 'src/constants';
import isEnabled from 'src/features';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { MIXPANEL_EVENTS } from 'src/mixpanelEvents';
import { useUser } from 'src/providers';
import strings from 'src/strings';
import useDeviceInfo from 'src/utils/useDeviceInfo';

type NavBarProps = {
  backgroundTransparent?: boolean;
  setShowNavBar: (value: boolean) => void;
};
export default function NavBar({ backgroundTransparent, setShowNavBar }: NavBarProps): JSX.Element | null {
  const { isDesktop } = useDeviceInfo();
  const navigate = useSyncNavigate();
  const { isAllowed } = useUser();
  const mixpanel = useMixpanel();

  const isApplicationRoute = useMatch({ path: APP_PATHS.ACCELERATOR_APPLICATIONS, end: false });
  const isDocumentsRoute = useMatch({ path: APP_PATHS.ACCELERATOR_DOCUMENT_PRODUCER_DOCUMENTS, end: false });
  const isDeliverablesRoute = useMatch({ path: APP_PATHS.ACCELERATOR_DELIVERABLES, end: false });
  const isFundingEntitiesRoute = useMatch({ path: APP_PATHS.ACCELERATOR_FUNDING_ENTITIES, end: false });
  const isModuleContentRoute = useMatch({ path: APP_PATHS.ACCELERATOR_MODULES, end: false });
  const isOrganizationRoute = useMatch({ path: APP_PATHS.ACCELERATOR_ORGANIZATIONS, end: false });
  const isOverviewRoute = useMatch({ path: APP_PATHS.ACCELERATOR_OVERVIEW, end: false });
  const isParticipantsRoute = useMatch({ path: APP_PATHS.ACCELERATOR_PARTICIPANTS_VIEW, end: false });
  const isPeopleRoute = useMatch({ path: APP_PATHS.ACCELERATOR_PEOPLE, end: false });
  const isScoringRoute = useMatch({ path: APP_PATHS.ACCELERATOR_PROJECT_SCORES, end: false });
  const isVotingRoute = useMatch({ path: APP_PATHS.ACCELERATOR_PROJECT_VOTES, end: false });
  const isMatrixViewRoute = useMatch({ path: APP_PATHS.ACCELERATOR_MATRIX_VIEW, end: false });

  const isAllowedViewPeople = isAllowed('READ_GLOBAL_ROLES');
  const isAllowedViewFundingEntities = isAllowed('READ_FUNDING_ENTITIES');
  const isMatrixViewEnabled = isEnabled('Matrix View');

  const closeAndNavigateTo = (path: string) => {
    closeNavBar();
    if (path) {
      navigate(path);
    }
  };

  const closeNavBar = () => {
    if (!isDesktop) {
      setShowNavBar(false);
    }
  };

  return (
    <Navbar
      backgroundTransparent={backgroundTransparent}
      setShowNavBar={setShowNavBar as React.Dispatch<React.SetStateAction<boolean>>}
    >
      {!isDesktop && (
        <>
          <NavItem
            icon='home'
            id='home'
            label={strings.BACK_TO_TERRAWARE}
            onClick={() => closeAndNavigateTo(APP_PATHS.HOME)}
          />

          <NavSection />
        </>
      )}

      <NavItem
        icon='home'
        id='overview'
        label={strings.OVERVIEW}
        onClick={() => closeAndNavigateTo(APP_PATHS.ACCELERATOR_OVERVIEW)}
        selected={!!isOverviewRoute || !!isParticipantsRoute || !!isScoringRoute || !!isVotingRoute}
      />

      {isMatrixViewEnabled && (
        <NavItem
          icon='iconModule'
          id='matrix'
          label={strings.MATRIX_VIEW}
          onClick={() => closeAndNavigateTo(APP_PATHS.ACCELERATOR_MATRIX_VIEW)}
          selected={!!isMatrixViewRoute}
        />
      )}

      <NavSection />

      <NavItem
        icon='iconSubmit'
        id='deliverables'
        label={strings.DELIVERABLES}
        onClick={() => {
          mixpanel?.track(MIXPANEL_EVENTS.CONSOLE_LEFT_NAV_DELIVERABLES);
          closeAndNavigateTo(APP_PATHS.ACCELERATOR_DELIVERABLES);
        }}
        selected={!!isDeliverablesRoute}
      />

      {
        <NavItem
          icon='iconFile'
          id='applications'
          label={strings.APPLICATIONS}
          onClick={() => closeAndNavigateTo(APP_PATHS.ACCELERATOR_APPLICATIONS)}
          selected={!!isApplicationRoute}
        />
      }

      <NavSection title={strings.DOC_PRODUCER} />

      <NavItem
        icon='iconFolder'
        id='document-producer'
        label={strings.DOCUMENTS}
        onClick={() => closeAndNavigateTo(APP_PATHS.ACCELERATOR_DOCUMENT_PRODUCER_DOCUMENTS)}
        selected={!!isDocumentsRoute}
      />

      <NavSection title={strings.SETTINGS} />

      <NavItem
        icon='organizationNav'
        id='organizations'
        label={strings.ORGANIZATIONS}
        onClick={() => {
          closeAndNavigateTo(APP_PATHS.ACCELERATOR_ORGANIZATIONS);
        }}
        selected={!!isOrganizationRoute}
      />

      {isAllowedViewPeople && (
        <NavItem
          icon='peopleNav'
          id='people'
          label={strings.PEOPLE}
          onClick={() => closeAndNavigateTo(APP_PATHS.ACCELERATOR_PEOPLE)}
          selected={!!isPeopleRoute}
        />
      )}

      <NavItem
        icon='iconModule'
        id='module-content'
        label={strings.MODULES}
        onClick={() => closeAndNavigateTo(APP_PATHS.ACCELERATOR_MODULES)}
        selected={!!isModuleContentRoute}
      />

      {isAllowedViewFundingEntities && (
        <NavItem
          icon='iconCoinInHand'
          id='funding-entities'
          label={strings.FUNDING_ENTITIES}
          onClick={() => closeAndNavigateTo(APP_PATHS.ACCELERATOR_FUNDING_ENTITIES)}
          selected={!!isFundingEntitiesRoute}
        />
      )}

      <NavFooter>
        <LocaleSelector transparent={true} />
      </NavFooter>
    </Navbar>
  );
}
