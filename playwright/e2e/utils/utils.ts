export const waitFor = async (page, selector, timeout = 3000) => {
    // Seems weird to await in here with nothing else going on, but I am doing that explicitly so I can
    // ditch the return and keep the signature Promise<void>
    await page.waitForSelector(selector, { timeout });
  };

