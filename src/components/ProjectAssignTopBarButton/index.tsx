import React, { useCallback, useState } from 'react';
import { Box, Grid, Typography, useTheme } from '@mui/material';
import { Button } from '@terraware/web-components';
import Link from 'src/components/common/Link';
import strings from 'src/strings';
import ProjectAssignModal from 'src/components/ProjectAssignModal';
import { makeStyles } from '@mui/styles';

interface ProjectAssignBulkProps<T extends { id: number | string }> {
  selectedRows: T[];
  totalResultsCount: number | undefined;
  selectAllRows: () => void;
  reloadData?: () => void;
}

const useStyles = makeStyles(() => ({
  selectAllRows: {
    verticalAlign: 'inherit',
  },
}));

function ProjectAssignBulk<T extends { id: number | string }>({
  selectedRows,
  totalResultsCount,
  selectAllRows,
  reloadData,
}: ProjectAssignBulkProps<T>) {
  const theme = useTheme();
  const classes = useStyles();

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
      <Box
        display={'flex'}
        sx={{
          backgroundColor: theme.palette.TwClrBaseGray075,
          borderRadius: '4px',
          padding: `${theme.spacing(1)} ${theme.spacing(2)}`,
          marginTop: theme.spacing(1),
        }}
      >
        <Grid container justifyContent={'space-between'} alignItems={'center'}>
          <Grid item>
            <Typography>
              {strings.formatString(strings.TABLE_SELECTED_ROWS, selectedRows.length)}{' '}
              <Link onClick={selectAllRows} fontSize={'1rem'} className={classes.selectAllRows}>
                {strings.formatString(strings.TABLE_SELECT_ALL_ROWS, `${totalResultsCount || 0}`)}
              </Link>
            </Typography>
          </Grid>

          <Grid item>
            <Button onClick={onClickHandler} label={strings.ADD_TO_PROJECT} priority={'secondary'} type={'passive'} />
          </Grid>
        </Grid>
      </Box>

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

export default ProjectAssignBulk;
