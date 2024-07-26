import { createContext, useContext } from 'react';

import { Application, ApplicationDeliverable, ApplicationModule } from 'src/types/Application';

export type ApplicationData = {
  allApplications?: Application[];
  applicationDeliverables: ApplicationDeliverable[];
  applicationSections: ApplicationModule[];
  selectedApplication?: Application;
  setSelectedApplication: (applicationId: number) => void;
  create: (projectId: number) => Promise<number | undefined>;
  reload: () => Promise<void>;
  restart: () => Promise<void>;
  submit: () => Promise<string[] | undefined>;
};

// default values pointing to nothing
export const ApplicationContext = createContext<ApplicationData>({
  applicationDeliverables: [],
  applicationSections: [],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setSelectedApplication: (applicationId: number) => {},
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  create: (projectId: number) => Promise.resolve(undefined),
  reload: () => Promise.resolve(),
  restart: () => Promise.resolve(),
  submit: () => Promise.resolve(undefined),
});

export const useApplicationData = () => useContext(ApplicationContext);
