import { components } from 'src/api/types/generated-schema';

export type AcceleratorOrg = components['schemas']['AcceleratorOrganizationPayload'];

export type AcceleratorOrgProject = AcceleratorOrg['projects'][0];
