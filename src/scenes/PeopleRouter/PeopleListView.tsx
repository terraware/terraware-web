import React, { type JSX, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Grid, useTheme } from '@mui/material';

import PageSnackbar from 'src/components/PageSnackbar';
import Card from 'src/components/common/Card';
import PageHeaderWrapper from 'src/components/common/PageHeaderWrapper';
import TextField from 'src/components/common/Textfield/Textfield';
import TfMain from 'src/components/common/TfMain';
import Button from 'src/components/common/button/Button';
import Table from 'src/components/common/table';
import TableSettingsButton from 'src/components/common/table/TableSettingsButton';
import { TableColumnType } from 'src/components/common/table/types';
import { APP_PATHS } from 'src/constants';
import { DEFAULT_SEARCH_DEBOUNCE_MS } from 'src/constants';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useLocalization, useOrganization, useUser } from 'src/providers/hooks';
import AssignNewOwnerDialog from 'src/scenes/MyAccountRouter/AssignNewOwnerModal';
import DeleteOrgDialog from 'src/scenes/MyAccountRouter/DeleteOrgModal';
import { OrganizationService, OrganizationUserService, Response } from 'src/services';
import { SearchService } from 'src/services';
import { OrganizationRole } from 'src/types/Organization';
import { OrNodePayload, SearchRequestPayload } from 'src/types/Search';
import { OrganizationUser } from 'src/types/User';
import { isTfContact } from 'src/utils/organization';
import { isAdmin } from 'src/utils/organization';
import { getRequestId, setRequestId } from 'src/utils/requestsId';
import { parseSearchTerm } from 'src/utils/search';
import useDebounce from 'src/utils/useDebounce';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import useSnackbar from 'src/utils/useSnackbar';

import CannotRemovePeopleDialog from './CannotRemovePeopleModal';
import RemovePeopleDialog from './RemovePeopleModal';
import TableCellRenderer from './TableCellRenderer';

type ProjectInternalUserRoles = Record<string, string[]>;

export default function PeopleListView(): JSX.Element {
  const { selectedOrganization, reloadOrganizations } = useOrganization();
  const { user } = useUser();
  const theme = useTheme();
  const navigate = useSyncNavigate();
  const [selectedPeopleRows, setSelectedPeopleRows] = useState<OrganizationUser[]>([]);
  const [orgPeople, setOrgPeople] = useState<OrganizationUser[]>();
  const [removePeopleModalOpened, setRemovePeopleModalOpened] = useState(false);
  const [assignNewOwnerModalOpened, setAssignNewOwnerModalOpened] = useState(false);
  const [cannotRemovePeopleModalOpened, setCannotRemovePeopleModalOpened] = useState(false);
  const [deleteOrgModalOpened, setDeleteOrgModalOpened] = useState(false);
  const [newOwner, setNewOwner] = useState<OrganizationUser>();
  const [temporalSearchValue, setTemporalSearchValue] = useState('');
  const debouncedSearchTerm = useDebounce(temporalSearchValue, DEFAULT_SEARCH_DEBOUNCE_MS);
  const [results, setResults] = useState<OrganizationUser[]>();
  const [projectRestorationLeads, setProjectRestorationLeads] = useState<ProjectInternalUserRoles>({});
  const [resultsWithLeadRoles, setResultsWithLeadRoles] = useState<OrganizationUser[]>([]);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const snackbar = useSnackbar();
  const { isMobile } = useDeviceInfo();
  const contentRef = useRef(null);
  const { activeLocale, strings } = useLocalization();

  const columns = useMemo(
    (): TableColumnType[] => [
      { key: 'email', name: strings.EMAIL, type: 'string' },
      { key: 'firstName', name: strings.FIRST_NAME, type: 'string' },
      { key: 'lastName', name: strings.LAST_NAME, type: 'string' },
      { key: 'role', name: strings.ROLE, type: 'string' },
      { key: 'addedTime', name: strings.DATE_ADDED, type: 'date' },
    ],
    [strings]
  );

  const getProjectsWithInternalUsersData = useCallback(async () => {
    if (!selectedOrganization?.id) {
      return;
    }

    const params: SearchRequestPayload = {
      prefix: 'projectInternalUsers',
      fields: ['project_name', 'user_id', 'role'],
      search: {
        operation: 'and',
        children: [
          {
            operation: 'field',
            field: 'project_organization_id',
            type: 'Exact',
            values: [selectedOrganization.id],
          },
          {
            operation: 'field',
            field: 'role',
            type: 'Exact',
            values: [
              strings.PROJECT_INTERNAL_USER_ROLE_PROJECT_LEAD,
              strings.PROJECT_INTERNAL_USER_ROLE_RESTORATION_LEAD,
            ],
          },
        ],
      },
      sortOrder: [{ field: 'role' }],
      count: 0,
    };

    const searchResults = await SearchService.search(params);

    const flattened = (searchResults || []).map(
      (result) => result as { role: string; user_id: string; project_name: string }
    );

    const internalUserRolesByUserId = flattened.reduce((acc, curr) => {
      if (!acc[curr.user_id]) {
        acc[curr.user_id] = [];
      }
      if (curr.role && !acc[curr.user_id].includes(curr.role)) {
        acc[curr.user_id].push(`${curr.role} (${curr.project_name})`);
      }
      return acc;
    }, {} as ProjectInternalUserRoles);
    setProjectRestorationLeads(internalUserRolesByUserId);
  }, [selectedOrganization?.id, strings]);

  useEffect(() => {
    void getProjectsWithInternalUsersData();
  }, [getProjectsWithInternalUsersData]);

  useEffect(() => {
    if (results) {
      const resultsWithRoles = results.map((result) => ({
        ...result,
        role: (result.role === strings.TERRAFORMATION_CONTACT && projectRestorationLeads[result.id]?.length
          ? `${result.role} - ${projectRestorationLeads[result.id].join(', ')}`
          : result.role) as OrganizationRole,
      }));
      setResultsWithLeadRoles(resultsWithRoles);
    }
  }, [results, projectRestorationLeads, strings]);

  const search = useCallback(
    async (searchTerm: string, skipTfContact = false) => {
      if (!selectedOrganization) {
        return [];
      }
      const { type, values } = parseSearchTerm(searchTerm);
      const searchField: OrNodePayload | null = searchTerm
        ? {
            operation: 'or',
            children: [
              {
                operation: 'field',
                field: 'user_firstName',
                type,
                values,
              },
              {
                operation: 'field',
                field: 'user_lastName',
                type,
                values,
              },
              {
                operation: 'field',
                field: 'user_email',
                type: 'Exact',
                values,
              },
            ],
          }
        : null;

      const params: SearchRequestPayload = {
        prefix: 'organizationUsers',
        fields: ['user_id', 'user_firstName', 'user_lastName', 'user_email', 'roleName', 'createdTime'],
        search: {
          operation: 'and',
          children: [
            {
              operation: 'field',
              field: 'organization_id',
              type: 'Exact',
              values: [selectedOrganization.id],
            },
          ],
        },
        sortOrder: [
          {
            field: 'user_email',
          },
        ],
        count: 0,
      };

      if (searchField) {
        params.search.children.push(searchField);
      }

      const searchResults = await SearchService.search(params);
      const usersResults: OrganizationUser[] = [];
      searchResults?.forEach((result) => {
        if (skipTfContact && isTfContact(result.roleName as OrganizationRole)) {
          return;
        }
        usersResults.push({
          firstName: result.user_firstName as string,
          lastName: result.user_lastName as string,
          email: result.user_email as string,
          id: result.user_id as number,
          role: result.roleName as OrganizationRole,
          addedTime: result.createdTime as string,
        });
      });
      return usersResults;
    },
    [selectedOrganization]
  );

  const refreshSearch = useCallback(async () => {
    const requestId = Math.random().toString();
    setRequestId('searchUsers', requestId);
    const usersResults = await search(debouncedSearchTerm);
    if (getRequestId('searchUsers') === requestId) {
      setResults(usersResults);
    }
  }, [debouncedSearchTerm, search]);

  useEffect(() => {
    if (activeLocale) {
      void refreshSearch();
    }
  }, [activeLocale, refreshSearch]);

  useEffect(() => {
    const findTotalUsers = async () => {
      const users = await search('', true);
      setTotalUsers(users.length);
    };

    void findTotalUsers();
  }, [search]);

  const isClickable = useCallback(() => false, []);

  const goToNewPerson = () => {
    const newPersonLocation = {
      pathname: APP_PATHS.PEOPLE_NEW,
    };
    navigate(newPersonLocation);
  };

  const openDeleteOrgModal = () => {
    setDeleteOrgModalOpened(true);
    setCannotRemovePeopleModalOpened(false);
  };

  const removeSelectedPeopleFromOrg = async () => {
    if (selectedOrganization) {
      const removableUsers = selectedPeopleRows.filter((row) => !isTfContact(row.role));
      if (removableUsers.length === totalUsers) {
        setCannotRemovePeopleModalOpened(true);
      } else {
        const selectedOwners = selectedPeopleRows.filter((selectedPerson) => selectedPerson.role === 'Owner');
        if (selectedOwners.length > 0 && selectedOrganization) {
          const organizationRoles = await OrganizationService.getOrganizationRoles(selectedOrganization?.id);
          const totalOwners = organizationRoles.roles?.find((role) => role.role === 'Owner');
          if (selectedOwners.length === totalOwners?.totalUsers) {
            setOrgPeople(
              results?.filter((person) => {
                const found = selectedPeopleRows.find((selectedPeople) => selectedPeople.id === person.id);
                if (found) {
                  return false;
                }
                return !isTfContact(person.role);
              })
            );
            if (assignNewOwnerModalOpened) {
              setAssignNewOwnerModalOpened(false);
              setRemovePeopleModalOpened(true);
            } else {
              setAssignNewOwnerModalOpened(true);
            }
          } else {
            setRemovePeopleModalOpened(true);
          }
        } else {
          setRemovePeopleModalOpened(true);
        }
      }
    }
  };

  const removePeopleHandler = async () => {
    if (selectedOrganization) {
      let assignNewOwnerResponse;
      if (newOwner) {
        assignNewOwnerResponse = await OrganizationUserService.updateOrganizationUser(
          selectedOrganization?.id,
          newOwner.id,
          'Owner'
        );
      }
      const promises: Promise<Response>[] = [];
      if ((assignNewOwnerResponse && assignNewOwnerResponse.requestSucceeded === true) || !assignNewOwnerResponse) {
        selectedPeopleRows.forEach((person) => {
          promises.push(OrganizationUserService.deleteOrganizationUser(selectedOrganization?.id, person.id));
        });
      }
      const leaveOrgResponses = await Promise.all(promises);
      let allRemoved = true;

      leaveOrgResponses.forEach((resp) => {
        if (!resp.requestSucceeded) {
          allRemoved = false;
        }
      });

      if (allRemoved) {
        void refreshSearch();
        setRemovePeopleModalOpened(false);
        setSelectedPeopleRows([]);
        if (reloadOrganizations) {
          void reloadOrganizations();
        }
        snackbar.toastSuccess(strings.CHANGES_SAVED);
      } else {
        snackbar.toastError();
      }
      navigate(APP_PATHS.PEOPLE);
    }
  };

  const deleteOrgHandler = async () => {
    if (user && selectedOrganization) {
      let allRemoved = true;
      const keepOneOwnerId = selectedPeopleRows.filter((person) => person.role === 'Owner')[0].id.toString();
      const otherUsers = selectedPeopleRows.filter(
        (person) =>
          person.id.toString() !== user.id.toString() &&
          !isTfContact(person.role) &&
          person.id.toString() !== keepOneOwnerId
      );
      if (otherUsers.length) {
        const promises: Promise<Response>[] = [];
        otherUsers.forEach((person) => {
          promises.push(OrganizationUserService.deleteOrganizationUser(selectedOrganization?.id, person.id));
        });
        const leaveOrgResponses = await Promise.all(promises);

        leaveOrgResponses.forEach((resp) => {
          if (!resp.requestSucceeded) {
            allRemoved = false;
          }
        });
      }
      const deleteOrgResponse = await OrganizationService.deleteOrganization(selectedOrganization?.id);
      if (allRemoved && deleteOrgResponse.requestSucceeded) {
        if (reloadOrganizations) {
          void reloadOrganizations();
        }
        snackbar.toastSuccess(strings.CHANGES_SAVED);
      } else {
        snackbar.toastError();
      }
      navigate(APP_PATHS.HOME);
    }
  };

  const clearSearch = () => {
    setTemporalSearchValue('');
  };

  const onChangeSearch = (id: string, value: unknown) => {
    setTemporalSearchValue(value as string);
  };

  const isRemovingTFContact = useMemo(
    () => selectedPeopleRows.some((row) => isTfContact(row.role)),
    [selectedPeopleRows]
  );

  return (
    <TfMain>
      {selectedPeopleRows.length > 0 && (
        <>
          <RemovePeopleDialog
            open={removePeopleModalOpened}
            onClose={() => setRemovePeopleModalOpened(false)}
            onSubmit={() => void removePeopleHandler()}
            removedPeople={selectedPeopleRows}
          />
          <AssignNewOwnerDialog
            open={assignNewOwnerModalOpened}
            onClose={() => setAssignNewOwnerModalOpened(false)}
            people={orgPeople || []}
            onSubmit={() => void removeSelectedPeopleFromOrg()}
            setNewOwner={setNewOwner}
            selectedOwner={newOwner}
          />
          <CannotRemovePeopleDialog
            open={cannotRemovePeopleModalOpened}
            onClose={() => setCannotRemovePeopleModalOpened(false)}
            onSubmit={openDeleteOrgModal}
          />
          <DeleteOrgDialog
            open={deleteOrgModalOpened}
            onClose={() => setDeleteOrgModalOpened(false)}
            onSubmit={() => void deleteOrgHandler()}
            orgName={selectedOrganization?.name || ''}
          />
        </>
      )}
      <PageHeaderWrapper nextElement={contentRef.current}>
        <Grid container paddingBottom={theme.spacing(4)} paddingLeft={isMobile ? 0 : theme.spacing(3)}>
          <Grid item xs={8}>
            <h1
              style={{
                margin: 0,
                fontSize: '24px',
                fontWeight: 600,
              }}
            >
              {strings.PEOPLE}
            </h1>
          </Grid>
          <Grid
            item
            xs={4}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'flex-end',
              marginBottom: '32px',
            }}
          >
            {isAdmin(selectedOrganization) &&
              (isMobile ? (
                <Button id='new-person' icon='plus' onClick={goToNewPerson} size='medium' />
              ) : (
                <Button id='new-person' label={strings.ADD_PERSON} icon='plus' onClick={goToNewPerson} size='medium' />
              ))}
          </Grid>
          <PageSnackbar />
        </Grid>
      </PageHeaderWrapper>
      <Card flushMobile>
        <Grid container ref={contentRef}>
          <Grid
            item
            xs={12}
            marginBottom='16px'
            sx={{
              display: 'flex',
            }}
          >
            <TextField
              placeholder={strings.SEARCH}
              iconLeft='search'
              label=''
              id='search'
              type='text'
              onChange={(value) => onChangeSearch('search', value)}
              value={temporalSearchValue}
              iconRight='cancel'
              onClickRightIcon={clearSearch}
              sx={{ width: '300px' }}
            />
            <TableSettingsButton />
          </Grid>

          <Grid item xs={12}>
            <div>
              <Grid container spacing={4}>
                <Grid item xs={12}>
                  {results && (
                    <Table
                      id='people-table'
                      columns={columns}
                      rows={resultsWithLeadRoles}
                      orderBy='name'
                      Renderer={TableCellRenderer}
                      isClickable={isClickable}
                      showCheckbox={isAdmin(selectedOrganization)}
                      selectedRows={selectedPeopleRows}
                      setSelectedRows={setSelectedPeopleRows}
                      showTopBar={true}
                      topBarButtons={[
                        {
                          buttonType: 'destructive',
                          ...(!isMobile && { buttonText: strings.REMOVE }),
                          onButtonClick: () => void removeSelectedPeopleFromOrg(),
                          icon: 'iconTrashCan',
                          disabled: isRemovingTFContact,
                          tooltipTitle: isRemovingTFContact ? strings.CANNOT_REMOVE_TF_CONTACT : undefined,
                        },
                      ]}
                    />
                  )}
                </Grid>
              </Grid>
            </div>
          </Grid>
        </Grid>
      </Card>
    </TfMain>
  );
}
