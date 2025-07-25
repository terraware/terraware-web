import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Grid, useTheme } from '@mui/material';
import { Dropdown, Textfield } from '@terraware/web-components';

import { useLocalization } from 'src/providers';
import { requestGetParticipantProject } from 'src/redux/features/participantProjects/participantProjectsAsyncThunks';
import { selectParticipantProjectRequest } from 'src/redux/features/participantProjects/participantProjectsSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { AcceleratorOrg } from 'src/types/Accelerator';
import { ParticipantProject } from 'src/types/ParticipantProject';

export type OrgProjectsSection = {
  id: number;
  org?: AcceleratorOrg;
  projectId: number;
  projectDetails: ParticipantProject;
  isNew?: boolean;
  isPopulated?: boolean;
};

export type OrgProjectsSectionEditProps = {
  availableOrgs: AcceleratorOrg[];
  onOrgSelect: (sectionId: number, orgId: number) => void;
  onProjectSelect: (sectionId: number, projectId: number) => void;
  section: OrgProjectsSection;
  updateProjectDetails: (projectId: number, field?: string, value?: string, allDetails?: ParticipantProject) => void;
  validateFields: boolean;
};

const OrgProjectsSectionEdit = ({
  availableOrgs,
  onOrgSelect,
  onProjectSelect,
  section,
  updateProjectDetails,
  validateFields,
}: OrgProjectsSectionEditProps): JSX.Element => {
  const { activeLocale } = useLocalization();
  const theme = useTheme();
  const [selectedProject, setSelectedProject] = useState<string>(section.projectId?.toString());
  const dispatch = useAppDispatch();
  const projectDetailsRequest = useAppSelector(selectParticipantProjectRequest(Number(selectedProject)));

  useEffect(() => {
    if (projectDetailsRequest?.status === 'success' && !section.isPopulated) {
      updateProjectDetails(section.projectId, undefined, undefined, projectDetailsRequest.data);
    }
  }, [projectDetailsRequest, section.projectId, updateProjectDetails, section.isPopulated]);

  useEffect(() => {
    onProjectSelect(section.id, Number(selectedProject));
  }, [selectedProject, onProjectSelect, section.id]);

  const onOrgChange = useCallback(
    (id: string) => {
      onOrgSelect(section.id, Number(id));
    },
    [onOrgSelect, section.id]
  );

  const orgOptions = useMemo(() => {
    const orgs = [...availableOrgs];
    const orgIds = orgs.map((org) => org.id);
    if (section.org && !orgIds.includes(section.org.id)) {
      orgs.push(section.org);
    }
    return orgs
      .sort((a, b) => a.name.localeCompare(b.name, activeLocale || undefined))
      .map((o) => ({ label: o.name, value: o.id }));
  }, [activeLocale, availableOrgs, section.org]);

  const projectOptions = useMemo(() => {
    return section.org?.projects.map((project) => {
      return { label: project.name, value: project.id.toString() };
    });
  }, [section.org]);

  useEffect(() => {
    if (section.projectId.toString() !== '-1') {
      setSelectedProject(section.projectId.toString());
      void dispatch(requestGetParticipantProject(section.projectId));
    }
  }, [section.projectId, projectOptions, dispatch]);

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sx={{ marginTop: theme.spacing(2) }}>
        <Dropdown
          fullWidth={true}
          label={strings.ORGANIZATION}
          onChange={onOrgChange}
          options={orgOptions}
          selectedValue={section.org?.id}
          tooltipTitle={strings.ACCELERATOR_ORGS_TOOLTIP}
          required
          errorText={validateFields && (!section.org?.id || section.org.id === -1) ? strings.REQUIRED_FIELD : ''}
          disabled={!section.isNew}
          autocomplete={section.isNew}
        />
      </Grid>
      <Grid item xs={6}>
        <Dropdown
          fullWidth
          options={projectOptions}
          placeholder={strings.SELECT}
          onChange={(value) => setSelectedProject(value)}
          label={strings.PROJECT}
          selectedValue={selectedProject}
          required
          errorText={
            validateFields && (!section.projectDetails.projectId || section.projectDetails.projectId === -1)
              ? strings.REQUIRED_FIELD
              : ''
          }
          autocomplete
        />
      </Grid>
      <Grid item xs={6}>
        <Textfield
          label={strings.FILE_NAMING}
          id='fileNaming'
          onChange={(value) => updateProjectDetails(section.projectId, 'fileNaming', value as string)}
          type='text'
          value={section.projectDetails.fileNaming}
          required={true}
          errorText={validateFields && !section.projectDetails.fileNaming ? strings.REQUIRED_FIELD : ''}
        />
      </Grid>
      <Grid item xs={12}>
        <Textfield
          label={strings.GOOGLE_FOLDER_URL}
          id='googleFolderUrl'
          onChange={(value) => updateProjectDetails(section.projectId, 'googleFolderUrl', value as string)}
          type='text'
          value={section.projectDetails.googleFolderUrl}
          required={true}
          errorText={validateFields && !section.projectDetails.googleFolderUrl ? strings.REQUIRED_FIELD : ''}
        />
      </Grid>
      <Grid item xs={12}>
        <Textfield
          label={strings.DROPBOX_FOLDER_URL}
          id='dropboxFolderPath'
          onChange={(value) => updateProjectDetails(section.projectId, 'dropboxFolderPath', value as string)}
          type='text'
          value={section.projectDetails.dropboxFolderPath}
          required={true}
          errorText={validateFields && !section.projectDetails.dropboxFolderPath ? strings.REQUIRED_FIELD : ''}
        />
      </Grid>
    </Grid>
  );
};

export default OrgProjectsSectionEdit;
