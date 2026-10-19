<script lang="ts">
	import { onMount } from 'svelte';
	import { T, useThrelte } from '@threlte/core';
	import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
	import { materials } from './materials/index.js';
	import { loadFloorMaps } from './materials/floor-maps.js';
	import { loadRugMaps } from './materials/rug-maps.js';
	import { loadWallMaps, WALL_TEXTURE_SIZE } from './materials/wall-maps.js';
	import { loadWoodMaps, WOOD_PLANKS } from './materials/wood-maps.js';
	import { clonePbrSet, disposePbrSet, type PbrSet } from './materials/texture-set.js';
	import { createGlowTexture, createPaintMaps } from './materials/surface-textures.js';
	import { ROOM } from './layout.js';
	import Logo from './props/Logo.svelte';
	import WallShelves from './props/WallShelves.svelte';
	import FloorPlant from './props/FloorPlant.svelte';
	import MapFrame from './props/MapFrame.svelte';
	import {
		BoxGeometry,
		CircleGeometry,
		CylinderGeometry,
		DataTexture,
		type MeshStandardMaterial
	} from 'three';
	import Instances from './Instances.svelte';
	import Merged from './Merged.svelte';
	import type { Part } from './merge.js';
	import type { InstanceItem } from './instances.js';

	const { invalidate } = useThrelte();
	const FLOOR = 34;
	const TILE_SIZE = 1;
	const WALL_W = ROOM.sideWall * 2;
	const LINE_Y = ROOM.height - 0.42;
	const wall = ROOM.backWall;
	const SLAT_H = ROOM.height - 0.16;
	const SIDE_SPOTS = [-5.6, 0.8];
	const FLOOR_LINE_Y = 0.17;
	const SIDE_LINE_L = 20;
	const fixtureAt = (x: number, y: number, z: number): Part[] => [
		{
			g: new CylinderGeometry(0.05, 0.054, 0.03, 24),
			m: materials.metalBlack,
			p: [x, y - 0.015, z]
		},
		{
			g: new CylinderGeometry(0.04, 0.04, 0.034, 20, 1, true),
			m: materials.plasticBlack,
			p: [x, y - 0.012, z]
		},
		{
			g: new CircleGeometry(0.032, 20),
			m: materials.ledWarm,
			p: [x, y - 0.022, z],
			r: [Math.PI / 2, 0, 0]
		}
	];
	const fixtureParts: Part[] = [-1, 1].flatMap((side) => [
		...SIDE_SPOTS.flatMap((z) => fixtureAt(side * (ROOM.sideWall - 0.14), ROOM.height - 0.16, z)),
		...fixtureAt(side * 2.85, ROOM.height - 0.16, wall + 0.14)
	]);
	const trimParts: Part[] = [
		{ g: new BoxGeometry(5.7, 0.07, 0.05), m: materials.rubber, p: [0, LINE_Y, wall + 0.01] },
		{ g: new BoxGeometry(5.6, 0.022, 0.012), m: materials.lineBlue, p: [0, LINE_Y, wall + 0.03] },
		{
			g: new BoxGeometry(WALL_W, 0.16, 0.28),
			m: materials.cornice,
			p: [0, ROOM.height - 0.08, wall + 0.14]
		},
		{
			g: new BoxGeometry(WALL_W, 0.12, 0.02),
			m: materials.plasticBlack,
			p: [0, 0.06, wall + 0.01]
		},
		{
			g: new BoxGeometry(WALL_W - 1.2, 0.05, 0.03),
			m: materials.rubber,
			p: [0, FLOOR_LINE_Y, wall + 0.012]
		},
		{
			g: new BoxGeometry(WALL_W - 1.3, 0.014, 0.01),
			m: materials.ledWarm,
			p: [0, FLOOR_LINE_Y - 0.008, wall + 0.028]
		},
		...[-1, 1].flatMap((side): Part[] => [
			{
				g: new BoxGeometry(0.28, 0.16, FLOOR),
				m: materials.cornice,
				p: [side * (ROOM.sideWall - 0.14), ROOM.height - 0.08, 1]
			},
			{
				g: new BoxGeometry(0.012, 0.02, FLOOR),
				m: materials.coveLight,
				p: [side * (ROOM.sideWall - 0.02), ROOM.height - 0.2, 1]
			},
			{
				g: new BoxGeometry(0.03, 0.05, SIDE_LINE_L),
				m: materials.rubber,
				p: [side * (ROOM.sideWall - 0.012), FLOOR_LINE_Y, 1]
			},
			{
				g: new BoxGeometry(0.01, 0.014, SIDE_LINE_L - 0.1),
				m: materials.ledWarm,
				p: [side * (ROOM.sideWall - 0.028), FLOOR_LINE_Y - 0.008, 1]
			},
			{
				g: new BoxGeometry(1.5, SLAT_H, 0.03),
				m: materials.slatBoard,
				p: [side * (ROOM.sideWall - 0.035), SLAT_H / 2, wall + 0.78],
				r: [0, -side * (Math.PI / 2), 0]
			},
			{
				g: new BoxGeometry(0.02, SLAT_H - 0.1, 0.02),
				m: materials.coveLight,
				p: [side * (ROOM.sideWall - 0.06), SLAT_H / 2, wall],
				r: [0, -side * (Math.PI / 2), 0]
			}
		])
	];
	const slatGeometry = new BoxGeometry(0.06, SLAT_H, 0.06);
	const slatItems: InstanceItem[] = Array.from({ length: 12 }, (_, i) => ({
		position: [-0.66 + i * 0.12, SLAT_H / 2, 0.05]
	}));

	const apply = (material: MeshStandardMaterial, set: PbrSet | null) => {
		material.map = set?.map ?? null;
		material.normalMap = set?.normalMap ?? null;
		material.roughnessMap = set?.roughnessMap ?? null;
		material.aoMap = set?.aoMap ?? null;
		material.needsUpdate = true;
	};

	onMount(() => {
		const flat = new DataTexture(new Uint8Array([128, 128, 255, 255]), 1, 1);
		const grey = new DataTexture(new Uint8Array([40, 42, 48, 255]), 1, 1);
		flat.needsUpdate = true;
		grey.needsUpdate = true;
		const placeholder: PbrSet = { map: grey, normalMap: flat, roughnessMap: grey, aoMap: grey };
		const textured = [
			materials.floor,
			materials.rug,
			materials.stone,
			materials.stoneSide,
			materials.slatWood,
			materials.slatBoard
		];
		for (const material of textured) apply(material, placeholder);
		const sets: PbrSet[] = [];
		const keep = (set: PbrSet) => {
			sets.push(set);
			return set;
		};
		const cancels = [
			loadFloorMaps(FLOOR / TILE_SIZE, (set) => {
				apply(materials.floor, keep(set));
				invalidate();
			}),
			loadRugMaps(9, 11.3, (set) => {
				apply(materials.rug, keep(set));
				invalidate();
			}),
			loadWoodMaps((set) => {
				keep(set);
				apply(materials.slatWood, keep(clonePbrSet(set, 1 / WOOD_PLANKS, SLAT_H / 1.1)));
				apply(materials.slatBoard, keep(clonePbrSet(set, 1.5 / 1.1, SLAT_H / 1.1)));
				invalidate();
			}),
			loadWallMaps((set) => {
				keep(set);
				const ry = ROOM.height / WALL_TEXTURE_SIZE.height;
				apply(materials.stone, keep(clonePbrSet(set, WALL_W / WALL_TEXTURE_SIZE.width, ry)));
				apply(materials.stoneSide, keep(clonePbrSet(set, FLOOR / WALL_TEXTURE_SIZE.width, ry)));
				invalidate();
			})
		];
		const paint = createPaintMaps(512, 10);
		materials.ceilingPaint.map = paint.map;
		materials.ceilingPaint.normalMap = paint.normalMap;
		materials.ceilingPaint.needsUpdate = true;
		const glow = createGlowTexture();
		materials.glowBlue.map = glow;
		materials.glowWarm.map = glow;
		materials.glowBlue.needsUpdate = true;
		materials.glowWarm.needsUpdate = true;
		return () => {
			for (const cancel of cancels) cancel();
			for (const material of textured) apply(material, null);
			for (const set of sets) disposePbrSet(set);
			materials.ceilingPaint.map = null;
			materials.ceilingPaint.normalMap = null;
			paint.map?.dispose();
			paint.normalMap?.dispose();
			materials.glowBlue.map = null;
			materials.glowWarm.map = null;
			flat.dispose();
			grey.dispose();
			glow.dispose();
		};
	});
</script>

<T.Mesh rotation.x={-Math.PI / 2} receiveShadow material={materials.floor}>
	<T.PlaneGeometry args={[FLOOR, FLOOR]} />
</T.Mesh>

<T.Mesh position={[0, 0.022, 1.6]} receiveShadow material={materials.rug}>
	<T is={RoundedBoxGeometry} args={[4.6, 0.044, 5.8, 3, 0.02]} />
</T.Mesh>

<T.Mesh
	position={[0, ROOM.height, 1]}
	rotation.x={Math.PI / 2}
	receiveShadow
	material={materials.ceilingPaint}
>
	<T.PlaneGeometry args={[WALL_W, FLOOR]} />
</T.Mesh>

<T.Mesh position={[0, ROOM.height / 2, wall]} receiveShadow material={materials.stone}>
	<T.PlaneGeometry args={[WALL_W, ROOM.height]} />
</T.Mesh>

<T.Mesh position={[0, LINE_Y, wall + 0.015]} material={materials.glowBlue} renderOrder={2}>
	<T.PlaneGeometry args={[6.2, 0.7]} />
</T.Mesh>
<T.Mesh position={[0, 2.2, wall + 0.015]} material={materials.glowBlue} renderOrder={2}>
	<T.PlaneGeometry args={[3.4, 3.4]} />
</T.Mesh>
{#each [-1, 1] as side (side)}
	<T.Mesh
		position={[side * 2.85, ROOM.height - 0.7, wall + 0.015]}
		material={materials.glowWarm}
		renderOrder={2}
	>
		<T.PlaneGeometry args={[1.8, 2.2]} />
	</T.Mesh>
{/each}

<Merged parts={[...trimParts, ...fixtureParts]} castShadow receiveShadow />

<Logo position={[0, 2.2, wall + 0.07]} size={1.3} />

<WallShelves position={[-ROOM.sideWall + 1.4, 1.42, wall + 0.14]} width={1.68} scale={1.25} />
<MapFrame position={[ROOM.sideWall - 1.4, 1.74, wall + 0.03]} width={2.1} />
<FloorPlant position={[-ROOM.sideWall + 0.85, 0, -6.1]} height={1.7} seed={2} />

{#each [-1, 1] as side (side)}
	<T.Group
		position={[side * (ROOM.sideWall - 0.02), 0, wall + 0.78]}
		rotation.y={-side * (Math.PI / 2)}
	>
		<Instances
			geometry={slatGeometry}
			material={materials.slatWood}
			items={slatItems}
			castShadow
			receiveShadow
		/>
	</T.Group>
{/each}

{#each [-1, 1] as side (side)}
	<T.Mesh
		position={[side * ROOM.sideWall, ROOM.height / 2, 1]}
		rotation.y={-side * (Math.PI / 2)}
		receiveShadow
		material={materials.stoneSide}
	>
		<T.PlaneGeometry args={[FLOOR, ROOM.height]} />
	</T.Mesh>
{/each}
