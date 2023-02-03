import { Chart } from 'chart.js';
import strings from 'src/strings';

export const getOrCreateLegendList = (chart: any, id: string) => {
  const legendContainer = document.getElementById(id);
  let listContainer = legendContainer?.querySelector('ul');

  if (!listContainer) {
    listContainer = document.createElement('ul');
    listContainer.style.flexDirection = 'row';
    listContainer.style.margin = '0';
    listContainer.style.padding = '0';

    legendContainer?.appendChild(listContainer);
  }

  return listContainer;
};

// Plugin to create a custom legend. To use it it is necessary to disable the default legend plugin from chart.js and add this plugin on the plugins section with plugins: [htmlLegendPlugin]
export const htmlLegendPlugin = {
  id: 'htmlLegend',
  // See how this get called here https://www.chartjs.org/docs/latest/developers/plugins.html
  afterUpdate(chart: Chart, args: any, options: { containerID: string }) {
    const ul = getOrCreateLegendList(chart, options.containerID);

    // Remove old legend items
    while (ul.firstChild) {
      ul.firstChild.remove();
    }

    // Reuse the built-in legendItems generator
    const generateLabelsFunction = chart.options?.plugins?.legend?.labels?.generateLabels;
    if (generateLabelsFunction) {
      const items = generateLabelsFunction(chart);
      const hasHumidityTresholds = items.find((item) => item.text === strings.MONITORING_LABEL_HUMIDITY_THRESHOLDS);
      items.forEach((item, index) => {
        const li = document.createElement('li');
        li.style.alignItems = 'center';
        li.style.cursor = 'pointer';
        li.style.display = 'flex';
        li.style.flexDirection = 'row';

        if (
          item.text === strings.MONITORING_LABEL_HUMIDITY_THRESHOLDS ||
          item.text === strings.MONITORING_LABEL_SYSTEM_POWER
        ) {
          li.style.marginLeft = 'auto';
        }
        if (!hasHumidityTresholds && item.text === strings.MONITORING_LABEL_HUMIDITY) {
          li.style.marginLeft = 'auto';
        }

        li.onclick = () => {
          if (item.datasetIndex !== undefined) {
            chart.setDatasetVisibility(item.datasetIndex, !chart.isDatasetVisible(item.datasetIndex));
            chart.update();
          }
        };

        // Color box
        const boxSpan = document.createElement('span');
        boxSpan.style.background = item.fillStyle?.toString() || '';
        boxSpan.style.borderColor = item.strokeStyle?.toString() || '';
        boxSpan.style.borderWidth = '2px';
        boxSpan.style.borderStyle = 'solid';
        boxSpan.style.display = 'inline-block';
        boxSpan.style.height = '13px';
        boxSpan.style.marginRight = '10px';
        boxSpan.style.width = '36px';

        // Text
        const textContainer = document.createElement('p');
        textContainer.style.color = item.fontColor?.toString() || '';
        textContainer.style.margin = '0';
        textContainer.style.padding = '0';
        textContainer.style.fontSize = '12px';
        textContainer.style.textDecoration = item.hidden ? 'line-through' : '';

        const text = document.createTextNode(item.text);
        textContainer.appendChild(text);

        if (item.text) {
          li.appendChild(boxSpan);
          li.appendChild(textContainer);
          ul.appendChild(li);
        }
      });
    }
  },
};
