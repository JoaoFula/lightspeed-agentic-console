import { expect, test } from '../support/fixtures';

test('agentic runs page is accessible from navigation', async ({ page }) => {
  await page.goto('/');

  const navigation = page.locator('[data-test="navigation-page-sidebar"]');
  const section = navigation.getByRole('button', { name: 'Agentic Runs', exact: true });

  await expect(section).toBeVisible();
  await section.click();

  const runsLink = navigation.getByRole('link', { name: 'Agentic runs', exact: true });
  await expect(runsLink).toBeVisible();
  await expect(runsLink).toHaveAttribute('href', '/lightspeed/runs');
  await runsLink.click();

  await expect(page.getByRole('heading', { name: 'Agentic runs', exact: true })).toBeVisible();
  await expect(page.getByText('Tech preview', { exact: true })).toBeVisible();
  await expect(
    page.getByText(
      'The autonomous features of OpenShift Lightspeed use AI technology to generate output. Always review AI-generated content prior to use.',
      { exact: true },
    ),
  ).toBeVisible();
});
