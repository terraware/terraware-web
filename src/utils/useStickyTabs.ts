import { useCallback, useEffect, useState } from 'react';

import { Tab } from '@terraware/web-components';

import { useSyncNavigate } from 'src/hooks/useSyncNavigate';

import useQuery from './useQuery';
import useStateLocation, { getLocation } from './useStateLocation';

interface StickyTabsProps {
  defaultTab: string;
  tabs: Tab[];
  viewIdentifier: string;
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

const useStickyTabs = ({ defaultTab, tabs, viewIdentifier }: StickyTabsProps) => {
  const location = useStateLocation();
  const navigate = useSyncNavigate();
  const query = useQuery();
  const queryTab = query.get('tab');

  const [activeTab, setActiveTab] = useState<string>(defaultTab);

  const onChangeTab = useCallback(
    (newTab: string) => {
      if (queryTab) {
        navigate(getLocation(location.pathname, location), { replace: true });
      }
      setActiveTab(newTab);
      writeTabToSession(viewIdentifier, newTab);
    },
    [navigate, location, viewIdentifier, queryTab, defaultTab]
  );

  useEffect(() => {
    if (!queryTab) {
      // If there is a "last viewed" tab in the session, use that, otherwise send to default
      const sessionTab = getTabFromSession(viewIdentifier);
      if (sessionTab) {
        onChangeTab(sessionTab);
      }

      return;
    }

    if (tabs.some((data) => data.id === queryTab)) {
      setActiveTab(queryTab);
    } else if (tabs.length) {
      setActiveTab(tabs[0].id);
    }
  }, [defaultTab, onChangeTab, queryTab, tabs, viewIdentifier]);

  return {
    activeTab,
    onChangeTab,
    setActiveTab,
    tab: queryTab,
  };
};

export default useStickyTabs;
