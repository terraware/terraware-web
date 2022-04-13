import { AppBar, Container, createStyles, Grid, makeStyles } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import strings from 'src/strings';
import { HighOrganizationRolesValues, Project, ServerOrganization } from 'src/types/Organization';
import TfDivisor from '../common/TfDivisor';
import Table from 'src/components/common/table';
import { TableColumnType } from '../common/table/types';
import { OrganizationUser } from 'src/types/User';
import TextField from '../common/Textfield/Textfield';
import useForm from 'src/utils/useForm';
import Select from '../common/Select/Select';
import Button from '../common/button/Button';
import AddToProjectModal from './AddToProjectModal';
import { addOrganizationUser, updateOrganizationUser } from 'src/api/user/user';
import snackbarAtom from 'src/state/snackbar';
import { useSetRecoilState } from 'recoil';
import ErrorBox from '../common/ErrorBox/ErrorBox';
import { getOrganizationUsers } from 'src/api/organization/organization';
import TableCellRenderer from './TableCellRenderer';
import { listAllProjects } from 'src/api/project/project';
import { getOrganizationProjects } from 'src/utils/organization';
import { APP_PATHS } from 'src/constants';
import dictionary from 'src/strings/dictionary';
import RemovedProjectsWarningModal from './RemovedProjectsWarningModal';
import InfoBox from '../common/InfoBox';

const useStyles = makeStyles((theme) =>
  createStyles({
    mainContainer: {
      paddingTop: theme.spacing(4),
      paddingBottom: theme.spacing(7),
      marginBottom: theme.spacing(6),
      background: '#ffffff',
    },
    backIcon: {
      fill: '#007DF2',
      marginRight: theme.spacing(1),
    },
    back: {
      display: 'flex',
      textDecoration: 'none',
      color: '#0067C8',
      fontSize: '20px',
      alignItems: 'center',
    },
    value: {
      fontSize: '16px',
    },
    bottomBar: {
      filter: 'drop-shadow(0px 0px 8px rgba(0, 0, 0, 0.2))',
      background: '#ffffff',
      boxShadow: 'none',
      flexDirection: 'row',
      justifyContent: 'space-between',
      display: 'flex',
      padding: '16px 24px',
      width: 'calc(100% - 200px)',
    },
    titleWithButton: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    label: {
      color: '#5C6B6C',
      lineHeight: '20px',
      fontFamily: '"Inter", sans-serif',
    },
    datePicker: {
      marginTop: '4px',
      '& .MuiOutlinedInput-root': {
        '& fieldset': {
          borderColor: '#708284',
        },
      },
    },
    blockCheckbox: {
      display: 'block',
    },
  })
);

type PersonViewProps = {
  organization: ServerOrganization;
  reloadOrganizationData: () => void;
};

const projectColumns: TableColumnType[] = [
  { key: 'name', name: strings.NAME, type: 'string' },
  { key: 'description', name: strings.DESCRIPTION, type: 'string' },
  { key: 'sites', name: strings.SITES, type: 'string' },
  { key: 'totalUsers', name: strings.PEOPLE, type: 'string' },
  { key: 'role', name: strings.ROLE, type: 'string' },
];

export type ProjectWithUserRole = Project & {
  role: string;
};

const getProjectsOfPerson = (projectsOfPerson: Project[] | undefined, role: string): ProjectWithUserRole[] => {
  if (projectsOfPerson) {
    return projectsOfPerson.map((project) => {
      return { ...project, role } as ProjectWithUserRole;
    });
  }
  return [];
};

export default function PersonView({ organization, reloadOrganizationData }: PersonViewProps): JSX.Element {
  const classes = useStyles();
  const history = useHistory();
  const [isAddProjectsModalOpen, setIsAddProjectsModalOpen] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [projectsOfPerson, setProjectsOfPerson] = useState<Project[]>();
  const [projectsWithUserRole, setProjectsWithUserRole] = useState<ProjectWithUserRole[]>();
  const [selectedProjectsRows, setSelectedProjectsRows] = useState<ProjectWithUserRole[]>([]);
  const setSnackbar = useSetRecoilState(snackbarAtom);
  const [repeatedEmail, setRepeatedEmail] = useState('');
  const [pageError, setPageError] = useState<'REPEATED_EMAIL' | 'INVALID_EMAIL'>();
  const [people, setPeople] = useState<OrganizationUser[]>();
  const [allProjects, setAllProjects] = useState<Project[]>();
  const { personId } = useParams<{ personId: string }>();
  const [personSelectedToEdit, setPersonSelectedToEdit] = useState<OrganizationUser>();
  const [shouldConfirmProjectRemoval, setShouldConfirmProjectRemoval] = useState<boolean>(false);
  const [namesOfProjectsRemovedForModal, setNamesOfProjectsRemovedForModal] = useState<string[]>([]);

  const [newPerson, setNewPerson, onChange] = useForm<OrganizationUser>({
    id: -1,
    email: '',
    role: 'Contributor',
    projectIds: [],
  });

  useEffect(() => {
    if (personSelectedToEdit) {
      setNewPerson({
        id: personSelectedToEdit.id,
        email: personSelectedToEdit.email,
        role: personSelectedToEdit.role,
        projectIds: personSelectedToEdit.projectIds,
      });
      setProjectsOfPerson(
        organization.projects?.filter((project) => personSelectedToEdit.projectIds.includes(project.id))
      );
    }
  }, [organization, personSelectedToEdit, setNewPerson]);

  useEffect(() => {
    setProjectsWithUserRole(getProjectsOfPerson(projectsOfPerson, newPerson.role));
  }, [projectsOfPerson, newPerson.role]);

  useEffect(() => {
    const populateAllProjects = async () => {
      const response = await listAllProjects();
      if (response.requestSucceeded && organization) {
        const allProjectsServer = response.projects?.filter((project) => project.organizationId === organization.id);
        const projectsWithTotalUsers = getOrganizationProjects(organization)?.map((orgProj) => {
          return { ...orgProj, totalUsers: allProjectsServer?.find((pro) => pro.id === orgProj.id)?.totalUsers };
        });
        setAllProjects(projectsWithTotalUsers);
      }
    };
    const populatePeople = async () => {
      if (organization) {
        const response = await getOrganizationUsers(organization);
        if (response.requestSucceeded) {
          setPeople(response.users);
          setPersonSelectedToEdit(response.users.find((user) => user.id === parseInt(personId, 10)));
        }
      }
    };
    if (organization) {
      populatePeople();
      populateAllProjects();
    }
  }, [organization, personId]);

  const onChangeRole = (newRole: string) => {
    onChange('role', newRole);
  };

  const goToPeople = () => {
    history.push({ pathname: APP_PATHS.PEOPLE });
  };

  const goToViewPerson = (userId: string) => {
    history.push({ pathname: APP_PATHS.PEOPLE_VIEW.replace(':personId', userId) });
  };

  const removeSelectedProjectsOfPerson = () => {
    if (projectsOfPerson && selectedProjectsRows) {
      setProjectsOfPerson((currentProjectsOfPerson) => {
        return currentProjectsOfPerson?.filter((project) => {
          const found = selectedProjectsRows?.find((selectedProject) => selectedProject.id === project.id);
          return !found;
        });
      });
    }
  };

  const saveUser = async (didConfirmProjectRemoval: boolean) => {
    setPageError(undefined);

    if (newPerson.email === '') {
      setEmailError(dictionary.REQUIRED_FIELD);
      return;
    }

    // https://stackoverflow.com/questions/46155/whats-the-best-way-to-validate-an-email-address-in-javascript
    if (
      !/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
        newPerson.email
      )
    ) {
      setEmailError(dictionary.INCORRECT_EMAIL_FORMAT);
      return;
    }

    const currentProjectIds = projectsOfPerson?.map((project) => project.id) || [];
    let successMessage: string | null = null;
    let userId: number = -1;

    if (!!personSelectedToEdit) {
      const addedProjectIds = currentProjectIds.filter((id) => !personSelectedToEdit.projectIds.includes(id));
      const removedProjectIds = personSelectedToEdit.projectIds.filter((id) => !currentProjectIds.includes(id));

      if (removedProjectIds && removedProjectIds.length > 0 && !didConfirmProjectRemoval) {
        if (organization.projects) {
          setNamesOfProjectsRemovedForModal(
            organization.projects
              .filter((project) => removedProjectIds.includes(project.id))
              .map((project) => project.name)
          );
        }
        setShouldConfirmProjectRemoval(true);
        return;
      }

      const response = await updateOrganizationUser(
        newPerson.id,
        organization.id,
        newPerson.role,
        addedProjectIds,
        removedProjectIds
      );
      successMessage = response.requestSucceeded ? strings.CHANGES_SAVED : null;
      userId = newPerson.id;
    } else {
      const response = await addOrganizationUser({ ...newPerson, projectIds: currentProjectIds }, organization.id);
      if (!response.requestSucceeded) {
        if (response.errorDetails === 'PRE_EXISTING_USER') {
          setRepeatedEmail(newPerson.email);
          setPageError('REPEATED_EMAIL');
          setEmailError(strings.EMAIL_ALREADY_EXISTS);
          return;
        } else if (response.errorDetails === 'INVALID_EMAIL') {
          setPageError('INVALID_EMAIL');
          setEmailError(dictionary.INCORRECT_EMAIL_FORMAT);
          return;
        }
      }
      if (response.requestSucceeded) {
        userId = response.newUserId;
      }
      successMessage = response.requestSucceeded ? dictionary.PERSON_ADDED : null;
    }

    if (successMessage) {
      setSnackbar({
        type: 'toast',
        priority: 'success',
        msg: successMessage,
      });
      await reloadOrganizationData();
      goToViewPerson(userId.toString());
    } else {
      setSnackbar({
        type: 'toast',
        priority: 'critical',
        msg: strings.GENERIC_ERROR,
      });
      goToPeople();
    }
  };

  const getProjectsNotOfPerson = () => {
    if (projectsOfPerson) {
      const projectsOfPersonIds = projectsOfPerson.map((project) => project.id);
      return allProjects?.filter((project) => !projectsOfPersonIds.includes(project.id));
    }
    return allProjects;
  };

  const goToProfile = () => {
    if (people && repeatedEmail) {
      const profile = people.find((person) => person.email === repeatedEmail);
      if (profile) {
        const profileLocation = {
          pathname: APP_PATHS.PEOPLE_VIEW.replace(':personId', profile.id.toString()),
        };
        history.push(profileLocation);
      }
    }
  };

  // TODO: Handle the case where we cannot find the requested person to edit in the list of people.
  return (
    <>
      <AddToProjectModal
        open={isAddProjectsModalOpen}
        onClose={() => setIsAddProjectsModalOpen(false)}
        projects={getProjectsNotOfPerson()}
        projectsOfPerson={projectsOfPerson}
        setProjectsOfPerson={setProjectsOfPerson}
      />
      <RemovedProjectsWarningModal
        open={shouldConfirmProjectRemoval}
        onClose={() => setShouldConfirmProjectRemoval(false)}
        onSubmit={() => {
          setShouldConfirmProjectRemoval(false);
          saveUser(true);
        }}
        removedProjectNames={namesOfProjectsRemovedForModal}
      />
      <Container maxWidth={false} className={classes.mainContainer}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            {personSelectedToEdit ? <h2>{strings.EDIT_PERSON}</h2> : <h2>{strings.ADD_PERSON}</h2>}
            {pageError === 'REPEATED_EMAIL' && repeatedEmail && (
              <ErrorBox
                text={strings.ALREADY_INVITED_PERSON_ERROR}
                buttonText={strings.GO_TO_PROFILE}
                onClick={goToProfile}
              />
            )}
            {pageError === 'INVALID_EMAIL' && (
              <ErrorBox title={strings.UNABLE_TO_ADD_PERSON} text={strings.FIX_HIGHLIGHTED_FIELDS} />
            )}
            <p>{strings.ADD_PERSON_DESC}</p>
          </Grid>
          <Grid item xs={4}>
            <TextField
              id='email'
              label={strings.EMAIL}
              type='text'
              onChange={onChange}
              value={newPerson.email}
              disabled={!!personSelectedToEdit}
              errorText={emailError}
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              id='firstName'
              label={strings.FIRST_NAME}
              type='text'
              onChange={onChange}
              disabled={true}
              value='--'
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              id='lastName'
              label={strings.LAST_NAME}
              type='text'
              onChange={onChange}
              disabled={true}
              value='--'
            />
          </Grid>
          <Grid item xs={12}>
            <p>{strings.ROLES_INFO}</p>
            <ul>
              <li>{strings.CONTRIBUTOR_INFO}</li>
              <li>{strings.ADMIN_INFO}</li>
            </ul>
          </Grid>
          <Grid item xs={4}>
            <Select
              id='role'
              label={strings.ROLE}
              onChange={onChangeRole}
              options={['Contributor', 'Admin']}
              disabled={newPerson.role === 'Owner'}
              selectedValue={newPerson.role}
            />
          </Grid>
          <Grid item xs={12} />
          <Grid item xs={12}>
            <TfDivisor />
          </Grid>
        </Grid>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <div className={classes.titleWithButton}>
              <h2>{strings.PROJECTS}</h2>
              {!HighOrganizationRolesValues.includes(newPerson.role) && (
                <Button
                  label={strings.ADD_TO_PROJECT}
                  priority='secondary'
                  onClick={() => {
                    setIsAddProjectsModalOpen(true);
                  }}
                />
              )}
            </div>
          </Grid>
          <Grid item xs={12}>
            {HighOrganizationRolesValues.includes(newPerson.role) ? (
              <InfoBox message={strings.OWNERS_ADMINS_ACCESS_ALL_PROJECTS} />
            ) : (
              <Table
                rows={projectsWithUserRole || []}
                orderBy='name'
                columns={projectColumns}
                emptyTableMessage={strings.NO_PROJECTS_FOR_PERSON}
                showCheckbox={true}
                selectedRows={selectedProjectsRows}
                setSelectedRows={setSelectedProjectsRows}
                showTopBar={true}
                buttonType='destructive'
                buttonText={strings.REMOVE}
                onButtonClick={removeSelectedProjectsOfPerson}
                Renderer={TableCellRenderer}
              />
            )}
          </Grid>
          <Grid item xs={12} />
        </Grid>
      </Container>
      <AppBar
        position='fixed'
        color='primary'
        style={{ top: 'auto', bottom: 0, right: 'auto' }}
        className={classes.bottomBar}
      >
        <Button label='Cancel' onClick={goToPeople} priority='secondary' type='passive' />
        <Button label='Save' onClick={() => saveUser(false)} />
      </AppBar>
    </>
  );
}
