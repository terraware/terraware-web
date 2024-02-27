import React from 'react';
import { BusySpinner, Message } from '@terraware/web-components';
import strings from 'src/strings';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import Card from 'src/components/common/Card';
import Page from 'src/components/Page';
import AcceleratorDocumentsList from 'src/scenes/AcceleratorRouter/AcceleratorDocumentsList';
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
>>>>>>> 65dae5b82a (SW-4906 Implement router-specific deliverable views so we can encapsulate the view-agnostic components)
<<<<<<< HEAD:src/components/DeliverableView/index.tsx
import { EditProps, ViewProps } from './types';
import TitleBar from './TitleBar';
import Metadata from './Metadata';
import DocumentsUploader from './DocumentsUploader';
=======
<<<<<<< HEAD
=======
>>>>>>> 028a74d2f2 (SW-4906 Implement router-specific deliverable views so we can encapsulate the view-agnostic components)
>>>>>>> 65dae5b82a (SW-4906 Implement router-specific deliverable views so we can encapsulate the view-agnostic components)
import { EditProps, ViewProps } from 'src/components/DeliverableView/types';
import TitleBar from 'src/components/DeliverableView/TitleBar';
import StatusBar from 'src/components/DeliverableView/StatusBar';
import Description from 'src/components/DeliverableView/Description';
import DocumentsUploader from 'src/components/DeliverableView/DocumentsUploader';
<<<<<<< HEAD
>>>>>>> ea1e7bec59 (SW-4906 Implement router-specific deliverable views so we can encapsulate the view-agnostic components):src/scenes/AcceleratorRouter/DeliverableView.tsx
=======
<<<<<<< HEAD
=======
>>>>>>> 126ce6a6f7 (SW-4906 Implement router-specific deliverable views so we can encapsulate the view-agnostic components):src/scenes/AcceleratorRouter/DeliverableView.tsx
>>>>>>> 028a74d2f2 (SW-4906 Implement router-specific deliverable views so we can encapsulate the view-agnostic components)
>>>>>>> 65dae5b82a (SW-4906 Implement router-specific deliverable views so we can encapsulate the view-agnostic components)

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
          <Card style={{ display: 'flex', flexDirection: 'column' }}>
            <Metadata {...viewProps} />
            <DocumentsUploader {...viewProps} />
            <AcceleratorDocumentsList {...viewProps} />
          </Card>
        </>
      }
      title={<TitleBar {...props} />}
    />
  );
};

export default DeliverableView;
