import React, { useCallback, useState } from 'react';
import { Button } from '@terraware/web-components';
import strings from 'src/strings';
import ProjectAssignModal from 'src/components/ProjectAssignModal';

interface ProjectAssignBulkProps<T extends { id: number | string }> {
  selectedRows: T[];
  totalResultsCount: number | undefined;
  selectAllRows: () => void;
  reloadData?: () => void;
}

function ProjectAssignTopBarButton<T extends { id: number | string }>({
  selectedRows,
  totalResultsCount,
  selectAllRows,
  reloadData,
}: ProjectAssignBulkProps<T>) {
  const [entityStub, setEntityStub] = useState({ id: -1, projectId: undefined });
  const [isProjectAssignModalOpen, setIsProjectAssignModalOpen] = useState<boolean>(false);

  const onClickHandler = useCallback(() => {
    setIsProjectAssignModalOpen(true);
  }, []);

  const projectAssignPayloadCreator = useCallback(
    () => ({ accessionIds: selectedRows.map((row) => Number(row.id)) }),
    [selectedRows]
  );

  return (
    <>
      <Button onClick={onClickHandler} label={strings.ADD_TO_PROJECT} priority={'secondary'} type={'passive'} />

      <ProjectAssignModal<{ id: number; projectId?: number }>
        entity={entityStub}
        assignPayloadCreator={projectAssignPayloadCreator}
        reloadEntity={() => {
          setIsProjectAssignModalOpen(false);
          setEntityStub({ id: -1, projectId: undefined });
          if (reloadData) {
            reloadData();
          }
        }}
        isModalOpen={isProjectAssignModalOpen}
        onClose={() => setIsProjectAssignModalOpen(false)}
      />
    </>
  );
}

export default ProjectAssignTopBarButton;
