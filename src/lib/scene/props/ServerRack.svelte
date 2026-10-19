<script lang="ts" module>
	import {
		BoxGeometry,
		Color,
		CylinderGeometry,
		MeshBasicMaterial,
		MeshStandardMaterial,
		PlaneGeometry,
		SphereGeometry
	} from 'three';
	import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

	const handleGeometry = new CylinderGeometry(0.004, 0.004, 0.02, 8);
	const handleMaterial = new MeshStandardMaterial({
		color: '#8d939c',
		roughness: 0.4,
		metalness: 0.9
	});
	const driveGeometry = new RoundedBoxGeometry(0.038, 0.06, 0.006, 1, 0.002);
	const driveMaterial = new MeshStandardMaterial({
		color: '#111318',
		roughness: 0.55,
		metalness: 0.5
	});
	const ventGeometry = new PlaneGeometry(0.3, 0.03);
	const powerGeometry = new SphereGeometry(0.0065, 8, 6);
	const ledGeometry = new SphereGeometry(0.0045, 8, 6);
	const driveLedGeometry = new SphereGeometry(0.0025, 6, 5);
	const ledMaterial = new MeshBasicMaterial({ color: '#ffffff' });
	const glowGeometry = new PlaneGeometry(0.026, 0.026);
	const driveGlowGeometry = new PlaneGeometry(0.014, 0.014);
	const displayGeometry = new BoxGeometry(0.09, 0.014, 0.003);
	const boost = (hex: string, k: number) => new Color(hex).multiplyScalar(k);
</script>

<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import { T, useTask, useThrelte } from '@threlte/core';
	import { materials } from '../materials/index.js';
	import { createBrushedMaps, createGrilleTexture } from '../materials/rack-textures.js';
	import { createGlowTexture } from '../materials/surface-textures.js';
	import Instances from '../Instances.svelte';
	import Merged from '../Merged.svelte';
	import type { Part } from '../merge.js';
	import type { InstanceItem } from '../instances.js';

	let {
		position = [0, 0, 0],
		rotation = 0,
		seed = 1,
		ledSide = -1,
		width = 1.0,
		depth = 1.0,
		height = 2.15
	}: {
		position?: [number, number, number];
		rotation?: number;
		seed?: number;
		ledSide?: 1 | -1;
		width?: number;
		depth?: number;
		height?: number;
	} = $props();

	const W = untrack(() => width);
	const D = untrack(() => depth);
	const H = untrack(() => height);
	const U = 0.0445;
	const INNER_W = W - 0.16;
	const START_Y = 0.1;
	const FRONT_Z = D / 2 - 0.05;

	onMount(() => {
		if (!materials.serverUnit.map) {
			const brushed = createBrushedMaps();
			materials.serverUnit.map = brushed.map;
			materials.serverUnit.roughnessMap = brushed.roughnessMap;
			materials.serverUnit.needsUpdate = true;
		}
		if (!materials.grille.map) {
			materials.grille.map = createGrilleTexture();
			materials.grille.needsUpdate = true;
		}
		if (!materials.ledGlow.map) {
			materials.ledGlow.map = createGlowTexture(64);
			materials.ledGlow.needsUpdate = true;
		}
	});

	const tones = [
		new Color('#2a2e36'),
		new Color('#22262d'),
		new Color('#30353d'),
		new Color('#1c1f25')
	];
	const green = boost('#3ddc84', 1.45);
	const accent = boost('#4aa8ff', 1.5);
	const amber = boost('#ffb547', 1.4);
	const white = boost('#cfe3ff', 1.7);
	const off = new Color('#0b0f14');

	const pattern = [1, 2, 1, 1, 4, 1, 2, 2, 1, 3, 1, 1, 2, 4, 1, 2, 1, 1, 3, 1];
	const s = untrack(() => seed);
	const side = untrack(() => ledSide);
	const hash = (a: number, b: number) => {
		let h = (a * 374761393 + b * 668265263 + s * 974634) | 0;
		h = Math.imul(h ^ (h >>> 13), 1274126177);
		return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
	};

	type Unit = { id: number; y: number; size: number; tone: Color };
	const units: Unit[] = [];
	let cursor = START_Y;
	let index = 0;
	while (cursor + U < H - 0.1) {
		const size = pattern[(index + s) % pattern.length];
		if (cursor + size * U > H - 0.1) break;
		units.push({
			id: index,
			y: cursor + (size * U) / 2,
			size,
			tone: tones[(index * 5 + s) % tones.length]
		});
		cursor += size * U + 0.004;
		index += 1;
	}

	const unitGeometry = new RoundedBoxGeometry(INNER_W, U - 0.004, D - 0.22, 2, 0.003);
	const unitItems: InstanceItem[] = units.map((unit) => ({
		position: [0, unit.y, 0.04],
		scale: [1, unit.size + (unit.size - 1) * (0.004 / U), 1],
		color: unit.tone
	}));

	const handleItems: InstanceItem[] = units.flatMap((unit) => [
		{ position: [INNER_W / 2 - 0.012, unit.y, FRONT_Z + 0.012] },
		{ position: [-INNER_W / 2 + 0.012, unit.y, FRONT_Z + 0.012] }
	]);

	const topOf = (unit: Unit) => unit.y + (unit.size * U) / 2 - 0.016;

	const powerItems: InstanceItem[] = units.map((unit) => ({
		position: [side * 0.25, topOf(unit), FRONT_Z + 0.005],
		color: white
	}));

	type Led = InstanceItem & { base: Color; mode: 'steady' | 'flicker' | 'pulse'; rate: number };
	const leds: Led[] = units.flatMap((unit) => {
		const n = 2 + ((unit.id * 3 + s) % 3);
		const y = topOf(unit);
		return Array.from({ length: n }, (_, k) => {
			const r = hash(unit.id, k);
			const base = k % 3 === 1 ? accent : r > 0.9 ? amber : green;
			const mode: Led['mode'] = r > 0.9 ? 'pulse' : r > 0.45 ? 'flicker' : 'steady';
			return {
				position: [side * (0.21 - k * 0.013), y, FRONT_Z + 0.005] as [number, number, number],
				color: base,
				base,
				mode,
				rate: 0.35 + hash(k, unit.id) * 0.4
			};
		});
	});

	const displayItems: InstanceItem[] = units
		.filter((unit) => (unit.id + s) % 3 === 0)
		.map((unit) => ({ position: [-side * 0.16, topOf(unit), FRONT_Z + 0.002] }));

	const driveItems: InstanceItem[] = units
		.filter((unit) => unit.size >= 2)
		.flatMap((unit) =>
			Array.from({ length: unit.size >= 3 ? 8 : 6 }, (_, k) => ({
				position: [
					-side * 0.06 - 0.2 + k * 0.058,
					unit.y + (unit.size >= 3 ? 0.012 : 0),
					FRONT_Z + 0.002
				] as [number, number, number]
			}))
		);

	const driveLeds: Led[] = driveItems.map((drive, k) => {
		const p = drive.position as [number, number, number];
		const base = hash(k, 99) > 0.7 ? accent : green;
		return {
			position: [p[0] + 0.012, p[1] - 0.022, p[2] + 0.006],
			color: base,
			base,
			mode: hash(k, 7) > 0.35 ? 'flicker' : 'steady',
			rate: 0.5 + hash(k, 3) * 0.4
		};
	});

	const ventItems: InstanceItem[] = units.map((unit) => ({
		position: [-side * 0.08, topOf(unit) - 0.001, FRONT_Z + 0.0035]
	}));

	const RB = RoundedBoxGeometry;
	const shellParts: Part[] = [
		...[-1, 1].flatMap((sx): Part[] => [
			...[-1, 1].map((sz): Part => ({
				g: new RB(0.04, H, 0.04, 2, 0.006),
				m: materials.metalBlack,
				p: [sx * (W / 2 - 0.02), H / 2, sz * (D / 2 - 0.02)]
			})),
			{
				g: new BoxGeometry(0.008, H - 0.08, D - 0.08),
				m: materials.plasticGrey,
				p: [sx * (W / 2 - 0.004), H / 2, 0]
			},
			{
				g: new BoxGeometry(0.02, H - 0.16, 0.012),
				m: materials.metalBrushed,
				p: [sx * (INNER_W / 2 + 0.02), H / 2, FRONT_Z + 0.004]
			},
			{
				g: new RB(0.05, H - 0.02, 0.024, 2, 0.005),
				m: materials.metalBlack,
				p: [sx * (W / 2 - 0.025), H / 2, D / 2 + 0.012]
			}
		]),
		{ g: new RB(W, 0.03, D, 2, 0.006), m: materials.metalBlack, p: [0, H + 0.015, 0] },
		{ g: new RB(W, 0.06, D, 2, 0.006), m: materials.metalBlack, p: [0, 0.03, 0] },
		{
			g: new BoxGeometry(W - 0.08, H - 0.1, 0.01),
			m: materials.plasticBlack,
			p: [0, H / 2, -D / 2 + 0.03]
		},
		{
			g: new RB(W - 0.04, 0.06, 0.024, 2, 0.005),
			m: materials.metalBlack,
			p: [0, 0.04, D / 2 + 0.012]
		},
		{
			g: new RB(W - 0.04, 0.06, 0.024, 2, 0.005),
			m: materials.metalBlack,
			p: [0, H - 0.04, D / 2 + 0.012]
		},
		{
			g: new CylinderGeometry(0.006, 0.006, 0.18, 10),
			m: materials.aluminium,
			p: [side * (W / 2 - 0.08), H / 2 + 0.05, D / 2 + 0.032]
		},
		...handleItems.map((h): Part => ({ g: handleGeometry, m: handleMaterial, p: h.position })),
		...driveItems.map((d): Part => ({ g: driveGeometry, m: driveMaterial, p: d.position })),
		...ventItems.map((v): Part => ({ g: ventGeometry, m: materials.grille, p: v.position })),
		...displayItems.map((d): Part => ({
			g: displayGeometry,
			m: materials.rackDisplay,
			p: d.position
		})),
		...powerItems.map((pw): Part => ({ g: powerGeometry, m: ledMaterial, p: pw.position }))
	];

	const { invalidate } = useThrelte();
	let tick = $state(0);
	let elapsed = 0;
	useTask(
		(delta) => {
			elapsed += delta;
			if (elapsed < 0.5) return;
			tick += 1;
			elapsed = 0;
			invalidate();
		},
		{ autoInvalidate: false }
	);

	const animate = (list: Led[], salt: number) =>
		list.map((led, i) => {
			if (led.mode === 'steady') return led.base;
			if (led.mode === 'pulse') {
				const pulse = 0.5 + 0.5 * Math.sin(tick * 0.11 * Math.PI * 2 * led.rate);
				return led.base.clone().multiplyScalar(0.25 + pulse * 0.75);
			}
			return hash(tick + salt, i) < led.rate ? led.base : off;
		});

	const ledColors = $derived(animate(leds, 11));
	const driveColors = $derived(animate(driveLeds, 29));
	const ledHalo = $derived(ledColors.map((c) => c.clone().multiplyScalar(0.5)));
	const driveHalo = $derived(driveColors.map((c) => c.clone().multiplyScalar(0.4)));
	const glowItems: InstanceItem[] = leds.map((led) => {
		const p = led.position as [number, number, number];
		return { position: [p[0], p[1], p[2] + 0.004] };
	});
	const driveGlowItems: InstanceItem[] = driveLeds.map((led) => {
		const p = led.position as [number, number, number];
		return { position: [p[0], p[1], p[2] + 0.003] };
	});
</script>

<T.Group {position} rotation.y={rotation}>
	<Merged parts={shellParts} castShadow receiveShadow />
	<Instances
		geometry={unitGeometry}
		material={materials.serverUnit}
		items={unitItems}
		castShadow
		receiveShadow
	/>
	<Instances geometry={ledGeometry} material={ledMaterial} items={leds} colors={ledColors} />
	<Instances
		geometry={driveLedGeometry}
		material={ledMaterial}
		items={driveLeds}
		colors={driveColors}
	/>
	<Instances
		geometry={glowGeometry}
		material={materials.ledGlow}
		items={glowItems}
		colors={ledHalo}
	/>
	<Instances
		geometry={driveGlowGeometry}
		material={materials.ledGlow}
		items={driveGlowItems}
		colors={driveHalo}
	/>
	<T.Mesh position={[0, H / 2, D / 2 + 0.012]} material={materials.rackGlass}>
		<T.PlaneGeometry args={[W - 0.1, H - 0.14]} />
	</T.Mesh>
</T.Group>
