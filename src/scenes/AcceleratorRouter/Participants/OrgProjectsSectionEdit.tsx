import React, { useCallback, useMemo } from 'react';

import { Grid, useTheme } from '@mui/material';
import { Dropdown, MultiSelect } from '@terraware/web-components';

import { useLocalization } from 'src/providers';
import strings from 'src/strings';
import { AcceleratorOrg } from 'src/types/Accelerator';

export type OrgProjectsSection = {
  id: number;
  org?: AcceleratorOrg;
  selectedProjectIds: number[];
};

export type OrgProjectsSectionEditProps = {
  availableOrgs: AcceleratorOrg[];
  onOrgSelect: (sectionId: number, orgId: number) => void;
  onProjects: (sectionId: number, projectIds: number[]) => void;
  section: OrgProjectsSection;
};

const OrgProjectsSectionEdit = ({
  availableOrgs,
  onOrgSelect,
  onProjects,
  section,
}: OrgProjectsSectionEditProps): JSX.Element => {
  const { activeLocale } = useLocalization();
  const theme = useTheme();

  const onOrgChange = useCallback(
    (id: string) => {
      onOrgSelect(section.id, Number(id));
    },
    [onOrgSelect, section.id]
  );

  const onAddProjectId = useCallback(
    (id: number) => {
      const projectIds = [...section.selectedProjectIds, id];
      onProjects(section.id, projectIds);
    },
    [onProjects, section]
  );

  const onRemoveProjectId = useCallback(
    (id: number) => {
      const projectIds = section.selectedProjectIds.filter((projectId) => projectId !== id);
      onProjects(section.id, projectIds);
    },
    [onProjects, section]
  );

  const orgOptions = useMemo(() => {
    const orgs = [...availableOrgs];
    if (section.org) {
      orgs.push(section.org);
    }
    return orgs
      .sort((a, b) => a.name.localeCompare(b.name, activeLocale || undefined))
      .map((o) => ({ label: o.name, value: o.id }));
  }, [activeLocale, availableOrgs, section.org]);

  const projectOptions = useMemo(() => {
    const options = new Map<number, string>([]);
    section.org?.projects.forEach((project) => {
      options.set(project.id, project.name);
    });
    return options;
  }, [section.org]);

  return (
    <Grid
      container
      sx={{
        borderBottom: `1px solid ${theme.palette.TwClrBrdrTertiary}`,
        paddingBottom: theme.spacing(3),
      }}
    >
      <Grid item xs={12} sx={{ marginTop: theme.spacing(2) }}>
        <Dropdown
          fullWidth={true}
          label={strings.ORGANIZATION}
          onChange={onOrgChange}
          options={orgOptions}
          selectedValue={section.org?.id}
        />
      </Grid>
      <Grid item xs={12} sx={{ marginTop: theme.spacing(2) }}>
        <MultiSelect<number, string>
          fullWidth
          onAdd={onAddProjectId}
          onRemove={onRemoveProjectId}
          options={projectOptions}
          placeHolder={strings.SELECT}
          valueRenderer={(v) => v}
          selectedOptions={section.selectedProjectIds}
          label={strings.PROJECTS}
        />
      </Grid>
    </Grid>
  );
};

export default OrgProjectsSectionEdit;
