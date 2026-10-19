<script lang="ts" module>
	import {
		AdditiveBlending,
		CatmullRomCurve3,
		Color,
		BoxGeometry,
		CylinderGeometry,
		DoubleSide,
		Euler,
		Quaternion,
		MeshBasicMaterial,
		MeshPhysicalMaterial,
		MeshStandardMaterial,
		TorusGeometry,
		TubeGeometry,
		Vector3,
		CircleGeometry,
		PlaneGeometry,
		type Material
	} from 'three';
	import { createBladeGeometry } from './pc-geometry.js';
	import { createGrilleAlpha } from '../materials/rack-textures.js';

	const shell = new MeshStandardMaterial({
		color: '#0c0d10',
		roughness: 0.3,
		metalness: 0.9,
		envMapIntensity: 1.1
	});
	const brushed = new MeshStandardMaterial({ color: '#40444c', roughness: 0.4, metalness: 0.95 });
	const gunmetal = new MeshStandardMaterial({ color: '#6a6f78', roughness: 0.32, metalness: 0.9 });
	const pcb = new MeshStandardMaterial({ color: '#1c1f25', roughness: 0.6, metalness: 0.2 });
	const heatsink = new MeshStandardMaterial({ color: '#9aa0a8', roughness: 0.28, metalness: 1 });
	const chrome = new MeshStandardMaterial({ color: '#dfe3e8', roughness: 0.15, metalness: 1 });
	const rubber = new MeshStandardMaterial({ color: '#141518', roughness: 0.9, metalness: 0 });
	const sleeve = new MeshStandardMaterial({ color: '#202329', roughness: 0.85, metalness: 0 });
	const fanBlade = new MeshStandardMaterial({
		color: '#3a3e46',
		roughness: 0.45,
		metalness: 0.4,
		side: DoubleSide
	});
	const tempered = new MeshPhysicalMaterial({
		color: '#2a3340',
		roughness: 0.02,
		metalness: 0,
		transparent: true,
		opacity: 0.3,
		envMapIntensity: 2.6,
		depthWrite: false,
		side: DoubleSide
	});
	const glassEdge = new MeshStandardMaterial({
		color: '#9fb3c8',
		roughness: 0.2,
		metalness: 0.1,
		transparent: true,
		opacity: 0.6
	});
	const perforated = new MeshStandardMaterial({
		color: '#15171b',
		roughness: 0.5,
		metalness: 0.7,
		alphaTest: 0.5,
		side: DoubleSide
	});
	const rgbRing = new MeshBasicMaterial({ color: '#ffffff' });
	const rgbStrip = new MeshBasicMaterial({ color: '#ffffff' });
	const rgbHalo = new MeshBasicMaterial({
		color: '#ffffff',
		transparent: true,
		opacity: 0.22,
		blending: AdditiveBlending,
		depthWrite: false
	});
	const fan200 = {
		r: 0.112,
		frame: new TorusGeometry(0.118, 0.008, 6, 56),
		ring: new TorusGeometry(0.102, 0.0036, 8, 64),
		hub: new CylinderGeometry(0.03, 0.03, 0.03, 28),
		blade: createBladeGeometry(0.034, 0.098, 0.62, 0.55)
	};
	const fan90 = {
		r: 0.045,
		frame: new TorusGeometry(0.049, 0.005, 6, 36),
		ring: new TorusGeometry(0.04, 0.0025, 8, 40),
		hub: new CylinderGeometry(0.015, 0.015, 0.016, 20),
		blade: createBladeGeometry(0.016, 0.038, 0.62, 0.55)
	};
	const finGeometry = new BoxGeometry(0.032, 0.03, 0.0015);
	const unitBox = new BoxGeometry(1, 1, 1);
	const blades = Array.from({ length: 9 }, (_, i) => (i / 9) * Math.PI * 2);
	type FanSpec = typeof fan200;
	type FanPlacement = {
		spec: FanSpec;
		position: [number, number, number];
		rotation: [number, number, number];
	};
	const qa = new Quaternion();
	const qb = new Quaternion();
	const euler = new Euler();
	const compose = (base: [number, number, number], local: [number, number, number]) => {
		qa.setFromEuler(euler.set(...base));
		qb.setFromEuler(euler.set(...local));
		euler.setFromQuaternion(qa.multiply(qb));
		return [euler.x, euler.y, euler.z] as [number, number, number];
	};
	const buildFanSets = (fans: FanPlacement[], spec: FanSpec) => {
		const own = fans.filter((f) => f.spec === spec);
		return {
			frames: own.map((f) => ({ position: f.position, rotation: f.rotation })),
			hubs: own.map((f) => ({
				position: f.position,
				rotation: compose(f.rotation, [Math.PI / 2, 0, 0])
			})),
			blades: own.flatMap((f) =>
				blades.map((a) => ({ position: f.position, rotation: compose(f.rotation, [0, 0, a]) }))
			)
		};
	};
	const colorA = new Color();
	const colorB = new Color();
	const white = new Color('#ffffff');
	const cable = (points: [number, number, number][], r = 0.0045) =>
		new TubeGeometry(new CatmullRomCurve3(points.map((p) => new Vector3(...p))), 24, r, 6, false);
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { T, useTask, useThrelte } from '@threlte/core';
	import { PointLight } from 'three';
	import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
	import { materials } from '../materials/index.js';
	import Merged from '../Merged.svelte';
	import type { Part } from '../merge.js';

	let { position = [0, 0, 0] }: { position?: [number, number, number] } = $props();

	const W = 0.28;
	const H = 0.76;
	const D = 0.6;
	const FRONT = D / 2;
	const MB_X = W / 2 - 0.02;
	const frontFans = [0.14, 0.38, 0.62];
	const radFans = [-0.18, 0.06];
	const gpuFans = [-0.1, 0.02, 0.14];
	const ramSlots = [0, 1, 2, 3];
	const finItems = Array.from({ length: 30 }, (_, i) => ({
		position: [0, H - 0.055, -0.05 - 0.24 + i * 0.0165] as [number, number, number]
	}));
	const GPU_Y = H / 2 - 0.1;
	const fans: FanPlacement[] = [
		...frontFans.map((y) => ({
			spec: fan200,
			position: [0, y, FRONT - 0.04] as [number, number, number],
			rotation: [0, 0, 0] as [number, number, number]
		})),
		...radFans.map((z) => ({
			spec: fan200,
			position: [0, H - 0.1, z] as [number, number, number],
			rotation: [-Math.PI / 2, 0, 0] as [number, number, number]
		})),
		{ spec: fan200, position: [0, H - 0.2, -D / 2 + 0.03], rotation: [0, 0, 0] },
		...gpuFans.map((z) => ({
			spec: fan90,
			position: [-0.06, GPU_Y, -0.06 + z] as [number, number, number],
			rotation: [0, -Math.PI / 2, 0] as [number, number, number]
		}))
	];
	type Box = { position: [number, number, number]; scale: [number, number, number] };
	const box = (position: [number, number, number], scale: [number, number, number]): Box => ({
		position,
		scale
	});
	const shellBoxes: Box[] = [
		box([0, 0.008, -D / 2 + 0.006], [W, 0.016, 0.012]),
		box([0, H - 0.008, -D / 2 + 0.006], [W, 0.016, 0.012]),
		box([W / 2 - 0.008, H / 2, -D / 2 + 0.006], [0.016, H, 0.012]),
		box([-W / 2 + 0.008, H / 2, -D / 2 + 0.006], [0.016, H, 0.012]),
		box([0, H - 0.006, D / 2 - 0.012], [W, 0.012, 0.024]),
		box([0, H - 0.006, -D / 2 + 0.012], [W, 0.012, 0.024]),
		box([W / 2 - 0.012, H - 0.006, 0], [0.024, 0.012, D]),
		box([-W / 2 + 0.012, H - 0.006, 0], [0.024, 0.012, D]),
		box([0.02, 0.112, -0.04], [0.06, 0.003, 0.09])
	];
	const brushedBoxes: Box[] = [
		...[0, 1, 2, 3, 4, 5, 6].map((k) =>
			box([0.01, 0.19 + k * 0.021, -D / 2 - 0.002], [0.1, 0.016, 0.003])
		),
		box([-W / 2 + 0.007, 0.014, 0], [0.014, 0.028, D]),
		box([-W / 2 + 0.007, H - 0.014, 0], [0.014, 0.028, D]),
		box([0, 0.014, FRONT - 0.007], [W, 0.028, 0.014]),
		box([0, H - 0.014, FRONT - 0.007], [W, 0.028, 0.014]),
		box([-W / 2 + 0.007, H / 2, FRONT - 0.007], [0.014, H, 0.014]),
		box([-W / 2 + 0.007, H / 2, -D / 2 + 0.007], [0.014, H, 0.014]),
		box([W / 2 - 0.007, H / 2, FRONT - 0.007], [0.014, H, 0.014])
	];
	const rubberBoxes: Box[] = [
		box([MB_X - 0.02, H - 0.13, -D / 2 - 0.002], [0.05, 0.16, 0.003]),
		box([-0.08, 0.07, -D / 2 - 0.003], [0.03, 0.022, 0.005]),
		box([0.01, GPU_Y, -0.06], [0.004, 0.02, 0.4]),
		box([-0.021, H - 0.05, -0.05], [0.007, 0.007, 0.48]),
		box([0.021, H - 0.05, -0.05], [0.007, 0.007, 0.48]),
		box([-W / 2 - 0.008, H / 2 + 0.02, FRONT - 0.05], [0.004, 0.07, 0.004])
	];
	const stripBoxes: Box[] = [
		box([-W / 2 + 0.004, H / 2, FRONT - 0.011], [0.003, H - 0.07, 0.003]),
		box([MB_X - 0.02, H - 0.128, 0.13], [0.02, 0.002, 0.08]),
		...ramSlots.map((k) =>
			box([MB_X - 0.026, H / 2 + 0.182, 0.03 + k * 0.014], [0.016, 0.004, 0.008])
		),
		box([-0.0585, GPU_Y + 0.06, -0.06], [0.002, 0.004, 0.34]),
		box([-0.0585, GPU_Y - 0.06, -0.06], [0.002, 0.004, 0.34]),
		box([-W / 2 + 0.03, 0.113, -0.04], [0.003, 0.003, D - 0.22])
	];
	const gunmetalBoxes: Box[] = [
		box([MB_X - 0.008, H / 2 + 0.03, -0.04], [0.006, H - 0.22, D - 0.28]),
		...ramSlots.map((k) =>
			box([MB_X - 0.026, H / 2 + 0.1, 0.03 + k * 0.014], [0.018, 0.16, 0.008])
		),
		box([0.015, GPU_Y, -0.06], [0.01, 0.03, 0.08]),
		box([0, H - 0.055, -0.05], [0.034, 0.032, 0.5])
	];
	const pcbBoxes: Box[] = [
		box([MB_X, H / 2 + 0.03, -0.04], [0.005, H - 0.16, D - 0.2]),
		box([-0.004, GPU_Y, -0.06], [0.003, 0.13, 0.38])
	];
	const heatsinkBoxes: Box[] = [box([-0.03, GPU_Y - 0.075, -0.06], [0.046, 0.004, 0.38])];
	const edgeBoxes: Box[] = [
		box([-W / 2 + 0.002, H / 2, D / 2 - 0.016], [0.004, H - 0.03, 0.003]),
		box([-W / 2 + 0.002, H / 2, -D / 2 + 0.016], [0.004, H - 0.03, 0.003]),
		box([-W / 2 + 0.002, 0.016, 0], [0.004, 0.003, D - 0.03]),
		box([-W / 2 + 0.002, H - 0.016, 0], [0.004, 0.003, D - 0.03]),
		box([W / 2 - 0.016, H / 2, FRONT - 0.001], [0.003, H - 0.03, 0.004]),
		box([-W / 2 + 0.016, H / 2, FRONT - 0.001], [0.003, H - 0.03, 0.004])
	];
	const grilleBoxes: Box[] = [
		box([0.02, 0.07, -D / 2 - 0.002], [0.12, 0.08, 0.003]),
		box([0, 0.111, -0.04], [W - 0.12, 0.001, 0.16])
	];
	const sets200 = buildFanSets(fans, fan200);
	const sets90 = buildFanSets(fans, fan90);
	const cables = [
		cable([
			[MB_X - 0.03, 0.14, -0.1],
			[MB_X - 0.07, 0.12, -0.18],
			[MB_X - 0.1, 0.15, -0.25]
		]),
		cable([
			[MB_X - 0.02, 0.42, -0.24],
			[MB_X - 0.08, 0.38, -0.27],
			[MB_X - 0.12, 0.16, -0.27]
		]),
		cable(
			[
				[MB_X - 0.05, 0.3, 0.12],
				[MB_X - 0.12, 0.26, 0.14],
				[MB_X - 0.14, 0.16, 0.02]
			],
			0.0055
		),
		cable([
			[MB_X - 0.04, 0.52, 0.0],
			[MB_X - 0.09, 0.56, 0.04],
			[-0.02, H - 0.08, 0.02]
		])
	];

	const bx = (b: Box, m: Material): Part => ({ g: unitBox, m, p: b.position, s: b.scale });
	const fanParts = (
		spec: FanSpec,
		sets: ReturnType<typeof buildFanSets>,
		ring: boolean
	): Part[] => [
		...sets.frames.map((f): Part => ({ g: spec.frame, m: rubber, p: f.position, r: f.rotation })),
		...sets.hubs.map((f): Part => ({ g: spec.hub, m: chrome, p: f.position, r: f.rotation })),
		...sets.blades.map((f): Part => ({ g: spec.blade, m: fanBlade, p: f.position, r: f.rotation })),
		...(ring ? [] : [])
	];
	const ringParts = (spec: FanSpec, sets: ReturnType<typeof buildFanSets>): Part[] =>
		sets.frames.map((f): Part => ({ g: spec.ring, m: rgbRing, p: f.position, r: f.rotation }));
	const R = RoundedBoxGeometry;
	const bodyParts: Part[] = [
		{ g: new R(W + 0.01, 0.032, D + 0.01, 2, 0.008), m: rubber, p: [0, 0.016, 0] },
		...[-1, 1].flatMap((sx) =>
			[-1, 1].map((sz): Part => ({
				g: new CylinderGeometry(0.024, 0.028, 0.024, 16),
				m: rubber,
				p: [sx * (W / 2 - 0.035), 0.012, sz * (D / 2 - 0.06)]
			}))
		)
	];
	const Y0 = 0.032;
	const lift = (parts: Part[]): Part[] =>
		parts.map((p) => ({ ...p, p: [p.p?.[0] ?? 0, (p.p?.[1] ?? 0) + Y0, p.p?.[2] ?? 0] }));
	const innerParts: Part[] = lift([
		{ g: new R(0.012, H, D, 2, 0.004), m: shell, p: [W / 2 - 0.006, H / 2, 0] },
		{ g: new R(W, 0.012, D, 2, 0.004), m: shell, p: [0, 0.006, 0] },
		...shellBoxes.map((b) => bx(b, shell)),
		...brushedBoxes.map((b) => bx(b, brushed)),
		...rubberBoxes.map((b) => bx(b, rubber)),
		...gunmetalBoxes.map((b) => bx(b, gunmetal)),
		...pcbBoxes.map((b) => bx(b, pcb)),
		...heatsinkBoxes.map((b) => bx(b, heatsink)),
		...edgeBoxes.map((b) => bx(b, glassEdge)),
		...grilleBoxes.map((b) => bx(b, materials.grille)),
		...finItems.map((f): Part => ({ g: finGeometry, m: heatsink, p: f.position })),
		{ g: new R(0.022, 0.07, 0.13, 2, 0.004), m: gunmetal, p: [MB_X - 0.016, H - 0.12, -0.19] },
		{ g: new R(0.022, 0.07, 0.1, 2, 0.004), m: gunmetal, p: [MB_X - 0.016, H - 0.12, 0.13] },
		{ g: new R(0.016, 0.055, 0.34, 2, 0.004), m: gunmetal, p: [MB_X - 0.014, 0.16, -0.04] },
		{ g: new R(0.014, 0.1, 0.03, 2, 0.003), m: gunmetal, p: [MB_X - 0.014, 0.3, -0.2] },
		{ g: new R(0.04, 0.11, 0.11, 2, 0.008), m: brushed, p: [MB_X - 0.034, H / 2 + 0.1, -0.07] },
		{
			g: new CylinderGeometry(0.046, 0.046, 0.01, 40),
			m: chrome,
			p: [MB_X - 0.056, H / 2 + 0.1, -0.07],
			r: [0, 0, Math.PI / 2]
		},
		...[-1, 1].map((side): Part => ({
			g: cable(
				[
					[MB_X - 0.056, H / 2 + 0.1 + side * 0.025, -0.07],
					[MB_X - 0.1, H / 2 + 0.18, -0.03 + side * 0.06],
					[0.0, H - 0.08, radFans[1] + side * 0.06]
				],
				0.0065
			),
			m: rubber
		})),
		{ g: new R(0.05, 0.145, 0.4, 2, 0.008), m: gunmetal, p: [-0.03, GPU_Y, -0.06] },
		{ g: new R(0.004, 0.14, 0.39, 2, 0.003), m: shell, p: [-0.056, GPU_Y, -0.06] },
		{ g: new R(W - 0.03, 0.1, D - 0.16, 2, 0.006), m: brushed, p: [0, 0.06, -0.04] },
		...cables.map((g): Part => ({ g, m: sleeve })),
		...fanParts(fan200, sets200, false),
		...fanParts(fan90, sets90, false),
		{
			g: new R(0.008, 0.11, 0.022, 2, 0.003),
			m: brushed,
			p: [-W / 2 - 0.004, H / 2 + 0.02, FRONT - 0.05]
		},
		{
			g: new R(0.006, 0.09, 0.012, 2, 0.003),
			m: chrome,
			p: [-W / 2 - 0.01, H / 2 + 0.02, FRONT - 0.05]
		}
	]);
	const rgbParts: Part[] = lift([
		...stripBoxes.map((b) => bx(b, rgbStrip)),
		...ringParts(fan200, sets200),
		...ringParts(fan90, sets90),
		{
			g: new TorusGeometry(0.038, 0.003, 6, 44),
			m: rgbRing,
			p: [MB_X - 0.062, H / 2 + 0.1, -0.07],
			r: [0, Math.PI / 2, 0]
		}
	]);
	const haloParts: Part[] = lift([
		{
			g: new CircleGeometry(0.034, 24),
			m: rgbHalo,
			p: [MB_X - 0.063, H / 2 + 0.1, -0.07],
			r: [0, Math.PI / 2, 0]
		},
		...frontFans.map((y): Part => ({
			g: new CircleGeometry(fan200.r + 0.035, 32),
			m: rgbHalo,
			p: [0, y, FRONT - 0.018]
		}))
	]);
	const glassParts: Part[] = lift([
		{
			g: new PlaneGeometry(D - 0.03, H - 0.03),
			m: tempered,
			p: [-W / 2 + 0.002, H / 2, 0],
			r: [0, -Math.PI / 2, 0]
		},
		{ g: new PlaneGeometry(W - 0.03, H - 0.03), m: tempered, p: [0, H / 2, FRONT - 0.001] }
	]);
	const perfParts: Part[] = lift([
		{ g: new PlaneGeometry(W - 0.03, H - 0.03), m: perforated, p: [0, H / 2, -D / 2 + 0.006] },
		{
			g: new PlaneGeometry(W - 0.03, D - 0.03),
			m: perforated,
			p: [0, H - 0.006, 0],
			r: [-Math.PI / 2, 0, 0]
		}
	]);

	onMount(() => {
		if (perforated.alphaMap) return;
		const alpha = createGrilleAlpha();
		alpha.repeat.set(5, 5);
		perforated.alphaMap = alpha;
		perforated.needsUpdate = true;
	});

	const { invalidate } = useThrelte();
	const interior = new PointLight('#ffffff', 1.4, 0.42, 2);
	let elapsed = 0;
	let phase = 0;
	useTask(
		(delta) => {
			elapsed += delta;
			if (elapsed < 0.5) return;
			phase += elapsed * 0.05;
			elapsed = 0;
			colorA.setHSL(phase % 1, 0.9, 0.55);
			colorB.setHSL((phase + 0.4) % 1, 0.9, 0.55);
			rgbRing.color.copy(colorA).multiplyScalar(2);
			rgbStrip.color.copy(colorB).multiplyScalar(2);
			rgbHalo.color.copy(colorA);
			interior.color.copy(colorA).lerp(white, 0.5);
			invalidate();
		},
		{ autoInvalidate: false }
	);
</script>

<T.Group {position}>
	<Merged parts={bodyParts} castShadow receiveShadow />
	<Merged parts={innerParts} />
	<Merged parts={perfParts} />
	<Merged parts={rgbParts} />
	<Merged parts={haloParts} />
	<T is={interior} position={[-0.04, H / 2 + Y0 + 0.04, 0.02]} />
	<Merged parts={glassParts} />
</T.Group>
