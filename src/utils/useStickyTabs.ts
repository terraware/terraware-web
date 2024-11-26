import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Tab } from '@terraware/web-components';

import useQuery from './useQuery';
import useStateLocation, { getLocation } from './useStateLocation';

interface StickyTabsProps {
  defaultTab: string;
  tabs: Tab[];
  viewIdentifier: string;
  keepQuery?: boolean;
}

const makeTabSessionKey = (viewIdentifier: string) => `tab-${viewIdentifier}`;

const getTabFromSession = (viewIdentifier: string): string => {
  try {
    return sessionStorage.getItem(makeTabSessionKey(viewIdentifier)) || '';
  } catch (e) {
    return '';
  }
};

const writeTabToSession = (viewIdentifier: string, tab: string): void => {
  try {
    sessionStorage.setItem(makeTabSessionKey(viewIdentifier), tab);
    // tslint:disable-next-line:no-empty
  } catch (e) {}
};

const useStickyTabs = ({ defaultTab, tabs, viewIdentifier, keepQuery = true }: StickyTabsProps) => {
  const location = useStateLocation();
  const navigate = useNavigate();
  const query = useQuery();
  const tab = query.get('tab');

  const [activeTab, setActiveTab] = useState<string>(defaultTab);

  const onTabChange = useCallback(
    (newTab: string) => {
      query.set('tab', newTab);
      const emptyQuery = tab === newTab ? query.toString() : new URLSearchParams(`tab=${newTab}`);
      navigate(getLocation(location.pathname, location, keepQuery ? query.toString() : emptyQuery.toString()));
      writeTabToSession(viewIdentifier, newTab);
    },
    [navigate, location, query, viewIdentifier]
  );

  useEffect(() => {
    if (!tab) {
      // If there is a "last viewed" tab in the session, use that, otherwise send to default
      const sessionTab = getTabFromSession(viewIdentifier);
      if (sessionTab) {
        onTabChange(sessionTab);
      } else {
        onTabChange(defaultTab);
      }
      return;
    }

    if (tabs.some((data) => data.id === tab)) {
      setActiveTab(tab);
    } else if (tabs.length) {
      setActiveTab(tabs[0].id);
    }
  }, [defaultTab, onTabChange, tab, tabs, viewIdentifier]);

  return {
    activeTab,
    onTabChange,
    tab,
  };
};

export default useStickyTabs;
