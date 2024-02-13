import { NavSection } from '@terraware/web-components';
import React from 'react';
import { useHistory, useRouteMatch } from 'react-router-dom';
import { APP_PATHS } from 'src/constants';
import strings from 'src/strings';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import Navbar from 'src/components/common/Navbar/Navbar';
import NavItem from 'src/components/common/Navbar/NavItem';
import LocaleSelector from 'src/components/LocaleSelector';
import NavFooter from 'src/components/common/Navbar/NavFooter';

type NavBarProps = {
  setShowNavBar: (value: boolean) => void;
  backgroundTransparent?: boolean;
};
export default function NavBar({ setShowNavBar, backgroundTransparent }: NavBarProps): JSX.Element | null {
  const { isDesktop } = useDeviceInfo();
  const history = useHistory();

  const isAcceleratorDeliverablesRoute = useRouteMatch(APP_PATHS.ACCELERATOR_DELIVERABLES + '/');
  const isAcceleratorModuleContentRoute = useRouteMatch(APP_PATHS.ACCELERATOR_MODULE_CONTENT + '/');
  const isAcceleratorOverviewRoute = useRouteMatch(APP_PATHS.ACCELERATOR_OVERVIEW + '/');
  const isAcceleratorPeopleRoute = useRouteMatch(APP_PATHS.ACCELERATOR_PEOPLE + '/');

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
      setShowNavBar={setShowNavBar as React.Dispatch<React.SetStateAction<boolean>>}
      backgroundTransparent={backgroundTransparent}
    >
      <NavItem
        label={strings.BACK_TO_TERRAWARE}
        icon='home'
        onClick={() => closeAndNavigateTo(APP_PATHS.HOME)}
        id='home'
      />

      <NavSection />

      <NavItem
        label={strings.OVERVIEW}
        onClick={() => closeAndNavigateTo(APP_PATHS.ACCELERATOR_OVERVIEW)}
        id='overview'
        selected={!!isAcceleratorOverviewRoute}
      />

      <NavSection />

      <NavItem
        label={strings.DELIVERABLES}
        onClick={() => closeAndNavigateTo(APP_PATHS.ACCELERATOR_DELIVERABLES)}
        id='deliverables'
        selected={!!isAcceleratorDeliverablesRoute}
      />

      <NavSection />

      <NavItem
        label={strings.PEOPLE}
        onClick={() => closeAndNavigateTo(APP_PATHS.ACCELERATOR_PEOPLE)}
        id='people'
        selected={!!isAcceleratorPeopleRoute}
      />
      <NavItem
        label={strings.MODULE_CONTENT}
        onClick={() => closeAndNavigateTo(APP_PATHS.ACCELERATOR_MODULE_CONTENT)}
        id='module-content'
        selected={!!isAcceleratorModuleContentRoute}
      />

      <NavFooter>
        <NavItem
          label={strings.CONTACT_US}
          icon='mail'
          onClick={() => closeAndNavigateTo(APP_PATHS.CONTACT_US)}
          id='contactus'
        />

        <LocaleSelector transparent={true} />
      </NavFooter>
    </Navbar>
  );
}
