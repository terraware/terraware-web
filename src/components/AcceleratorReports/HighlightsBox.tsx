import React from 'react';

import { Textfield } from '@terraware/web-components';

import strings from 'src/strings';

import EditableReportBox from './EditableReportBox';

const HighlightsBox = ({ highlights }: { highlights?: string }) => {
  return (
    <EditableReportBox
      name={strings.HIGHLIGHTS}
      canEdit={false}
      onEdit={() => {}}
      onCancel={() => {}}
      onSave={() => {}}
    >
      <Textfield
        type='textarea'
        value={highlights}
        id={'highlights'}
        label={''}
        display={true}
        preserveNewlines={true}
      />
    </EditableReportBox>
  );
};

export default HighlightsBox;
