<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import { T } from '@threlte/core';
	import { BoxGeometry } from 'three';
	import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
	import Merged from '../Merged.svelte';
	import type { Part } from '../merge.js';
	import { materials } from '../materials/index.js';
	import Books from './Books.svelte';
	import PothosPlant from './PothosPlant.svelte';
	import { ensureFigurineTextures } from './figurines/materials.js';
	import {
		artMannequin,
		brassKnot,
		ceramicVase,
		stoneCairn,
		transform,
		vintageCamera,
		woodenBird
	} from './figurines/parts.js';

	let {
		position = [0, 0, 0],
		width = 1.3,
		scale = 1
	}: { position?: [number, number, number]; width?: number; scale?: number } = $props();

	const w = untrack(() => width);
	const LEVELS = [1.0, 0.5, 0];
	const DEPTH = 0.24;
	const bookRows = [
		{ y: LEVELS[2] + 0.02, from: -w / 2 + 0.06, to: w / 2 - 0.06, seed: 1, flat: 3 },
		{ y: LEVELS[1] + 0.02, from: w / 2 - 0.5, to: w / 2 - 0.06, seed: 4 }
	];
	const shelfParts: Part[] = LEVELS.flatMap((level): Part[] => [
		{
			g: new RoundedBoxGeometry(w, 0.04, DEPTH, 2, 0.006),
			m: materials.metalBlack,
			p: [0, level, 0]
		},
		{
			g: new BoxGeometry(w - 0.08, 0.006, 0.014),
			m: materials.ledWarm,
			p: [0, level - 0.022, DEPTH / 2 - 0.03]
		}
	]);
	const figurineParts: Part[] = [
		...transform(woodenBird(), [-0.14, LEVELS[0] + 0.02, 0.01], [0, -0.5, 0], 0.17),
		...transform(brassKnot(), [0.22, LEVELS[0] + 0.02, 0], [0, 0, 0], 0.11),
		...transform(ceramicVase(), [0.6, LEVELS[0] + 0.02, -0.01], [0, 0, 0], 0.2),
		...transform(artMannequin(), [-w / 2 + 0.2, LEVELS[1] + 0.02, 0], [0, 0.4, 0], 0.3),
		...transform(vintageCamera(), [-0.28, LEVELS[1] + 0.02, 0], [0, -0.35, 0], 0.14),
		...transform(stoneCairn(), [0.08, LEVELS[1] + 0.02, 0], [0, 0, 0], 0.17)
	];

	onMount(ensureFigurineTextures);
</script>

<T.Group {position} {scale}>
	<Merged parts={shelfParts} castShadow receiveShadow />
	<Merged parts={figurineParts} castShadow />
	<T.PointLight
		position={[0, LEVELS[1] + 0.22, DEPTH / 2 - 0.02]}
		intensity={1.1}
		distance={0.95}
		decay={2}
		color="#ffc98a"
	/>
	<PothosPlant
		position={[-width / 2 + 0.26, LEVELS[0] + 0.02, 0.0]}
		drop={0.42}
		vines={14}
		potSize={0.24}
		wall
		seed={4}
	/>
	<Books rows={bookRows} />
</T.Group>
