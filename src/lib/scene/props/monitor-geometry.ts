import { BufferAttribute, BufferGeometry, ExtrudeGeometry, Shape } from 'three';

export const MONITOR_W = 0.64;
export const MONITOR_H = 0.37;
export const MONITOR_R = 1.5;
export const BEZEL = 0.004;
export const CHIN = 0.018;
export const HOUSING_T = 0.022;

export function createCurvedPanelGeometry(
	width: number,
	height: number,
	radius: number,
	segments = 24
) {
	const arc = width / radius;
	const positions: number[] = [];
	const uvs: number[] = [];
	const indices: number[] = [];
	const rows = 2;
	for (let j = 0; j <= rows; j++) {
		const y = (j / rows - 0.5) * height;
		for (let i = 0; i <= segments; i++) {
			const t = i / segments;
			const theta = (t - 0.5) * arc;
			positions.push(Math.sin(theta) * radius, y, radius - Math.cos(theta) * radius);
			uvs.push(t, j / rows);
		}
	}
	const ring = segments + 1;
	for (let j = 0; j < rows; j++) {
		for (let i = 0; i < segments; i++) {
			const a = j * ring + i;
			const b = a + 1;
			const c = a + ring;
			const d = c + 1;
			indices.push(a, b, d, a, d, c);
		}
	}
	const geometry = new BufferGeometry();
	geometry.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3));
	geometry.setAttribute('uv', new BufferAttribute(new Float32Array(uvs), 2));
	geometry.setIndex(indices);
	geometry.computeVertexNormals();
	return geometry;
}

export function createCurvedHousingGeometry(
	width: number,
	height: number,
	radius: number,
	thickness: number,
	inset = 0.002
) {
	const arc = width / radius;
	const inner = radius + inset;
	const outer = radius + inset + thickness;
	const shape = new Shape();
	const a0 = Math.PI / 2 + arc / 2;
	const a1 = Math.PI / 2 - arc / 2;
	shape.absarc(0, -radius, inner, a0, a1, true);
	shape.absarc(0, -radius, outer, a1, a0, false);
	shape.closePath();
	const geometry = new ExtrudeGeometry(shape, {
		depth: height,
		bevelEnabled: true,
		bevelThickness: 0.003,
		bevelSize: 0.003,
		bevelSegments: 2,
		curveSegments: 28
	});
	geometry.rotateX(-Math.PI / 2);
	geometry.translate(0, -height / 2, 0);
	return geometry;
}
