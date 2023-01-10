import React from 'react';
import { OrganizationContext } from './contexts';
import { ProvidedOrganizationData } from './DataTypes';

export type OrganizationProviderProps = {
  children?: React.ReactNode;
  data: ProvidedOrganizationData;
};

export default function OrganizationProvider({ children, data }: OrganizationProviderProps): JSX.Element {
  return <OrganizationContext.Provider value={data}>{children}</OrganizationContext.Provider>;
}
