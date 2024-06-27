import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Container, Grid, useTheme } from '@mui/material';
import { MultiSelect, Textfield } from '@terraware/web-components';

import Card from 'src/components/common/Card';
import PageForm from 'src/components/common/PageForm';
import { useLocalization, useUser } from 'src/providers/hooks';
import { PersonData } from 'src/scenes/AcceleratorRouter/People/PersonContext';
import strings from 'src/strings';
import { DeliverableCategories, DeliverableCategoryType, categoryLabel } from 'src/types/Deliverables';
import { USER_GLOBAL_ROLES, UserWithGlobalRoles, getGlobalRole } from 'src/types/GlobalRoles';
import { User, UserGlobalRole } from 'src/types/User';
import { isAllowed } from 'src/utils/acl';
import useDeviceInfo from 'src/utils/useDeviceInfo';

type PersonFormProps = {
  emailEnabled?: boolean;
  emailError?: string;
  personData?: PersonData;
  onCancel: () => void;
  onChange?: (person: PersonData) => void;
  onSave: (person: PersonData) => void;
};

export default function PersonForm(props: PersonFormProps): JSX.Element {
  const { emailEnabled, emailError, personData, onCancel, onChange, onSave } = props;

  const { isMobile } = useDeviceInfo();
  const { activeLocale } = useLocalization();
  const { user: activeUser } = useUser();
  const theme = useTheme();

  const [localUserRecord, setLocalUserRecord] = useState<Partial<User>>({});
  const [localDeliverableCategories, setLocalDeliverableCategories] = useState<DeliverableCategoryType[]>([]);

  const deliverableCategoryDropdownOptions = useMemo(() => {
    const options = new Map<string, string>([]);

    if (!activeLocale || !activeUser) {
      return options;
    }

    for (const deliverableCategory of DeliverableCategories) {
      options.set(deliverableCategory, categoryLabel(deliverableCategory));
    }

    return options;
  }, [activeLocale, activeUser]);

  const globalRoleDropdownOptions = useMemo(() => {
    const options = new Map<string, string>([]);

    if (!activeLocale || !activeUser) {
      return options;
    }

    for (const globalRole of USER_GLOBAL_ROLES) {
      if (isAllowed(activeUser, 'ASSIGN_GLOBAL_ROLE_TO_USER', { roleToSet: globalRole })) {
        options.set(globalRole, getGlobalRole(globalRole));
      }
    }

    return options;
  }, [activeLocale, activeUser]);

  const updateField = useCallback((field: keyof UserWithGlobalRoles, value: any) => {
    setLocalUserRecord((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const onAddGlobalRole = useCallback((globalRole: string) => {
    setLocalUserRecord((prev) => ({
      ...prev,
      globalRoles: [...(prev.globalRoles || []), globalRole as UserGlobalRole],
    }));
  }, []);

  const onRemoveGlobalRole = useCallback((globalRole: string) => {
    setLocalUserRecord((prev) => ({
      ...prev,
      globalRoles: (prev.globalRoles || []).filter((_globalRole) => _globalRole !== globalRole),
    }));
  }, []);

  const onAddDeliverableCategory = useCallback((categoryToAdd: string) => {
    setLocalDeliverableCategories((prev) => [...prev, categoryToAdd as DeliverableCategoryType]);
  }, []);

  const onRemoveDeliverableCategory = useCallback((categoryToRemove: string) => {
    setLocalDeliverableCategories((prev) => prev.filter((category) => category !== categoryToRemove));
  }, []);

  const onSaveHandler = () => {
    if (!localUserRecord.email || emailError || !personData) {
      return;
    }

    onSave({
      ...personData,
      deliverableCategories: localDeliverableCategories,
      user: localUserRecord as User,
    });
  };

  useEffect(() => {
    if (personData?.user) {
      setLocalUserRecord(personData.user);
    }
    if (personData?.deliverableCategories) {
      setLocalDeliverableCategories(personData.deliverableCategories);
    }
  }, [personData]);

  useEffect(() => {
    if (onChange && personData) {
      onChange({
        ...personData,
        deliverableCategories: localDeliverableCategories,
        user: localUserRecord as User,
        userId: localUserRecord?.id || -1,
      });
    }
  }, [localDeliverableCategories, localUserRecord]);

  return (
    <PageForm
      busy={personData?.isBusy}
      cancelID='cancelEditUser'
      onCancel={onCancel}
      onSave={onSaveHandler}
      saveID='saveUser'
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
              errorText={emailError}
              id='email'
              label={strings.EMAIL}
              onChange={(value) => updateField('email', value)}
              type='text'
              value={localUserRecord.email}
              disabled={!emailEnabled}
            />
          </Grid>
          <Grid item xs={12} sx={{ marginTop: theme.spacing(2) }}>
            <Textfield
              id='firstName'
              label={strings.FIRST_NAME}
              onChange={(value) => updateField('firstName', value)}
              type='text'
              value={localUserRecord.firstName}
              disabled
            />
          </Grid>
          <Grid item xs={12} sx={{ marginTop: theme.spacing(2) }}>
            <Textfield
              id='lastName'
              label={strings.LAST_NAME}
              onChange={(value) => updateField('lastName', value)}
              type='text'
              value={localUserRecord.lastName}
              disabled
            />
          </Grid>
          <Grid item xs={12} sx={{ marginTop: theme.spacing(2) }}>
            <MultiSelect<string, string>
              fullWidth
              onAdd={onAddGlobalRole}
              onRemove={onRemoveGlobalRole}
              options={globalRoleDropdownOptions}
              placeHolder={strings.SELECT}
              valueRenderer={(v) => v}
              selectedOptions={localUserRecord.globalRoles || []}
              label={strings.ROLE}
            />
          </Grid>
          <Grid item xs={12} sx={{ marginTop: theme.spacing(2) }}>
            <MultiSelect<string, string>
              fullWidth
              onAdd={onAddDeliverableCategory}
              onRemove={onRemoveDeliverableCategory}
              options={deliverableCategoryDropdownOptions}
              placeHolder={strings.SELECT}
              valueRenderer={(v) => v}
              selectedOptions={localDeliverableCategories?.toSorted()}
              label={strings.CATEGORIES}
            />
          </Grid>
        </Card>
      </Container>
    </PageForm>
  );
}
