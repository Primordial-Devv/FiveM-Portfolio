<script lang="ts" module>
	import {
		CatmullRomCurve3,
		DoubleSide,
		Euler,
		MeshPhysicalMaterial,
		MeshStandardMaterial,
		Quaternion,
		TubeGeometry,
		Vector3
	} from 'three';
	import { createHeartLeafGeometry } from './pothos-geometry.js';
	import { createPotGeometry } from './succulent-geometry.js';

	const leafGeometry = createHeartLeafGeometry();
	const potGeometry = createPotGeometry();
	const leafMaterial = new MeshPhysicalMaterial({
		color: '#d8dcd4',
		roughness: 0.42,
		metalness: 0,
		clearcoat: 0.5,
		clearcoatRoughness: 0.35,
		side: DoubleSide
	});
	const stemMaterial = new MeshStandardMaterial({
		color: '#4d6b3a',
		roughness: 0.75,
		metalness: 0
	});
	const potMaterial = new MeshStandardMaterial({
		color: '#ffffff',
		roughness: 0.88,
		metalness: 0,
		bumpScale: 0.4
	});
	const soilMaterial = new MeshStandardMaterial({ color: '#ffffff', roughness: 1, metalness: 0 });
	const euler = new Euler();
	const q = new Quaternion();
	const spin = new Quaternion();
	const up = new Vector3(0, 1, 0);
	const orient = (dir: Vector3, roll: number): [number, number, number] => {
		q.setFromUnitVectors(up, dir.clone().normalize());
		spin.setFromAxisAngle(up, roll);
		q.multiply(spin);
		euler.setFromQuaternion(q, 'XYZ');
		return [euler.x, euler.y, euler.z];
	};
</script>

<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import { T } from '@threlte/core';
	import Instances from '../Instances.svelte';
	import type { InstanceItem } from '../instances.js';
	import { createPothosLeafTexture } from '../materials/pothos-textures.js';
	import { createPotTexture, createSoilTexture } from '../materials/succulent-textures.js';

	let {
		position = [0, 0, 0],
		rotation = 0,
		drop = 1.2,
		vines = 11,
		potSize = 0.42,
		wall = false,
		seed = 1
	}: {
		position?: [number, number, number];
		rotation?: number;
		drop?: number;
		vines?: number;
		potSize?: number;
		wall?: boolean;
		seed?: number;
	} = $props();

	const d = untrack(() => drop);
	const n = untrack(() => vines);
	const s = untrack(() => potSize);
	const againstWall = untrack(() => wall);
	let state = untrack(() => seed) * 48271 + 7;
	const rand = () => {
		state = (state * 1664525 + 1013904223) % 4294967296;
		return state / 4294967296;
	};

	onMount(() => {
		if (!leafMaterial.map) {
			leafMaterial.map = createPothosLeafTexture();
			leafMaterial.needsUpdate = true;
		}
		if (!potMaterial.map) {
			const pot = createPotTexture();
			potMaterial.map = pot;
			potMaterial.bumpMap = pot;
			potMaterial.needsUpdate = true;
		}
		if (!soilMaterial.map) {
			soilMaterial.map = createSoilTexture();
			soilMaterial.needsUpdate = true;
		}
	});

	const SOIL_Y = s * 0.56;
	const RIM = s * 0.42;
	const FRONT = Math.PI / 2;
	const CONE = 0.85;
	const EDGE = s * 0.9;
	const leaves: InstanceItem[] = [];
	const stems: { id: number; geometry: TubeGeometry }[] = [];

	const addLeaf = (point: Vector3, tangent: Vector3, size: number, side: number) => {
		const outward = new Vector3(point.x, 0, point.z).normalize();
		const lateral = new Vector3().crossVectors(tangent, outward).normalize();
		if (lateral.lengthSq() < 0.5) lateral.set(-outward.z, 0, outward.x);
		const petiole = point
			.clone()
			.add(lateral.clone().multiplyScalar(side * size * 0.22))
			.add(outward.clone().multiplyScalar(size * 0.08));
		const dir = lateral
			.clone()
			.multiplyScalar(side * (0.35 + rand() * 0.25))
			.add(outward.clone().multiplyScalar(0.4 + rand() * 0.2))
			.add(new Vector3(0, -(0.55 + rand() * 0.45), 0))
			.normalize();
		leaves.push({
			position: [petiole.x, petiole.y, petiole.z],
			rotation: orient(dir, (rand() - 0.5) * 0.7),
			scale: [size * 0.95, size, size]
		});
	};

	for (let i = 0; i < n; i++) {
		const angle = (i / n) * Math.PI * 2 + rand() * 0.4;
		const out = new Vector3(Math.cos(angle), 0, Math.sin(angle));
		const sideways = new Vector3(-out.z, 0, out.x);
		const facing = Math.cos(angle - FRONT);
		if (againstWall && facing < -0.15) continue;
		const hangs = facing > Math.cos(CONE);
		const spread = EDGE / Math.max(facing, 0.65);
		const length = hangs
			? d * (0.35 + rand() * 0.65)
			: s * (againstWall ? 0.25 + rand() * 0.2 : 0.5 + rand() * 0.6);
		const sway = (rand() - 0.5) * 0.5;
		const shift = hangs ? (rand() - 0.5) * s * 2.6 : 0;
		const points = hangs
			? [
					out
						.clone()
						.multiplyScalar(s * 0.08)
						.setY(SOIL_Y + s * 0.14),
					out
						.clone()
						.multiplyScalar(RIM * 0.95)
						.setY(SOIL_Y + s * 0.16),
					out
						.clone()
						.multiplyScalar(spread)
						.add(sideways.clone().multiplyScalar(shift * 0.6))
						.setY(s * 0.1),
					out
						.clone()
						.multiplyScalar(spread + s * 0.14)
						.add(sideways.clone().multiplyScalar(shift + sway * 0.3))
						.setY(-length * 0.45),
					out
						.clone()
						.multiplyScalar(spread + s * 0.1)
						.add(sideways.clone().multiplyScalar(shift + sway))
						.setY(-length)
				]
			: [
					out
						.clone()
						.multiplyScalar(s * 0.08)
						.setY(SOIL_Y + s * 0.14),
					out
						.clone()
						.multiplyScalar(RIM * 0.95)
						.setY(SOIL_Y + s * 0.12),
					out
						.clone()
						.multiplyScalar(RIM + length * 0.5)
						.setY(s * 0.06),
					out
						.clone()
						.multiplyScalar(RIM + length)
						.add(sideways.clone().multiplyScalar(sway * 0.4))
						.setY(s * 0.03)
				];
		const curve = new CatmullRomCurve3(points, false, 'catmullrom', 0.5);
		stems.push({ id: i, geometry: new TubeGeometry(curve, 24, 0.0045, 6, false) });
		const count = hangs ? 9 + Math.round(length * 13) : 5;
		for (let k = 0; k < count; k++) {
			const t = 0.24 + ((k + rand() * 0.4) / count) * 0.74;
			const point = curve.getPoint(t);
			const tangent = curve.getTangent(t);
			const size = s * (0.3 + rand() * 0.16) * (t > 0.9 ? 0.75 : 1);
			addLeaf(point, tangent, size, k % 2 ? 1 : -1);
			if (hangs && rand() > 0.55) {
				const t2 = Math.min(0.98, t + 0.025);
				addLeaf(curve.getPoint(t2), curve.getTangent(t2), size * 0.85, k % 2 ? -1 : 1);
			}
		}
	}

	const crownCount = 34;
	for (let i = 0; i < crownCount; i++) {
		const angle = (i / crownCount) * Math.PI * 2 + 0.3;
		const r = s * (0.05 + rand() * 0.2);
		const point = new Vector3(Math.cos(angle) * r, s * (0.66 + rand() * 0.08), Math.sin(angle) * r);
		const dir = new Vector3(
			Math.cos(angle) * 0.75,
			0.25 + rand() * 0.35,
			Math.sin(angle) * 0.75
		).normalize();
		leaves.push({
			position: [point.x, point.y, point.z],
			rotation: orient(dir, (rand() - 0.5) * 0.6),
			scale: [s * 0.3, s * 0.34, s * 0.34]
		});
	}
</script>

<T.Group {position} rotation.y={rotation}>
	<T.Mesh scale={s} castShadow receiveShadow material={potMaterial}>
		<T is={potGeometry} />
	</T.Mesh>
	<T.Mesh position.y={SOIL_Y} rotation.x={-Math.PI / 2} material={soilMaterial}>
		<T.CircleGeometry args={[s * 0.39, 32]} />
	</T.Mesh>
	{#each stems as stem (stem.id)}
		<T.Mesh castShadow material={stemMaterial}>
			<T is={stem.geometry} />
		</T.Mesh>
	{/each}
	<Instances geometry={leafGeometry} material={leafMaterial} items={leaves} castShadow />
</T.Group>
