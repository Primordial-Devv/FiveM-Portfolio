import {
	BoxGeometry,
	CapsuleGeometry,
	ConeGeometry,
	CylinderGeometry,
	Euler,
	LatheGeometry,
	Matrix4,
	Quaternion,
	SphereGeometry,
	TorusGeometry,
	TorusKnotGeometry,
	Vector2,
	Vector3
} from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import type { Part } from '../../merge.js';
import { figurineMaterials as m } from './materials.js';

type V3 = [number, number, number];
const tmpM = new Matrix4();
const tmpP = new Vector3();
const tmpQ = new Quaternion();
const tmpS = new Vector3();
const tmpE = new Euler();

export function transform(
	parts: Part[],
	position: V3,
	rotation: V3 = [0, 0, 0],
	scale = 1
): Part[] {
	const parent = new Matrix4().compose(
		new Vector3(...position),
		new Quaternion().setFromEuler(new Euler(...rotation)),
		new Vector3(scale, scale, scale)
	);
	return parts.map((part) => {
		const s = part.s ?? 1;
		tmpM.compose(
			tmpP.set(...(part.p ?? [0, 0, 0])),
			tmpQ.setFromEuler(tmpE.set(...(part.r ?? [0, 0, 0]))),
			typeof s === 'number' ? tmpS.setScalar(s) : tmpS.set(...s)
		);
		tmpM.premultiply(parent);
		tmpM.decompose(tmpP, tmpQ, tmpS);
		tmpE.setFromQuaternion(tmpQ);
		return {
			g: part.g,
			m: part.m,
			p: [tmpP.x, tmpP.y, tmpP.z],
			r: [tmpE.x, tmpE.y, tmpE.z],
			s: [tmpS.x, tmpS.y, tmpS.z]
		};
	});
}

const sphere = new SphereGeometry(1, 14, 10);
const sphereLow = new SphereGeometry(1, 8, 6);

export function woodenBird(): Part[] {
	const head: Part[] = transform(
		[
			{ g: sphere, m: m.walnut, s: [0.5, 0.3, 0.3] },
			{ g: sphereLow, m: m.walnut, p: [-0.55, 0.1, 0], r: [0, 0, -0.5], s: [0.32, 0.08, 0.16] },
			{ g: sphere, m: m.walnut, p: [0.42, 0.2, 0], s: [0.2, 0.18, 0.18] },
			{
				g: new ConeGeometry(0.05, 0.16, 10),
				m: m.black,
				p: [0.64, 0.18, 0],
				r: [0, 0, -Math.PI / 2]
			},
			{ g: sphereLow, m: m.black, p: [0.47, 0.25, 0.11], s: 0.028 },
			{ g: sphereLow, m: m.black, p: [0.47, 0.25, -0.11], s: 0.028 }
		],
		[0, 0.62, 0],
		[0, 0, 0.12]
	);
	return [
		{ g: new CylinderGeometry(0.28, 0.3, 0.04, 24), m: m.walnut, p: [0, 0.02, 0] },
		{ g: new CylinderGeometry(0.02, 0.025, 0.52, 10), m: m.walnut, p: [0, 0.3, 0] },
		...head
	];
}

export function brassKnot(): Part[] {
	return [
		{ g: new CylinderGeometry(0.62, 0.62, 0.24, 32), m: m.marble, p: [0, 0.12, 0] },
		{ g: new CylinderGeometry(0.08, 0.08, 0.1, 10), m: m.brass, p: [0, 0.28, 0] },
		{
			g: new TorusKnotGeometry(0.44, 0.13, 96, 10, 2, 3),
			m: m.brass,
			p: [0, 0.95, 0],
			r: [0.4, 0.3, 0.2]
		}
	];
}

const vaseProfile = [
	new Vector2(0, 0),
	new Vector2(0.3, 0),
	new Vector2(0.36, 0.05),
	new Vector2(0.46, 0.3),
	new Vector2(0.44, 0.55),
	new Vector2(0.3, 0.78),
	new Vector2(0.2, 0.9),
	new Vector2(0.2, 1),
	new Vector2(0.24, 1.02),
	new Vector2(0.17, 1.02),
	new Vector2(0.15, 0.9),
	new Vector2(0, 0.9)
];
export function ceramicVase(): Part[] {
	return [
		{ g: new LatheGeometry(vaseProfile, 32), m: m.ceramic },
		...[-0.12, 0.08, 0.02].map((x, i): Part => ({
			g: new CylinderGeometry(0.012, 0.016, 0.9, 6),
			m: m.walnut,
			p: [x, 1.2 + i * 0.1, i * 0.05 - 0.05],
			r: [0, 0, x * 1.4]
		}))
	];
}

export function artMannequin(): Part[] {
	const arm = (x: number, upper: number, lower: number): Part[] =>
		transform(
			[
				{ g: sphere, m: m.beech, s: 0.045 },
				{ g: new CapsuleGeometry(0.034, 0.18, 4, 10), m: m.beech, p: [0, -0.14, 0] },
				...transform(
					[
						{ g: sphere, m: m.beech, s: 0.036 },
						{ g: new CapsuleGeometry(0.03, 0.16, 4, 10), m: m.beech, p: [0, -0.12, 0] },
						{ g: sphereLow, m: m.beech, p: [0, -0.24, 0], s: [0.036, 0.045, 0.0225] }
					],
					[0, -0.28, 0],
					[0, 0, lower]
				)
			],
			[x, 0.9, 0],
			[0, 0, upper]
		);
	const body: Part[] = [
		...[-1, 1].flatMap((side): Part[] => [
			{ g: sphere, m: m.beech, p: [side * 0.07, 0.02, 0.02], s: [0.05, 0.025, 0.1] },
			{ g: new CapsuleGeometry(0.04, 0.2, 4, 10), m: m.beech, p: [side * 0.07, 0.16, 0] },
			{ g: sphere, m: m.beech, p: [side * 0.07, 0.3, 0], s: 0.045 },
			{ g: new CapsuleGeometry(0.045, 0.18, 4, 10), m: m.beech, p: [side * 0.07, 0.42, 0] }
		]),
		{ g: sphere, m: m.beech, p: [0, 0.55, 0], s: [0.132, 0.072, 0.096] },
		{ g: sphere, m: m.beech, p: [0, 0.76, 0], s: [0.15, 0.1875, 0.105] },
		{ g: new CylinderGeometry(0.035, 0.045, 0.08, 10), m: m.beech, p: [0, 0.98, 0] },
		{ g: sphere, m: m.beech, p: [0, 1.12, 0], s: [0.09, 0.11, 0.095] },
		...arm(-0.17, 0.35, -0.9),
		...arm(0.17, -2.6, -0.5)
	];
	return [
		{ g: new CylinderGeometry(0.24, 0.26, 0.03, 24), m: m.beech, p: [0, 0.015, 0] },
		{ g: new CylinderGeometry(0.012, 0.012, 0.5, 8), m: m.chrome, p: [0, 0.25, -0.05] },
		...transform(body, [0, 0.12, 0])
	];
}

export function vintageCamera(): Part[] {
	return [
		{ g: new RoundedBoxGeometry(1, 0.6, 0.36, 3, 0.05), m: m.leather, p: [0, 0.3, 0] },
		{ g: new RoundedBoxGeometry(1, 0.12, 0.36, 2, 0.02), m: m.chrome, p: [0, 0.66, 0] },
		{
			g: new CylinderGeometry(0.2, 0.22, 0.08, 24),
			m: m.chrome,
			p: [0, 0.3, 0.2],
			r: [Math.PI / 2, 0, 0]
		},
		{
			g: new CylinderGeometry(0.19, 0.19, 0.14, 24),
			m: m.black,
			p: [0, 0.3, 0.3],
			r: [Math.PI / 2, 0, 0]
		},
		{
			g: new CylinderGeometry(0.13, 0.13, 0.01, 24),
			m: m.glass,
			p: [0, 0.3, 0.375],
			r: [Math.PI / 2, 0, 0]
		},
		{
			g: new TorusGeometry(0.165, 0.012, 8, 32),
			m: m.chrome,
			p: [0, 0.3, 0.33],
			r: [Math.PI / 2, 0, 0]
		},
		{ g: new CylinderGeometry(0.07, 0.07, 0.09, 16), m: m.chrome, p: [-0.32, 0.76, 0] },
		{ g: new CylinderGeometry(0.05, 0.05, 0.08, 16), m: m.chrome, p: [0.34, 0.76, 0] },
		{ g: new CylinderGeometry(0.03, 0.03, 0.06, 10), m: m.chrome, p: [0.2, 0.75, 0.08] },
		{ g: new RoundedBoxGeometry(0.16, 0.08, 0.1, 1, 0.01), m: m.black, p: [0, 0.72, -0.06] },
		{ g: new BoxGeometry(0.1, 0.06, 0.16), m: m.black, p: [-0.2, 0.72, 0.02] },
		{
			g: new TorusGeometry(0.035, 0.012, 6, 12),
			m: m.chrome,
			p: [0.51, 0.52, 0],
			r: [0, 0, Math.PI / 2]
		},
		{
			g: new TorusGeometry(0.035, 0.012, 6, 12),
			m: m.chrome,
			p: [-0.51, 0.52, 0],
			r: [0, 0, Math.PI / 2]
		}
	];
}

export function stoneCairn(): Part[] {
	const stones = [
		{ r: 0.5, h: 0.3, rot: 0.2, dark: false },
		{ r: 0.42, h: 0.26, rot: 1.1, dark: true },
		{ r: 0.34, h: 0.24, rot: 2.3, dark: false },
		{ r: 0.24, h: 0.2, rot: 0.7, dark: true }
	];
	let y = 0;
	return stones.map((stone, i) => {
		const cy = y + stone.h * 0.5;
		y += stone.h * 0.92;
		return {
			g: sphere,
			m: stone.dark ? m.stoneDark : m.stone,
			p: [(i % 2 ? 0.04 : -0.03) * i, cy, 0],
			r: [0.08, stone.rot, -0.05],
			s: [stone.r, stone.h * 0.5, stone.r * 0.82]
		};
	});
}
