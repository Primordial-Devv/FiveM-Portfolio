<script lang="ts">
	import { untrack } from 'svelte';
	import { Canvas } from '@threlte/core';
	import { ACESFilmicToneMapping, PCFShadowMap } from 'three';
	import { page } from '$app/state';
	import MainCamera from './camera/MainCamera.svelte';
	import { cameraAnchors, type CameraAnchorName } from './camera/anchors.js';
	import Lighting from './Lighting.svelte';
	import Room from './Room.svelte';
	import Workstation from './Workstation.svelte';
	import RackCabinet from './props/RackCabinet.svelte';
	import Chair from './props/Chair.svelte';
	import Warmup from './Warmup.svelte';
	import Smoke from './Smoke.svelte';
	import { DefaultLoadingManager } from 'three';
	import { getPortfolioState } from '#lib/state/index.js';
	import PothosPlant from './props/PothosPlant.svelte';
	import Succulent from './props/Succulent.svelte';
	import { SceneRefs, setSceneRefs } from './refs.svelte.js';
	import { ROOM } from './layout.js';

	const RACK_X = ROOM.sideWall - 1.12 / 2 - 0.08;
	const CABINET_TOP = 0.12 + 2.7 + 0.1;

	let { refs = new SceneRefs() }: { refs?: SceneRefs } = $props();

	setSceneRefs(untrack(() => refs));
	const portfolio = getPortfolioState();
	DefaultLoadingManager.onProgress = (_url, loaded, total) =>
		portfolio.setAssetProgress(loaded, total);
	DefaultLoadingManager.onLoad = () =>
		portfolio.setAssetProgress(portfolio.assetsTotal, portfolio.assetsTotal);
	const debug = $derived(page.url.searchParams.has('debug'));
	const anchor = $derived.by((): CameraAnchorName => {
		const requested = page.url.searchParams.get('anchor');
		return debug && requested && requested in cameraAnchors
			? (requested as CameraAnchorName)
			: 'hero';
	});
</script>

<Canvas
	dpr={[1, 1.25]}
	shadows={PCFShadowMap}
	toneMapping={ACESFilmicToneMapping}
	autoRender={false}
>
	<MainCamera {anchor} {debug} />
	<Lighting />
	<Room />
	<Workstation />
	<RackCabinet position={[-RACK_X, 0, -1.2]} rotation={Math.PI / 2} seeds={[1, 4]} />
	<RackCabinet position={[RACK_X, 0, -1.2]} rotation={-Math.PI / 2} seeds={[7, 2]} ledSide={1} />
	<PothosPlant
		position={[RACK_X - 0.4, CABINET_TOP, -0.7]}
		rotation={-Math.PI / 2}
		drop={1.3}
		vines={22}
		potSize={0.4}
		seed={6}
	/>
	<Succulent position={[-RACK_X + 0.42, CABINET_TOP, -2.5]} size={0.3} seed={1} />
	<Succulent position={[-RACK_X + 0.38, CABINET_TOP, -1.8]} size={0.24} seed={3} />
	<Succulent position={[-RACK_X + 0.44, CABINET_TOP, -0.9]} size={0.34} seed={5} />
	<Succulent position={[-RACK_X + 0.36, CABINET_TOP, -0.2]} size={0.22} seed={7} />
	<Chair position={[-0.95, 0.03, 1.45]} rotation={Math.PI - 0.6} scale={1.16} />
	<Warmup />
	<Smoke />
</Canvas>
