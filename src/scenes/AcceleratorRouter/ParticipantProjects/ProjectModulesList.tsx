import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { TableRowType } from '@terraware/web-components';
import { TableColumnType } from '@terraware/web-components/components/table/types';

import ClientSideFilterTable from 'src/components/Tables/ClientSideFilterTable';
import Button from 'src/components/common/button/Button';
import useBoolean from 'src/hooks/useBoolean';
import useNavigateTo from 'src/hooks/useNavigateTo';
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
  const { goToAcceleratorProjectModulesEdit } = useNavigateTo();
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
    () => goToAcceleratorProjectModulesEdit(projectId),
    [goToAcceleratorProjectModulesEdit, projectId]
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
    (id: number) => {
      const clickedModule = pendingProjectModules.find((module) => module.id === id);
      setModuleToEdit(clickedModule as ProjectModulePayload);
      openAddModuleModal();
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

  const onAddModule = useCallback((module: ProjectModulePayload) => {
    setPendingProjectModules((prev) => [...prev, module]);
  }, []);

  const onEditedModule = useCallback((updatedModule: ProjectModulePayload) => {
    setPendingProjectModules((prev) => {
      // filter out updated module, then add edited module
      const unchangedModules = prev.filter((existingModule) => existingModule.id !== updatedModule.id);
      return [...unchangedModules, updatedModule];
    });
  }, []);

  const onModalSaveHandler = useCallback(
    (module: ProjectModulePayload) => {
      if (moduleToEdit) {
        setModuleToEdit(undefined);
        onEditedModule(module);
      } else {
        onAddModule(module);
      }
      closeAddModuleModal();
    },
    [closeAddModuleModal, moduleToEdit, onAddModule, onEditedModule]
  );

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
