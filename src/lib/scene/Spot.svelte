<script lang="ts">
	import { onMount } from 'svelte';
	import { T, useThrelte } from '@threlte/core';
	import { Object3D } from 'three';

	let {
		position,
		target,
		intensity = 10,
		color = '#ffffff',
		angle = 0.6,
		penumbra = 0.7,
		distance = 0,
		decay = 2,
		castShadow = false,
		shadowMapSize = 1024,
		shadowBias = -0.0003,
		shadowNormalBias = 0.02
	}: {
		position: [number, number, number];
		target: [number, number, number];
		intensity?: number;
		color?: string;
		angle?: number;
		penumbra?: number;
		distance?: number;
		decay?: number;
		castShadow?: boolean;
		shadowMapSize?: number;
		shadowBias?: number;
		shadowNormalBias?: number;
	} = $props();

	const { scene } = useThrelte();
	const anchor = new Object3D();

	onMount(() => {
		scene.add(anchor);
		return () => {
			scene.remove(anchor);
		};
	});

	$effect(() => {
		anchor.position.set(...target);
		anchor.updateMatrixWorld();
	});
</script>

<T.SpotLight
	{position}
	{intensity}
	{color}
	{angle}
	{penumbra}
	{distance}
	{decay}
	{castShadow}
	target={anchor}
	shadow.mapSize.width={shadowMapSize}
	shadow.mapSize.height={shadowMapSize}
	shadow.bias={shadowBias}
	shadow.normalBias={shadowNormalBias}
	shadow.camera.near={0.5}
	shadow.camera.far={14}
	shadow.radius={4}
/>
