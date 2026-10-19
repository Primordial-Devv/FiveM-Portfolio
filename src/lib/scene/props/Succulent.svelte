<script lang="ts" module>
	import {
		Color,
		DoubleSide,
		Euler,
		MeshPhysicalMaterial,
		MeshStandardMaterial,
		Quaternion,
		SphereGeometry
	} from 'three';
	import { createLeafGeometry, createPotGeometry } from './succulent-geometry.js';

	const leafGeometry = createLeafGeometry();
	const potGeometry = createPotGeometry();
	const pebbleGeometry = new SphereGeometry(1, 7, 5);
	const leafMaterial = new MeshPhysicalMaterial({
		color: '#e4ebe8',
		roughness: 0.78,
		metalness: 0,
		sheen: 0.4,
		sheenRoughness: 0.9,
		sheenColor: new Color('#c9dcd6'),
		side: DoubleSide
	});
	const potMaterial = new MeshStandardMaterial({
		color: '#ffffff',
		roughness: 0.88,
		metalness: 0,
		bumpScale: 0.4
	});
	const soilMaterial = new MeshStandardMaterial({ color: '#ffffff', roughness: 1, metalness: 0 });
	const pebbleMaterial = new MeshStandardMaterial({
		color: '#9a9690',
		roughness: 0.8,
		metalness: 0
	});
	const euler = new Euler();
	const qa = new Quaternion();
	const qb = new Quaternion();
	const Y = { x: 0, y: 1, z: 0 };
	const X = { x: 1, y: 0, z: 0 };
	const leafRotation = (angle: number, tilt: number, twist: number): [number, number, number] => {
		qa.setFromAxisAngle(Y, angle);
		qb.setFromAxisAngle(X, tilt);
		qa.multiply(qb);
		qb.setFromAxisAngle(Y, twist);
		qa.multiply(qb);
		euler.setFromQuaternion(qa, 'XYZ');
		return [euler.x, euler.y, euler.z];
	};
</script>

<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import { T } from '@threlte/core';
	import { Vector3 } from 'three';
	import Instances from '../Instances.svelte';
	import type { InstanceItem } from '../instances.js';
	import {
		createLeafTexture,
		createPotTexture,
		createSoilTexture
	} from '../materials/succulent-textures.js';

	let {
		position = [0, 0, 0],
		size = 0.16,
		seed = 1
	}: { position?: [number, number, number]; size?: number; seed?: number } = $props();

	const s = untrack(() => size);
	const k = untrack(() => seed);
	let state = k * 7919 + 13;
	const rand = () => {
		state = (state * 1664525 + 1013904223) % 4294967296;
		return state / 4294967296;
	};

	onMount(() => {
		if (!leafMaterial.map) {
			leafMaterial.map = createLeafTexture();
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
	const COUNT = 56;
	const GOLDEN = 2.39996;
	const leaves: InstanceItem[] = Array.from({ length: COUNT }, (_, i) => {
		const t = i / (COUNT - 1);
		const angle = i * GOLDEN + k;
		const tilt = 0.1 + 1.05 * Math.pow(t, 1.6) + (rand() - 0.5) * 0.1;
		const length = s * (0.14 + 0.46 * Math.pow(t, 0.7)) * (0.94 + rand() * 0.12);
		const radius = s * (0.01 + 0.11 * Math.pow(t, 1.1));
		const dir = new Vector3(Math.sin(angle), 0, Math.cos(angle));
		return {
			position: [dir.x * radius, SOIL_Y + s * (0.02 + 0.1 * (1 - t)), dir.z * radius] as [
				number,
				number,
				number
			],
			rotation: leafRotation(angle, tilt, (rand() - 0.5) * 0.15),
			scale: [length * 0.7, length, length] as [number, number, number]
		};
	});

	const pebbles: InstanceItem[] = Array.from({ length: 14 }, () => {
		const a = rand() * Math.PI * 2;
		const rr = s * (0.2 + rand() * 0.14);
		const pr = s * (0.012 + rand() * 0.014);
		return {
			position: [Math.cos(a) * rr, SOIL_Y + pr * 0.5, Math.sin(a) * rr],
			rotation: [rand() * 3, rand() * 3, 0],
			scale: [pr * 1.3, pr * 0.8, pr]
		};
	});
</script>

<T.Group {position}>
	<T.Mesh scale={s} castShadow receiveShadow material={potMaterial}>
		<T is={potGeometry} />
	</T.Mesh>
	<T.Mesh position.y={SOIL_Y} rotation.x={-Math.PI / 2} material={soilMaterial}>
		<T.CircleGeometry args={[s * 0.39, 32]} />
	</T.Mesh>
	<Instances geometry={pebbleGeometry} material={pebbleMaterial} items={pebbles} />
	<Instances geometry={leafGeometry} material={leafMaterial} items={leaves} castShadow />
</T.Group>
