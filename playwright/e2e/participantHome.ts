import { Page } from 'playwright-core';

export const openTodoFromHome = async (todoName: string, page: Page) => {
  await page.getByText(todoName).locator('../..').getByRole('button', { name: 'View' }).click();
};
