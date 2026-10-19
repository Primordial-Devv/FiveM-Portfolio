<script lang="ts" module>
	import { Color, MeshStandardMaterial } from 'three';
	import {
		BEZEL,
		CHIN,
		createCurvedHousingGeometry,
		createCurvedPanelGeometry,
		HOUSING_T,
		MONITOR_H,
		MONITOR_R,
		MONITOR_W
	} from './monitor-geometry.js';

	const housingGeometry = createCurvedHousingGeometry(
		MONITOR_W + BEZEL * 2,
		MONITOR_H + BEZEL + CHIN,
		MONITOR_R,
		HOUSING_T,
		0.0065
	);
	const panelGeometry = createCurvedPanelGeometry(MONITOR_W, MONITOR_H - CHIN, MONITOR_R, 28);
	const glassGeometry = createCurvedPanelGeometry(
		MONITOR_W + BEZEL * 2 - 0.001,
		MONITOR_H + BEZEL + CHIN - 0.001,
		MONITOR_R - 0.0004,
		28
	);
	const chinGeometry = createCurvedPanelGeometry(MONITOR_W, CHIN - 0.004, MONITOR_R - 0.0002, 20);
	const housing = new MeshStandardMaterial({
		color: '#0a0b0d',
		roughness: 0.5,
		metalness: 0.65,
		envMapIntensity: 0.9
	});
	const glassBlack = new MeshStandardMaterial({
		color: '#050507',
		roughness: 0.08,
		metalness: 0.3,
		envMapIntensity: 1.4
	});
	const chin = new MeshStandardMaterial({ color: '#4a4e56', roughness: 0.38, metalness: 1 });
	const vesa = new MeshStandardMaterial({ color: '#15171b', roughness: 0.55, metalness: 0.7 });
	const led = new MeshStandardMaterial({
		color: '#0a1220',
		emissive: new Color('#6cb6f6'),
		emissiveIntensity: 1.2
	});
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { T } from '@threlte/core';
	import { type Mesh } from 'three';
	import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
	import { getSceneRefs } from '../refs.svelte.js';
	import { createScreenTexture, type ScreenKind } from './screen-texture.js';

	let {
		kind,
		position = [0, 0, 0],
		rotation = 0
	}: {
		kind: ScreenKind;
		position?: [number, number, number];
		rotation?: number;
	} = $props();

	const refs = getSceneRefs();
	let screen = $state<Mesh>();

	$effect(() => {
		refs.screens[kind] = screen;
	});

	const screenMaterial = new MeshStandardMaterial({
		color: '#000000',
		emissive: new Color('#ffffff'),
		emissiveIntensity: 1,
		roughness: 0.35,
		metalness: 0.1,
		envMapIntensity: 0.6
	});

	onMount(() => {
		const texture = createScreenTexture(kind);
		screenMaterial.map = texture;
		screenMaterial.emissiveMap = texture;
		screenMaterial.needsUpdate = true;
		return () => {
			texture.dispose();
			screenMaterial.dispose();
		};
	});

	const PANEL_Y = (CHIN - BEZEL) / 2;
</script>

<T.Group {position} rotation.y={rotation}>
	<T.Mesh position.y={(BEZEL - CHIN) / 2 + 0.006} castShadow receiveShadow material={housing}>
		<T is={housingGeometry} />
	</T.Mesh>
	<T.Mesh position={[0, (BEZEL - CHIN) / 2 + 0.006, -0.0022]} material={glassBlack}>
		<T is={glassGeometry} />
	</T.Mesh>
	<T.Mesh position.y={PANEL_Y} position.z={-0.001} bind:ref={screen} material={screenMaterial}>
		<T is={panelGeometry} />
	</T.Mesh>
	<T.Mesh position={[0, -MONITOR_H / 2 + 0.002, -0.0008]} material={chin}>
		<T is={chinGeometry} />
	</T.Mesh>
	<T.Mesh position={[MONITOR_W / 2 - 0.03, -MONITOR_H / 2 + 0.002, -0.0004]} material={led}>
		<T.BoxGeometry args={[0.008, 0.002, 0.0008]} />
	</T.Mesh>
	<T.Mesh position={[0, 0, -HOUSING_T - 0.004]} material={vesa}>
		<T is={RoundedBoxGeometry} args={[0.12, 0.12, 0.012, 2, 0.003]} />
	</T.Mesh>
	<T.Mesh position={[0, 0, -HOUSING_T - 0.014]} material={vesa}>
		<T is={RoundedBoxGeometry} args={[0.07, 0.07, 0.016, 2, 0.003]} />
	</T.Mesh>
</T.Group>
