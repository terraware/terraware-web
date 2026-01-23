import React, { type JSX, useMemo, useState } from 'react';

import { Box, Grid, Typography, useTheme } from '@mui/material';
import { Button, TableColumnType } from '@terraware/web-components';

import Table from 'src/components/common/table';
import strings from 'src/strings';
import { CohortModule, Module, ModuleDeliverable } from 'src/types/Module';

import AddModuleModal from './AddModuleModal';
import CohortModulesCellRenderer from './CohortModulesCellRenderer';
import ModuleDeliverablesModal from './ModuleDeliverablesModal';

interface CohortModulesTableProps {
  cohortModules: CohortModule[];
  modules: Module[];
  editing?: boolean;
  setCohortModules?: React.Dispatch<React.SetStateAction<CohortModule[]>>;
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

export default function CohortModulesTable(props: CohortModulesTableProps): JSX.Element {
  const { cohortModules, modules, editing, setCohortModules } = props;
  const theme = useTheme();
  const [addModuleModalOpened, setAddModuleModalOpened] = useState(false);
  const [deliverablesModalOpened, setDeliverablesModalOpened] = useState(false);
  const [selectedRows, setSelectedRows] = useState<CohortModule[]>([]);
  const [moduleToEdit, setModuleToEdit] = useState<CohortModule>();

  const moduleDeliverables = useMemo(() => {
    const record: Record<string, ModuleDeliverable[]> = {};
    cohortModules.forEach((cohortModule) => {
      const deliverables = modules.find((module) => cohortModule.id === module.id)?.deliverables ?? [];
      record[cohortModule.id] = deliverables;
    });
    return record;
  }, [cohortModules, modules]);

  const onAddCohortModule = (cohortModule: CohortModule) => {
    setCohortModules?.((prev) => [...prev, cohortModule]);
  };

  const onEditedCohortModule = (cohortModule: CohortModule) => {
    setCohortModules?.((prev) => {
      // filter out updated cohortModule, then add edited cohortModule
      const unchangedModules = prev.filter((existingModule) => existingModule.id !== cohortModule.id);
      return [...unchangedModules, cohortModule];
    });
  };

  const deleteModules = () => {
    setCohortModules?.((prev) =>
      prev.filter(
        (existingModule) => selectedRows.find((deletedModule) => deletedModule.id === existingModule.id) === undefined
      )
    );
  };

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

  const unusedModules = useMemo(() => {
    return modules.filter(
      (module) => cohortModules.find((existingModule) => module.id === existingModule.id) === undefined
    );
  }, [cohortModules, modules]);

  return (
    <>
      {deliverablesModalOpened && (
        <ModuleDeliverablesModal
          onClose={onCloseModalHandler}
          deliverables={
            moduleDeliverables && moduleToEdit && moduleToEdit.id ? moduleDeliverables[moduleToEdit.id] : []
          }
          moduleToEdit={moduleToEdit}
        />
      )}
      {addModuleModalOpened && (
        <AddModuleModal
          onClose={onCloseModalHandler}
          onSave={onModalSaveHandler}
          selectedModule={moduleToEdit}
          unusedModules={unusedModules}
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
          {(!modules || modules.length === 0) && !editing ? (
            <Typography>{strings.EDIT_COHORT_TO_ADD_MODULES}</Typography>
          ) : (
            <Table
              id='modules-table'
              columns={editing ? columns : viewColumns}
              rows={cohortModules}
              orderBy='startDate'
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
              Renderer={CohortModulesCellRenderer}
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
