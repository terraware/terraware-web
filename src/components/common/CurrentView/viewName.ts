import strings from 'src/strings';

export const MAX_VIEW_NAME_LENGTH = 40;

export const getViewNameError = (name: string, existingNames: string[]) => {
  const normalizedName = name.trim().toLocaleLowerCase();
  if (!normalizedName) {
    return strings.VIEW_NAME_REQUIRED;
  }
  if (existingNames.some((existingName) => existingName.trim().toLocaleLowerCase() === normalizedName)) {
    return strings.VIEW_NAME_EXISTS;
  }
  return undefined;
};
