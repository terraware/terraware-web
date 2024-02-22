import { Message } from '@terraware/web-components';
import strings from 'src/strings';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import Card from 'src/components/common/Card';
import Page from 'src/components/Page';
import { EditProps, ViewProps } from './types';
import TitleBar from './TitleBar';
import StatusBar from './StatusBar';
import Description from './Description';
import DocumentsUploader from './DocumentsUploader';
import DocumentsList from './DocumentsList';

export type Props = EditProps;

const DeliverableView = (props: Props): JSX.Element => {
  const { ...viewProps }: ViewProps = props;
  const { isMobile } = useDeviceInfo();

  if (isMobile) {
    return (
      <Page
        content={<Message body={strings.FEATURE_AVAILABLE_ON_DESKTOP} priority='info' type='page' />}
        title={<TitleBar deliverable={props.deliverable} isAcceleratorConsole={props.isAcceleratorConsole} />}
      />
    );
  }

  return (
    <Page
      content={
        <Card style={{ display: 'flex', flexDirection: 'column' }}>
          <StatusBar {...viewProps} />
          <Description {...viewProps} />
          <DocumentsUploader {...viewProps} />
          <DocumentsList {...viewProps} />
        </Card>
      }
      title={<TitleBar {...props} />}
    />
  );
};

export default DeliverableView;
