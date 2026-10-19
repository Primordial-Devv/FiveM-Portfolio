<script lang="ts">
	import { T } from '@threlte/core';
	import { BoxGeometry } from 'three';
	import Merged from '../Merged.svelte';
	import type { Part } from '../merge.js';
	import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
	import { materials } from '../materials/index.js';
	import ServerRack from './ServerRack.svelte';

	let {
		position = [0, 0, 0],
		rotation = 0,
		seeds = [1, 2],
		ledSide = -1,
		width = 1.5,
		depth = 1.0,
		height = 2.7
	}: {
		position?: [number, number, number];
		rotation?: number;
		seeds?: [number, number];
		ledSide?: 1 | -1;
		width?: number;
		depth?: number;
		height?: number;
	} = $props();

	const GAP = 0.06;
	const PLINTH = 0.12;
	const CAP = 0.1;
	const POST = 0.1;
	const outerW = $derived(width * 2 + GAP + POST * 2);
	const outerD = $derived(depth + 0.12);
	const frameParts = $derived.by((): Part[] => {
		const ow = outerW;
		const od = outerD;
		return [
			{
				g: new RoundedBoxGeometry(ow, PLINTH, od, 2, 0.01),
				m: materials.metalBlack,
				p: [0, PLINTH / 2, 0]
			},
			{
				g: new RoundedBoxGeometry(ow + 0.04, CAP, od + 0.06, 2, 0.012),
				m: materials.metalBlack,
				p: [0, PLINTH + height + CAP / 2, 0]
			},
			{
				g: new RoundedBoxGeometry(POST, height, od, 2, 0.01),
				m: materials.metalBlack,
				p: [ow / 2 - POST / 2, PLINTH + height / 2, 0]
			},
			{
				g: new RoundedBoxGeometry(POST, height, od, 2, 0.01),
				m: materials.metalBlack,
				p: [-(ow / 2 - POST / 2), PLINTH + height / 2, 0]
			},
			{
				g: new BoxGeometry(GAP + 0.04, height, 0.06),
				m: materials.metalBlack,
				p: [0, PLINTH + height / 2, od / 2 - 0.03]
			},
			{
				g: new BoxGeometry(ow - POST * 2, height, 0.02),
				m: materials.metalBlack,
				p: [0, PLINTH + height / 2, -od / 2 + 0.02]
			},
			{
				g: new BoxGeometry(ow - 0.4, 0.008, 0.02),
				m: materials.coveLight,
				p: [0, PLINTH + height + CAP + 0.004, -od / 2 + 0.3]
			}
		];
	});
</script>

<T.Group {position} rotation.y={rotation}>
	<Merged parts={frameParts} castShadow receiveShadow />
	<T.PointLight
		position={[0, PLINTH + height * 0.5, 0.25]}
		intensity={1.6}
		distance={2.0}
		decay={2}
		color="#7fbdf5"
	/>
	<ServerRack
		position={[-(width / 2 + GAP / 2), PLINTH, 0]}
		seed={seeds[0]}
		{ledSide}
		{width}
		{depth}
		{height}
	/>
	<ServerRack
		position={[width / 2 + GAP / 2, PLINTH, 0]}
		seed={seeds[1]}
		{ledSide}
		{width}
		{depth}
		{height}
	/>
</T.Group>
