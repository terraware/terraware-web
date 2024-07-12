import { createContext, useContext } from 'react';

import { Application, ApplicationModuleWithDeliverables } from 'src/types/Application';

export type ApplicationData = {
  allApplications: Application[];
  applicationSections: ApplicationModuleWithDeliverables[];
  selectedApplication?: Application;
  setSelectedApplitcation: (applicationId: number) => void;
};

// default values pointing to nothing
export const ApplicationContext = createContext<ApplicationData>({
  allApplications: [],
  applicationSections: [],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setSelectedApplitcation: (applicationId: number) => {},
});

export const useApplicationData = () => useContext(ApplicationContext);
