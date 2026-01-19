import React, { type JSX, useCallback, useMemo } from 'react';
import { matchPath, useMatch } from 'react-router';

import { NavSection, theme } from '@terraware/web-components';

import LocaleSelector from 'src/components/LocaleSelector';
import NavFooter from 'src/components/common/Navbar/NavFooter';
import NavItem from 'src/components/common/Navbar/NavItem';
import Navbar from 'src/components/common/Navbar/Navbar';
import { APP_PATHS } from 'src/constants';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import strings from 'src/strings';
import useDeviceInfo from 'src/utils/useDeviceInfo';

import { useApplicationData } from '../../../providers/Application/Context';

type NavBarProps = {
  backgroundTransparent?: boolean;
  setShowNavBar: (value: boolean) => void;
};
export default function NavBar({ backgroundTransparent, setShowNavBar }: NavBarProps): JSX.Element | null {
  const { isDesktop } = useDeviceInfo();
  const navigate = useSyncNavigate();

  const { applicationSections, selectedApplication } = useApplicationData();

  const isOverviewRoute = useMatch({ path: APP_PATHS.APPLICATION_OVERVIEW, end: true });
  const isReviewRoute = useMatch({ path: APP_PATHS.APPLICATION_REVIEW, end: true });

  const closeNavBar = useCallback(() => {
    if (!isDesktop) {
      setShowNavBar(false);
    }
  }, [isDesktop, setShowNavBar]);

  const closeAndNavigateTo = useCallback(
    (path: string) => {
      closeNavBar();
      if (path && selectedApplication) {
        navigate(path.replace(':applicationId', `${selectedApplication.id}`));
      }
    },
    [selectedApplication, closeNavBar, navigate]
  );

  const isApplicationEnabled = useMemo(() => {
    if (!selectedApplication) {
      return false;
    }

    return selectedApplication.status !== 'Not Submitted' && selectedApplication.status !== 'Failed Pre-screen';
  }, [selectedApplication]);

  const applicationNavItems = useMemo(() => {
    if (!selectedApplication) {
      return [];
    }
    return (
      applicationSections
        ?.filter((section) => section.phase === 'Application')
        .map((section) => {
          const path = APP_PATHS.APPLICATION_SECTION.replace(':applicationId', `${selectedApplication.id}`).replace(
            ':sectionId',
            `${section.moduleId}`
          );
          const isMatch = !!matchPath(`${path}/*`, location.pathname);
          const isCompleted = section.status === 'Complete';

          return (
            <NavItem
              disabled={!isApplicationEnabled}
              icon={isCompleted ? 'successFilled' : 'success'}
              iconColor={isCompleted ? theme.palette.TwClrIcnBrand : undefined}
              id={`application-section-${section.moduleId}`}
              key={section.moduleId}
              label={section.name}
              onClick={() => closeAndNavigateTo(path)}
              selected={!!isMatch}
            />
          );
        }) ?? []
    );
  }, [applicationSections, isApplicationEnabled, selectedApplication, closeAndNavigateTo]);

  const prescreenNavItems = useMemo(() => {
    if (!selectedApplication) {
      return [];
    }
    return (
      applicationSections
        ?.filter((section) => section.phase === 'Pre-Screen')
        .map((section) => {
          const path = APP_PATHS.APPLICATION_PRESCREEN.replace(':applicationId', `${selectedApplication.id}`);
          const sectionPath = APP_PATHS.APPLICATION_SECTION.replace(
            ':applicationId',
            `${selectedApplication.id}`
          ).replace(':sectionId', `${section.moduleId}`);
          const mapPath = APP_PATHS.APPLICATION_MAP.replace(':applicationId', `${selectedApplication.id}`);
          const isMatch =
            !!matchPath(`${path}/*`, location.pathname) ||
            !!matchPath(`${sectionPath}/*`, location.pathname) ||
            !!matchPath(`${mapPath}/*`, location.pathname);
          const isCompleted =
            selectedApplication.status !== 'Not Submitted' && selectedApplication.status !== 'Failed Pre-screen';

          const navPath =
            selectedApplication.status === 'Not Submitted'
              ? path
              : APP_PATHS.APPLICATION_PRESCREEN_RESULT.replace(':applicationId', `${selectedApplication.id}`);
          return (
            <NavItem
              icon={isCompleted ? 'successFilled' : 'success'}
              iconColor={isCompleted ? theme.palette.TwClrIcnBrand : undefined}
              id={`application-section-${section.moduleId}`}
              key={section.moduleId}
              label={section.name}
              onClick={() => closeAndNavigateTo(navPath)}
              selected={!!isMatch}
            />
          );
        }) ?? []
    );
  }, [applicationSections, selectedApplication, closeAndNavigateTo]);

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
        disabled={!isApplicationEnabled}
        label={strings.REVIEW_AND_SUBMIT}
        onClick={() => closeAndNavigateTo(APP_PATHS.APPLICATION_REVIEW)}
        selected={!!isReviewRoute}
      />

      <NavFooter>
        <LocaleSelector transparent={true} />
      </NavFooter>
    </Navbar>
  );
}
