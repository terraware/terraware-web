type NamedIdentifiableObject = {
  id: number;
  name: string;
};

export type AcceleratorOrgProject = NamedIdentifiableObject;

export type AcceleratorOrg = NamedIdentifiableObject & {
  // available for Participant membership
  availableProjects: AcceleratorOrgProject[];
};
