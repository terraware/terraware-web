import React from 'react';
import { LocalizationContext } from './contexts';
import { ProvidedTimeZones } from './DataTypes';

export type LocalizationProviderProps = {
  children?: React.ReactNode;
  data: ProvidedTimeZones;
};

export default function LocalizationProvider({ children, data }: LocalizationProviderProps): JSX.Element {
  return <LocalizationContext.Provider value={data}>{children}</LocalizationContext.Provider>;
}
