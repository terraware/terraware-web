import { type JSX, useEffect, useState } from 'react';

import { DatePicker as WebComponentsDatePicker } from '@terraware/web-components';
import type { Props } from '@terraware/web-components/components/DatePicker/DatePicker';
import { Settings } from 'luxon';

import { useLocalization } from 'src/providers';

/**
 * Wrapper for web-components DatePicker which
 * also initializes locale and timezone.
 * Note: App needs to always use this DatePicker
 * instead of directly importing from web-components.
 * Fox luxon specific date formats:
 * @see https://moment.github.io/luxon/#/parsing?id=table-of-tokens
 */
export default function DatePicker(props: Props): JSX.Element {
  const { activeLocale } = useLocalization();
  const [propsWithLocale, setPropsWithLocale] = useState(props);
  /**
   * Luxon settings override needs to be set in the active codebase.
   * This setting is also overridden in web-components but luxon seems to
   * have sandboxed that, which makes sense, so default settings in app aren't affected by
   * third party libraries.
   */
  Settings.defaultZone = props.defaultTimeZone || 'Etc/UTC';

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
