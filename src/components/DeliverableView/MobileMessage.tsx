import React, { type JSX } from 'react';

import { Message } from '@terraware/web-components';

import TitleBar from 'src/components/DeliverableView/TitleBar';
import Page from 'src/components/Page';
import strings from 'src/strings';

import { ViewProps } from './types';

const MobileMessage = (props: ViewProps): JSX.Element => (
  <Page title={<TitleBar deliverable={props.deliverable} />}>
    <Message body={strings.FEATURE_AVAILABLE_ON_DESKTOP} priority='info' type='page' />
  </Page>
);

export default MobileMessage;
