import React, { type JSX } from 'react';

import { Props as ButtonProps } from '@terraware/web-components/components/Button/Button';
import Tooltip from '@terraware/web-components/components/Tooltip/Tooltip';

import Button from './Button';

export type TooltipButtonProps = {
  tooltip?: string; // if not undefined, hovering over the button will show a tooltip
};

const TooltipButton = (props: TooltipButtonProps & ButtonProps): JSX.Element => {
  const { tooltip } = props;

  if (tooltip !== undefined) {
    return (
      <Tooltip title={tooltip}>
        <Button {...props} />
      </Tooltip>
    );
  } else {
    return <Button {...props} />;
  }
};

export default TooltipButton;
