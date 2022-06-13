import { Chart } from 'chart.js';

export const getOrCreateLegendList = (chart: any, id: string) => {
  const legendContainer = document.getElementById(id);
  let listContainer = legendContainer?.querySelector('ul');

  if (!listContainer) {
    listContainer = document.createElement('ul');
    listContainer.style.display = 'flex';
    listContainer.style.flexDirection = 'row';
    listContainer.style.margin = '0';
    listContainer.style.padding = '0';

    legendContainer?.appendChild(listContainer);
  }

  return listContainer;
};

export const htmlLegendPlugin = {
  id: 'htmlLegend',
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
      items.forEach((item, index) => {
        const li = document.createElement('li');
        li.style.alignItems = 'center';
        li.style.cursor = 'pointer';
        li.style.display = 'flex';
        li.style.flexDirection = 'row';
        li.style.marginLeft = '10px';

        if (item.text === 'Humidity Thresholds' || item.text === 'System Voltage') {
          li.style.marginLeft = 'auto';
        }

        li.onclick = () => {
          const { type } = chart.config;
          if (type === 'pie' || type === 'doughnut') {
            // Pie and doughnut charts only have a single dataset and visibility is per item
            chart.toggleDataVisibility(index);
          } else {
            chart.setDatasetVisibility(item.datasetIndex, !chart.isDatasetVisible(item.datasetIndex));
          }
          chart.update();
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
