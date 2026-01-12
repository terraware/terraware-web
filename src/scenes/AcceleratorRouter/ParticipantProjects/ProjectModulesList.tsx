import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { TableRowType } from '@terraware/web-components';
import { TableColumnType } from '@terraware/web-components/components/table/types';

import ClientSideFilterTable from 'src/components/Tables/ClientSideFilterTable';
import Button from 'src/components/common/button/Button';
import { APP_PATHS } from 'src/constants';
import useBoolean from 'src/hooks/useBoolean';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useLocalization, useUser } from 'src/providers';
import { ProjectModulePayload, useListProjectModulesQuery } from 'src/queries/generated/projectModules';
import { SearchSortOrder } from 'src/types/Search';

import AddModuleModal from '../Cohorts/AddModuleModal';
import ProjectModulesCellRenderer from './ProjectModulesCellRenderer';

type ProjectModulesListProps = {
  projectId: number;
  editing?: boolean;
};

const defaultSortOrder: SearchSortOrder = {
  field: 'startDate',
  direction: 'Ascending',
};

const fuzzySearchColumns = ['title', 'name', 'id'];

const ProjectModulesList = ({ projectId, editing }: ProjectModulesListProps): JSX.Element => {
  const { strings } = useLocalization();
  const navigate = useSyncNavigate();
  const { isAllowed } = useUser();
  const [addModuleModalOpened, , openAddModuleModal, closeAddModuleModal] = useBoolean(false);
  const [selectedRows, setSelectedRows] = useState<TableRowType[]>([]);
  const [moduleToEdit, setModuleToEdit] = useState<ProjectModulePayload>();

  const { data, isLoading } = useListProjectModulesQuery(projectId);
  const modules = useMemo(() => data?.modules || [], [data?.modules]);
  const [pendingProjectModules, setPendingProjectModules] = useState<ProjectModulePayload[]>(modules);

  useEffect(() => {
    setPendingProjectModules(modules);
  }, [modules]);

  const columns: TableColumnType[] = useMemo(() => {
    return [
      { key: 'title', name: strings.NAME, type: 'string' },
      { key: 'name', name: strings.MODULE, type: 'string' },
      { key: 'id', name: strings.MODULE_ID, type: 'string' },
      { key: 'startDate', name: strings.START_DATE, type: 'date' },
      { key: 'endDate', name: strings.END_DATE, type: 'date' },
    ];
  }, [strings]);

  const goToEditModulesPage = useCallback(
    () => navigate(APP_PATHS.ACCELERATOR_PROJECT_MODULES_EDIT.replace(':projectId', `${projectId}`)),
    [navigate, projectId]
  );

  const isAllowedEdit = useMemo(() => isAllowed('UPDATE_PROJECT_MODULES'), [isAllowed]);

  const editButton = useMemo(
    () =>
      isAllowedEdit ? (
        <Button
          label={strings.EDIT_MODULES}
          icon={'iconEdit'}
          onClick={goToEditModulesPage}
          id='editProjectModules'
          size={'medium'}
          priority={'secondary'}
        />
      ) : (
        ''
      ),
    [goToEditModulesPage, isAllowedEdit, strings.EDIT_MODULES]
  );

  const addButton = useMemo(
    () => (
      <Button
        icon='plus'
        id='add-module'
        label={strings.ADD_MODULE}
        onClick={openAddModuleModal}
        priority='secondary'
        size='medium'
      />
    ),
    [openAddModuleModal, strings.ADD_MODULE]
  );

  const deleteModules = () => {
    setPendingProjectModules?.((prev) =>
      prev.filter(
        (existingModule) => selectedRows.find((deletedModule) => deletedModule.id === existingModule.id) === undefined
      )
    );
  };

  const onEditHandler = useCallback(
    (id: string) => {
      const clickedModule = pendingProjectModules.find((module) => String(module.id) === id);
      setModuleToEdit(clickedModule as ProjectModulePayload);
      openAddModuleModal(); // todo change to edit modal in later PR
    },
    [openAddModuleModal, pendingProjectModules]
  );

  const unusedModules = useMemo(() => {
    return modules.filter(
      (module) => pendingProjectModules.find((existingModule) => module.id === existingModule.id) === undefined
    );
  }, [pendingProjectModules, modules]);

  const onCloseModalHandler = useCallback(() => {
    setModuleToEdit(undefined);
    closeAddModuleModal();
  }, [closeAddModuleModal]);

  const onModalSaveHandler = useCallback((module: ProjectModulePayload) => {
    // TODO later PR
    console.log('onModalSaveHandler', module);
    // if (moduleToEdit) {
    //   setModuleToEdit(undefined);
    //   onEditedModule(module);
    // } else {
    //   onAddModule(module);
    // }
    // closeAddModuleModal();
  }, []);

  const falseCallback = useCallback(() => false, []);

  return (
    <>
      {addModuleModalOpened && (
        <AddModuleModal
          onClose={onCloseModalHandler}
          onSave={onModalSaveHandler}
          selectedModule={moduleToEdit}
          unusedModules={unusedModules}
        />
      )}
      <ClientSideFilterTable
        id={'projectModulesTable'}
        busy={isLoading}
        defaultSortOrder={defaultSortOrder}
        columns={columns}
        fuzzySearchColumns={fuzzySearchColumns}
        rows={pendingProjectModules}
        selectedRows={selectedRows}
        setSelectedRows={setSelectedRows}
        title={strings.MODULES}
        Renderer={ProjectModulesCellRenderer({ editing, onClickName: onEditHandler })}
        maxItemsPerPage={10}
        showCheckbox={editing && isAllowedEdit}
        showTopBar={editing}
        topBarButtons={[
          {
            buttonText: strings.REMOVE,
            buttonType: 'destructive',
            onButtonClick: () => deleteModules(),
            icon: 'iconTrashCan',
          },
        ]}
        rightComponent={editing ? addButton : editButton}
        isClickable={falseCallback}
      />
    </>
  );
};

export default ProjectModulesList;
