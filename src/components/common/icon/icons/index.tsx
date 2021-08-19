import React from 'react';
import { ReactComponent as CaretDown } from './caret-down.svg';
import { ReactComponent as Lock } from './lock.svg';
import { ReactComponent as Plus } from './plus.svg';
import { ReactComponent as Spinner } from './spinner.svg';

export type IconName = 'lock' | 'spinner' | 'caretDown' | 'plus';

type SVGComponent = React.FunctionComponent<
  React.SVGProps<SVGSVGElement> & {
    title?: string | undefined;
  }
>;
const icons: Record<IconName, SVGComponent> = {
  lock: Lock,
  spinner: Spinner,
  caretDown: CaretDown,
  plus: Plus,
};

export default icons;
