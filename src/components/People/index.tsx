import React, { useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';
import Button from 'src/components/common/button/Button';
import Table from 'src/components/common/table';
import { TableColumnType } from 'src/components/common/table/types';
import { APP_PATHS } from 'src/constants';
import strings from 'src/strings';
import { OrganizationRole } from 'src/types/Organization';
import { OrganizationUser } from 'src/types/User';
import TfMain from '../common/TfMain';
import TableCellRenderer from './TableCellRenderer';
import PageSnackbar from 'src/components/PageSnackbar';
import RemovePeopleDialog from './RemovePeopleModal';
import AssignNewOwnerDialog from '../MyAccount/AssignNewOwnerModal';
import DeleteOrgDialog from '../MyAccount/DeleteOrgModal';
import CannotRemovePeopleDialog from './CannotRemovePeopleModal';
import { OrganizationService, OrganizationUserService, Response } from 'src/services';
import { Grid, Theme, useTheme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import useSnackbar from 'src/utils/useSnackbar';
import PageHeaderWrapper from '../common/PageHeaderWrapper';
import TextField from '../common/Textfield/Textfield';
import useDebounce from 'src/utils/useDebounce';
import { search, SearchNodePayload } from 'src/api/search';
import { getRequestId, setRequestId } from 'src/utils/requestsId';
import { useUser, useOrganization, useLocalization } from '../../providers/hooks';

const useStyles = makeStyles((theme: Theme) => ({
  title: {
    margin: 0,
    fontSize: '24px',
    fontWeight: 600,
  },
  mainContent: {
    padding: theme.spacing(3),
    backgroundColor: theme.palette.TwClrBg,
    borderRadius: '32px',
    minWidth: 'fit-content',
  },
  contentContainer: {
    backgroundColor: theme.palette.TwClrBg,
    padding: theme.spacing(3),
    borderRadius: '32px',
  },
  centered: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginBottom: '32px',
  },
  searchField: {
    width: '300px',
  },
}));

export default function PeopleList(): JSX.Element {
  const { selectedOrganization, reloadOrganizations } = useOrganization();
  const { user } = useUser();
  const classes = useStyles();
  const theme = useTheme();
  const history = useHistory();
  const [selectedPeopleRows, setSelectedPeopleRows] = useState<OrganizationUser[]>([]);
  const [orgPeople, setOrgPeople] = useState<OrganizationUser[]>();
  const [removePeopleModalOpened, setRemovePeopleModalOpened] = useState(false);
  const [assignNewOwnerModalOpened, setAssignNewOwnerModalOpened] = useState(false);
  const [cannotRemovePeopleModalOpened, setCannotRemovePeopleModalOpened] = useState(false);
  const [deleteOrgModalOpened, setDeleteOrgModalOpened] = useState(false);
  const [newOwner, setNewOwner] = useState<OrganizationUser>();
  const [temporalSearchValue, setTemporalSearchValue] = useState('');
  const debouncedSearchTerm = useDebounce(temporalSearchValue, 250);
  const [results, setResults] = useState<OrganizationUser[]>();
  const snackbar = useSnackbar();
  const { isMobile } = useDeviceInfo();
  const contentRef = useRef(null);
  const { loadedStringsForLocale } = useLocalization();
  const columns: TableColumnType[] = [
    { key: 'email', name: strings.EMAIL, type: 'string' },
    { key: 'firstName', name: strings.FIRST_NAME, type: 'string' },
    { key: 'lastName', name: strings.LAST_NAME, type: 'string' },
    { key: 'role', name: strings.ROLE, type: 'string' },
    { key: 'addedTime', name: strings.DATE_ADDED, type: 'date' },
  ];

  useEffect(() => {
    const refreshSearch = async () => {
      const searchField = debouncedSearchTerm
        ? {
            operation: 'or',
            children: [
              { operation: 'field', field: 'user_firstName', type: 'Fuzzy', values: [debouncedSearchTerm] },
              { operation: 'field', field: 'user_lastName', type: 'Fuzzy', values: [debouncedSearchTerm] },
            ],
          }
        : null;

      const params: SearchNodePayload = {
        prefix: 'members',
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

      const requestId = Math.random().toString();
      setRequestId('searchUsers', requestId);
      const searchResults = await search(params);
      const usersResults: OrganizationUser[] = [];
      searchResults?.forEach((result) => {
        usersResults.push({
          firstName: result.user_firstName as string,
          lastName: result.user_lastName as string,
          email: result.user_email as string,
          id: result.user_id as number,
          role: result.roleName as OrganizationRole,
          addedTime: result.createdTime as string,
        });
      });
      if (getRequestId('searchUsers') === requestId) {
        setResults(usersResults);
      }
    };

    if (loadedStringsForLocale) {
      refreshSearch();
    }
  }, [debouncedSearchTerm, selectedOrganization, loadedStringsForLocale]);

  const goToNewPerson = () => {
    const newPersonLocation = {
      pathname: APP_PATHS.PEOPLE_NEW,
    };
    history.push(newPersonLocation);
  };

  const openDeleteOrgModal = () => {
    setDeleteOrgModalOpened(true);
    setCannotRemovePeopleModalOpened(false);
  };

  const removeSelectedPeopleFromOrg = async () => {
    if (selectedOrganization) {
      if (selectedPeopleRows.length === selectedOrganization.totalUsers) {
        setCannotRemovePeopleModalOpened(true);
      } else {
        const selectedOwners = selectedPeopleRows.filter((selectedPerson) => selectedPerson.role === 'Owner');
        if (selectedOwners.length > 0) {
          const organizationRoles = await OrganizationService.getOrganizationRoles(selectedOrganization.id);
          const totalOwners = organizationRoles.roles?.find((role) => role.role === 'Owner');
          if (selectedOwners.length === totalOwners?.totalUsers) {
            setOrgPeople(
              results?.filter((person) => {
                const found = selectedPeopleRows.find((selectedPeople) => selectedPeople.id === person.id);
                if (found) {
                  return false;
                }
                return true;
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
    let assignNewOwnerResponse;
    if (newOwner) {
      assignNewOwnerResponse = await OrganizationUserService.updateOrganizationUser(
        selectedOrganization.id,
        newOwner.id,
        'Owner'
      );
    }
    const promises: Promise<Response>[] = [];
    if ((assignNewOwnerResponse && assignNewOwnerResponse.requestSucceeded === true) || !assignNewOwnerResponse) {
      selectedPeopleRows.forEach((person) => {
        promises.push(OrganizationUserService.deleteOrganizationUser(selectedOrganization.id, person.id));
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
      setRemovePeopleModalOpened(false);
      setSelectedPeopleRows([]);
      if (reloadOrganizations) {
        reloadOrganizations();
      }
      snackbar.toastSuccess(strings.CHANGES_SAVED);
    } else {
      snackbar.toastError();
    }
    history.push(APP_PATHS.PEOPLE);
  };

  const deleteOrgHandler = async () => {
    if (user) {
      let allRemoved = true;
      const otherUsers = selectedPeopleRows.filter((person) => person.id !== user.id);
      if (otherUsers.length) {
        const promises: Promise<Response>[] = [];
        otherUsers.forEach((person) => {
          promises.push(OrganizationUserService.deleteOrganizationUser(selectedOrganization.id, person.id));
        });
        const leaveOrgResponses = await Promise.all(promises);

        leaveOrgResponses.forEach((resp) => {
          if (!resp.requestSucceeded) {
            allRemoved = false;
          }
        });
      }
      const deleteOrgResponse = await OrganizationService.deleteOrganization(selectedOrganization.id);
      if (allRemoved && deleteOrgResponse.requestSucceeded) {
        if (reloadOrganizations) {
          reloadOrganizations();
        }
        snackbar.toastSuccess(strings.CHANGES_SAVED);
      } else {
        snackbar.toastError();
      }
      history.push(APP_PATHS.HOME);
    }
  };

  const clearSearch = () => {
    setTemporalSearchValue('');
  };

  const onChangeSearch = (id: string, value: unknown) => {
    setTemporalSearchValue(value as string);
  };

  return (
    <TfMain>
      {selectedPeopleRows.length > 0 && (
        <>
          <RemovePeopleDialog
            open={removePeopleModalOpened}
            onClose={() => setRemovePeopleModalOpened(false)}
            onSubmit={removePeopleHandler}
            removedPeople={selectedPeopleRows}
          />
          <AssignNewOwnerDialog
            open={assignNewOwnerModalOpened}
            onClose={() => setAssignNewOwnerModalOpened(false)}
            people={orgPeople || []}
            onSubmit={removeSelectedPeopleFromOrg}
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
            onSubmit={deleteOrgHandler}
            orgName={selectedOrganization.name || ''}
          />
        </>
      )}
      <PageHeaderWrapper nextElement={contentRef.current} nextElementInitialMargin={-24}>
        <Grid container paddingBottom={theme.spacing(4)} paddingLeft={isMobile ? 0 : theme.spacing(3)}>
          <Grid item xs={8}>
            <h1 className={classes.title}>{strings.PEOPLE}</h1>
          </Grid>
          <Grid item xs={4} className={classes.centered}>
            {isMobile ? (
              <Button id='new-person' icon='plus' onClick={goToNewPerson} size='medium' />
            ) : (
              <Button id='new-person' label={strings.ADD_PERSON} icon='plus' onClick={goToNewPerson} size='medium' />
            )}
          </Grid>
          <PageSnackbar />
        </Grid>
      </PageHeaderWrapper>
      <Grid container className={classes.contentContainer} ref={contentRef}>
        <Grid item xs={12}>
          <TextField
            placeholder={strings.SEARCH}
            iconLeft='search'
            label=''
            id='search'
            type='text'
            className={classes.searchField}
            onChange={(value) => onChangeSearch('search', value)}
            value={temporalSearchValue}
            iconRight='cancel'
            onClickRightIcon={clearSearch}
          />
        </Grid>

        <Grid item xs={12}>
          <div className={classes.mainContent}>
            <Grid container spacing={4}>
              <Grid item xs={12}>
                {results && (
                  <Table
                    id='people-table'
                    columns={columns}
                    rows={results}
                    orderBy='name'
                    Renderer={TableCellRenderer}
                    showCheckbox={true}
                    selectedRows={selectedPeopleRows}
                    setSelectedRows={setSelectedPeopleRows}
                    showTopBar={true}
                    topBarButtons={[
                      {
                        buttonType: 'passive',
                        ...(!isMobile && { buttonText: strings.REMOVE }),
                        onButtonClick: removeSelectedPeopleFromOrg,
                        icon: 'iconTrashCan',
                      },
                    ]}
                  />
                )}
              </Grid>
            </Grid>
          </div>
        </Grid>
      </Grid>
    </TfMain>
  );
}
