import { BufferAttribute, BufferGeometry } from 'three';

export const MOUSE_L = 0.125;
export const MOUSE_W = 0.066;
export const MOUSE_H = 0.041;

function width(u: number) {
	const front = 0.74 + 0.26 * Math.sin(Math.PI * Math.min(1, u * 1.6));
	const back = u > 0.6 ? 1 - Math.pow((u - 0.6) / 0.4, 2.2) * 0.42 : 1;
	return front * back;
}

function height(u: number) {
	const rise = Math.pow(Math.sin(Math.PI * Math.pow(u, 0.9) * 0.93), 1.15);
	return 0.28 + 0.72 * rise;
}

export function createMouseShellGeometry(segU = 28, segV = 16) {
	const positions: number[] = [];
	const uvs: number[] = [];
	const indices: number[] = [];
	const ring = segV + 1;
	for (let i = 0; i <= segU; i++) {
		const u = i / segU;
		const z = (0.5 - u) * MOUSE_L;
		const hw = (MOUSE_W / 2) * width(u);
		const h = MOUSE_H * height(u);
		for (let j = 0; j <= segV; j++) {
			const t = j / segV;
			const a = Math.PI * t;
			const x = Math.cos(a) * hw;
			const y = Math.pow(Math.sin(a), 0.78) * h;
			positions.push(x, y, z);
			uvs.push(u, t);
		}
	}
	for (let i = 0; i < segU; i++) {
		for (let j = 0; j < segV; j++) {
			const a = i * ring + j;
			const b = a + ring;
			indices.push(a, b, a + 1, a + 1, b, b + 1);
		}
	}
	const base = positions.length / 3;
	for (let i = 0; i <= segU; i++) {
		const u = i / segU;
		const z = (0.5 - u) * MOUSE_L;
		const hw = (MOUSE_W / 2) * width(u);
		positions.push(hw, 0, z, -hw, 0, z);
		uvs.push(u, 0, u, 1);
	}
	for (let i = 0; i < segU; i++) {
		const a = base + i * 2;
		indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
	}
	const geometry = new BufferGeometry();
	geometry.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3));
	geometry.setAttribute('uv', new BufferAttribute(new Float32Array(uvs), 2));
	geometry.setIndex(indices);
	geometry.computeVertexNormals();
	return geometry;
}

export function topAt(u: number) {
	return MOUSE_H * height(u);
}

export function halfWidthAt(u: number) {
	return (MOUSE_W / 2) * width(u);
}
