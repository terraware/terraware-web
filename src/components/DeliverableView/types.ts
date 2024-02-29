import { ReactNode } from 'react';
import { Deliverable } from 'src/types/Deliverables';

export type ViewProps = {
  deliverable: Deliverable;
};

export type EditProps = ViewProps & {
  callToAction?: ReactNode;
};
