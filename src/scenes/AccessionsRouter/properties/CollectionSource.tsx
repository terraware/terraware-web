import React, { type JSX, useState } from 'react';

import { Dropdown } from '@terraware/web-components';

import TooltipLearnMoreModal, {
  LearnMoreLink,
  LearnMoreModalContentCollectionSource,
  TooltipLearnMoreModalData,
} from 'src/components/TooltipLearnMoreModal';
import strings from 'src/strings';

interface Props {
  placeholder: string;
  id: string;
  label: string;
  onChange: (value: string) => void;
  selectedValue?: string;
}

export default function CollectionSource(props: Props): JSX.Element {
  const [tooltipLearnMoreModalOpen, setTooltipLearnMoreModalOpen] = useState(false);
  const [tooltipLearnMoreModalData, setTooltipLearnMoreModalData] = useState<TooltipLearnMoreModalData | undefined>(
    undefined
  );
  const openTooltipLearnMoreModal = (data: TooltipLearnMoreModalData) => {
    setTooltipLearnMoreModalData(data);
    setTooltipLearnMoreModalOpen(true);
  };
  const handleTooltipLearnMoreModalClose = () => {
    setTooltipLearnMoreModalOpen(false);
  };

  return (
    <>
      <TooltipLearnMoreModal
        content={tooltipLearnMoreModalData?.content}
        onClose={handleTooltipLearnMoreModalClose}
        open={tooltipLearnMoreModalOpen}
        title={tooltipLearnMoreModalData?.title}
      />
      <Dropdown
        {...props}
        fullWidth={true}
        tooltipTitle={
          <>
            {strings.TOOLTIP_ACCESSIONS_COLLECTION_SOURCE}
            <LearnMoreLink
              onClick={() =>
                openTooltipLearnMoreModal({
                  title: strings.COLLECTION_SOURCE,
                  content: <LearnMoreModalContentCollectionSource />,
                })
              }
            />
          </>
        }
        options={[
          {
            label: strings.WILD_IN_SITU,
            value: 'Wild',
          },
          {
            label: strings.REINTRODUCED,
            value: 'Reintroduced',
          },
          {
            label: strings.CULTIVATED_EX_SITU,
            value: 'Cultivated',
          },
          {
            label: strings.OTHER,
            value: 'Other',
          },
        ]}
      />
    </>
  );
}
