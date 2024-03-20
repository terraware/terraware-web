import React from 'react';
import { useHistory, useRouteMatch } from 'react-router-dom';

import { NavSection } from '@terraware/web-components';

import LocaleSelector from 'src/components/LocaleSelector';
import NavFooter from 'src/components/common/Navbar/NavFooter';
import NavItem from 'src/components/common/Navbar/NavItem';
import Navbar from 'src/components/common/Navbar/Navbar';
import { APP_PATHS } from 'src/constants';
import { useUser } from 'src/providers';
import strings from 'src/strings';
import useDeviceInfo from 'src/utils/useDeviceInfo';

type NavBarProps = {
  backgroundTransparent?: boolean;
  setShowNavBar: (value: boolean) => void;
};
export default function NavBar({ backgroundTransparent, setShowNavBar }: NavBarProps): JSX.Element | null {
  const { isDesktop } = useDeviceInfo();
  const history = useHistory();
  const { isAllowed } = useUser();

  const isCohortsRoute = useRouteMatch(APP_PATHS.ACCELERATOR_COHORTS);
  const isDeliverablesRoute = useRouteMatch(APP_PATHS.ACCELERATOR_DELIVERABLES);
  const isModuleContentRoute = useRouteMatch(APP_PATHS.ACCELERATOR_MODULE_CONTENT);
  const isOverviewRoute = useRouteMatch(APP_PATHS.ACCELERATOR_OVERVIEW);
  const isScoringRoute = useRouteMatch(APP_PATHS.ACCELERATOR_SCORING);
  const isVotingRoute = useRouteMatch(APP_PATHS.ACCELERATOR_VOTING);
  const isPeopleRoute = useRouteMatch(APP_PATHS.ACCELERATOR_PEOPLE);

  const isAllowedViewPeople = isAllowed('READ_GLOBAL_ROLES');

  const navigate = (url: string) => {
    history.push(url);
  };

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
        selected={!!isOverviewRoute || !!isScoringRoute || !!isVotingRoute}
      />

      <NavSection />

      <NavItem
        icon='iconBusinessNetwork'
        id='cohorts'
        label={strings.COHORTS}
        onClick={() => closeAndNavigateTo(APP_PATHS.ACCELERATOR_COHORTS)}
        selected={!!isCohortsRoute}
      />

      <NavItem
        icon='iconSubmit'
        id='deliverables'
        label={strings.DELIVERABLES}
        onClick={() => closeAndNavigateTo(APP_PATHS.ACCELERATOR_DELIVERABLES)}
        selected={!!isDeliverablesRoute}
      />

      <NavSection />

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
        icon='iconFolder'
        id='module-content'
        label={strings.MODULE_CONTENT}
        onClick={() => closeAndNavigateTo(APP_PATHS.ACCELERATOR_MODULE_CONTENT)}
        selected={!!isModuleContentRoute}
      />

      <NavFooter>
        <NavItem
          icon='mail'
          id='contactus'
          label={strings.CONTACT_US}
          onClick={() => closeAndNavigateTo(APP_PATHS.CONTACT_US)}
        />

        <LocaleSelector transparent={true} />
      </NavFooter>
    </Navbar>
  );
}
