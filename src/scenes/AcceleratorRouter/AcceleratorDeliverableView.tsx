import React, { useMemo } from 'react';
import { BusySpinner } from '@terraware/web-components';
import strings from 'src/strings';
import { APP_PATHS } from 'src/constants';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import { useLocalization } from 'src/providers';
import Card from 'src/components/common/Card';
import { Crumb } from 'src/components/BreadCrumbs';
import Page from 'src/components/Page';
import AcceleratorDocumentsList from 'src/scenes/AcceleratorRouter/AcceleratorDocumentsList';
import { EditProps, ViewProps } from 'src/components/DeliverableView/types';
import MobileMessage from 'src/components/DeliverableView/MobileMessage';
import TitleBar from 'src/components/DeliverableView/TitleBar';
import DocumentsUploader from 'src/components/DeliverableView/DocumentsUploader';
import Metadata from 'src/components/DeliverableView/Metadata';

export type Props = EditProps & {
  isBusy?: boolean;
};

const AcceleratorDeliverableView = (props: Props): JSX.Element => {
  const { ...viewProps }: ViewProps = props;
  const { isMobile } = useDeviceInfo();
  const { activeLocale } = useLocalization();

  const crumbs: Crumb[] = useMemo(
    () => [
      {
        name: activeLocale ? strings.DELIVERABLES : '',
        to: APP_PATHS.ACCELERATOR_DELIVERABLES,
      },
    ],
    [activeLocale]
  );

  if (isMobile) {
    return <MobileMessage {...viewProps} />;
  }

  return (
    <Page title={<TitleBar {...viewProps} />} rightComponent={props.callToAction} crumbs={crumbs}>
      <>
        {props.isBusy && <BusySpinner />}
        <Card style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
          <Metadata {...viewProps} />
          <DocumentsUploader {...viewProps} />
          <AcceleratorDocumentsList {...viewProps} />
        </Card>
      </>
    </Page>
  );
};

export default AcceleratorDeliverableView;
