export const addError = (source: any, destination: any) => {
  destination.error = source.error?.message;
};
