import { ReactNode } from 'react';

import { DeliverableWithOverdue } from 'src/types/Deliverables';

export type ViewProps = {
  deliverable: DeliverableWithOverdue;
  hideId?: boolean;
  hideStatusBadge?: boolean;
  setSubmitButtonDisalbed?: (disabled: boolean) => void;
};

export type EditProps = ViewProps & {
  callToAction?: ReactNode;
  optionsMenu?: ReactNode;
};
