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
  backgroundTransparent?: boolean;
  setShowNavBar: (value: boolean) => void;
};
export default function NavBar({ backgroundTransparent, setShowNavBar }: NavBarProps): JSX.Element | null {
  const { isDesktop } = useDeviceInfo();
  const history = useHistory();

  const isAcceleratorDeliverablesRoute = useRouteMatch(APP_PATHS.ACCELERATOR_DELIVERABLES);
  const isAcceleratorModuleContentRoute = useRouteMatch(APP_PATHS.ACCELERATOR_MODULE_CONTENT);
  const isAcceleratorOverviewRoute = useRouteMatch(APP_PATHS.ACCELERATOR_OVERVIEW);
  const isAcceleratorPeopleRoute = useRouteMatch(APP_PATHS.ACCELERATOR_PEOPLE);

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
        id='overview'
        label={strings.OVERVIEW}
        onClick={() => closeAndNavigateTo(APP_PATHS.ACCELERATOR_OVERVIEW)}
        selected={!!isAcceleratorOverviewRoute}
      />

      <NavSection />

      <NavItem
        id='deliverables'
        label={strings.DELIVERABLES}
        onClick={() => closeAndNavigateTo(APP_PATHS.ACCELERATOR_DELIVERABLES)}
        selected={!!isAcceleratorDeliverablesRoute}
      />

      <NavSection />

      <NavItem
        id='people'
        label={strings.PEOPLE}
        onClick={() => closeAndNavigateTo(APP_PATHS.ACCELERATOR_PEOPLE)}
        selected={!!isAcceleratorPeopleRoute}
      />
      <NavItem
        id='module-content'
        label={strings.MODULE_CONTENT}
        onClick={() => closeAndNavigateTo(APP_PATHS.ACCELERATOR_MODULE_CONTENT)}
        selected={!!isAcceleratorModuleContentRoute}
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
