import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';

import { Box, Grid, Typography, useTheme } from '@mui/material';
import { BusySpinner, Button, DropdownItem, Textfield } from '@terraware/web-components';

import { Crumb } from 'src/components/BreadCrumbs';
import Page from 'src/components/Page';
import Card from 'src/components/common/Card';
import Link from 'src/components/common/Link';
import OptionsMenu from 'src/components/common/OptionsMenu';
import { APP_PATHS } from 'src/constants';
import useNavigateTo from 'src/hooks/useNavigateTo';
import { useParticipant } from 'src/hooks/useParticipant';
import { useLocalization, useUser } from 'src/providers';
import strings from 'src/strings';
import useDeviceInfo from 'src/utils/useDeviceInfo';

import RemoveParticipant from './RemoveParticipant';

type ProjectsByOrg = {
  organizationId: number;
  organizationName: string;
  projects: {
    id: number;
    name: string;
  }[];
};

export default function ParticipantsView(): JSX.Element {
  const history = useHistory();
  const theme = useTheme();
  const { activeLocale } = useLocalization();
  const { isAllowed } = useUser();
  const { isMobile } = useDeviceInfo();
  const pathParams = useParams<{ participantId: string }>();
  const participantId = Number(pathParams.participantId);
  const { isBusy, isError, participant } = useParticipant(participantId);
  const { goToParticipantsList } = useNavigateTo();

  const [showDelete, setShowDelete] = useState<boolean>(false);

  const goToEdit = useCallback(() => {
    history.push(APP_PATHS.ACCELERATOR_PARTICIPANTS_EDIT.replace(':participantId', `${participantId}`));
  }, [history, participantId]);

  const onOptionItemClick = useCallback((optionItem: DropdownItem) => {
    if (optionItem.value === 'remove-participant') {
      setShowDelete(true);
    }
  }, []);

  useEffect(() => {
    if (isNaN(participantId) || isError) {
      goToParticipantsList();
    }
  }, [goToParticipantsList, isError, participantId]);

  const projectsByOrg = useMemo<ProjectsByOrg[]>(() => {
    const orgMap: Record<number, ProjectsByOrg> = (participant?.projects || []).reduce(
      (acc, curr) => {
        const { projectId: id, projectName: name, organizationId, organizationName } = curr;
        if (!acc[organizationId]) {
          acc[organizationId] = {
            organizationId,
            organizationName,
            projects: [{ id, name }],
          };
        } else {
          acc[organizationId].projects.push({ id, name });
        }
        return acc;
      },
      {} as Record<number, ProjectsByOrg>
    );

    return Object.values(orgMap)
      .sort((a, b) => a.organizationName.localeCompare(b.organizationName, activeLocale || undefined))
      .map((data) => ({
        ...data,
        projects: data.projects.sort((a, b) => a.name.localeCompare(b.name, activeLocale || undefined)),
      }));
  }, [activeLocale, participant?.projects]);

  const actionMenu = useMemo(() => {
    const canUpdateParticipants = isAllowed('UPDATE_PARTICIPANTS');
    const canDeleteParticipants = isAllowed('DELETE_PARTICIPANTS');

    if (!canUpdateParticipants && !canDeleteParticipants) {
      return null;
    }

    return (
      <Box display='flex' justifyContent='right'>
        {canUpdateParticipants && (
          <Button
            id='edit-participant'
            icon='iconEdit'
            label={isMobile ? '' : strings.EDIT_PARTICIPANT}
            onClick={goToEdit}
            size='medium'
            priority='primary'
          />
        )}
        {canDeleteParticipants && (
          <OptionsMenu
            onOptionItemClick={onOptionItemClick}
            optionItems={[
              {
                disabled: participant === undefined || participant.projects.length > 0,
                label: strings.REMOVE,
                type: 'destructive',
                value: 'remove-participant',
              },
            ]}
          />
        )}
      </Box>
    );
  }, [goToEdit, isAllowed, isMobile, onOptionItemClick, participant]);

  const crumbs = useMemo<Crumb[]>(
    () =>
      activeLocale
        ? [
            {
              name: strings.OVERVIEW,
              to: `${APP_PATHS.ACCELERATOR_OVERVIEW}?tab=participants`,
            },
          ]
        : [],
    [activeLocale]
  );

  return (
    <Page crumbs={crumbs} rightComponent={actionMenu} title={participant?.name ?? ''}>
      <Card style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        {isBusy && <BusySpinner />}
        {showDelete && participant !== undefined && (
          <RemoveParticipant onClose={() => setShowDelete(false)} participant={participant} />
        )}
        <DataRow
          leftChild={<Textfield display id='name' label={strings.NAME} type='text' value={participant?.name ?? ''} />}
          rightChild={
            <Textfield
              display
              id='cohort-name'
              label={strings.COHORT}
              type='text'
              value={participant?.cohortName ?? ''}
            />
          }
        />
        {projectsByOrg.map((data) => (
          <DataRow
            key={data.organizationId}
            leftChild={
              <Textfield display id='name' label={strings.ORGANIZATION} type='text' value={data.organizationName} />
            }
            rightChild={
              <Box display='flex' flexDirection='column'>
                <Typography fontSize='14px' fontWeight={400} lineHeight='20px'>
                  {strings.PROJECTS}
                </Typography>
                <Box display='flex' flexDirection='row' flexWrap='wrap' marginTop={theme.spacing(1.5)}>
                  {data.projects.map((project, index) => (
                    <span key={index}>
                      <Link
                        fontSize='16px'
                        to={APP_PATHS.ACCELERATOR_PROJECT_VIEW.replace(':projectId', `${project.id}`)}
                      >
                        {project.name}
                      </Link>
                      {index < data.projects.length - 1 ? ', ' : ''}&nbsp;
                    </span>
                  ))}
                </Box>
              </Box>
            }
          />
        ))}
      </Card>
    </Page>
  );
}

type Props = {
  leftChild: ReactNode;
  rightChild: ReactNode;
};

const DataRow = ({ leftChild, rightChild }: Props): JSX.Element => {
  const { isMobile } = useDeviceInfo();
  const theme = useTheme();

  return (
    <Grid
      container
      sx={{
        borderBottom: `1px solid ${theme.palette.TwClrBrdrTertiary}`,
        display: 'flex',
        flexDirection: 'row',
        marginBottom: theme.spacing(2),
        paddingBottom: theme.spacing(2),
        '&:last-child': {
          borderBottom: 'none',
          marginBottom: 0,
          paddingBottom: 0,
        },
      }}
    >
      <Grid item xs={isMobile ? 12 : 4}>
        {leftChild}
      </Grid>
      <Grid item xs={isMobile ? 12 : 8}>
        {rightChild}
      </Grid>
    </Grid>
  );
};
