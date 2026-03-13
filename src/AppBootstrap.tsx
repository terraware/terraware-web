import React, { type JSX, useState } from 'react';

import { LocalizationProvider as MuiLocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

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

type BlockingBootstrapProps = {
  children?: React.ReactNode;
};

function BlockingBootstrap({ children }: BlockingBootstrapProps): JSX.Element {
  const [bootstrapped, setBootstrapped] = useState(false);
  const { bootstrapped: userBootstrapped } = useUser();
  const { bootstrapped: organizationBootstrapped } = useOrganization();
  const { bootstrapped: localizationBootstrapped } = useLocalization();
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

  if (!bootstrapped) {
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
            <MuiLocalizationProvider dateAdapter={AdapterDayjs}>
              <BlockingBootstrap>{children}</BlockingBootstrap>
            </MuiLocalizationProvider>
          </LocalizationProvider>
        </UserFundingEntityProvider>
      </OrganizationProvider>
    </UserProvider>
  );
}
