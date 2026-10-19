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
	import { createPaddleLeafGeometry, createPlanterGeometry } from './strelitzia-geometry.js';

	const leafGeometry = createPaddleLeafGeometry();
	const planterGeometry = createPlanterGeometry();
	const leafMaterial = new MeshPhysicalMaterial({
		color: '#ffffff',
		roughness: 0.5,
		metalness: 0,
		clearcoat: 0.35,
		clearcoatRoughness: 0.45,
		side: DoubleSide
	});
	const stemMaterial = new MeshStandardMaterial({ color: '#3a5a2e', roughness: 0.7, metalness: 0 });
	const planterMaterial = new MeshStandardMaterial({
		color: '#121316',
		roughness: 0.68,
		metalness: 0.05,
		envMapIntensity: 0.5
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
	import { createStrelitziaLeafTexture } from '../materials/strelitzia-textures.js';
	import { createSoilTexture } from '../materials/succulent-textures.js';

	let {
		position = [0, 0, 0],
		height = 1.8,
		leaves = 40,
		seed = 1
	}: {
		position?: [number, number, number];
		height?: number;
		leaves?: number;
		seed?: number;
	} = $props();

	const h = untrack(() => height);
	const n = untrack(() => leaves);
	let state = untrack(() => seed) * 7331 + 3;
	const rand = () => {
		state = (state * 1664525 + 1013904223) % 4294967296;
		return state / 4294967296;
	};

	onMount(() => {
		if (!leafMaterial.map) {
			leafMaterial.map = createStrelitziaLeafTexture();
			leafMaterial.needsUpdate = true;
		}
		if (!soilMaterial.map) {
			soilMaterial.map = createSoilTexture();
			soilMaterial.needsUpdate = true;
		}
	});

	const POT = h * 0.26;
	const SOIL_Y = POT * 0.86;
	const items: InstanceItem[] = [];
	const stems: { id: number; geometry: TubeGeometry }[] = [];
	const GOLDEN = 2.39996;

	for (let i = 0; i < n; i++) {
		const t = i / (n - 1);
		const angle = i * GOLDEN + rand() * 0.3;
		const out = new Vector3(Math.cos(angle), 0, Math.sin(angle));
		const tall = 0.3 + Math.pow(1 - t, 1.1) * 0.7;
		const stemLength = h * 0.7 * tall;
		const tilt = 0.08 + (1 - tall) * 0.3 + rand() * 0.1;
		const base = out
			.clone()
			.multiplyScalar(POT * 0.06 + rand() * POT * 0.08)
			.setY(SOIL_Y);
		const mid = base
			.clone()
			.add(out.clone().multiplyScalar(Math.sin(tilt * 0.6) * stemLength * 0.5))
			.setY(SOIL_Y + Math.cos(tilt * 0.6) * stemLength * 0.5);
		const top = base
			.clone()
			.add(out.clone().multiplyScalar(Math.sin(tilt) * stemLength))
			.setY(SOIL_Y + Math.cos(tilt) * stemLength);
		const curve = new CatmullRomCurve3([base, mid, top], false, 'catmullrom', 0.5);
		stems.push({ id: i, geometry: new TubeGeometry(curve, 12, h * 0.006, 6, false) });
		const dir = curve
			.getTangent(1)
			.add(new Vector3(0, -0.04 - (1 - tall) * 0.12, 0))
			.normalize();
		const leafLength = h * (0.17 + tall * 0.15) * (0.9 + rand() * 0.2);
		const roll = Math.PI / 2 + (rand() - 0.5) * 0.5;
		items.push({
			position: [top.x, top.y, top.z],
			rotation: orient(dir, roll),
			scale: [leafLength * 0.4, leafLength, leafLength]
		});
	}
</script>

<T.Group {position}>
	<T.Mesh scale={POT} castShadow receiveShadow material={planterMaterial}>
		<T is={planterGeometry} />
	</T.Mesh>
	<T.Mesh position.y={SOIL_Y} rotation.x={-Math.PI / 2} material={soilMaterial}>
		<T.CircleGeometry args={[POT * 0.4, 32]} />
	</T.Mesh>
	{#each stems as stem (stem.id)}
		<T.Mesh castShadow material={stemMaterial}>
			<T is={stem.geometry} />
		</T.Mesh>
	{/each}
	<Instances geometry={leafGeometry} material={leafMaterial} {items} castShadow />
</T.Group>
