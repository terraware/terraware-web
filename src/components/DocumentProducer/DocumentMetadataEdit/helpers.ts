import { DropdownItem } from '@terraware/web-components/components/types';

import { User } from 'src/types/User';
import { Methodology } from 'src/types/documentProducer/Methodology';
import { getUserDisplayName } from 'src/utils/user';

export const getMethodologyOptions = (methodologies: Methodology[]): DropdownItem[] =>
  methodologies.map((methodology) => ({
    label: methodology.name,
    value: methodology.id.toString(),
  }));

export const getDocumentOwnerOptions = (users: User[]): DropdownItem[] =>
  users.map((user) => ({
    label: getUserDisplayName(user) ?? '',
    value: user.id.toString(),
  }));

export const getMethodologyName = (methodologies: Methodology[], id?: string | number): string =>
  methodologies.find((methodology) => methodology.id.toString() === id?.toString())?.name ?? '';
