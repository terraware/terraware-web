import type { JSX } from 'react';

import { ProgressCircle as WebComponentsProgressCircle } from '@terraware/web-components';
import { Props } from '@terraware/web-components/components/ProgressCircle/ProgressCircle';

import strings from 'src/strings';

function renderPercentText(percent: number): string {
  return strings.formatString(strings.PERCENTAGE_VALUE, percent) as string;
}

export default function ProgressCircle(props: Omit<Props, 'renderPercentText'>): JSX.Element {
  return WebComponentsProgressCircle({ ...props, renderPercentText });
}
