<script lang="ts">
	import { onMount } from 'svelte';
	import { CylinderGeometry, PlaneGeometry } from 'three';
	import Merged from '../Merged.svelte';
	import type { Part } from '../merge.js';
	import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
	import { materials } from '../materials/index.js';
	import {
		createBurntWoodMaps,
		createMousepadMaps,
		createPowderCoatBump
	} from '../materials/desk-textures.js';
	import { DESK } from '../layout.js';
	import { createPipingGeometry } from './chair-geometry.js';

	const W = DESK.width;
	const D = DESK.depth;
	const H = DESK.height;
	const TOP = DESK.top;
	const UNDER = H - TOP;
	const LEG_X = W / 2 - 0.36;
	const FOOT_L = D - 0.22;
	const PAD_W = W * 0.75;
	const PAD_D = D - 0.16;
	const PAD_T = 0.004;
	const buttons = [-0.03, 0, 0.03];
	const padEdge = createPipingGeometry(PAD_W - 0.004, PAD_D - 0.004, 0.02, 0.0022);
	const R = RoundedBoxGeometry;
	const frame = materials.deskFrame;
	const legParts = (x: number): Part[] => [
		{ g: new R(0.09, 0.06, FOOT_L, 3, 0.02), m: frame, p: [x, 0.03, 0] },
		{
			g: new CylinderGeometry(0.025, 0.028, 0.012, 16),
			m: materials.rubber,
			p: [x, 0.006, FOOT_L / 2 - 0.05]
		},
		{
			g: new CylinderGeometry(0.025, 0.028, 0.012, 16),
			m: materials.rubber,
			p: [x, 0.006, -(FOOT_L / 2 - 0.05)]
		},
		{ g: new R(0.1, 0.36, 0.1, 2, 0.012), m: frame, p: [x, 0.24, 0] },
		{ g: new R(0.084, 0.2, 0.084, 2, 0.01), m: materials.deskSteel, p: [x, 0.5, 0] },
		{ g: new R(0.07, 0.1, 0.07, 2, 0.01), m: frame, p: [x, 0.63, 0] },
		{ g: new R(0.12, 0.03, D - 0.44, 2, 0.008), m: frame, p: [x, UNDER - 0.015, 0] },
		{ g: new R(0.18, 0.08, 0.12, 2, 0.01), m: frame, p: [x, UNDER - 0.06, 0.12] }
	];
	const cx = W / 2 - 0.42;
	const cy = UNDER - 0.018;
	const cz = D / 2 - 0.02;
	const parts: Part[] = [
		{ g: new R(W, TOP, D, 3, 0.012), m: materials.deskTop, p: [0, H - TOP / 2, 0] },
		{ g: new R(PAD_W, PAD_T, PAD_D, 2, 0.002), m: materials.deskPad, p: [0, H + PAD_T / 2, 0] },
		{ g: padEdge, m: materials.deskPadEdge, p: [0, H + PAD_T * 0.8, 0] },
		{ g: new R(W - 0.5, 0.05, 0.05, 2, 0.006), m: frame, p: [0, UNDER - 0.025, D / 2 - 0.22] },
		{ g: new R(W - 0.5, 0.05, 0.05, 2, 0.006), m: frame, p: [0, UNDER - 0.025, -(D / 2 - 0.22)] },
		{ g: new R(0.05, 0.05, D - 0.5, 2, 0.006), m: frame, p: [0, UNDER - 0.025, 0] },
		{ g: new R(1.4, 0.09, 0.2, 2, 0.006), m: frame, p: [0.2, UNDER - 0.07, -D / 2 + 0.22] },
		{ g: new R(0.24, 0.07, 0.16, 2, 0.008), m: frame, p: [-1.0, UNDER - 0.06, -0.1] },
		...legParts(-LEG_X),
		...legParts(LEG_X),
		{ g: new R(0.14, 0.03, 0.07, 2, 0.008), m: materials.plasticBlack, p: [cx, cy, cz] },
		{
			g: new PlaneGeometry(0.036, 0.014),
			m: materials.screenOff,
			p: [cx - 0.035, cy, cz + 0.0355]
		},
		...buttons.map((x): Part => ({
			g: new CylinderGeometry(0.006, 0.006, 0.004, 14),
			m: materials.plasticGrey,
			p: [cx + 0.02 + x, cy, cz + 0.036],
			r: [Math.PI / 2, 0, 0]
		}))
	];

	onMount(() => {
		if (materials.deskTop.map) return;
		const wood = createBurntWoodMaps();
		materials.deskTop.map = wood.map;
		materials.deskTop.roughnessMap = wood.roughnessMap;
		materials.deskTop.bumpMap = wood.bumpMap;
		materials.deskTop.needsUpdate = true;
		const pad = createMousepadMaps();
		materials.deskPad.map = pad.map;
		materials.deskPad.bumpMap = pad.bumpMap;
		materials.deskPad.needsUpdate = true;
		materials.deskFrame.bumpMap = createPowderCoatBump();
		materials.deskFrame.needsUpdate = true;
	});
</script>

<Merged {parts} castShadow receiveShadow />
