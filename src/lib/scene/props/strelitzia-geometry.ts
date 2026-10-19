import { BufferAttribute, BufferGeometry, LatheGeometry, Vector2 } from 'three';

export function createPaddleLeafGeometry(segmentsU = 8, segmentsV = 18) {
	const positions: number[] = [];
	const uvs: number[] = [];
	const indices: number[] = [];
	const half = (v: number) => 0.5 * Math.pow(Math.sin(Math.PI * Math.pow(v, 0.85)), 0.6);
	for (let j = 0; j <= segmentsV; j++) {
		const v = j / segmentsV;
		for (let i = 0; i <= segmentsU; i++) {
			const u = (i / segmentsU) * 2 - 1;
			const x = u * half(v);
			const fold = Math.abs(u) * 0.18 * (0.4 + v * 0.6);
			const droop = -0.32 * Math.pow(v, 2.2);
			const ripple = Math.sin(v * Math.PI * 6 + u * 2) * 0.012 * Math.abs(u);
			positions.push(x, v, fold + droop + ripple);
			uvs.push(i / segmentsU, v);
		}
	}
	for (let j = 0; j < segmentsV; j++) {
		for (let i = 0; i < segmentsU; i++) {
			const a = j * (segmentsU + 1) + i;
			const b = a + segmentsU + 1;
			indices.push(a, b, a + 1, b, b + 1, a + 1);
		}
	}
	const geometry = new BufferGeometry();
	geometry.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3));
	geometry.setAttribute('uv', new BufferAttribute(new Float32Array(uvs), 2));
	geometry.setIndex(indices);
	geometry.computeVertexNormals();
	return geometry;
}

export function createPlanterGeometry() {
	const profile = [
		new Vector2(0, 0),
		new Vector2(0.3, 0),
		new Vector2(0.34, 0.01),
		new Vector2(0.42, 0.18),
		new Vector2(0.46, 0.5),
		new Vector2(0.46, 0.92),
		new Vector2(0.44, 1),
		new Vector2(0.4, 1),
		new Vector2(0.4, 0.86),
		new Vector2(0, 0.86)
	];
	return new LatheGeometry(profile, 48);
}
