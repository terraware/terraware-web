import { DatePicker as WebComponentsDatePicker } from '@terraware/web-components';
import type { Props } from '@terraware/web-components/components/DatePicker/DatePicker';
import { useLocalization } from 'src/providers';
import { useEffect, useState } from 'react';

export default function DatePicker(props: Props): JSX.Element {
  const { activeLocale } = useLocalization();
  const [propsWithLocale, setPropsWithLocale] = useState(props);

  useEffect(() => {
    if (activeLocale) {
      // Adding a custom gibberish locale to MUI's date picker is nontrivial; show French dates
      // in the gibberish locale to support testing that the date picker is localized.
      const effectiveLocale = activeLocale === 'gx' ? 'fr' : activeLocale;
      setPropsWithLocale({ ...props, locale: effectiveLocale });
    }
  }, [activeLocale, props, setPropsWithLocale]);

  return WebComponentsDatePicker(propsWithLocale);
}
