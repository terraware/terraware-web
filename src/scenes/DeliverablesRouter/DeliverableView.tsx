import React from 'react';
import { BusySpinner, Message } from '@terraware/web-components';
import strings from 'src/strings';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import Card from 'src/components/common/Card';
import Page from 'src/components/Page';
import DeliverablePageMessage from 'src/scenes/DeliverablesRouter/DeliverablePageMessage';
import DocumentsList from 'src/scenes/DeliverablesRouter/DocumentsList';
import { EditProps, ViewProps } from 'src/components/DeliverableView/types';
import TitleBar from 'src/components/DeliverableView/TitleBar';
import DocumentsUploader from 'src/components/DeliverableView/DocumentsUploader';
import Metadata from 'src/components/DeliverableView/Metadata';

export type Props = EditProps & {
  isBusy?: boolean;
};

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
        <>
          {props.isBusy && <BusySpinner />}
          <DeliverablePageMessage {...viewProps} />
          <Card style={{ display: 'flex', flexDirection: 'column' }}>
            <Metadata {...viewProps} />
            <DocumentsUploader {...viewProps} />
            <DocumentsList {...viewProps} />
          </Card>
        </>
      }
      title={<TitleBar {...props} />}
    />
  );
};

export default DeliverableView;
