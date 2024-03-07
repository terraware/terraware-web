import React, { useEffect, useState } from 'react';

import BlockingSpinner from 'src/components/common/BlockingSpinner';
import useAcceleratorConsole from 'src/hooks/useAcceleratorConsole';
import {
  LocalizationProvider,
  OrganizationProvider,
  UserProvider,
  useLocalization,
  useOrganization,
  useUser,
} from 'src/providers';

type BlockingBootstrapProps = {
  children?: React.ReactNode;
};

function BlockingBootstrap({ children }: BlockingBootstrapProps): JSX.Element {
  const [bootstrapped, setBootstrapped] = useState<boolean>(false);
  const { bootstrapped: userBootstrapped } = useUser();
  const { bootstrapped: organizationBootstrapped } = useOrganization();
  const { bootstrapped: localizationBootstrapped } = useLocalization();
  const { isAcceleratorRoute } = useAcceleratorConsole();

  useEffect(() => {
    setBootstrapped(
      bootstrapped ||
        (userBootstrapped && !!(organizationBootstrapped || isAcceleratorRoute) && localizationBootstrapped)
    );
  }, [bootstrapped, userBootstrapped, organizationBootstrapped, isAcceleratorRoute, localizationBootstrapped]);

  if (!bootstrapped) {
    return <BlockingSpinner />;
  }

  return <>{children}</>;
}

export type AppBootstrapProps = {
  children?: React.ReactNode;
};

export default function AppBootstrap({ children }: AppBootstrapProps): JSX.Element {
  const [selectedLocale, setSelectedLocale] = useState('en');
  const [activeLocale, setActiveLocale] = useState<string | null>(null);

  return (
    <UserProvider>
      <OrganizationProvider>
        <LocalizationProvider
          selectedLocale={selectedLocale}
          setSelectedLocale={setSelectedLocale}
          activeLocale={activeLocale}
          setActiveLocale={setActiveLocale}
        >
          <BlockingBootstrap>{children}</BlockingBootstrap>
        </LocalizationProvider>
      </OrganizationProvider>
    </UserProvider>
  );
}
