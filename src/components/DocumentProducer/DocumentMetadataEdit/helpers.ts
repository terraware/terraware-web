import { DropdownItem } from '@terraware/web-components/components/types';

import { UserWithGlobalRoles } from 'src/types/GlobalRoles';
import { DocumentTemplate } from 'src/types/documentProducer/DocumentTemplate';
import { getUserDisplayName } from 'src/utils/user';

export const getDocumentTemplateOptions = (documentTemplates: DocumentTemplate[]): DropdownItem[] =>
  documentTemplates.map((documentTemplate) => ({
    label: documentTemplate.name,
    value: documentTemplate.id.toString(),
  }));

export const getDocumentOwnerOptions = (users: UserWithGlobalRoles[]): DropdownItem[] =>
  users.map((user) => ({
    label: getUserDisplayName(user) ?? '',
    value: user.id.toString(),
  }));

export const getDocumentTemplateName = (documentTemplates: DocumentTemplate[], id?: string | number): string =>
  documentTemplates.find((documentTemplate) => documentTemplate.id.toString() === id?.toString())?.name ?? '';
