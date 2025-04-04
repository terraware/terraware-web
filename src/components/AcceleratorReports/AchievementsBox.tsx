import React from 'react';

import { Grid, useTheme } from '@mui/material';
import { Textfield } from '@terraware/web-components';

import strings from 'src/strings';

import EditableReportBox from './EditableReportBox';

const Achievement = ({
  achievement,
  key,
  includeBorder,
}: {
  achievement: string;
  key: string;
  includeBorder: boolean;
}) => {
  const theme = useTheme();

  return (
    <Grid container borderBottom={includeBorder ? `1px solid ${theme.palette.TwClrBgTertiary}` : ''} marginBottom={1}>
      <Textfield
        key={key}
        type='text'
        value={achievement}
        id={`achievement-${key}`}
        label={''}
        display={true}
        preserveNewlines
      />
    </Grid>
  );
};

const AchievementsBox = ({ achievements }: { achievements?: string[] }) => {
  return (
    <EditableReportBox
      name={strings.ACHIEVEMENTS}
      canEdit={false}
      onEdit={() => {}}
      onCancel={() => {}}
      onSave={() => {}}
    >
      {achievements?.map((achievement, i) => (
        <Achievement achievement={achievement} key={i.toString()} includeBorder={i < achievements.length - 1} />
      ))}
    </EditableReportBox>
  );
};

export default AchievementsBox;
