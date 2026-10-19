<script lang="ts" module>
	import { BoxGeometry, MeshStandardMaterial, PlaneGeometry, RingGeometry } from 'three';
	import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
	import { createLeatherTexture, createPagesTexture } from '../materials/figurine-textures.js';
	import { drawIntroPage, drawSkillsPage, drawValuesPage } from '../materials/notebook-pages.js';
	import type { Part } from '../merge.js';

	const leather = new MeshStandardMaterial({
		color: '#1c1f27',
		roughness: 0.72,
		metalness: 0,
		bumpScale: 0.25
	});
	const pages = new MeshStandardMaterial({ color: '#ffffff', roughness: 0.92, metalness: 0 });
	const intro = new MeshStandardMaterial({ color: '#ffffff', roughness: 0.95, metalness: 0 });
	const skills = new MeshStandardMaterial({ color: '#ffffff', roughness: 0.95, metalness: 0 });
	const values = new MeshStandardMaterial({ color: '#ffffff', roughness: 0.95, metalness: 0 });
	const liner = new MeshStandardMaterial({ color: '#d9d2c3', roughness: 0.95, metalness: 0 });
	const band = new MeshStandardMaterial({ color: '#111318', roughness: 0.9, metalness: 0 });
	const ribbon = new MeshStandardMaterial({ color: '#8a2d3a', roughness: 0.8, metalness: 0 });
	const emboss = new MeshStandardMaterial({ color: '#2a2e38', roughness: 0.5, metalness: 0.4 });
	let ready = false;
	function paint(image: HTMLImageElement | null) {
		for (const [material, draw] of [
			[intro, () => drawIntroPage(image)],
			[skills, drawSkillsPage],
			[values, drawValuesPage]
		] as const) {
			material.map?.dispose();
			material.map = draw();
			material.needsUpdate = true;
		}
		const back = skills.map;
		if (back) {
			back.center.set(0.5, 0.5);
			back.rotation = Math.PI;
		}
	}
	function ensure(photoUrl: string | undefined, refresh: () => void) {
		if (ready) return;
		ready = true;
		const grain = createLeatherTexture();
		grain.repeat.set(2, 2.6);
		leather.map = grain;
		leather.bumpMap = grain;
		leather.needsUpdate = true;
		const edge = createPagesTexture();
		edge.repeat.set(1, 6);
		pages.map = edge;
		pages.needsUpdate = true;
		paint(null);
		document.fonts.ready.then(() => {
			paint(null);
			refresh();
		});
		if (photoUrl) {
			const image = new Image();
			image.onload = () => {
				paint(image);
				refresh();
			};
			image.src = photoUrl;
		}
	}
	const W = 0.21;
	const D = 0.29;
	const HINGE_X = -0.105;
	const HINGE_Y = 0.0112;
	const bodyParts: Part[] = [
		{ g: new RoundedBoxGeometry(W, 0.004, D, 2, 0.003), m: leather, p: [0, 0.002, 0] },
		{ g: new RoundedBoxGeometry(0.204, 0.015, 0.282, 2, 0.002), m: pages, p: [0.004, 0.0115, 0] },
		{ g: new BoxGeometry(0.014, 0.0225, D), m: leather, p: [-0.1, 0.0112, 0] },
		{ g: new PlaneGeometry(0.2, 0.278), m: values, p: [0.004, 0.0192, 0], r: [-Math.PI / 2, 0, 0] },
		{ g: new BoxGeometry(0.008, 0.0008, 0.05), m: ribbon, p: [0.012, 0.0196, 0.145] }
	];
	const coverParts: Part[] = [
		{ g: new RoundedBoxGeometry(W, 0.004, D, 2, 0.003), m: leather, p: [0.105, 0.0103, 0] },
		{
			g: new RingGeometry(0.03, 0.037, 48, 1, Math.PI * 0.62, Math.PI * 1.76),
			m: emboss,
			p: [0.133, 0.0124, 0.07],
			r: [-Math.PI / 2, 0, 0]
		},
		{ g: new PlaneGeometry(0.2, 0.278), m: liner, p: [0.105, 0.0081, 0], r: [Math.PI / 2, 0, 0] }
	];
	const pageParts: Part[] = [
		{ g: new PlaneGeometry(0.2, 0.278), m: intro, p: [0.104, 0.0004, 0], r: [-Math.PI / 2, 0, 0] },
		{ g: new PlaneGeometry(0.2, 0.278), m: skills, p: [0.104, 0.0002, 0], r: [Math.PI / 2, 0, 0] }
	];
	const bandParts: Part[] = [
		{ g: new BoxGeometry(W, 0.0014, 0.016), m: band, p: [0, 0.0237, -0.11] }
	];
	const ease = (t: number) => t * t * (3 - 2 * t);
	const seg = (t: number, a: number, b: number) => Math.min(1, Math.max(0, (t - a) / (b - a)));
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { T, useTask, useThrelte } from '@threlte/core';
	import Merged from '../Merged.svelte';
	import { getPortfolioState } from '#lib/state/index.js';

	let {
		position = [0, 0, 0],
		rotation = 0,
		photoUrl
	}: { position?: [number, number, number]; rotation?: number; photoUrl?: string } = $props();

	const portfolio = getPortfolioState();
	const { invalidate } = useThrelte();
	let shown = $state(0);
	let current = 0;

	onMount(() => ensure(photoUrl, invalidate));

	useTask(
		(delta) => {
			const target = portfolio.bookProgress;
			if (Math.abs(target - current) < 0.0005 && shown === current) return;
			current += (target - current) * Math.min(1, delta * 4);
			if (Math.abs(target - current) < 0.0005) current = target;
			shown = current;
			invalidate();
		},
		{ autoInvalidate: false }
	);

	const bandShift = $derived(ease(seg(shown, 0, 0.14)));
	const coverAngle = $derived(Math.PI * ease(seg(shown, 0.08, 0.42)));
	const pageAngle = $derived(Math.PI * 0.985 * ease(seg(shown, 0.62, 0.92)));
	const glow = $derived(ease(portfolio.cameraProgress) * 1.3 + shown * 0.5);
</script>

<T.Group {position} rotation.y={rotation}>
	<T.PointLight
		position={[0.05, 0.42, 0.08]}
		intensity={glow}
		distance={1.1}
		decay={2}
		color="#ffe2bf"
	/>
	<Merged parts={bodyParts} castShadow receiveShadow />
	<T.Group
		position={[bandShift * 0.19, -bandShift * 0.0225, bandShift * 0.03]}
		rotation.y={bandShift * 0.35}
	>
		<Merged parts={bandParts} />
	</T.Group>
	<T.Group position={[HINGE_X, HINGE_Y, 0]} rotation.z={coverAngle}>
		<Merged parts={coverParts} castShadow />
	</T.Group>
	<T.Group position={[-0.1, 0.0196, 0]} rotation.z={pageAngle}>
		<Merged parts={pageParts} />
	</T.Group>
</T.Group>
