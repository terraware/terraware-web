import React, { useCallback, useEffect, useState } from 'react';

import { Container, Grid, useTheme } from '@mui/material';
import { Textfield } from '@terraware/web-components';

import Card from 'src/components/common/Card';
import PageForm from 'src/components/common/PageForm';
import strings from 'src/strings';
import { FundingEntity } from 'src/types/FundingEntity';
import useDeviceInfo from 'src/utils/useDeviceInfo';

type FundingEntityFormProps = {
  busy?: boolean;
  fundingEntity?: FundingEntity;
  onCancel: () => void;
  onSave: (fundingEntity: FundingEntity) => void;
};

const FundingEntityForm = (props: FundingEntityFormProps) => {
  const { busy, fundingEntity, onCancel, onSave } = props;
  const theme = useTheme();
  const { isMobile } = useDeviceInfo();

  const [localRecord, setLocalRecord] = useState<Partial<FundingEntity>>({});

  const onSaveHandler = () => {
    onSave({
      ...(localRecord as FundingEntity),
    });
  };

  const updateField = useCallback((field: keyof FundingEntity, value: any) => {
    setLocalRecord((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  useEffect(() => {
    if (fundingEntity) {
      setLocalRecord(fundingEntity);
    }
  }, [fundingEntity]);

  return (
    <PageForm
      busy={busy}
      cancelID='cancelEditFundingEntity'
      onCancel={onCancel}
      onSave={onSaveHandler}
      saveID='saveFundingEntity'
    >
      <Container
        maxWidth={false}
        sx={{
          display: 'flex',
          margin: '0 auto',
          paddingLeft: theme.spacing(isMobile ? 0 : 4),
          paddingRight: theme.spacing(isMobile ? 0 : 4),
          paddingTop: theme.spacing(5),
          width: isMobile ? '100%' : '700px',
        }}
      >
        <Card style={{ width: '568px', margin: 'auto' }}>
          <Grid item xs={12} sx={{ marginTop: theme.spacing(2) }}>
            <Textfield
              id='name'
              label={strings.NAME}
              onChange={(value) => updateField('name', value)}
              type='text'
              value={localRecord.name}
              required={true}
            />
          </Grid>
        </Card>
      </Container>
    </PageForm>
  );
};

export default FundingEntityForm;
