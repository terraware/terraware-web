import { createContext, useContext } from 'react';

import { Application, ApplicationDeliverable, ApplicationModule } from 'src/types/Application';

export type ApplicationData = {
  allApplications?: Application[];
  applicationDeliverables: ApplicationDeliverable[];
  applicationSections: ApplicationModule[];
  getApplicationByProjectId: (projectId: number) => Application | undefined;
  selectedApplication?: Application;
  setSelectedApplication: (applicationId: number) => void;
  reload: (onReload?: () => void) => void;
};

// default values pointing to nothing
export const ApplicationContext = createContext<ApplicationData>({
  applicationDeliverables: [],
  applicationSections: [],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getApplicationByProjectId: (projectId: number) => undefined,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setSelectedApplication: (applicationId: number) => {},
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  reload: (onReload?: () => void) => {},
});

export const useApplicationData = () => useContext(ApplicationContext);
