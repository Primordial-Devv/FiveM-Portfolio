import { describe, expect, it } from 'vitest';
import { KEY_UNIT, KEYBOARD_ROWS, KEYBOARD_UNITS, keys } from './keyboard-layout.js';

describe('keyboard layout', () => {
	it('fills every row to the same width', () => {
		for (let row = 0; row < KEYBOARD_ROWS; row++) {
			const width = keys.filter((key) => key.row === row).reduce((sum, key) => sum + key.width, 0);
			expect(width).toBe(KEYBOARD_UNITS);
		}
	});

	it('gives every key a unique id', () => {
		expect(new Set(keys.map((key) => key.id)).size).toBe(keys.length);
	});

	it('centers keys inside the keyboard footprint', () => {
		const half = (KEYBOARD_UNITS / 2) * KEY_UNIT;
		for (const key of keys) {
			expect(Math.abs(key.x)).toBeLessThanOrEqual(half);
		}
	});

	it('marks the accent keys', () => {
		expect(keys.filter((key) => key.accent).map((key) => key.label)).toEqual([
			'Esc',
			'Enter',
			'Space'
		]);
	});
});
