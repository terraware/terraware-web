import { Chart, ChartType, DefaultDataPoint, ScaleOptionsByType } from 'chart.js/auto';
import { ChartConfiguration, ChartConfigurationCustomTypesPerDataset, ChartItem } from 'chart.js/dist/types';
import 'chartjs-adapter-luxon';

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
        scaleOptions.adapters = {
          ...scaleOptions.adapters,
          date: {
            ...existingDateOptions,
            locale: config.options.locale,
          },
        };
      }
    }
  }

  return new Chart(item, config);
}
