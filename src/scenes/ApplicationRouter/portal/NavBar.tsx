import React, { useCallback, useMemo } from 'react';
import { matchPath, useMatch, useNavigate } from 'react-router-dom';

import { NavSection } from '@terraware/web-components';

import LocaleSelector from 'src/components/LocaleSelector';
import NavFooter from 'src/components/common/Navbar/NavFooter';
import NavItem from 'src/components/common/Navbar/NavItem';
import Navbar from 'src/components/common/Navbar/Navbar';
import { APP_PATHS } from 'src/constants';
import strings from 'src/strings';
import useDeviceInfo from 'src/utils/useDeviceInfo';

import { useApplicationData } from '../provider/Context';

type NavBarProps = {
  backgroundTransparent?: boolean;
  setShowNavBar: (value: boolean) => void;
};
export default function NavBar({ backgroundTransparent, setShowNavBar }: NavBarProps): JSX.Element | null {
  const { isDesktop } = useDeviceInfo();
  const navigate = useNavigate();

  const { applicationSections, selectedApplication } = useApplicationData();

  const isOverviewRoute = useMatch({ path: APP_PATHS.APPLICATION_OVERVIEW, end: true });
  const isReviewRoute = useMatch({ path: APP_PATHS.APPLICATION_REVIEW, end: true });

  const closeNavBar = () => {
    if (!isDesktop) {
      setShowNavBar(false);
    }
  };

  const closeAndNavigateTo = useCallback(
    (path: string) => {
      closeNavBar();
      if (path && selectedApplication) {
        navigate(path.replace(':applicationId', `${selectedApplication.id}`));
      }
    },
    [selectedApplication]
  );

  const applicationNavItems = useMemo(() => {
    if (!selectedApplication) {
      return [];
    }
    return (
      applicationSections
        ?.filter((section) => section.category === 'Application')
        .map((section) => {
          const path = APP_PATHS.APPLICATION_SECTION.replace(':applicationId', `${selectedApplication.id}`).replace(
            ':sectionId',
            `${section.id}`
          );
          const isMatch = !!matchPath(`${path}/*`, location.pathname);

          return (
            <NavItem
              icon={'success'}
              id={`application-section-${section.id}`}
              key={section.id}
              label={section.name}
              onClick={() => closeAndNavigateTo(path)}
              selected={!!isMatch}
            />
          );
        }) ?? []
    );
  }, [applicationSections, selectedApplication, location.pathname]);

  const prescreenNavItems = useMemo(() => {
    if (!selectedApplication) {
      return [];
    }
    return (
      applicationSections
        ?.filter((section) => section.category === 'Pre-screen')
        .map((section) => {
          const path = APP_PATHS.APPLICATION_SECTION.replace(':applicationId', `${selectedApplication.id}`).replace(
            ':sectionId',
            `${section.id}`
          );
          const isMatch = !!matchPath(`${path}/*`, location.pathname);

          return (
            <NavItem
              icon={'success'}
              id={`application-section-${section.id}`}
              key={section.id}
              label={section.name}
              onClick={() => closeAndNavigateTo(path)}
              selected={!!isMatch}
            />
          );
        }) ?? []
    );
  }, [applicationSections, selectedApplication, location.pathname]);

  return (
    <Navbar
      backgroundTransparent={backgroundTransparent}
      setShowNavBar={setShowNavBar as React.Dispatch<React.SetStateAction<boolean>>}
    >
      {!isDesktop && (
        <>
          <NavItem id='home' label={strings.BACK_TO_TERRAWARE} onClick={() => closeAndNavigateTo(APP_PATHS.HOME)} />

          <NavSection />
        </>
      )}

      <NavItem
        id='overview'
        label={strings.OVERVIEW}
        onClick={() => closeAndNavigateTo(APP_PATHS.APPLICATION_OVERVIEW)}
        selected={!!isOverviewRoute}
      />

      <NavSection />

      {prescreenNavItems}

      <NavSection title={strings.APPLICATION} separator={false} />
      {applicationNavItems}

      <NavSection />

      <NavItem
        id='review'
        label={strings.REVIEW}
        onClick={() => closeAndNavigateTo(APP_PATHS.APPLICATION_REVIEW)}
        selected={!!isReviewRoute}
      />

      <NavFooter>
        <LocaleSelector transparent={true} />
      </NavFooter>
    </Navbar>
  );
}
