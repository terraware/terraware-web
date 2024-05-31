import React, { useCallback, useMemo, useState } from 'react';

import { Box, useTheme } from '@mui/material';
import { BusySpinner, DropdownItem } from '@terraware/web-components';

import { Crumb } from 'src/components/BreadCrumbs';
import Metadata from 'src/components/DeliverableView/Metadata';
import MobileMessage from 'src/components/DeliverableView/MobileMessage';
import TitleBar from 'src/components/DeliverableView/TitleBar';
import { EditProps } from 'src/components/DeliverableView/types';
import Page from 'src/components/Page';
import SpeciesDeliverableTable from 'src/components/SpeciesDeliverableTable';
import Card from 'src/components/common/Card';
import OptionsMenu from 'src/components/common/OptionsMenu';
import { APP_PATHS } from 'src/constants';
import { useLocalization } from 'src/providers';
import strings from 'src/strings';
import useDeviceInfo from 'src/utils/useDeviceInfo';

import DownloadSpeciesSnapshotModal from '../Species/DownloadSpeciesSnapshotModal';
import RejectedDeliverableMessage from './RejectedDeliverableMessage';

export type Props = EditProps & {
  isBusy?: boolean;
  showRejectDialog: () => void;
};

const SpeciesDeliverableView = (props: Props): JSX.Element => {
  const { ...viewProps }: Props = props;
  const { isMobile } = useDeviceInfo();
  const { activeLocale } = useLocalization();
  const theme = useTheme();

  const [showDownloadModal, setShowDownloadModal] = useState<boolean>(false);

  const crumbs: Crumb[] = useMemo(
    () => [
      {
        name: activeLocale ? strings.DELIVERABLES : '',
        to: APP_PATHS.ACCELERATOR_DELIVERABLES,
      },
    ],
    [activeLocale]
  );

  const onOptionItemClick = useCallback((optionItem: DropdownItem) => {
    switch (optionItem.value) {
      case 'download_snapshot': {
        console.log('download');
        break;
      }
    }
  }, []);

  const optionItems = useMemo(
    (): DropdownItem[] =>
      activeLocale
        ? [
            {
              label: strings.DOWNLOAD_SPECIES_SUBMISSION_SNAPSHOT,
              value: 'download_snapshot',
            },
          ]
        : [],
    [activeLocale, props.deliverable?.status]
  );

  const optionsMenu = useMemo(
    () =>
      props.deliverable?.status === 'Approved' ? (
        <OptionsMenu onOptionItemClick={onOptionItemClick} optionItems={optionItems} />
      ) : (
        props.optionsMenu
      ),
    [props.deliverable, props.optionsMenu]
  );

  const rightComponent = useMemo(
    () => (
      <Box display='flex' flexDirection='row' flexGrow={0} marginRight={theme.spacing(3)} justifyContent='right'>
        {props.callToAction}
        {optionsMenu}
      </Box>
    ),
    []
  );

  if (isMobile) {
    return <MobileMessage {...viewProps} />;
  }

  return (
    <>
      {showDownloadModal && (
        <DownloadSpeciesSnapshotModal
          deliverableId={props.deliverable.id}
          projectId={props.deliverable.projectId}
          open={showDownloadModal}
          onClose={() => setShowDownloadModal(false)}
        />
      )}

      <Page title={<TitleBar {...viewProps} />} rightComponent={rightComponent} crumbs={crumbs}>
        {props.isBusy && <BusySpinner />}
        <Box display='flex' flexDirection='column' flexGrow={1}>
          <RejectedDeliverableMessage {...viewProps} />
          <Card style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
            <Metadata {...viewProps} />
            <SpeciesDeliverableTable deliverable={viewProps.deliverable} />
          </Card>
        </Box>
      </Page>
    </>
  );
};

export default SpeciesDeliverableView;
