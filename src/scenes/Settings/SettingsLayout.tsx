import React, { type JSX, useCallback, useMemo } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { Tab, Tabs } from '@terraware/web-components';

import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useLocalization, useOrganization } from 'src/providers/hooks';

import { SECTION_PATHS, SettingsSection, getAllowedSections, writeStoredSection } from './settingsTabs';

type SettingsLayoutProps = {
  activeSection: SettingsSection;
  children: React.ReactNode;
};

const SettingsLayout = ({ activeSection, children }: SettingsLayoutProps): JSX.Element => {
  const { strings } = useLocalization();
  const { selectedOrganization } = useOrganization();
  const navigate = useSyncNavigate();
  const theme = useTheme();

  const sectionLabels = useMemo<Record<SettingsSection, string>>(
    () => ({
      organization: strings.ORGANIZATION,
      people: strings.PEOPLE,
      projects: strings.PROJECTS,
    }),
    [strings]
  );

  const tabs = useMemo<Tab[]>(
    () =>
      getAllowedSections(selectedOrganization).map((section) => ({
        id: section,
        label: sectionLabels[section],
        children: <></>,
      })),
    [selectedOrganization, sectionLabels]
  );

  const onChangeTab = useCallback(
    (tab: string) => {
      const section = tab as SettingsSection;
      writeStoredSection(section);
      navigate(SECTION_PATHS[section]);
    },
    [navigate]
  );

  // The section routers (children) each render their own Page with a title.
  // SettingsLayout therefore renders only the tab bar above that content — no Page of
  // its own — to avoid doubled page chrome and nested <main> elements. The tabs' own
  // (empty) panels are hidden since the section content is provided via children.
  return (
    <Box>
      <Box sx={{ '& .MuiTabPanel-root': { display: 'none' } }}>
        <Typography fontSize='24px' fontWeight={600} margin={theme.spacing(0, 4, 2)}>
          {selectedOrganization
            ? strings.formatString(strings.SETTINGS_FOR, selectedOrganization.name)
            : strings.SETTINGS}
        </Typography>
        <Tabs activeTab={activeSection} onChangeTab={onChangeTab} tabs={tabs} />
      </Box>
      {children}
    </Box>
  );
};

export default SettingsLayout;
