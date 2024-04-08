import React, { useCallback, useState } from 'react';

import { Button } from '@terraware/web-components';

import ProjectAssignModal from 'src/components/ProjectAssignModal';
import { AssignProjectRequestPayload } from 'src/services/ProjectsService';
import strings from 'src/strings';

interface ProjectAssignTopBarButtonProps {
  totalResultsCount: number | undefined;
  selectAllRows: () => void;
  reloadData?: () => void;
  projectAssignPayloadCreator: () => AssignProjectRequestPayload;
}

function ProjectAssignTopBarButton({
  totalResultsCount,
  selectAllRows,
  reloadData,
  projectAssignPayloadCreator,
}: ProjectAssignTopBarButtonProps) {
  const [entityStub, setEntityStub] = useState({ id: -1, projectId: undefined });
  const [isProjectAssignModalOpen, setIsProjectAssignModalOpen] = useState<boolean>(false);

  const onClickHandler = useCallback(() => {
    setIsProjectAssignModalOpen(true);
  }, []);

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
