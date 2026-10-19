<script lang="ts">
	import { onMount } from 'svelte';
	import { T } from '@threlte/core';
	import { CylinderGeometry } from 'three';
	import Merged from '../Merged.svelte';
	import type { Part } from '../merge.js';
	import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
	import { materials } from '../materials/index.js';
	import {
		createGrainBump,
		createMeshWeaveMaps,
		createTwillMaps
	} from '../materials/chair-textures.js';
	import {
		createBackFrameGeometry,
		createBackPanelGeometry,
		createPipingGeometry,
		createSpineGeometry
	} from './chair-geometry.js';

	let {
		position = [0, 0, 0],
		rotation = 0,
		scale = 1
	}: { position?: [number, number, number]; rotation?: number; scale?: number } = $props();

	const SEAT_Y = 0.45;
	const SEAT_W = 0.5;
	const SEAT_D = 0.5;
	const panel = createBackPanelGeometry();
	const frame = createBackFrameGeometry();
	const spine = createSpineGeometry();
	const piping = createPipingGeometry(SEAT_W - 0.1, SEAT_D - 0.12, 0.05);
	const spokes = [0, 1, 2, 3, 4].map((i) => (i / 5) * Math.PI * 2 + 0.2);
	const R = RoundedBoxGeometry;
	const plastic = materials.chairPlastic;
	const rot = (x: number, z: number, a: number): [number, number] => [
		x * Math.cos(a) + z * Math.sin(a),
		-x * Math.sin(a) + z * Math.cos(a)
	];
	const spokeParts = (a: number): Part[] => {
		const [sx, sz] = rot(0.165, 0, a);
		const [hx, hz] = rot(0.31, 0, a);
		const [w1x, w1z] = rot(0.32, 0.018, a);
		const [w2x, w2z] = rot(0.32, -0.018, a);
		return [
			{
				g: new CylinderGeometry(0.02, 0.034, 0.31, 12),
				m: plastic,
				p: [sx, 0.055, sz],
				r: [0, a, -Math.PI / 2 - 0.1],
				s: [1, 1, 0.62]
			},
			{ g: new CylinderGeometry(0.008, 0.008, 0.04, 10), m: plastic, p: [hx, 0.05, hz] },
			{ g: new R(0.03, 0.03, 0.02, 2, 0.006), m: plastic, p: [hx, 0.032, hz], r: [0, a, 0] },
			{
				g: new CylinderGeometry(0.028, 0.028, 0.014, 18),
				m: materials.rubber,
				p: [w1x, 0.028, w1z],
				r: [Math.PI / 2, a, 0]
			},
			{
				g: new CylinderGeometry(0.028, 0.028, 0.014, 18),
				m: materials.rubber,
				p: [w2x, 0.028, w2z],
				r: [Math.PI / 2, a, 0]
			}
		];
	};
	const armParts = (side: number): Part[] => {
		const x = side * 0.29;
		return [
			{
				g: new R(0.14, 0.025, 0.07, 2, 0.008),
				m: plastic,
				p: [x - side * 0.04, SEAT_Y - 0.035, -0.02]
			},
			{ g: new R(0.03, 0.2, 0.05, 2, 0.01), m: plastic, p: [x, SEAT_Y + 0.08, -0.02] },
			{ g: new R(0.05, 0.035, 0.07, 2, 0.01), m: plastic, p: [x, SEAT_Y + 0.185, -0.02] },
			{
				g: new R(0.085, 0.024, 0.28, 3, 0.011),
				m: materials.armPad,
				p: [x - side * 0.005, SEAT_Y + 0.215, -0.005],
				r: [0, side * 0.08, 0]
			}
		];
	};
	const BACK_Y = SEAT_Y + 0.02;
	const parts: Part[] = [
		{ g: new CylinderGeometry(0.045, 0.06, 0.06, 20), m: plastic, p: [0, 0.07, 0] },
		...spokes.flatMap(spokeParts),
		{ g: new CylinderGeometry(0.034, 0.038, 0.16, 20), m: plastic, p: [0, 0.17, 0] },
		{ g: new CylinderGeometry(0.024, 0.024, 0.12, 16), m: materials.metalBrushed, p: [0, 0.3, 0] },
		{ g: new R(0.27, 0.06, 0.25, 2, 0.014), m: plastic, p: [0, 0.385, 0] },
		{
			g: new CylinderGeometry(0.007, 0.007, 0.11, 10),
			m: plastic,
			p: [0.17, 0.375, 0.06],
			r: [0, 0, Math.PI / 2]
		},
		{
			g: new R(SEAT_W - 0.02, 0.03, SEAT_D - 0.02, 2, 0.012),
			m: plastic,
			p: [0, SEAT_Y - 0.04, 0]
		},
		{ g: new R(SEAT_W, 0.09, SEAT_D, 4, 0.038), m: materials.cushion, p: [0, SEAT_Y, 0] },
		{ g: piping, m: materials.piping, p: [0, SEAT_Y + 0.034, 0] },
		{
			g: new R(SEAT_W - 0.1, 0.05, SEAT_D - 0.12, 4, 0.02),
			m: materials.cushion,
			p: [0, SEAT_Y + 0.03, -0.02]
		},
		{
			g: new CylinderGeometry(0.045, 0.045, SEAT_W - 0.04, 22),
			m: materials.cushion,
			p: [0, SEAT_Y - 0.01, SEAT_D / 2 - 0.02],
			r: [0, 0, Math.PI / 2]
		},
		{ g: spine, m: materials.chairFrame, p: [0, BACK_Y, -0.22] },
		{ g: panel, m: materials.mesh, p: [0, BACK_Y + 0.05, -0.25], r: [0.04, 0, 0] },
		{ g: frame, m: materials.chairFrame, p: [0, BACK_Y + 0.05, -0.25], r: [0.04, 0, 0] },
		{
			g: new R(0.3, 0.03, 0.028, 2, 0.01),
			m: materials.chairFrame,
			p: [
				0,
				BACK_Y + 0.05 + 0.12 * Math.cos(0.04) + 0.03 * Math.sin(0.04),
				-0.25 - 0.03 * Math.cos(0.04) + 0.12 * Math.sin(0.04)
			],
			r: [0.04, 0, 0]
		},
		...armParts(-1),
		...armParts(1)
	];

	onMount(() => {
		if (materials.mesh.alphaMap) return;
		const weave = createMeshWeaveMaps();
		materials.mesh.alphaMap = weave.alphaMap;
		materials.mesh.map = weave.map;
		materials.mesh.needsUpdate = true;
		const twill = createTwillMaps();
		materials.cushion.map = twill.map;
		materials.cushion.bumpMap = twill.bumpMap;
		materials.cushion.needsUpdate = true;
		const grain = createGrainBump();
		materials.chairPlastic.bumpMap = grain;
		materials.chairFrame.bumpMap = grain;
		materials.armPad.bumpMap = grain;
		materials.chairPlastic.needsUpdate = true;
		materials.chairFrame.needsUpdate = true;
		materials.armPad.needsUpdate = true;
	});
</script>

<T.Group {position} rotation.y={rotation} {scale}>
	<Merged {parts} castShadow receiveShadow />
</T.Group>
