import { Chart, ChartType, DefaultDataPoint, ScaleOptionsByType } from 'chart.js/auto';
import { ChartConfiguration, ChartConfigurationCustomTypesPerDataset, ChartItem } from 'chart.js/dist/types';
import 'chartjs-adapter-date-fns';
import { Locale } from 'date-fns';

type DateFnsModule = {
  default: Locale;
};

const availableDateModules: { [locale: string]: () => Promise<DateFnsModule> } = {
  // The default locale if there isn't a better match.
  '': () => import('date-fns/locale/en-US'),
  es: () => import('date-fns/locale/es'),
  // Render dates in French in the gibberish locale so they look visually distinct from English.
  gx: () => import('date-fns/locale/fr'),
};

function importDateFuncsForLocale(locale: string): Promise<DateFnsModule> {
  const loadModule =
    availableDateModules[locale] || availableDateModules[locale.replace(/-.*/, '')] || availableDateModules[''];

  return loadModule();
}

export async function newChart<TType extends ChartType = ChartType, TData = DefaultDataPoint<TType>, TLabel = unknown>(
  locale: string,
  item: ChartItem,
  config: ChartConfiguration<TType, TData, TLabel> | ChartConfigurationCustomTypesPerDataset<TType, TData, TLabel>
): Promise<Chart<TType, TData, TLabel>> {
  // @ts-ignore
  if (typeof config.options === 'object' && 'scales' in config.options) {
    config.options.locale = locale === 'gx' ? 'fr' : locale;
    const scales = config.options.scales as { [name: string]: ScaleOptionsByType };

    for (const scaleOptions of Object.values(scales)) {
      if (scaleOptions.type === 'time') {
        const existingDateOptions = scaleOptions.adapters?.date as object | undefined;
        const dateFuncsLocale = (await importDateFuncsForLocale(locale)).default;
        scaleOptions.adapters = {
          ...scaleOptions.adapters,
          date: {
            ...existingDateOptions,
            locale: dateFuncsLocale,
          },
        };
      }
    }
  }

  return new Chart(item, config);
}
