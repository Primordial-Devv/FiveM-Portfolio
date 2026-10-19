import { describe, expect, it } from 'vitest';
import {
	BACK_HEIGHT,
	backrestPoint,
	createBackFrameGeometry,
	createBackPanelGeometry
} from './chair-geometry.js';

describe('chair geometry', () => {
	it('builds a mesh panel that spans the backrest height', () => {
		const geometry = createBackPanelGeometry(10, 10);
		geometry.computeBoundingBox();
		expect(geometry.boundingBox?.min.y).toBeCloseTo(0, 5);
		expect(geometry.boundingBox?.max.y).toBeCloseTo(BACK_HEIGHT, 5);
		expect(geometry.index?.count).toBe(10 * 10 * 6);
	});

	it('bulges forward at the lumbar and leans back at the top', () => {
		const lumbar = backrestPoint(0.5, 0.35).z;
		const top = backrestPoint(0.5, 1).z;
		expect(lumbar).toBeGreaterThan(backrestPoint(0.5, 0).z);
		expect(top).toBeLessThan(lumbar);
	});

	it('is symmetric left to right', () => {
		expect(backrestPoint(0, 0.5).x).toBeCloseTo(-backrestPoint(1, 0.5).x, 6);
	});

	it('closes the frame tube', () => {
		const frame = createBackFrameGeometry();
		expect(frame.parameters.closed).toBe(true);
	});
});
