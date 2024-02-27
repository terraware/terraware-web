import { BusySpinner, Message } from '@terraware/web-components';
import { useRouteMatch } from 'react-router-dom';
import { APP_PATHS } from 'src/constants';
import strings from 'src/strings';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import Card from 'src/components/common/Card';
import Page from 'src/components/Page';
import DocumentsList from 'src/scenes/DeliverablesRouter/DocumentsList';
import AcceleratorDocumentsList from 'src/scenes/AcceleratorRouter/AcceleratorDocumentsList';
import { EditProps, ViewProps } from './types';
import TitleBar from './TitleBar';
import Metadata from './Metadata';
import DocumentsUploader from './DocumentsUploader';

export type Props = EditProps & {
  isBusy?: boolean;
};

const DeliverableView = (props: Props): JSX.Element => {
  const { ...viewProps }: ViewProps = props;
  const { isMobile } = useDeviceInfo();
  const isAcceleratorRoute = useRouteMatch(APP_PATHS.ACCELERATOR);

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
        <>
          {props.isBusy && <BusySpinner />}
          <Card style={{ display: 'flex', flexDirection: 'column' }}>
            <Metadata {...viewProps} />
            <DocumentsUploader {...viewProps} />
            {isAcceleratorRoute ? <AcceleratorDocumentsList {...props} /> : <DocumentsList {...props} />}
          </Card>
        </>
      }
      title={<TitleBar {...props} />}
    />
  );
};

export default DeliverableView;
