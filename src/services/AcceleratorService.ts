import { Response2 } from 'src/services/HttpService';
import { AcceleratorOrg } from 'src/types/Accelerator';

export type AcceleratorOrgData = {
  orgs: AcceleratorOrg[];
};

const listAcceleratorOrgs = async (locale?: string | null): Promise<Response2<AcceleratorOrgData>> => {
  return {
    requestSucceeded: true,
    data: {
      orgs: [...mockData].sort((a, b) => a.name.localeCompare(b.name, locale || undefined)),
    },
  };
};

const mockData: AcceleratorOrg[] = [
  {
    id: 1,
    name: 'Org1',
    availableProjects: [
      { id: 1, name: 'Project1' },
      { id: 2, name: 'Project2' },
      { id: 3, name: 'Project3' },
    ],
  },
  {
    id: 2,
    name: 'Org2',
    availableProjects: [
      { id: 4, name: 'Project4' },
      { id: 5, name: 'Project5' },
    ],
  },
  {
    id: 3,
    name: 'Org3',
    availableProjects: [
      { id: 6, name: 'Andromeda' },
      { id: 7, name: 'Project7' },
      { id: 8, name: 'Project8' },
      { id: 9, name: 'Project9' },
    ],
  },
];

const AcceleratorService = {
  listAcceleratorOrgs,
};

export default AcceleratorService;
