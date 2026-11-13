import React, { type JSX, useState } from 'react';

import BlockingSpinner from 'src/components/common/BlockingSpinner';
import useAcceleratorConsole from 'src/hooks/useAcceleratorConsole';
import {
  LocalizationProvider,
  OrganizationProvider,
  UserFundingEntityProvider,
  UserProvider,
  useLocalization,
  useOrganization,
  useUser,
  useUserFundingEntity,
} from 'src/providers';
import DateLocalizationProvider from 'src/providers/DateLocalizationProvider';

type BlockingBootstrapProps = {
  children?: React.ReactNode;
};

function BlockingBootstrap({ children }: BlockingBootstrapProps): JSX.Element {
  const [bootstrapped, setBootstrapped] = useState(false);
  const { bootstrapped: userBootstrapped, isLoadingUser } = useUser();
  const { bootstrapped: organizationBootstrapped, isLoadingOrganizations } = useOrganization();
  const { activeLocale, bootstrapped: localizationBootstrapped, selectedLocale } = useLocalization();
  const { bootstrapped: userFundingEntityBootstrapped } = useUserFundingEntity();
  const { isAcceleratorRoute } = useAcceleratorConsole();

  if (
    !bootstrapped &&
    userBootstrapped &&
    (organizationBootstrapped || isAcceleratorRoute || userFundingEntityBootstrapped) &&
    localizationBootstrapped
  ) {
    setBootstrapped(true);
  }

  // Switching languages resets the RTK Query cache, and strings for the new locale load
  // asynchronously. Wait for both rather than rendering the app without a user or organizations,
  // which would look like a user who doesn't belong to any organization.
  const switchingLocale = isLoadingUser || isLoadingOrganizations || activeLocale !== selectedLocale;

  if (!bootstrapped || switchingLocale) {
    return <BlockingSpinner />;
  }

  return <>{children}</>;
}

export type AppBootstrapProps = {
  children?: React.ReactNode;
};

export default function AppBootstrap({ children }: AppBootstrapProps): JSX.Element {
  const [selectedLocale, setSelectedLocale] = useState<string | null>(null);
  const [activeLocale, setActiveLocale] = useState<string | null>(null);

  return (
    <UserProvider>
      <OrganizationProvider>
        <UserFundingEntityProvider>
          <LocalizationProvider
            selectedLocale={selectedLocale}
            setSelectedLocale={setSelectedLocale}
            activeLocale={activeLocale}
            setActiveLocale={setActiveLocale}
          >
            <DateLocalizationProvider>
              <BlockingBootstrap>{children}</BlockingBootstrap>
            </DateLocalizationProvider>
          </LocalizationProvider>
        </UserFundingEntityProvider>
      </OrganizationProvider>
    </UserProvider>
  );
}
