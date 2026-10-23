import React, { type JSX } from 'react';

import { Box, Typography, useTheme } from '@mui/material';

import { AntSwitch } from 'src/components/Switch/AntSwitch';
import { EmailNotificationCategorySettingPayload } from 'src/queries/generated/emailNotificationSettings';
import strings from 'src/strings';

export type EmailNotificationCategory = EmailNotificationCategorySettingPayload['category'];

export type EmailNotificationSettingsValue = {
  categories: EmailNotificationCategorySettingPayload[];
  emailNotificationsEnabled: boolean;
};

const CATEGORY_ORDER: EmailNotificationCategory[] = ['SeedBank', 'Nursery', 'PlantingAndObservations', 'Accelerator'];

const categoryCopy = (category: EmailNotificationCategory) => {
  switch (category) {
    case 'SeedBank':
      return {
        title: strings.SEED_BANK,
        description: strings.EMAIL_NOTIFICATION_CATEGORY_SEED_BANK_DESCRIPTION,
        example: strings.EMAIL_NOTIFICATION_CATEGORY_SEED_BANK_EXAMPLE,
      };
    case 'Nursery':
      return {
        title: strings.NURSERY,
        description: strings.EMAIL_NOTIFICATION_CATEGORY_NURSERY_DESCRIPTION,
        example: strings.EMAIL_NOTIFICATION_CATEGORY_NURSERY_EXAMPLE,
      };
    case 'PlantingAndObservations':
      return {
        title: strings.PLANTING_AND_OBSERVATIONS,
        description: strings.EMAIL_NOTIFICATION_CATEGORY_PLANTING_AND_OBSERVATIONS_DESCRIPTION,
        example: strings.EMAIL_NOTIFICATION_CATEGORY_PLANTING_AND_OBSERVATIONS_EXAMPLE,
      };
    case 'Accelerator':
      return {
        title: strings.ACCELERATOR,
        description: strings.EMAIL_NOTIFICATION_CATEGORY_ACCELERATOR_DESCRIPTION,
        example: strings.EMAIL_NOTIFICATION_CATEGORY_ACCELERATOR_EXAMPLE,
      };
  }
};

type SettingRowProps = {
  checked: boolean;
  description: string;
  disabled: boolean;
  example?: string;
  id: string;
  onChange: (checked: boolean) => void;
  title: string;
};

const SettingRow = ({ checked, description, disabled, example, id, onChange, title }: SettingRowProps) => {
  const theme = useTheme();
  const titleId = `${id}-title`;

  return (
    <Box display='flex' alignItems='flex-start' gap={theme.spacing(2)} paddingY={theme.spacing(1.5)}>
      <Box flex={1} minWidth={0}>
        <Typography id={titleId} fontSize='16px' fontWeight={600}>
          {title}
        </Typography>
        <Typography fontSize='14px' color={theme.palette.TwClrTxtSecondary}>
          {description}
        </Typography>
        {example && (
          <Typography fontSize='12px' fontStyle='italic' color={theme.palette.TwClrTxtSecondary} marginTop={0.5}>
            {example}
          </Typography>
        )}
      </Box>
      <Box marginTop={0.5}>
        <AntSwitch
          id={id}
          checked={checked}
          disabled={disabled}
          onChange={(_event, value) => onChange(value)}
          inputProps={{ 'aria-labelledby': titleId }}
        />
      </Box>
    </Box>
  );
};

type EmailNotificationSettingsProps = {
  edit: boolean;
  onChange: (value: EmailNotificationSettingsValue) => void;
  value: EmailNotificationSettingsValue;
};

const EmailNotificationSettings = ({ edit, onChange, value }: EmailNotificationSettingsProps): JSX.Element => {
  const theme = useTheme();
  const { categories, emailNotificationsEnabled } = value;

  const sortedCategories = CATEGORY_ORDER.flatMap(
    (category) => categories.find((setting) => setting.category === category) ?? []
  );

  const setCategoryOptedIn = (category: EmailNotificationCategory, optedIn: boolean) =>
    onChange({
      ...value,
      categories: categories.map((setting) => (setting.category === category ? { ...setting, optedIn } : setting)),
    });

  return (
    <Box>
      <SettingRow
        id='emailNotificationsEnabled'
        title={strings.EMAIL_NOTIFICATIONS}
        description={strings.EMAIL_NOTIFICATIONS_DESCRIPTION}
        checked={emailNotificationsEnabled}
        disabled={!edit}
        onChange={(checked) => onChange({ ...value, emailNotificationsEnabled: checked })}
      />
      {sortedCategories.length > 0 && (
        <Box
          borderLeft={`2px solid ${theme.palette.TwClrBrdrTertiary}`}
          marginLeft={theme.spacing(1)}
          paddingLeft={theme.spacing(3)}
          sx={{ opacity: emailNotificationsEnabled ? 1 : 0.5 }}
        >
          {sortedCategories.map(({ category, optedIn }) => (
            <SettingRow
              key={category}
              id={`emailNotificationCategory-${category}`}
              {...categoryCopy(category)}
              checked={optedIn}
              disabled={!edit || !emailNotificationsEnabled}
              onChange={(checked) => setCategoryOptedIn(category, checked)}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

export default EmailNotificationSettings;
