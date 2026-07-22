// This is folded into every cache key via baseApi `serializeQueryArgs` so switching languages
// refetches localized data. Kept in sync synchronously by LocalizationProvider.
let currentLocale: string | undefined;

export const setQueryLocale = (locale: string | undefined): void => {
  currentLocale = locale;
};

export const getQueryLocale = (): string | undefined => currentLocale;
