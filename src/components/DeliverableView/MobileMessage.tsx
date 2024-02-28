import { Message } from '@terraware/web-components';
import strings from 'src/strings';
import Page from 'src/components/Page';
import { ViewProps } from './types';
import TitleBar from 'src/components/DeliverableView/TitleBar';

const MobileMessage = (props: ViewProps): JSX.Element => (
  <Page title={<TitleBar deliverable={props.deliverable} />}>
    <Message body={strings.FEATURE_AVAILABLE_ON_DESKTOP} priority='info' type='page' />
  </Page>
);

export default MobileMessage;
