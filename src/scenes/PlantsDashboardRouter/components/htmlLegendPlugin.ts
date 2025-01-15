import { Chart } from 'chart.js';

import strings from 'src/strings';

export const getOrCreateLegendList = (chart: any, id: string) => {
  const legendContainer = document.getElementById(id);
  let listContainer = legendContainer?.querySelector('ul');

  if (!listContainer) {
    listContainer = document.createElement('ul');
    listContainer.style.display = 'flex';
    listContainer.style.flexDirection = 'row';
    listContainer.style.margin = '0';
    listContainer.style.padding = '0';
    listContainer.style.justifyContent = 'center';

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
      items.forEach((item) => {
        const li = document.createElement('li');
        li.style.alignItems = 'center';
        li.style.cursor = 'pointer';
        li.style.display = 'flex';
        li.style.flexDirection = 'row';
        li.style.paddingRight = '20px';

        li.onclick = () => {
          if (item.datasetIndex !== undefined) {
            chart.setDatasetVisibility(item.datasetIndex, !chart.isDatasetVisible(item.datasetIndex));
            chart.update();
          }
        };

        // Color box
        const boxSpan = document.createElement('span');
        if (item.text === strings.ACTUAL) {
          boxSpan.style.background = item.strokeStyle?.toString() || '';
          boxSpan.style.display = 'inline-block';
          boxSpan.style.height = '3px';
          boxSpan.style.marginRight = '10px';
          boxSpan.style.width = '30px';
        } else {
          boxSpan.style.background = '#B8A0D64D';
          boxSpan.style.display = 'inline-block';
          boxSpan.style.height = '12px';
          boxSpan.style.marginRight = '10px';
          boxSpan.style.width = '40px';
        }

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
