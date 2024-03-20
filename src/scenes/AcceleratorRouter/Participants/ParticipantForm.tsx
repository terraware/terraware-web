import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Box, Grid, useTheme } from '@mui/material';
import { Dropdown, Textfield } from '@terraware/web-components';

import AddLink from 'src/components/common/AddLink';
import Card from 'src/components/common/Card';
import PageForm from 'src/components/common/PageForm';
import { useAcceleratorOrgs } from 'src/hooks/useAcceleratorOrgs';
import { useCohorts } from 'src/hooks/useCohorts';
import strings from 'src/strings';
import { AcceleratorOrg } from 'src/types/Accelerator';
import { Cohort } from 'src/types/Cohort';
import { ParticipantCreateRequest, ParticipantUpdateRequest } from 'src/types/Participant';
import useDeviceInfo from 'src/utils/useDeviceInfo';

import OrgProjectsSectionEdit, { OrgProjectsSection } from './OrgProjectsSectionEdit';

type ParticipantFormProps<T extends ParticipantCreateRequest | ParticipantUpdateRequest> = {
  busy?: boolean;
  participant: T;
  onCancel: () => void;
  onSave: (participant: T) => void;
};

export default function ParticipantForm<T extends ParticipantCreateRequest | ParticipantUpdateRequest>(
  props: ParticipantFormProps<T>
): JSX.Element {
  const { busy, participant, onCancel, onSave } = props;
  const { isMobile } = useDeviceInfo();
  const theme = useTheme();
  const { availableCohorts } = useCohorts();
  const { acceleratorOrgs: allAcceleratorOrgs } = useAcceleratorOrgs();

  const [localRecord, setLocalRecord] = useState<T>(participant);
  const [validateFields, setValidateFields] = useState<boolean>(false);
  // initialize with one org selection enabled
  const [orgProjectsSections, setOrgProjectsSections] = useState<OrgProjectsSection[]>([
    { id: 1, selectedProjectIds: [] },
  ]);
  // orgs available for selection in the dropdowns, does not included already selected orgs
  const [availableOrgs, setAvailableOrgs] = useState<AcceleratorOrg[]>([]);

  const acceleratorOrgs = useMemo<AcceleratorOrg[]>(
    () => (allAcceleratorOrgs || []).filter((org) => org.availableProjects.length > 0),
    [allAcceleratorOrgs]
  );

  const cohortOptions = useMemo(
    () => (availableCohorts || []).map((cohort: Cohort) => ({ label: cohort.name, value: cohort.id })),
    [availableCohorts]
  );

  const updateField = useCallback((field: keyof T, value: any) => {
    setLocalRecord((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const validateForm = () => {
    if (!localRecord.name) {
      return false;
    }

    if (!localRecord.cohort_id) {
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
        updateField(
          'project_ids',
          updated.flatMap((data) => data.selectedProjectIds)
        );
        setAvailableOrgs((acceleratorOrgs || []).filter((o) => !updated.some((data) => data.org?.id === o.id)));
        return updated;
      });
    },
    [acceleratorOrgs, updateField]
  );

  const onProjects = useCallback(
    (sectionId: number, selectedProjectIds: number[]) => {
      setOrgProjectsSections((prev) => {
        const updated = [...prev].map((section) =>
          section.id !== sectionId
            ? section
            : {
                ...section,
                selectedProjectIds,
              }
        );
        updateField(
          'project_ids',
          updated.flatMap((data) => data.selectedProjectIds)
        );
        return updated;
      });
    },
    [updateField]
  );

  const addOrgProjectsSection = useCallback(() => {
    setOrgProjectsSections((prev) => [...prev, { id: prev.length + 1, selectedProjectIds: [] }]);
  }, []);

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
              errorText={validateFields && !localRecord?.cohort_id ? strings.REQUIRED_FIELD : ''}
              fullWidth={true}
              label={strings.COHORT}
              onChange={(value) => updateField('cohort_id', value)}
              options={cohortOptions}
              required
              selectedValue={localRecord.cohort_id}
            />
          </Grid>
        </Grid>
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
