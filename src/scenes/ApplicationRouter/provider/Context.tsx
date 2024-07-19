import { createContext, useContext } from 'react';

import { Application, ApplicationModuleWithDeliverables } from 'src/types/Application';

export type ApplicationData = {
  allApplications?: Application[];
  applicationSections: ApplicationModuleWithDeliverables[];
  selectedApplication?: Application;
  setSelectedApplication: (applicationId: number) => void;
  reload: () => void;
};

// default values pointing to nothing
export const ApplicationContext = createContext<ApplicationData>({
  applicationSections: [],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setSelectedApplication: (applicationId: number) => {},
  reload: () => {},
});

export const useApplicationData = () => useContext(ApplicationContext);
