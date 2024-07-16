import React, { useMemo } from 'react';

import { Box, Card, Grid, Typography, useTheme } from '@mui/material';
import { useDeviceInfo } from '@terraware/web-components/utils';
import { DateTime } from 'luxon';

import Link from 'src/components/common/Link';
import { APP_PATHS } from 'src/constants';
import useNavigateTo from 'src/hooks/useNavigateTo';
import { useLocalization } from 'src/providers';
import strings from 'src/strings';
import { DeliverableStatusType } from 'src/types/Deliverables';
import { ModuleContentType, ModuleEventType } from 'src/types/Module';
import { getLongDate, getLongDateTime } from 'src/utils/dateFormatter';

import DeliverableStatusBadge from './ModuleDeliverableStatusBadge';
import ModuleEventSessionCard from './ModuleEventSessionCard';

const ModuleContentSection = ({ children }: { children: React.ReactNode }) => {
  return (
    <Box
      sx={{
        flexDirection: 'row',
        marginBottom: '16px',
      }}
    >
      {children}
    </Box>
  );
};

type ModuleContent = {
  type: ModuleContentType;
  label: string;
  onClick: (type: ModuleContentType) => void;
};

const MODULE_CONTENTS = (module: ModuleDetails, navigate: (type: ModuleContentType) => void): ModuleContent[] => {
  const content: ModuleContent[] = [];

  if (module.additionalResources) {
    content.push({
      type: 'additionalResources',
      label: strings.ADDITIONAL_RESOURCES,
      onClick: (type) => navigate(type),
    });
  }

  if (module.preparationMaterials) {
    content.push({
      type: 'preparationMaterials',
      label: strings.PREPARATION_MATERIALS,
      onClick: (type) => navigate(type),
    });
  }

  return content;
};

type DeliverableDetails = {
  dueDate?: DateTime;
  id: number;
  name: string;
  onClick: () => void;
  status: DeliverableStatusType;
};

type EventDetails = {
  id: number;
  type: ModuleEventType;
  onClick: () => void;
  startTime?: string;
};

type ModuleDetails = {
  id: number;
  isActive: boolean;
  title: string;
  name: string;
  overview?: string;
  additionalResources?: string;
  preparationMaterials?: string;
};

export type ModuleDetailsCardProp = {
  deliverables?: DeliverableDetails[];
  events?: EventDetails[];
  module: ModuleDetails;
  projectId: number;
  showSeeAllModules?: boolean;
  showSimplifiedStatus?: boolean;
};

const ModuleDetailsCard = ({
  deliverables,
  events,
  module,
  projectId,
  showSeeAllModules = false,
  showSimplifiedStatus = false,
}: ModuleDetailsCardProp) => {
  const { activeLocale } = useLocalization();
  const theme = useTheme();

  const { goToModuleContent } = useNavigateTo();

  const getDueDateLabelColor = (dueDate: DateTime) => {
    const isCurrentModule = module.isActive;
    const today = DateTime.now().startOf('day');
    const dueDateStart = dueDate.startOf('day');

    // if due date is in the past, item is overdue
    if (dueDateStart < today) {
      return theme.palette.TwClrTxtDanger;
    }

    if (!isCurrentModule) {
      return theme.palette.TwClrTxt;
    }

    return theme.palette.TwClrTxtWarning;
  };

  const { isTablet, isMobile } = useDeviceInfo();

  const wrap = () => {
    if (isMobile || isTablet) {
      return 'wrap';
    }
    return 'nowrap';
  };

  const gridSize = () => {
    if (isMobile || isTablet) {
      return 12;
    }
    return 'auto';
  };

  const whiteSpace = () => {
    if (isMobile || isTablet) {
      return 'pre-line';
    }
    return 'nowrap';
  };

  const contents = useMemo(
    () => (module ? MODULE_CONTENTS(module, (type) => goToModuleContent(projectId, module.id, type)) : []),
    [module, goToModuleContent]
  );

  return (
    <Card
      sx={{
        borderRadius: '24px',
        boxShadow: 'none',
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
        marginBottom: theme.spacing(3),
        padding: `${theme.spacing(2)} ${theme.spacing(1)}`,
      }}
    >
      <Grid container spacing={theme.spacing(1)}>
        <Grid item xs style={{ flexGrow: 1, padding: `${theme.spacing(1)} ${theme.spacing(3)}` }}>
          <ModuleContentSection>
            <Grid container>
              <Grid item xs={12}>
                <Grid container justifyContent={'space-between'}>
                  <Grid item>
                    <Typography fontSize={'16px'} fontWeight={500} lineHeight={'24px'}>
                      {module.title}
                    </Typography>
                  </Grid>
                  <Grid item>
                    {showSeeAllModules && (
                      <Link
                        to={APP_PATHS.PROJECT_MODULES.replace(':projectId', `${projectId}`)}
                        fontSize={16}
                        fontWeight={500}
                      >
                        {strings.SEE_ALL_MODULES}
                      </Link>
                    )}
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <Typography fontSize={'24px'} lineHeight={'32px'} fontWeight={600}>
                  {module.name}
                </Typography>
              </Grid>
            </Grid>
          </ModuleContentSection>

          <ModuleContentSection>
            <Box dangerouslySetInnerHTML={{ __html: module.overview || '' }} />
          </ModuleContentSection>

          {(!!contents.length || !!deliverables?.length) && (
            <ModuleContentSection>
              <Typography fontSize={'20px'} lineHeight={'28px'} fontWeight={600}>
                {strings.THIS_MODULE_CONTAINS}
              </Typography>
            </ModuleContentSection>
          )}

          {
            <>
              {deliverables?.map((deliverable) => (
                <ModuleContentSection key={deliverable.id}>
                  <Grid
                    container
                    columnSpacing={theme.spacing(2)}
                    marginTop={theme.spacing(2)}
                    alignItems={'center'}
                    justifyContent={'flex-start'}
                    flexWrap={wrap()}
                  >
                    <Grid item flexGrow={0} xs={gridSize()}>
                      <DeliverableStatusBadge
                        showSimplifiedStatus={showSimplifiedStatus}
                        status={deliverable.status || 'Not Submitted'}
                      />
                    </Grid>
                    <Grid item flexGrow={0} xs={gridSize()}>
                      <Link fontSize='16px' onClick={deliverable.onClick} style={{ textAlign: 'left' }}>
                        {deliverable.name}
                      </Link>
                    </Grid>
                    {deliverable.dueDate && activeLocale && (
                      <Grid item flexGrow={0} xs={gridSize()}>
                        <Typography
                          component='span'
                          fontSize={'16px'}
                          fontWeight={600}
                          lineHeight={'24px'}
                          sx={{
                            color: getDueDateLabelColor(deliverable.dueDate),
                            marginLeft: '8px',
                          }}
                          whiteSpace={whiteSpace()}
                        >
                          {strings.formatString(strings.DUE, getLongDate(deliverable.dueDate.toString(), activeLocale))}
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                </ModuleContentSection>
              ))}
            </>
          }

          {contents.map((content, index) => (
            <ModuleContentSection key={index}>
              <Link fontSize='16px' onClick={() => goToModuleContent(projectId, module.id, content.type)}>
                {content.label}
              </Link>
            </ModuleContentSection>
          ))}
        </Grid>

        {!!events?.length && (
          <Grid item>
            {events.map((event) => (
              <ModuleEventSessionCard
                key={event.id}
                label={event.type}
                onClickButton={event.onClick}
                value={event.startTime ? getLongDateTime(event.startTime, activeLocale) : ''}
              />
            ))}
          </Grid>
        )}
      </Grid>
    </Card>
  );
};

export default ModuleDetailsCard;
