import { BufferAttribute, BufferGeometry } from 'three';

export function createBladeGeometry(inner: number, outer: number, sweep: number, pitch: number) {
	const steps = 6;
	const positions: number[] = [];
	const indices: number[] = [];
	for (let i = 0; i <= steps; i++) {
		const a = -sweep / 2 + (i / steps) * sweep;
		const twist = a * 0.6;
		positions.push(Math.cos(a) * inner, Math.sin(a) * inner, 0);
		positions.push(Math.cos(a + twist * 0.3) * outer, Math.sin(a + twist * 0.3) * outer, 0);
	}
	for (let i = 0; i < steps; i++) {
		const a = i * 2;
		indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
	}
	const geometry = new BufferGeometry();
	geometry.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3));
	geometry.setIndex(indices);
	geometry.rotateX(pitch);
	geometry.computeVertexNormals();
	return geometry;
}
