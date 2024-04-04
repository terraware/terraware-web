import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Box, Grid, useTheme } from '@mui/material';
import { Dropdown, Message, Textfield } from '@terraware/web-components';
import _ from 'lodash';

import AddLink from 'src/components/common/AddLink';
import Card from 'src/components/common/Card';
import PageForm from 'src/components/common/PageForm';
import { useAcceleratorOrgs } from 'src/hooks/useAcceleratorOrgs';
import { useCohorts } from 'src/hooks/useCohorts';
import { useLocalization } from 'src/providers';
import strings from 'src/strings';
import { AcceleratorOrg } from 'src/types/Accelerator';
import { Cohort } from 'src/types/Cohort';
import { ParticipantCreateRequest, ParticipantProject, ParticipantUpdateRequest } from 'src/types/Participant';
import useDeviceInfo from 'src/utils/useDeviceInfo';

import OrgProjectsSectionEdit, { OrgProjectsSection } from './OrgProjectsSectionEdit';

type ParticipantFormProps<T extends ParticipantCreateRequest | ParticipantUpdateRequest> = {
  busy?: boolean;
  existingProjects?: ParticipantProject[];
  participant: T;
  onCancel: () => void;
  onSave: (participant: T) => void;
};

export default function ParticipantForm<T extends ParticipantCreateRequest | ParticipantUpdateRequest>(
  props: ParticipantFormProps<T>
): JSX.Element {
  const { busy, existingProjects, participant, onCancel, onSave } = props;
  const { isMobile } = useDeviceInfo();
  const { activeLocale } = useLocalization();
  const theme = useTheme();
  const { availableCohorts } = useCohorts();
  const { acceleratorOrgs: allAcceleratorOrgs } = useAcceleratorOrgs(false);

  const [localRecord, setLocalRecord] = useState<T>(participant);
  const [validateFields, setValidateFields] = useState<boolean>(false);
  const [modified, setModified] = useState<boolean>(false);
  // initialize with one org selection enabled
  const [orgProjectsSections, setOrgProjectsSections] = useState<OrgProjectsSection[]>([]);
  // orgs available for selection in the dropdowns, does not included already selected orgs
  const [availableOrgs, setAvailableOrgs] = useState<AcceleratorOrg[]>([]);

  const acceleratorOrgs = useMemo<AcceleratorOrg[]>(() => {
    const orgs = (allAcceleratorOrgs || [])
      .filter((org) => org.projects.length > 0)
      .reduce(
        (acc, org) => {
          // The org by default is immutable (from redux store).
          // The local copy of org will be merged with existing participant projects' data,
          // and needs to be mutable, hence the clone.
          return { ...acc, [org.id]: _.cloneDeep(org) };
        },
        {} as Record<string, AcceleratorOrg>
      );

    // update accelerator orgs with values from already assigned project info
    (existingProjects ?? []).forEach((project) => {
      const { organizationId: id, organizationName: name, projectId, projectName } = project;
      if (!orgs[id]) {
        orgs[id] = { id, name, projects: [{ id: projectId, name: projectName }] };
      } else {
        if (!orgs[id].projects.find((orgProject) => orgProject.id === projectId)) {
          orgs[id].projects.push({ id: projectId, name: projectName });
        }
      }
    });

    return Object.values(orgs);
  }, [allAcceleratorOrgs, existingProjects]);

  const cohortOptions = useMemo(
    () => (availableCohorts || []).map((cohort: Cohort) => ({ label: cohort.name, value: cohort.id })),
    [availableCohorts]
  );

  const updateField = useCallback((field: keyof T, value: any) => {
    setModified(true);
    setLocalRecord((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const validateForm = () => {
    if (!localRecord.name) {
      return false;
    }

    if (!localRecord.cohortId) {
      return false;
    }

    return true;
  };

  const onSaveHandler = () => {
    if (!validateForm()) {
      setValidateFields(true);
      return;
    }

    onSave({
      ...localRecord,
      projectIds: orgProjectsSections.flatMap((data) => data.selectedProjectIds),
    });
  };

  /**
   * The orgProjectsSection is an array of org/projects sections
   * ordered by the section id. The id is also the index into the array
   * and has positional relevance in the rendered layout.
   */
  const onOrgSelect = useCallback(
    (sectionId: number, orgId: number) => {
      const org = acceleratorOrgs?.find((o) => o.id === orgId);
      if (!org) {
        return;
      }
      setModified(true);
      setOrgProjectsSections((prev) => {
        const updated = [...prev].map((section) =>
          section.id !== sectionId
            ? section
            : {
                ...section,
                org,
                selectedProjects: [],
              }
        );
        setAvailableOrgs((acceleratorOrgs || []).filter((o) => !updated.some((data) => data.org?.id === o.id)));
        return updated;
      });
    },
    [acceleratorOrgs]
  );

  const onProjects = useCallback((sectionId: number, selectedProjectIds: number[]) => {
    setModified(true);
    setOrgProjectsSections((prev) => {
      const updated = [...prev].map((section) =>
        section.id !== sectionId
          ? section
          : {
              ...section,
              selectedProjectIds,
            }
      );
      return updated;
    });
  }, []);

  const addOrgProjectsSection = useCallback(() => {
    setOrgProjectsSections((prev) => [...prev, { id: prev.length + 1, selectedProjectIds: [] }]);
  }, []);

  // initialize sections for participant that already had project ids (edit use-case)
  useEffect(() => {
    if (modified) {
      return;
    }

    const sections = acceleratorOrgs
      .filter((org) => org.projects.some((p) => (localRecord.projectIds ?? []).some((id) => id === p.id)))
      .sort((a, b) => a.name.localeCompare(b.name, activeLocale || undefined))
      .map((org, index) => ({
        id: index + 1,
        org,
        selectedProjectIds: org.projects
          .map((p) => p.id)
          .filter((projectId) => (localRecord.projectIds ?? []).some((id) => id === projectId)),
      }));

    if (sections.length) {
      setModified(true);
      setOrgProjectsSections(sections);
      // remove the orgs as being available for selection (since they already has projects selected prior to edit)
      setAvailableOrgs(acceleratorOrgs.filter((org) => !sections.some((section) => section.org.id === org.id)));
    } else if (acceleratorOrgs.length) {
      // allow initial selection
      setOrgProjectsSections([{ id: 1, selectedProjectIds: [] }]);
    }
  }, [acceleratorOrgs, activeLocale, localRecord.projectIds, modified]);

  useEffect(() => {
    // update local record when participant changes
    setLocalRecord(participant);
  }, [participant]);

  useEffect(() => {
    if (acceleratorOrgs) {
      setAvailableOrgs(acceleratorOrgs);
    }
  }, [acceleratorOrgs]);

  return (
    <PageForm
      busy={busy}
      cancelID='cancelParticipantForm'
      onCancel={onCancel}
      onSave={onSaveHandler}
      saveID='saveParticipantForm'
    >
      <Card
        flushMobile
        style={{
          display: 'flex',
          flexDirection: 'column',
          margin: '0 auto',
          maxWidth: isMobile ? 'auto' : '592px',
        }}
      >
        <Grid
          container
          sx={{
            borderBottom: `1px solid ${theme.palette.TwClrBrdrTertiary}`,
            paddingBottom: theme.spacing(3),
          }}
        >
          <Grid item xs={12} sx={{ marginTop: theme.spacing(2) }}>
            <Textfield
              errorText={validateFields && !localRecord?.name ? strings.REQUIRED_FIELD : ''}
              id='name'
              label={strings.NAME}
              onChange={(value) => updateField('name', value)}
              required
              type='text'
              value={localRecord.name}
            />
          </Grid>
          <Grid item xs={12} sx={{ marginTop: theme.spacing(2) }}>
            <Dropdown
              errorText={validateFields && !localRecord?.cohortId ? strings.REQUIRED_FIELD : ''}
              fullWidth={true}
              label={strings.COHORT}
              onChange={(value) => updateField('cohortId', value)}
              options={cohortOptions}
              required
              selectedValue={localRecord.cohortId}
            />
          </Grid>
        </Grid>
        {orgProjectsSections.length === 0 && (
          <Grid item xs={12} marginTop={2}>
            <Message body={strings.ACCELERATOR_ORGS_EMPTY_WARNING} priority='warning' type='page' />
          </Grid>
        )}
        {orgProjectsSections.map((section, index) => (
          <OrgProjectsSectionEdit
            availableOrgs={availableOrgs}
            key={section.id}
            onOrgSelect={onOrgSelect}
            onProjects={onProjects}
            section={section}
          />
        ))}
        {orgProjectsSections.length < acceleratorOrgs.length && (
          <Box display='flex' marginTop={theme.spacing(2)}>
            <AddLink
              id='add-org-project'
              large={true}
              onClick={addOrgProjectsSection}
              text={strings.ADD_PROJECTS_BY_ORGANIZATION}
            />
          </Box>
        )}
      </Card>
    </PageForm>
  );
}
