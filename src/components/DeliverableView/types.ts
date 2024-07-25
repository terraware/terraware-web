import { ReactNode } from 'react';

import { Deliverable } from 'src/types/Deliverables';

export type ViewProps = {
  deliverable: Deliverable;
  setSubmitButtonDisalbed?: (disabled: boolean) => void;
};

export type EditProps = ViewProps & {
  callToAction?: ReactNode;
  optionsMenu?: ReactNode;
};
