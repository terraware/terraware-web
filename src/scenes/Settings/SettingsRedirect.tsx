import React, { type JSX, useEffect } from 'react';

import BlockingSpinner from 'src/components/common/BlockingSpinner';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useOrganization } from 'src/providers/hooks';

import { getSettingsLandingPath } from './settingsTabs';

// `/settings` has no page of its own for org users; send them to their sticky
// last-used section, falling back to the first section their role allows.
const SettingsRedirect = (): JSX.Element => {
  const { selectedOrganization } = useOrganization();
  const navigate = useSyncNavigate();

  useEffect(() => {
    navigate(getSettingsLandingPath(selectedOrganization), { replace: true });
  }, [navigate, selectedOrganization]);

  return <BlockingSpinner />;
};

export default SettingsRedirect;
