import { ReactNode } from 'react';
import { Deliverable } from 'src/types/Deliverables';

export type ViewProps = {
  deliverable: Deliverable;
  isAcceleratorConsole?: boolean;
};

export type EditProps = ViewProps & {
  callToAction?: ReactNode;
};
