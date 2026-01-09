import React, { useCallback, useMemo, useState } from 'react';

import { TableRowType } from '@terraware/web-components';
import { TableColumnType } from '@terraware/web-components/components/table/types';

import ClientSideFilterTable from 'src/components/Tables/ClientSideFilterTable';
import Button from 'src/components/common/button/Button';
import useBoolean from 'src/hooks/useBoolean';
import useNavigateTo from 'src/hooks/useNavigateTo';
import { useLocalization, useUser } from 'src/providers';
import { ModulePayload } from 'src/queries/generated/modules';
import { ProjectModulePayload } from 'src/queries/generated/projectModules';
import { SearchSortOrder } from 'src/types/Search';

import AddModuleModal from '../Cohorts/AddModuleModal';
import ProjectModulesCellRenderer from './ProjectModulesCellRenderer';

const defaultSortOrder: SearchSortOrder = {
  field: 'startDate',
  direction: 'Ascending',
};

const fuzzySearchColumns = ['title', 'name', 'id'];

type ProjectModulesListProps = {
  projectId: number;
  editing?: boolean;
  isLoading: boolean;
  projectModules: ProjectModulePayload[];
  setProjectModules?: React.Dispatch<React.SetStateAction<ProjectModulePayload[]>>;
  allModules?: ModulePayload[];
};

const ProjectModulesList = ({
  projectId,
  editing,
  isLoading,
  allModules,
  projectModules,
  setProjectModules,
}: ProjectModulesListProps): JSX.Element => {
  const { strings } = useLocalization();
  const { goToAcceleratorProjectModulesEdit } = useNavigateTo();
  const { isAllowed } = useUser();
  const [addModuleModalOpened, , openAddModuleModal, closeAddModuleModal] = useBoolean(false);
  const [selectedRows, setSelectedRows] = useState<TableRowType[]>([]);
  const [moduleToEdit, setModuleToEdit] = useState<ProjectModulePayload>();

  const columns: TableColumnType[] = useMemo(() => {
    return [
      { key: 'title', name: strings.NAME, type: 'string' },
      { key: 'name', name: strings.MODULE, type: 'string' },
      { key: 'id', name: strings.MODULE_ID, type: 'string' },
      { key: 'startDate', name: strings.START_DATE, type: 'date' },
      { key: 'endDate', name: strings.END_DATE, type: 'date' },
    ];
  }, [strings]);

  const isAllowedEdit = useMemo(() => isAllowed('UPDATE_PROJECT_MODULES'), [isAllowed]);

  const goToEditModulesPage = useCallback(
    () => goToAcceleratorProjectModulesEdit(projectId),
    [goToAcceleratorProjectModulesEdit, projectId]
  );

  const deleteModules = useCallback(() => {
    setProjectModules?.((prev) =>
      prev.filter(
        (existingModule) => selectedRows.find((deletedModule) => deletedModule.id === existingModule.id) === undefined
      )
    );
  }, [selectedRows, setProjectModules]);

  const onEditHandler = useCallback(
    (id: number) => {
      const clickedModule = projectModules?.find((module) => module.id === id);
      setModuleToEdit(clickedModule as ProjectModulePayload);
      openAddModuleModal();
    },
    [openAddModuleModal, projectModules]
  );

  const onCloseModalHandler = useCallback(() => {
    setModuleToEdit(undefined);
    closeAddModuleModal();
  }, [closeAddModuleModal]);

  const onAddModule = useCallback(
    (module: ProjectModulePayload) => {
      setProjectModules?.((prev) => [...prev, module]);
    },
    [setProjectModules]
  );

  const onEditedModule = useCallback(
    (updatedModule: ProjectModulePayload) => {
      setProjectModules?.((prev) => {
        // filter out updated module, then add edited module
        const unchangedModules = prev.filter((existingModule) => existingModule.id !== updatedModule.id);
        return [...unchangedModules, updatedModule];
      });
    },
    [setProjectModules]
  );

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

  const unusedModules = useMemo(() => {
    return (allModules || []).filter(
      (module) => projectModules?.find((existingModule) => module.id === existingModule.id) === undefined
    );
  }, [projectModules, allModules]);

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
        rows={projectModules}
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
