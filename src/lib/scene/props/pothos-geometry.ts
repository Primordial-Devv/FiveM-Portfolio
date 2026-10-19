import { BufferAttribute, BufferGeometry } from 'three';

export function createHeartLeafGeometry(segmentsU = 10, segmentsV = 14) {
	const positions: number[] = [];
	const uvs: number[] = [];
	const indices: number[] = [];
	const half = (v: number) => {
		const lobe = Math.sin(Math.PI * Math.pow(v, 0.5));
		const notch = v > 0.86 ? 1 - Math.pow((v - 0.86) / 0.14, 2) * 0.55 : 1;
		return 0.5 * lobe * notch;
	};
	for (let j = 0; j <= segmentsV; j++) {
		const v = j / segmentsV;
		for (let i = 0; i <= segmentsU; i++) {
			const u = (i / segmentsU) * 2 - 1;
			const x = u * half(v);
			const fold = Math.abs(u) * 0.12 * (0.5 + v);
			const droop = -0.22 * v * v;
			const tipDip = v > 0.86 && Math.abs(u) < 0.3 ? -(v - 0.86) * 0.5 : 0;
			positions.push(x, v, fold + droop + tipDip);
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
