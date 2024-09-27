import React, { useEffect, useMemo, useState } from 'react';

import { Box, Grid, Typography, useTheme } from '@mui/material';
import { Button, TableColumnType } from '@terraware/web-components';

import Table from 'src/components/common/table';
import strings from 'src/strings';
import { ListDeliverablesElementWithOverdue } from 'src/types/Deliverables';
import { CohortModule } from 'src/types/Module';

import AddModuleModal from './AddModuleModal';
import ModuleDeliverablesModal from './ModuleDeliverablesModal';
import ModulesCellRenderer from './ModulesCellRenderer';

interface ModulesTableProps {
  modules?: CohortModule[];
  editing?: boolean;
  modulesToAdd?: CohortModule[];
  setModulesToAdd?: React.Dispatch<React.SetStateAction<CohortModule[] | undefined>>;
  modulesToDelete?: CohortModule[];
  setModulesToDelete?: React.Dispatch<React.SetStateAction<CohortModule[] | undefined>>;
  deliverablesByModuleId?: Record<number, ListDeliverablesElementWithOverdue[]>;
  cohortId?: number;
}

const columns = (): TableColumnType[] => [
  {
    key: 'title',
    name: strings.NAME,
    type: 'string',
  },
  {
    key: 'name',
    name: strings.MODULE,
    type: 'string',
  },
  {
    key: 'id',
    name: strings.MODULE_ID,
    type: 'string',
  },
  { key: 'startDate', name: strings.START_DATE, type: 'date' },
  { key: 'endDate', name: strings.END_DATE, type: 'date' },
];

const viewColumns = (): TableColumnType[] => [
  ...columns(),
  { key: 'deliverablesQuantity', name: strings.DELIVERABLES, type: 'string' },
];

export default function ModulesTable(props: ModulesTableProps): JSX.Element {
  const {
    modules,
    editing,
    modulesToAdd,
    setModulesToAdd,
    modulesToDelete,
    setModulesToDelete,
    deliverablesByModuleId,
    cohortId,
  } = props;
  const theme = useTheme();
  const [addModuleModalOpened, setAddModuleModalOpened] = useState(false);
  const [deliverablesModalOpened, setDeliverablesModalOpened] = useState(false);
  const [prevModules, setPrevModules] = useState<CohortModule[]>(modules || []);
  const [selectedRows, setSelectedRows] = useState<CohortModule[]>([]);
  const [moduleToEdit, setModuleToEdit] = useState<CohortModule>();

  const areModulesEqual = (a: CohortModule, b: CohortModule) => {
    if (a.title === b.title && a.name === b.name && a.startDate === b.startDate && a.endDate === b.endDate) {
      return true;
    }
    return false;
  };

  const onAddCohortModule = (cohortModule: CohortModule) => {
    if (setModulesToAdd) {
      setModulesToAdd((prev) => {
        if (prev) {
          return [...prev, cohortModule];
        } else {
          return [cohortModule];
        }
      });
    }
  };

  const onEditedCohortModule = (cohortModule: CohortModule) => {
    if (setModulesToDelete && setModulesToAdd) {
      // When editing a module, first we remove the old entrance and then we add it again
      const modulesToAddIds = modulesToAdd?.map((mta) => mta.id);
      if (modulesToAddIds?.includes(cohortModule.id)) {
        const found = modulesToAdd?.find((moduleToAdd) => moduleToAdd.id === cohortModule.id);
        if (!(found && areModulesEqual(found, cohortModule))) {
          const newModulesToAdd = modulesToAdd?.filter((mtAdd) => mtAdd.id !== cohortModule.id);
          newModulesToAdd?.push(cohortModule);
          setModulesToAdd(newModulesToAdd);
        }
      } else {
        const found = prevModules?.find((moduleToAdd) => moduleToAdd.id === cohortModule.id);
        if (!(found && areModulesEqual(found, cohortModule))) {
          setModulesToDelete((prev) => {
            return prev && found ? [...prev, found] : [found || {}];
          });
          setModulesToAdd((prev) => {
            if (prev) {
              return [...prev, cohortModule];
            } else {
              return [cohortModule];
            }
          });
        }
      }
    }
  };

  const deleteModules = () => {
    if (setModulesToDelete && setModulesToAdd) {
      const selectedRowsIds = selectedRows.map((sr) => sr.id);
      const modulesToAddIds = modulesToAdd?.map((mta) => mta.id);

      const modulesToDelete = selectedRows.filter((sr) => !modulesToAddIds?.includes(sr.id));
      setModulesToDelete((prev) => {
        return prev ? [...prev, ...modulesToDelete] : modulesToDelete;
      });

      const newModulesToAdd = modulesToAdd?.filter((mtAdd) => !selectedRowsIds.includes(mtAdd.id));
      setModulesToAdd(newModulesToAdd);

      setSelectedRows([]);
    }
  };

  useEffect(() => {
    if (modules) {
      setPrevModules(modules);
    }
  }, [modules]);

  const onEditHandler = (clickedModule: CohortModule, fromColumn?: string) => {
    if (fromColumn === 'title') {
      setModuleToEdit(clickedModule);
      setAddModuleModalOpened(true);
    }
  };

  const onViewClick = (clickedModule: CohortModule, fromColumn?: string) => {
    if (fromColumn === 'deliverablesQuantity') {
      setModuleToEdit(clickedModule);
      setDeliverablesModalOpened(true);
    }
  };

  const onCloseModalHandler = () => {
    setModuleToEdit(undefined);
    setAddModuleModalOpened(false);
    setDeliverablesModalOpened(false);
  };

  const onModalSaveHandler = (cohortModule: CohortModule) => {
    if (moduleToEdit) {
      setModuleToEdit(undefined);
      onEditedCohortModule(cohortModule);
    } else {
      onAddCohortModule(cohortModule);
    }
    setAddModuleModalOpened(false);
  };

  const allModules = useMemo(() => {
    const modulesToDeleteIds = modulesToDelete?.map((mtd) => mtd.id);
    return prevModules.concat(modulesToAdd || []).filter((mod) => {
      if (modulesToDeleteIds?.includes(mod.id)) {
        const found = modulesToDelete?.find((m) => m.id === mod.id);
        if (found) {
          return !areModulesEqual(mod, found);
        }
      } else {
        return true;
      }
    });
  }, [prevModules, modulesToAdd, modulesToDelete]);

  return (
    <>
      {deliverablesModalOpened && (
        <ModuleDeliverablesModal
          onClose={onCloseModalHandler}
          deliverables={
            deliverablesByModuleId && moduleToEdit && moduleToEdit.id ? deliverablesByModuleId[moduleToEdit.id] : []
          }
          moduleToEdit={moduleToEdit}
          cohortId={cohortId}
        />
      )}
      {addModuleModalOpened && (
        <AddModuleModal
          onClose={onCloseModalHandler}
          onSave={onModalSaveHandler}
          moduleToEdit={moduleToEdit}
          existingModules={allModules}
        />
      )}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box
            alignItems='center'
            display='flex'
            flexDirection='row'
            justifyContent='space-between'
            marginBottom={theme.spacing(2)}
            width='100%'
          >
            <Typography sx={{ fontSize: '20px', fontWeight: 600 }}>{strings.MODULES}</Typography>
            {editing && (
              <Button
                icon='plus'
                id='add-module'
                label={strings.ADD_MODULE}
                onClick={() => setAddModuleModalOpened(true)}
                priority='secondary'
                size='medium'
              />
            )}
          </Box>
        </Grid>
        <Grid item xs={12}>
          {!modules && !editing ? (
            <Typography>{strings.EDIT_COHORT_TO_ADD_MODULES}</Typography>
          ) : (
            <Table
              id='modules-table'
              columns={editing ? columns : viewColumns}
              rows={allModules}
              orderBy='name'
              showCheckbox={editing}
              showTopBar={editing}
              selectedRows={selectedRows}
              setSelectedRows={setSelectedRows}
              topBarButtons={[
                {
                  buttonText: strings.REMOVE,
                  buttonType: 'destructive',
                  onButtonClick: () => deleteModules(),
                  icon: 'iconTrashCan',
                },
              ]}
              Renderer={ModulesCellRenderer}
              controlledOnSelect={true}
              onSelect={editing ? onEditHandler : onViewClick}
              isClickable={() => false}
              // this function is sent to differentiate if editing or not in the Renderer
              reloadData={editing ? () => true : undefined}
            />
          )}
        </Grid>
      </Grid>
    </>
  );
}
