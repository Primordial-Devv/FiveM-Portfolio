<script lang="ts">
	import { onMount } from 'svelte';
	import { T, useThrelte } from '@threlte/core';
	import { DataTexture, MeshStandardMaterial, type Texture } from 'three';
	import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
	import { PlaneGeometry } from 'three';
	import Merged from '../Merged.svelte';
	import type { Part } from '../merge.js';
	import { materials } from '../materials/index.js';
	import { loadMapTexture } from '../materials/map-texture.js';

	let {
		position = [0, 0, 0],
		width = 2.1
	}: { position?: [number, number, number]; width?: number } = $props();

	const { invalidate } = useThrelte();
	const height = $derived(width * 1.28);
	const BORDER = 0.05;
	const MAT = 0.08;
	const frameParts = $derived.by((): Part[] => [
		{ g: new RoundedBoxGeometry(width, height, 0.05, 2, 0.006), m: materials.metalBlack },
		{
			g: new PlaneGeometry(width - BORDER * 2, height - BORDER * 2),
			m: materials.metalGrey,
			p: [0, 0, 0.026]
		}
	]);
	const placeholder = new DataTexture(new Uint8Array([150, 150, 150, 255]), 1, 1);
	placeholder.needsUpdate = true;
	const poster = new MeshStandardMaterial({
		map: placeholder,
		color: '#d8dde6',
		roughness: 0.42,
		metalness: 0.55,
		envMapIntensity: 0.9
	});

	onMount(() => {
		let texture: Texture | undefined;
		loadMapTexture((loaded) => {
			texture = loaded;
			poster.map = loaded;
			poster.needsUpdate = true;
			invalidate();
		});
		return () => {
			texture?.dispose();
			placeholder.dispose();
			poster.dispose();
		};
	});
</script>

<T.Group {position}>
	<Merged parts={frameParts} castShadow receiveShadow />
	<T.Mesh position.z={0.028} material={poster}>
		<T.PlaneGeometry args={[width - BORDER * 2 - MAT * 2, height - BORDER * 2 - MAT * 2]} />
	</T.Mesh>
	<T.Mesh position.z={0.03} material={materials.rackGlass}>
		<T.PlaneGeometry args={[width - BORDER * 2, height - BORDER * 2]} />
	</T.Mesh>
</T.Group>
