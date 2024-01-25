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

  const isAcceleratorAdminRoute = useRouteMatch(APP_PATHS.ACCELERATOR_ADMIN);

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
        label={strings.ADMIN}
        icon='home'
        selected={!!isAcceleratorAdminRoute}
        onClick={() => {
          closeAndNavigateTo(APP_PATHS.HOME);
        }}
        id='home'
      />

      <NavFooter>
        <NavItem
          label={strings.CONTACT_US}
          icon='mail'
          onClick={() => {
            closeAndNavigateTo(APP_PATHS.CONTACT_US);
          }}
          id='contactus'
        />

        <LocaleSelector transparent={true} />
      </NavFooter>
    </Navbar>
  );
}
