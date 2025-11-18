import React, { useCallback, useMemo, useState } from 'react';
import { useParams } from 'react-router';

import { Box, Grid, Typography, useTheme } from '@mui/material';
import { DropdownItem } from '@terraware/web-components';

import { Crumb } from 'src/components/BreadCrumbs';
import FundersTable from 'src/components/FundersTable';
import Page from 'src/components/Page';
import Card from 'src/components/common/Card';
import Link from 'src/components/common/Link';
import OptionsMenu from 'src/components/common/OptionsMenu';
import TextField from 'src/components/common/Textfield/Textfield';
import Button from 'src/components/common/button/Button';
import { APP_PATHS } from 'src/constants';
import useNavigateTo from 'src/hooks/useNavigateTo';
import { useLocalization, useUser } from 'src/providers';
import { useGetFundingEntityQuery } from 'src/queries/generated/fundingEntities';
import strings from 'src/strings';

import DeleteFundingEntityModal from './DeleteFundingEntityModal';

const SingleView = () => {
  const { activeLocale } = useLocalization();
  const { isAllowed } = useUser();
  const theme = useTheme();
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const { goToEditFundingEntity } = useNavigateTo();

  const pathParams = useParams<{ fundingEntityId: string }>();
  const { data: getFundingEntityResponse } = useGetFundingEntityQuery({
    fundingEntityId: Number(pathParams.fundingEntityId),
  });
  const canManage = isAllowed('MANAGE_FUNDING_ENTITIES');

  const onDeleteClick = useCallback((optionItem: DropdownItem) => {
    if (optionItem.value === 'delete') {
      setOpenDeleteConfirm(true);
    }
  }, []);

  const goToEdit = useCallback(() => {
    if (getFundingEntityResponse) {
      goToEditFundingEntity(getFundingEntityResponse.fundingEntity.id);
    }
  }, [getFundingEntityResponse, goToEditFundingEntity]);

  const rightComponent = useMemo(() => {
    return (
      activeLocale &&
      canManage &&
      getFundingEntityResponse?.fundingEntity && (
        <>
          <Button
            label={strings.EDIT_FUNDING_ENTITY}
            icon='iconEdit'
            onClick={goToEdit}
            size='medium'
            id='editFundingEntity'
          />
          <OptionsMenu
            onOptionItemClick={onDeleteClick}
            optionItems={[{ label: strings.DELETE, value: 'delete', type: 'destructive' }]}
          />
        </>
      )
    );
  }, [activeLocale, canManage, getFundingEntityResponse, goToEdit, onDeleteClick]);

  const crumbs: Crumb[] = useMemo(
    () => [
      {
        name: activeLocale ? strings.FUNDING_ENTITIES : '',
        to: APP_PATHS.ACCELERATOR_FUNDING_ENTITIES,
      },
    ],
    [activeLocale]
  );

  return (
    <>
      {getFundingEntityResponse?.fundingEntity && (
        <Page crumbs={crumbs} title={getFundingEntityResponse.fundingEntity.name} rightComponent={rightComponent}>
          {openDeleteConfirm && (
            <DeleteFundingEntityModal
              open={openDeleteConfirm}
              onClose={() => setOpenDeleteConfirm(false)}
              fundingEntity={getFundingEntityResponse.fundingEntity}
            />
          )}
          <Card flushMobile style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, borderRadius: '24px' }}>
            <Grid container spacing={3} paddingBottom={theme.spacing(4)}>
              <Grid item xs={4}>
                <TextField
                  label={strings.NAME}
                  id='name'
                  type='text'
                  value={getFundingEntityResponse.fundingEntity.name}
                  display={true}
                />
              </Grid>
              {getFundingEntityResponse.fundingEntity.projects?.map((project, idx) => (
                <Grid key={idx} item xs={4}>
                  <Typography fontSize='14px' fontWeight={400} lineHeight='20px' color={theme.palette.TwClrBaseGray500}>
                    {strings.PROJECT}
                  </Typography>
                  <Box display='flex' flexDirection='row' flexWrap='wrap' marginTop={theme.spacing(1.5)}>
                    <span>
                      <Link
                        fontSize='16px'
                        to={APP_PATHS.ACCELERATOR_PROJECT_VIEW.replace(':projectId', `${project.projectId}`)}
                      >
                        {project.dealName}
                      </Link>
                    </span>
                  </Box>
                </Grid>
              ))}
            </Grid>
            <Grid container spacing={3}>
              <FundersTable fundingEntityId={getFundingEntityResponse.fundingEntity.id} />
            </Grid>
          </Card>
        </Page>
      )}
    </>
  );
};

export default SingleView;
