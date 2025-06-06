import { useCallback, useEffect, useRef, useState } from 'react';

import { Tab } from '@terraware/web-components';

import { useSyncNavigate } from 'src/hooks/useSyncNavigate';

import useQuery from './useQuery';
import useStateLocation, { getLocation } from './useStateLocation';

interface StickyTabsProps {
  defaultTab: string;
  tabs: Tab[];
  viewIdentifier: string;
  keepQuery?: boolean;
  tabsAreNewPages?: boolean;
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
  } catch (e) {
    /* empty */
  }
};

const useStickyTabs = ({
  defaultTab,
  tabs: initialTabs = [],
  viewIdentifier,
  keepQuery = true,
  tabsAreNewPages = true,
}: StickyTabsProps) => {
  const location = useStateLocation();
  const navigate = useSyncNavigate();
  const query = useQuery();
  const tab = query.get('tab');

  const [activeTab, setActiveTab] = useState<string>(defaultTab);
  const tabsRef = useRef<Tab[]>(initialTabs);

  const onTabChange = useCallback(
    (newTab: string) => {
      query.set('tab', newTab);
      const emptyQuery = tab === newTab ? query.toString() : new URLSearchParams(`tab=${newTab}`);
      navigate(getLocation(location.pathname, location, keepQuery ? query.toString() : emptyQuery.toString()), {
        replace: !tabsAreNewPages,
      });
      writeTabToSession(viewIdentifier, newTab);
    },
    [navigate, location, query, viewIdentifier, keepQuery, tab, tabsAreNewPages]
  );

  const updateTabs = useCallback((tabs: Tab[]) => {
    tabsRef.current = tabs;
  }, []);

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

    const validTabs = tabsRef.current;

    if (validTabs.some((data) => data.id === tab)) {
      setActiveTab(tab);
    } else if (validTabs.length) {
      setActiveTab(validTabs[0].id);
    }
  }, [defaultTab, onTabChange, tab, viewIdentifier]);

  return {
    activeTab,
    onTabChange,
    updateTabs,
    tab,
  };
};

export default useStickyTabs;
