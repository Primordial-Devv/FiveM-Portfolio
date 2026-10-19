import { BufferAttribute, BufferGeometry, LatheGeometry, Vector2 } from 'three';

export function createLeafGeometry(segmentsU = 8, segmentsV = 14) {
	const positions: number[] = [];
	const uvs: number[] = [];
	const indices: number[] = [];
	const half = (v: number) => 0.42 * Math.pow(Math.sin(Math.PI * Math.pow(v, 0.65)), 0.7);
	const thick = (v: number) => 0.34 * Math.pow(Math.sin(Math.PI * v), 0.6);
	const bend = (v: number) => 0.3 * v * v;
	for (const sideSign of [1, -1]) {
		const offset = positions.length / 3;
		for (let j = 0; j <= segmentsV; j++) {
			const v = j / segmentsV;
			for (let i = 0; i <= segmentsU; i++) {
				const u = (i / segmentsU) * 2 - 1;
				const x = u * half(v);
				const lens = Math.sqrt(Math.max(0, 1 - u * u));
				const z = bend(v) + sideSign * thick(v) * lens * (sideSign > 0 ? 1 : 0.55);
				positions.push(x, v, z);
				uvs.push(i / segmentsU, v);
			}
		}
		for (let j = 0; j < segmentsV; j++) {
			for (let i = 0; i < segmentsU; i++) {
				const a = offset + j * (segmentsU + 1) + i;
				const b = a + segmentsU + 1;
				if (sideSign > 0) indices.push(a, b, a + 1, b, b + 1, a + 1);
				else indices.push(a, a + 1, b, b, a + 1, b + 1);
			}
		}
	}
	const geometry = new BufferGeometry();
	geometry.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3));
	geometry.setAttribute('uv', new BufferAttribute(new Float32Array(uvs), 2));
	geometry.setIndex(indices);
	geometry.computeVertexNormals();
	return geometry;
}

export function createPotGeometry() {
	const profile = [
		new Vector2(0, 0),
		new Vector2(0.3, 0),
		new Vector2(0.32, 0.012),
		new Vector2(0.4, 0.5),
		new Vector2(0.405, 0.51),
		new Vector2(0.44, 0.515),
		new Vector2(0.445, 0.62),
		new Vector2(0.405, 0.62),
		new Vector2(0.4, 0.56),
		new Vector2(0.36, 0.56),
		new Vector2(0, 0.56)
	];
	return new LatheGeometry(profile, 40);
}
