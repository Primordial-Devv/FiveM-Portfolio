<script lang="ts" module>
	import {
		Color,
		CylinderGeometry,
		MeshStandardMaterial,
		SphereGeometry,
		TorusGeometry
	} from 'three';
	import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
	import type { Part } from '../merge.js';

	const body = new MeshStandardMaterial({
		color: '#0e0f12',
		roughness: 0.35,
		metalness: 0.85,
		envMapIntensity: 1
	});
	const joint = new MeshStandardMaterial({ color: '#8d929a', roughness: 0.3, metalness: 1 });
	const diffuser = new MeshStandardMaterial({
		color: '#2a2418',
		emissive: new Color('#ffd7a6'),
		emissiveIntensity: 1.4,
		roughness: 0.6
	});
	const POST = 0.34;
	const UPPER = 0.42;
	const FORE = 0.46;
	const upperTilt = 0.5;
	const foreTilt = 1.45;
	const elbow: [number, number, number] = [
		0,
		POST + Math.cos(upperTilt) * UPPER,
		Math.sin(upperTilt) * UPPER
	];
	const wrist: [number, number, number] = [
		0,
		elbow[1] + Math.cos(upperTilt + foreTilt) * FORE,
		elbow[2] + Math.sin(upperTilt + foreTilt) * FORE
	];
	export const head: [number, number, number] = [wrist[0], wrist[1] - 0.06, wrist[2] + 0.03];
	export const target: [number, number, number] = [0, -0.6, wrist[2] + 0.12];
	const mid = (a: number[], b: number[]): [number, number, number] => [
		(a[0] + b[0]) / 2,
		(a[1] + b[1]) / 2,
		(a[2] + b[2]) / 2
	];
	export const parts: Part[] = [
		{ g: new RoundedBoxGeometry(0.07, 0.12, 0.05, 2, 0.006), m: body, p: [0, -0.03, 0] },
		{ g: new RoundedBoxGeometry(0.07, 0.03, 0.09, 2, 0.005), m: body, p: [0, -0.075, 0.045] },
		{ g: new CylinderGeometry(0.008, 0.008, 0.04, 12), m: joint, p: [0, -0.1, 0.06] },
		{ g: new CylinderGeometry(0.011, 0.012, POST, 16), m: body, p: [0, POST / 2, 0] },
		{
			g: new CylinderGeometry(0.02, 0.02, 0.034, 20),
			m: joint,
			p: [0, POST, 0],
			r: [0, 0, Math.PI / 2]
		},
		{
			g: new RoundedBoxGeometry(0.022, UPPER, 0.016, 1, 0.004),
			m: body,
			p: mid([0, POST, 0], elbow),
			r: [upperTilt, 0, 0]
		},
		{ g: new CylinderGeometry(0.02, 0.02, 0.034, 20), m: joint, p: elbow, r: [0, 0, Math.PI / 2] },
		{
			g: new RoundedBoxGeometry(0.02, FORE, 0.014, 1, 0.004),
			m: body,
			p: mid(elbow, wrist),
			r: [upperTilt + foreTilt, 0, 0]
		},
		{ g: new SphereGeometry(0.016, 16, 12), m: joint, p: wrist },
		{
			g: new CylinderGeometry(0.006, 0.006, 0.06, 10),
			m: body,
			p: [head[0], head[1] + 0.03, head[2] - 0.015],
			r: [0.4, 0, 0]
		},
		{ g: new CylinderGeometry(0.062, 0.07, 0.03, 32), m: body, p: head, r: [0.18, 0, 0] },
		{
			g: new CylinderGeometry(0.058, 0.058, 0.002, 32),
			m: diffuser,
			p: [head[0], head[1] - 0.0155 * Math.cos(0.18), head[2] + 0.0155 * Math.sin(0.18)],
			r: [0.18, 0, 0]
		},
		{
			g: new TorusGeometry(0.064, 0.0025, 8, 32),
			m: joint,
			p: [head[0], head[1] + 0.016 * Math.cos(0.18), head[2] - 0.016 * Math.sin(0.18)],
			r: [Math.PI / 2 + 0.18, 0, 0]
		}
	];
</script>

<script lang="ts">
	import { T } from '@threlte/core';
	import Merged from '../Merged.svelte';
	import Spot from '../Spot.svelte';

	let {
		position = [0, 0, 0],
		rotation = 0
	}: { position?: [number, number, number]; rotation?: number } = $props();
</script>

<T.Group {position} rotation.y={rotation}>
	<Merged {parts} castShadow />
	<Spot
		position={head}
		{target}
		intensity={2.6}
		color="#ffd0a0"
		angle={0.62}
		penumbra={0.95}
		distance={1.4}
	/>
</T.Group>
