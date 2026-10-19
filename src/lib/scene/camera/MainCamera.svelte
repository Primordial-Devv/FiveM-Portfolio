<script lang="ts">
	import { T, useTask, useThrelte } from '@threlte/core';
	import { OrbitControls } from '@threlte/extras';
	import { CatmullRomCurve3, type PerspectiveCamera, Vector3 } from 'three';
	import { cameraAnchors, type CameraAnchorName } from './anchors.js';
	import { getPortfolioState } from '#lib/state/index.js';

	let { anchor = 'hero', debug = false }: { anchor?: CameraAnchorName; debug?: boolean } = $props();

	const portfolio = getPortfolioState();
	const { invalidate } = useThrelte();
	const current = $derived(cameraAnchors[anchor]);

	const hero = cameraAnchors.hero;
	const positions = new CatmullRomCurve3(
		[
			new Vector3(...hero.position),
			new Vector3(-0.35, 1.32, 2.45),
			new Vector3(-1.0, 1.68, 0.9),
			new Vector3(-1.025, 1.46, 0.745)
		],
		false,
		'centripetal'
	);
	const targets = new CatmullRomCurve3(
		[
			new Vector3(...hero.target),
			new Vector3(-1.0, 0.92, 0.72),
			new Vector3(-1.04, 0.84, 0.64),
			new Vector3(-1.045, 0.84, 0.625)
		],
		false,
		'centripetal'
	);
	const ease = (t: number) => t * t * (3 - 2 * t);
	const seg = (t: number, a: number, b: number) => Math.min(1, Math.max(0, (t - a) / (b - a)));
	const spread = new Vector3(-0.165, 0.1, 0.045);
	let camera = $state<PerspectiveCamera>();
	let smooth = 0;
	const pos = new Vector3();
	const look = new Vector3();

	useTask(
		(delta) => {
			if (debug || !camera) return;
			const book = portfolio.bookProgress;
			const target =
				portfolio.cameraProgress * 0.86 + seg(book, 0, 0.2) * 0.14 + seg(book, 0.58, 0.96);
			if (Math.abs(target - smooth) < 0.0004) return;
			smooth += (target - smooth) * Math.min(1, delta * 3);
			if (Math.abs(target - smooth) < 0.0004) smooth = target;
			const u = ease(Math.min(1, smooth));
			const shift = ease(Math.max(0, smooth - 1));
			positions.getPoint(u, pos);
			targets.getPoint(u, look);
			pos.addScaledVector(spread, shift);
			look.addScaledVector(spread, shift);
			look.y -= spread.y * shift;
			camera.position.copy(pos);
			camera.lookAt(look);
			camera.fov = hero.fov + (36 - hero.fov) * u;
			camera.updateProjectionMatrix();
			invalidate();
		},
		{ autoInvalidate: false }
	);
</script>

<T.PerspectiveCamera
	bind:ref={camera}
	makeDefault
	position={current.position}
	fov={current.fov}
	near={0.1}
	far={40}
	oncreate={(cam) => cam.lookAt(...current.target)}
>
	{#if debug}
		<OrbitControls target={current.target} enableDamping />
	{/if}
</T.PerspectiveCamera>
