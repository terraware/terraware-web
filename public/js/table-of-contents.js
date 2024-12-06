const MAX_TRIES = 20;

/**
 * Wait for an element to exist within the DOM, return that element
 * Will reject if the attempts exceeds MAX_TRIES
 * @param {string} selector
 * @returns HTMLElement
 */
const waitForElement = (selector) =>
  new Promise((resolve, reject) => {
    let interval;
    let tries = 0;

    interval = setInterval(() => {
      const element = document.body.querySelector(selector);
      if (!element || element.length === 0) {
        tries++;
        if (tries > MAX_TRIES) {
          clearInterval(interval);
          reject('Could not find element');
        }

        return;
      }

      clearInterval(interval);
      resolve(element);
    }, 100);
  });

const createToc = async (config) => {
  const tocElement = config.tocElement;
  const titleElements = config.titleElements;

  let tocElementDiv;
  try {
    tocElementDiv = await waitForElement(tocElement);
  } catch (error) {
    console.error(error);
    return;
  }

  let tocUl = document.createElement('ul');
  tocUl.id = 'list-toc-generated';
  tocElementDiv.appendChild(tocUl);

  // add class to all title elements
  let tocElementNbr = 0;
  for (let i = 0; i < titleElements.length; i++) {
    let titleHierarchy = i + 1;
    let titleElement = document.body.querySelectorAll(titleElements[i]);

    titleElement.forEach(function (element) {
      // add classes to the element
      element.classList.add('title-element');
      element.setAttribute('data-title-level', titleHierarchy);

      // add id if doesn't exist
      tocElementNbr++;
      const idElement = element.id;
      if (idElement == '') {
        element.id = 'title-element-' + tocElementNbr;
      }
      // TODO this seems to be unused, figure out if it is needed or not
      let newIdElement = element.id;
    });
  }

  // create toc list
  let tocElements = document.body.querySelectorAll('.title-element');

  for (let i = 0; i < tocElements.length; i++) {
    let tocElement = tocElements[i];

    let tocNewLi = document.createElement('li');

    // Add class for the hierarcy of toc
    tocNewLi.classList.add('toc-element');
    tocNewLi.classList.add('toc-element-level-' + tocElement.dataset.titleLevel);

    // Keep class of title elements
    let classTocElement = tocElement.classList;
    for (let n = 0; n < classTocElement.length; n++) {
      if (classTocElement[n] != 'title-element') {
        tocNewLi.classList.add(classTocElement[n]);
      }
    }

    // Create the element
    tocNewLi.innerHTML = '<a href="#' + tocElement.id + '">' + tocElement.innerHTML + '</a>';
    tocUl.appendChild(tocNewLi);
  }
};

(async function () {
  try {
    await createToc({
      tocElement: '#table-of-contents',
      titleElements: ['.toc-major', '.toc-minor'],
    });
    debugger;
  } catch (error) {
    console.error(error);
  }
})();
