import {
	BufferAttribute,
	type BufferGeometry,
	Euler,
	type Material,
	Matrix4,
	Quaternion,
	Vector3
} from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

export type Part = {
	g: BufferGeometry;
	m: Material;
	p?: [number, number, number];
	r?: [number, number, number];
	s?: number | [number, number, number];
};

export type MergedGroup = { material: Material; geometry: BufferGeometry };

const matrix = new Matrix4();
const position = new Vector3();
const quaternion = new Quaternion();
const scale = new Vector3();
const euler = new Euler();

export function partMatrix(part: Part, out = new Matrix4()) {
	position.set(...(part.p ?? [0, 0, 0]));
	quaternion.setFromEuler(euler.set(...(part.r ?? [0, 0, 0])));
	const s = part.s ?? 1;
	if (typeof s === 'number') scale.setScalar(s);
	else scale.set(...s);
	return out.compose(position, quaternion, scale);
}

export function mergeParts(parts: Part[]): MergedGroup[] {
	const buckets = new Map<Material, BufferGeometry[]>();
	for (const part of parts) {
		const source = part.g.index ? part.g.toNonIndexed() : part.g.clone();
		source.deleteAttribute('color');
		if (!source.getAttribute('uv')) {
			const count = source.getAttribute('position').count;
			source.setAttribute('uv', new BufferAttribute(new Float32Array(count * 2), 2));
		}
		if (!source.getAttribute('normal')) source.computeVertexNormals();
		source.applyMatrix4(partMatrix(part, matrix));
		const list = buckets.get(part.m) ?? [];
		list.push(source);
		buckets.set(part.m, list);
	}
	const groups: MergedGroup[] = [];
	for (const [material, list] of buckets) {
		const geometry = mergeGeometries(list, false);
		for (const g of list) g.dispose();
		if (geometry) groups.push({ material, geometry });
	}
	return groups;
}
