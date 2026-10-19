import { expect, test } from '@playwright/test';

test('header renders brand and navigation', async ({ page }) => {
	await page.goto('/');
	await expect(page.getByRole('link', { name: 'Portfolio, accueil' })).toBeVisible();
	const nav = page.getByRole('list', { name: 'Navigation principale' });
	await expect(nav.getByRole('link')).toHaveText([
		'Qui je suis',
		'Projets',
		'Expérience',
		'Contact'
	]);
});

test('mobile menu toggles', async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await page.goto('/');
	const toggle = page.getByRole('button', { name: 'Menu' });
	await toggle.click();
	await expect(toggle).toHaveAttribute('aria-expanded', 'true');
	await expect(page.getByRole('link', { name: 'Contact' })).toBeVisible();
});
