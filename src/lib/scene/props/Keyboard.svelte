<script lang="ts" module>
	import {
		AdditiveBlending,
		BoxGeometry,
		Color,
		MeshBasicMaterial,
		MeshStandardMaterial
	} from 'three';
	import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
	import { KEY_UNIT, KEYBOARD_ROWS, KEYBOARD_UNITS, keys } from './keyboard-layout.js';

	const BASE_W = KEYBOARD_UNITS * KEY_UNIT + 0.022;
	const BASE_D = KEYBOARD_ROWS * KEY_UNIT + 0.022;
	const BASE_H = 0.016;
	const CAP = KEY_UNIT - 0.0024;
	const CAP_H = 0.009;
	const keyGeometry = new RoundedBoxGeometry(CAP, CAP_H, CAP, 1, 0.0016);
	const legendGeometry = new BoxGeometry(CAP * 0.45, 0.0004, CAP * 0.28);
	const glowGeometry = new BoxGeometry(KEY_UNIT, 0.0006, KEY_UNIT);
	const caseMaterial = new MeshStandardMaterial({
		color: '#0b0c0f',
		roughness: 0.3,
		metalness: 0.9,
		envMapIntensity: 1.1
	});
	const plateMaterial = new MeshStandardMaterial({
		color: '#ffffff',
		roughness: 0.4,
		metalness: 0.95
	});
	const capMaterial = new MeshStandardMaterial({
		color: '#ffffff',
		roughness: 0.55,
		metalness: 0.2
	});
	const legendMaterial = new MeshBasicMaterial({ color: '#ffffff' });
	const glowMaterial = new MeshBasicMaterial({
		color: '#ffffff',
		transparent: true,
		opacity: 0.55,
		blending: AdditiveBlending,
		depthWrite: false
	});
	const restMaterial = new MeshStandardMaterial({
		color: '#1a1c21',
		roughness: 0.6,
		metalness: 0.7
	});
	const dark = new Color('#1e2026');
	const mid = new Color('#2f333b');
	const accent = new Color('#6cb6f6');
	const rowLift = [0.003, 0.0022, 0.0014, 0.0008, 0.0004, 0.001];
	const rowTilt = [0.12, 0.09, 0.06, 0.03, 0, -0.04];
	const keyItems = keys.map((key) => ({
		position: [key.x, BASE_H + CAP_H / 2 + rowLift[key.row], key.z - 0.004] as [
			number,
			number,
			number
		],
		rotation: [rowTilt[key.row], 0, 0] as [number, number, number],
		scale: [(key.width * KEY_UNIT - 0.0024) / CAP, 1, 1] as [number, number, number],
		color: key.accent ? accent : key.row === 0 || key.label.length > 2 ? mid : dark
	}));
	const legendItems = keys.map((key) => ({
		position: [key.x, BASE_H + CAP_H + rowLift[key.row] + 0.0003, key.z - 0.006] as [
			number,
			number,
			number
		],
		rotation: [rowTilt[key.row], 0, 0] as [number, number, number],
		scale: [key.width, 1, 1] as [number, number, number]
	}));
	const glowItems = keys.map((key) => ({
		position: [key.x, BASE_H + 0.0008, key.z - 0.004] as [number, number, number],
		scale: [key.width, 1, 1] as [number, number, number]
	}));
	const legendColors = keys.map(() => new Color('#ffffff'));
	const glowColors = keys.map(() => new Color('#ffffff'));
	const tmp = new Color();
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { T, useTask, useThrelte } from '@threlte/core';
	import Instances from '../Instances.svelte';
	import { createBrushedMaps } from '../materials/rack-textures.js';

	let { position = [0, 0, 0], scale = 1 }: { position?: [number, number, number]; scale?: number } =
		$props();

	onMount(() => {
		if (plateMaterial.map) return;
		const brushed = createBrushedMaps();
		brushed.map.repeat.set(1, 2);
		brushed.roughnessMap.repeat.set(1, 2);
		plateMaterial.map = brushed.map;
		plateMaterial.roughnessMap = brushed.roughnessMap;
		plateMaterial.needsUpdate = true;
	});

	const { invalidate } = useThrelte();
	let elapsed = 0;
	let phase = 0;
	let legendTick = $state(legendColors);
	let glowTick = $state(glowColors);
	useTask(
		(delta) => {
			elapsed += delta;
			if (elapsed < 0.5) return;
			phase += elapsed * 0.05;
			elapsed = 0;
			keys.forEach((key, i) => {
				const hue = (phase + ((key.x + BASE_W / 2) / BASE_W) * 0.55) % 1;
				tmp.setHSL(hue, 0.85, 0.6);
				legendColors[i].copy(tmp).multiplyScalar(1.8);
				glowColors[i].copy(tmp);
			});
			legendTick = [...legendColors];
			glowTick = [...glowColors];
			invalidate();
		},
		{ autoInvalidate: false }
	);
</script>

<T.Group {position} {scale} rotation.x={-0.045}>
	<T.Mesh position.y={BASE_H / 2} castShadow receiveShadow material={caseMaterial}>
		<T is={RoundedBoxGeometry} args={[BASE_W, BASE_H, BASE_D, 1, 0.004]} />
	</T.Mesh>
	<T.Mesh position.y={BASE_H + 0.0003} material={plateMaterial}>
		<T.BoxGeometry args={[BASE_W - 0.01, 0.0008, BASE_D - 0.01]} />
	</T.Mesh>
	<Instances geometry={glowGeometry} material={glowMaterial} items={glowItems} colors={glowTick} />
	<Instances geometry={keyGeometry} material={capMaterial} items={keyItems} castShadow />
	<Instances
		geometry={legendGeometry}
		material={legendMaterial}
		items={legendItems}
		colors={legendTick}
	/>
	<T.Mesh
		position={[0, 0.005, BASE_D / 2 + 0.036]}
		castShadow
		receiveShadow
		material={restMaterial}
	>
		<T is={RoundedBoxGeometry} args={[BASE_W, 0.01, 0.062, 1, 0.004]} />
	</T.Mesh>
	<T.Mesh
		position={[BASE_W / 2 - 0.014, BASE_H + 0.0012, -BASE_D / 2 + 0.006]}
		material={legendMaterial}
	>
		<T.BoxGeometry args={[0.012, 0.0006, 0.0025]} />
	</T.Mesh>
	<T.Mesh
		position={[-BASE_W / 2 + 0.03, 0.006, -BASE_D / 2 - 0.02]}
		rotation.x={Math.PI / 2}
		material={caseMaterial}
	>
		<T.CylinderGeometry args={[0.0025, 0.0025, 0.08, 8]} />
	</T.Mesh>
</T.Group>
