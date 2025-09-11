import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Box, Grid, Typography, useTheme } from '@mui/material';
import { Dropdown, Icon, Message, Textfield } from '@terraware/web-components';
import _ from 'lodash';

import AddLink from 'src/components/common/AddLink';
import Card from 'src/components/common/Card';
import Link from 'src/components/common/Link';
import PageForm from 'src/components/common/PageForm';
import { useAcceleratorOrgs } from 'src/hooks/useAcceleratorOrgs';
import { useCohorts } from 'src/hooks/useCohorts';
import { useLocalization } from 'src/providers';
import strings from 'src/strings';
import { AcceleratorOrg } from 'src/types/Accelerator';
import { Cohort } from 'src/types/Cohort';
import { ParticipantCreateRequest, ParticipantProject, ParticipantUpdateRequest } from 'src/types/Participant';
import { ParticipantProject as ParticipantProjectType } from 'src/types/ParticipantProject';
import useDeviceInfo from 'src/utils/useDeviceInfo';

import OrgProjectsSectionEdit, { OrgProjectsSection } from './OrgProjectsSectionEdit';

type ParticipantFormProps<T extends ParticipantCreateRequest | ParticipantUpdateRequest> = {
  busy?: boolean;
  existingProjects?: ParticipantProject[];
  participant: T;
  onCancel: () => void;
  onSave: (participant: T, projectsDetails: ParticipantProjectType[]) => void;
};

export default function ParticipantForm<T extends ParticipantCreateRequest | ParticipantUpdateRequest>(
  props: ParticipantFormProps<T>
): JSX.Element {
  const { busy, existingProjects, participant, onCancel, onSave } = props;
  const { isMobile } = useDeviceInfo();
  const { activeLocale } = useLocalization();
  const theme = useTheme();
  const { availableCohorts } = useCohorts();
  const { acceleratorOrgs: allAcceleratorOrgs } = useAcceleratorOrgs();

  const [localRecord, setLocalRecord] = useState<T>(participant);
  const [validateFields, setValidateFields] = useState<boolean>(false);
  const [modified, setModified] = useState<boolean>(false);
  // initialize with one org selection enabled
  const [orgProjectsSections, setOrgProjectsSections] = useState<OrgProjectsSection[]>([]);
  // ensures org sections don't update each other after deleting and adding a section
  const [sectionSeq, setSectionSeq] = useState<number>(0);

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
        orgs[id] = { id, name, projects: [{ id: projectId, name: projectName }], tfContactUsers: [] };
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

    const details = orgProjectsSections.map((ops) => ops.projectDetails);
    const detailsMissingFields = details.some((detail) => {
      return (
        !detail.fileNaming ||
        !detail.googleFolderUrl ||
        !detail.dropboxFolderPath ||
        detail.projectId === -1 ||
        !detail.projectId
      );
    });

    return !detailsMissingFields;
  };

  const onSaveHandler = () => {
    if (!validateForm()) {
      setValidateFields(true);
      return;
    }

    onSave(
      {
        ...localRecord,
        projectIds: orgProjectsSections.flatMap((data) => data.projectId),
      },
      orgProjectsSections.map((ops) => ops.projectDetails)
    );
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
        return [...prev].map((section) =>
          section.id !== sectionId
            ? section
            : {
                ...section,
                org,
                selectedProjects: [],
              }
        );
      });
    },
    [acceleratorOrgs]
  );

  const onProjectSelect = useCallback((sectionId: number, projectId: number) => {
    setModified(true);
    setOrgProjectsSections((prev) => {
      return [...prev].map((section) =>
        section.id !== sectionId
          ? section
          : {
              ...section,
              projectDetails: { ...section.projectDetails, projectId },
              projectId,
            }
      );
    });
  }, []);

  const removeOrgProjectsSection = useCallback((index: number) => {
    setOrgProjectsSections((prev) => {
      const newProjects = [...prev];
      newProjects.splice(index, 1);
      return newProjects;
    });
  }, []);

  const addOrgProjectsSection = useCallback(() => {
    setOrgProjectsSections((prev) => [
      ...prev,
      {
        id: sectionSeq + 1,
        projectId: -1,
        projectDetails: { projectId: -1, landUseModelTypes: [], metricProgress: [] },
        isNew: true,
      },
    ]);
    setSectionSeq((prev) => prev + 1);
  }, [sectionSeq]);

  // initialize sections for participant that already had project ids (edit use-case)
  useEffect(() => {
    const sections: OrgProjectsSection[] = [];
    localRecord.projectIds?.forEach((projectId, index) => {
      sections.push({
        id: index + 1,
        org: acceleratorOrgs.find((org) => org.projects.some((proj) => proj.id === projectId)),
        projectId,
        projectDetails: { projectId, landUseModelTypes: [], metricProgress: [] },
      });
    });

    if (sections.length) {
      setModified(true);
      setOrgProjectsSections(sections);
    } else if (acceleratorOrgs.length) {
      // allow initial selection
      setOrgProjectsSections([
        {
          id: 1,
          projectId: -1,
          projectDetails: { projectId: -1, landUseModelTypes: [], metricProgress: [] },
          isNew: true,
        },
      ]);
    }
    setSectionSeq(sections.length || 1);
  }, [acceleratorOrgs, activeLocale, localRecord.projectIds, modified]);

  useEffect(() => {
    // update local record when participant changes
    setLocalRecord(participant);
  }, [participant]);

  const updateProjectDetails = (
    projectId: number,
    field?: string,
    value?: string,
    allDetails?: ParticipantProjectType
  ) => {
    setOrgProjectsSections((prev) => {
      const sectionToUpdate = prev.find((section) => section.projectId === projectId);

      if (!sectionToUpdate) {
        return prev;
      }

      let newDetails: ParticipantProjectType = { landUseModelTypes: [], metricProgress: [], projectId };

      if (field && value !== undefined) {
        newDetails = { ...sectionToUpdate.projectDetails, [field]: value };
      } else if (allDetails) {
        newDetails = allDetails;
      }

      return prev.map((section) =>
        section.projectId === projectId
          ? {
              ...section,
              projectDetails: {
                ...newDetails,
                landUseModelTypes: newDetails.landUseModelTypes || [],
                projectId,
              },
              isPopulated: true,
            }
          : section
      );
    });
  };

  // orgs available for selection in the dropdowns, excludes selected orgs with no other projects
  const availableOrgs = useMemo(() => {
    return (acceleratorOrgs || []).filter((org) => {
      const selectedProjectIds = orgProjectsSections
        .filter((section) => section.org?.id === org.id)
        .map((section) => section.projectId);

      return org.projects.some((project) => !selectedProjectIds.includes(project.id));
    });
  }, [acceleratorOrgs, orgProjectsSections]);

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
        {orgProjectsSections.length === 0 && acceleratorOrgs.length === 0 && (
          <Grid item xs={12} marginTop={2}>
            <Message body={strings.ACCELERATOR_ORGS_EMPTY_WARNING} priority='warning' type='page' />
          </Grid>
        )}
        {orgProjectsSections.map((section, index) => (
          <Box
            key={`section-${section.id}`}
            sx={{
              borderBottom: `1px solid ${theme.palette.TwClrBrdrTertiary}`,
              paddingBottom: theme.spacing(3),
            }}
          >
            <OrgProjectsSectionEdit
              availableOrgs={availableOrgs}
              key={section.id}
              onOrgSelect={onOrgSelect}
              onProjectSelect={onProjectSelect}
              section={section}
              updateProjectDetails={updateProjectDetails}
              validateFields={validateFields}
            />
            {orgProjectsSections.length > 1 && (
              <Box display='flex' marginTop={theme.spacing(2)}>
                <Link
                  onClick={() => removeOrgProjectsSection(index)}
                  fontSize='16px'
                  disabled={orgProjectsSections.length === 1}
                >
                  <Box display='flex' alignItems='center'>
                    <Icon
                      name='iconSubtract'
                      style={{
                        fill: theme.palette.TwClrIcnSecondary,
                        height: '20px',
                        width: '20px',
                      }}
                    />
                    <Typography fontWeight={500} color={theme.palette.TwClrIcnSecondary}>
                      &nbsp;{strings.REMOVE_PROJECT}
                    </Typography>
                  </Box>
                </Link>
              </Box>
            )}
          </Box>
        ))}
        {acceleratorOrgs.length > 0 && (
          <Box display='flex' marginTop={theme.spacing(2)}>
            <AddLink
              disabled={orgProjectsSections.length === acceleratorOrgs.length}
              id='add-org-project'
              large={true}
              onClick={addOrgProjectsSection}
              text={strings.ADD_PROJECT_BY_ORGANIZATION}
              tooltipTitle={
                orgProjectsSections.length === acceleratorOrgs.length ? strings.ACCELERATOR_ORGS_EXHAUSTED_WARNING : ''
              }
            />
          </Box>
        )}
      </Card>
    </PageForm>
  );
}
