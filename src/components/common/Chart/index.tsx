import { Chart, ChartType, DefaultDataPoint, ScaleOptionsByType, TooltipItem } from 'chart.js/auto';
import { ChartConfiguration, ChartConfigurationCustomTypesPerDataset, ChartItem } from 'chart.js/dist/types';
import 'chartjs-adapter-date-fns';
import { Locale } from 'date-fns';
import { formatGibberish } from 'src/utils/useNumber';

type DateFnsModule = {
  default: Locale;
};

const availableDateModules: { [locale: string]: () => Promise<DateFnsModule> } = {
  // The default locale if there isn't a better match.
  '': () => import('date-fns/locale/en-US'),
  es: () => import('date-fns/locale/es'),
  // Render dates in Korean in the gibberish locale so they look visually distinct from English.
  gx: () => import('date-fns/locale/ko'),
};

function importDateFuncsForLocale(locale: string): Promise<DateFnsModule> {
  const loadModule =
    availableDateModules[locale] || availableDateModules[locale.replace(/-.*/, '')] || availableDateModules[''];

  return loadModule();
}

function formatGibberishTick(tickValue: number | string, index: number): string {
  if (typeof tickValue === 'number') {
    return formatGibberish(tickValue);
  } else {
    return tickValue;
  }
}

function formatGibberishTooltipValue<TType extends ChartType>(context: TooltipItem<TType>): string {
  // @ts-ignore
  const value = context.parsed.y;
  if (typeof value === 'number') {
    return formatGibberish(value);
  } else if (value === null || value === undefined) {
    return '';
  } else {
    return value.toString();
  }
}

export async function newChart<TType extends ChartType = ChartType, TData = DefaultDataPoint<TType>, TLabel = unknown>(
  locale: string,
  item: ChartItem,
  config: ChartConfiguration<TType, TData, TLabel> | ChartConfigurationCustomTypesPerDataset<TType, TData, TLabel>
): Promise<Chart<TType, TData, TLabel>> {
  if (typeof config.options === 'object') {
    if ('scales' in config.options) {
      config.options.locale = locale === 'gx' ? 'ko' : locale;
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

        if (
          locale === 'gx' &&
          !scaleOptions.ticks?.callback &&
          (!scaleOptions.type || scaleOptions.type === 'linear' || scaleOptions.type === 'logarithmic')
        ) {
          scaleOptions.ticks = {
            ...scaleOptions.ticks,
            callback: formatGibberishTick,
          };
        }
      }
    }

    // @ts-ignore
    if (locale === 'gx' && !config.options.plugins?.tooltip?.callbacks?.label && config.options.scales?.y) {
      // @ts-ignore
      config.options.plugins = {
        // @ts-ignore
        ...config.options.plugins,
        tooltip: {
          // @ts-ignore
          ...config.options.plugins?.tooltip,
          callbacks: {
            // @ts-ignore
            ...config.options.plugins?.tooltip?.callbacks,
            label: formatGibberishTooltipValue,
          },
        },
      };
    }
  }

  return new Chart(item, config);
}
