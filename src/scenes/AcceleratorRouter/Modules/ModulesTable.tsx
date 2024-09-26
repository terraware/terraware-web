import React, { useEffect, useState } from 'react';

import { Box, Grid, Typography, useTheme } from '@mui/material';
import { Button, TableColumnType } from '@terraware/web-components';

import Table from 'src/components/common/table';
import strings from 'src/strings';
import { CohortModule, Module } from 'src/types/Module';

import AddModuleModal from './AddModuleModal';

interface ModulesTableProps {
  modules?: Module[];
  editing?: boolean;
  modulesToAdd?: CohortModule[];
  setModulesToAdd?: React.Dispatch<React.SetStateAction<CohortModule[] | undefined>>;
  modulesToDelete?: CohortModule[];
  setModulesToDelete?: React.Dispatch<React.SetStateAction<CohortModule[] | undefined>>;
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
  { key: 'deliverables', name: strings.DELIVERABLES, type: 'string' },
];

export default function ModulesTable(props: ModulesTableProps): JSX.Element {
  const { modules, editing, modulesToAdd, setModulesToAdd, modulesToDelete, setModulesToDelete } = props;
  const theme = useTheme();
  const [addModuleModalOpened, setAddModuleModalOpened] = useState(false);
  const [allModules, setAllModules] = useState<CohortModule[]>(modules || []);
  const [selectedRows, setSelectedRows] = useState<CohortModule[]>([]);

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
    setAllModules(() => {
      let _allModules: CohortModule[] = modules ? modules : [];

      if (modulesToAdd) {
        _allModules = _allModules.concat(...modulesToAdd);
      }
      if (modulesToDelete) {
        const modulesToDeleteIds = modulesToDelete.map((mtd) => mtd.id);
        _allModules = _allModules.filter((module) => !modulesToDeleteIds.includes(module.id));
      }
      return _allModules;
    });
  }, [modules, modulesToAdd, modulesToDelete]);

  return (
    <>
      {addModuleModalOpened && (
        <AddModuleModal
          onClose={() => setAddModuleModalOpened(false)}
          onSave={(cohortModule: CohortModule) => onAddCohortModule(cohortModule)}
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
              columns={columns}
              rows={allModules || []}
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
            />
          )}
        </Grid>
      </Grid>
    </>
  );
}
