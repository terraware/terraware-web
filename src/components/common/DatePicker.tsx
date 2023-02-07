import { DatePicker as WebComponentsDatePicker } from '@terraware/web-components';
import type { Props } from '@terraware/web-components/components/DatePicker/DatePicker';
import { useLocalization } from 'src/providers';
import { useEffect, useState } from 'react';

export default function DatePicker(props: Props): JSX.Element {
  const { loadedStringsForLocale } = useLocalization();
  const [propsWithLocale, setPropsWithLocale] = useState(props);

  useEffect(() => {
    if (loadedStringsForLocale) {
      // Adding a custom gibberish locale to MUI's date picker is nontrivial; show Korean dates
      // in the gibberish locale to support testing that the date picker is localized.
      const effectiveLocale = loadedStringsForLocale === 'gx' ? 'ko' : loadedStringsForLocale;
      setPropsWithLocale({ ...props, locale: effectiveLocale });
    }
  }, [loadedStringsForLocale, props, setPropsWithLocale]);

  return WebComponentsDatePicker(propsWithLocale);
}
