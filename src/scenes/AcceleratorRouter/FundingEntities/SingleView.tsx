import React, { useMemo, useState } from 'react';
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
import isEnabled from 'src/features';
import useNavigateTo from 'src/hooks/useNavigateTo';
import { useFundingEntity, useLocalization, useUser } from 'src/providers';
import { useGetFundingEntityQuery } from 'src/queries/funder/fundingEntities';
import strings from 'src/strings';

import DeleteFundingEntityModal from './DeleteFundingEntityModal';

const SingleView = () => {
  const { activeLocale } = useLocalization();
  const { isAllowed } = useUser();
  const theme = useTheme();
  const { fundingEntity } = useFundingEntity();
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState<boolean>(false);
  const { goToEditFundingEntity } = useNavigateTo();

  const pathParams = useParams<{ fundingEntityId: string }>();
  const { data: rtkFundingEntity } = useGetFundingEntityQuery(Number(pathParams.fundingEntityId));
  const rtkQueryEnabled = isEnabled('Redux RTK Query');
  const canManage = isAllowed('MANAGE_FUNDING_ENTITIES');

  const onDeleteClick = (optionItem: DropdownItem) => {
    if (optionItem.value === 'delete') {
      setOpenDeleteConfirm(true);
    }
  };

  const fundingEntityToUse = useMemo(
    () => (rtkQueryEnabled ? rtkFundingEntity : fundingEntity),
    [fundingEntity, rtkFundingEntity, rtkQueryEnabled]
  );

  const rightComponent = useMemo(() => {
    return (
      activeLocale &&
      canManage &&
      fundingEntityToUse && (
        <>
          <Button
            label={strings.EDIT_FUNDING_ENTITY}
            icon='iconEdit'
            onClick={() => goToEditFundingEntity(String(fundingEntityToUse.id))}
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
  }, [activeLocale, canManage, fundingEntityToUse, goToEditFundingEntity]);

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
      {fundingEntityToUse && (
        <Page crumbs={crumbs} title={fundingEntityToUse.name} rightComponent={rightComponent}>
          {openDeleteConfirm && (
            <DeleteFundingEntityModal
              open={openDeleteConfirm}
              onClose={() => setOpenDeleteConfirm(false)}
              fundingEntity={fundingEntityToUse}
            />
          )}
          <Card flushMobile style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, borderRadius: '24px' }}>
            <Grid container spacing={3} paddingBottom={theme.spacing(4)}>
              <Grid item xs={4}>
                <TextField label={strings.NAME} id='name' type='text' value={fundingEntityToUse.name} display={true} />
              </Grid>
              {fundingEntityToUse.projects?.map((project, idx) => (
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
              <FundersTable fundingEntityId={fundingEntityToUse.id} />
            </Grid>
          </Card>
        </Page>
      )}
    </>
  );
};

export default SingleView;
