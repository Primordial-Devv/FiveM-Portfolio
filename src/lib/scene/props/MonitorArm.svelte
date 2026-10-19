<script lang="ts" module>
	import {
		CylinderGeometry,
		Euler,
		MeshStandardMaterial,
		Quaternion,
		SphereGeometry,
		Vector3
	} from 'three';
	import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
	import type { Part } from '../merge.js';

	const arm = new MeshStandardMaterial({
		color: '#0c0d10',
		roughness: 0.62,
		metalness: 0.75,
		envMapIntensity: 0.6
	});
	const joint = new MeshStandardMaterial({ color: '#17191e', roughness: 0.45, metalness: 0.85 });
	const forward = new Vector3(0, 1, 0);
	const q = new Quaternion();
	const e = new Euler();
	type P = [number, number, number];
	const MAIN = 0.05;
	const SIDE = 0.032;
	const sphere = new SphereGeometry(1, 16, 12);
	const bar = (a: P, b: P, w: number, h: number): Part => {
		const from = new Vector3(...a);
		const dir = new Vector3(...b).sub(from);
		const length = dir.length();
		q.setFromUnitVectors(forward, dir.normalize());
		e.setFromQuaternion(q);
		const mid = from.add(dir.multiplyScalar(length / 2));
		return {
			g: new RoundedBoxGeometry(w, length, h, 2, Math.min(w, h) * 0.3),
			m: arm,
			p: [mid.x, mid.y, mid.z],
			r: [e.x, e.y, e.z]
		};
	};
	const ball = (p: P, r: number): Part => ({ g: sphere, m: joint, p, s: r });
	export function buildArm(clampZ: number, center: P, left: P, right: P): Part[] {
		const postTop: P = [0, 0.54, clampZ];
		const mainElbow: P = [0, 0.64, clampZ + 0.06];
		const hubY = 0.46;
		const sideHub = (side: number): P => [side * 0.035, hubY, clampZ];
		const sideElbow = (side: number): P => [side * 0.46, 0.52, clampZ - 0.03];
		const parts: Part[] = [
			{ g: new RoundedBoxGeometry(0.11, 0.08, 0.07, 2, 0.008), m: arm, p: [0, -0.02, clampZ] },
			{
				g: new RoundedBoxGeometry(0.11, 0.03, 0.12, 2, 0.006),
				m: arm,
				p: [0, -0.075, clampZ + 0.05]
			},
			{ g: new CylinderGeometry(0.012, 0.012, 0.05, 14), m: joint, p: [0, -0.1, clampZ + 0.07] },
			{
				g: new CylinderGeometry(MAIN / 2, MAIN / 2 + 0.004, 0.54, 24),
				m: arm,
				p: [0, 0.27, clampZ]
			},
			ball(postTop, MAIN * 0.62),
			bar(postTop, mainElbow, MAIN, MAIN * 0.8),
			ball(mainElbow, MAIN * 0.6),
			bar(mainElbow, center, MAIN * 0.9, MAIN * 0.7),
			ball(center, 0.026),
			{
				g: new CylinderGeometry(MAIN / 2 + 0.014, MAIN / 2 + 0.014, 0.05, 24),
				m: joint,
				p: [0, hubY, clampZ]
			}
		];
		for (const side of [-1, 1]) {
			const target = side < 0 ? left : right;
			parts.push(
				bar(sideHub(side), sideElbow(side), SIDE, SIDE * 0.85),
				ball(sideElbow(side), SIDE * 0.65),
				bar(sideElbow(side), target, SIDE * 0.9, SIDE * 0.75),
				ball(target, 0.022)
			);
		}
		return parts;
	}
</script>

<script lang="ts">
	import { untrack } from 'svelte';
	import Merged from '../Merged.svelte';

	let { clampZ, center, left, right }: { clampZ: number; center: P; left: P; right: P } = $props();

	const parts = untrack(() => buildArm(clampZ, center, left, right));
</script>

<Merged {parts} castShadow />
