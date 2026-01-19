import React, { type JSX, useCallback, useEffect, useMemo, useState } from 'react';

import { Container, Grid, useTheme } from '@mui/material';
import { MultiSelect, Textfield } from '@terraware/web-components';

import Card from 'src/components/common/Card';
import PageForm from 'src/components/common/PageForm';
import { useLocalization, useUser } from 'src/providers/hooks';
import { UserWithInternalnterests } from 'src/scenes/AcceleratorRouter/People/UserWithInternalInterests';
import strings from 'src/strings';
import { USER_GLOBAL_ROLES, UserWithGlobalRoles, getGlobalRole } from 'src/types/GlobalRoles';
import { UserGlobalRole } from 'src/types/User';
import { InternalInterest, InternalInterests, internalInterestLabel } from 'src/types/UserInternalInterests';
import { isAllowed } from 'src/utils/acl';
import useDeviceInfo from 'src/utils/useDeviceInfo';

type PersonFormProps = {
  busy?: boolean;
  emailEnabled?: boolean;
  emailError?: string;
  roleError?: string;
  user?: UserWithInternalnterests;
  onCancel: () => void;
  onChange?: (person: UserWithInternalnterests) => void;
  onSave: (person: UserWithInternalnterests) => void;
};

export default function PersonForm(props: PersonFormProps): JSX.Element {
  const { busy, emailEnabled, emailError, roleError, user, onCancel, onChange, onSave } = props;

  const { isMobile } = useDeviceInfo();
  const { activeLocale } = useLocalization();
  const { user: activeUser } = useUser();
  const theme = useTheme();

  const [localRecord, setLocalRecord] = useState<Partial<UserWithInternalnterests>>({});

  const InternalInterestDropdownOptions = useMemo(() => {
    const options = new Map<string, string>([]);

    if (!activeLocale || !activeUser) {
      return options;
    }

    for (const internalInterest of InternalInterests) {
      options.set(internalInterest, internalInterestLabel(internalInterest));
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
    setLocalRecord((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const onAddInternalInterest = useCallback((internalInterest: string) => {
    setLocalRecord((prev) => ({
      ...prev,
      internalInterests: [...(prev.internalInterests || []), internalInterest as InternalInterest],
    }));
  }, []);

  const onRemoveInternalInterest = useCallback((internalInterest: string) => {
    setLocalRecord((prev) => ({
      ...prev,
      internalInterests: (prev.internalInterests || []).filter(
        (_internalInterest) => _internalInterest !== internalInterest
      ),
    }));
  }, []);

  const onAddGlobalRole = useCallback((globalRole: string) => {
    setLocalRecord((prev) => ({
      ...prev,
      globalRoles: [...(prev.globalRoles || []), globalRole as UserGlobalRole],
    }));
  }, []);

  const onRemoveGlobalRole = useCallback((globalRole: string) => {
    setLocalRecord((prev) => ({
      ...prev,
      globalRoles: (prev.globalRoles || []).filter((_globalRole) => _globalRole !== globalRole),
    }));
  }, []);

  const onSaveHandler = () => {
    if (emailError) {
      return;
    }

    onSave({
      ...(localRecord as UserWithInternalnterests),
    });
  };

  useEffect(() => {
    if (user) {
      setLocalRecord(user);
    }
  }, [user]);

  useEffect(() => {
    if (onChange) {
      onChange(localRecord as UserWithInternalnterests);
    }
  }, [localRecord, onChange]);

  return (
    <PageForm busy={busy} cancelID='cancelEditUser' onCancel={onCancel} onSave={onSaveHandler} saveID='saveUser'>
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
              value={localRecord.email}
              disabled={!emailEnabled}
              required={true}
            />
          </Grid>
          <Grid item xs={12} sx={{ marginTop: theme.spacing(2) }}>
            <Textfield
              id='firstName'
              label={strings.FIRST_NAME}
              onChange={(value) => updateField('firstName', value)}
              type='text'
              value={localRecord.firstName}
              disabled
            />
          </Grid>
          <Grid item xs={12} sx={{ marginTop: theme.spacing(2) }}>
            <Textfield
              id='lastName'
              label={strings.LAST_NAME}
              onChange={(value) => updateField('lastName', value)}
              type='text'
              value={localRecord.lastName}
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
              selectedOptions={localRecord.globalRoles || []}
              label={strings.ROLE_REQUIRED}
              errorText={roleError}
            />
          </Grid>
          <Grid item xs={12} sx={{ marginTop: theme.spacing(2) }}>
            <MultiSelect<string, string>
              fullWidth
              onAdd={onAddInternalInterest}
              onRemove={onRemoveInternalInterest}
              options={InternalInterestDropdownOptions}
              placeHolder={strings.SELECT}
              valueRenderer={(v) => v}
              selectedOptions={localRecord.internalInterests?.toSorted() || []}
              label={strings.INTERNAL_INTERESTS}
            />
          </Grid>
        </Card>
      </Container>
    </PageForm>
  );
}
