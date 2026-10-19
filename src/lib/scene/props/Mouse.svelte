<script lang="ts" module>
	import {
		AdditiveBlending,
		Color,
		CylinderGeometry,
		MeshBasicMaterial,
		MeshStandardMaterial,
		PlaneGeometry,
		RingGeometry,
		SphereGeometry,
		TorusGeometry
	} from 'three';
	import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
	import { materials } from '../materials/index.js';
	import type { Part } from '../merge.js';
	import { createMouseShellGeometry, halfWidthAt, MOUSE_L, topAt } from './mouse-geometry.js';

	const shell = new MeshStandardMaterial({
		color: '#121317',
		roughness: 0.34,
		metalness: 0.7,
		envMapIntensity: 1.1
	});
	const grip = new MeshStandardMaterial({ color: '#0b0c0f', roughness: 0.96, metalness: 0 });
	const wheel = new MeshStandardMaterial({ color: '#2a2d34', roughness: 0.4, metalness: 0.8 });
	const seam = new MeshStandardMaterial({ color: '#06070a', roughness: 0.9, metalness: 0 });
	const rgb = new MeshBasicMaterial({ color: '#6cb6f6' });
	const rgbHalo = new MeshBasicMaterial({
		color: '#6cb6f6',
		transparent: true,
		opacity: 0.3,
		blending: AdditiveBlending,
		depthWrite: false
	});
	const tmp = new Color();
	const white = new Color('#ffffff');
	const uz = (u: number) => (0.5 - u) * MOUSE_L;
	const WHEEL_U = 0.16;
	const seamLength = uz(0.02) - uz(0.42);
	const seamZ = (uz(0.02) + uz(0.42)) / 2;
	const seamY = (topAt(0.02) + topAt(0.42)) / 2 + 0.0015;
	const seamTilt = Math.atan2(topAt(0.42) - topAt(0.02), seamLength);
	const wheelY = topAt(WHEEL_U) + 0.0055;
	const sideX = halfWidthAt(0.34) - 0.0015;
	const sideY = topAt(0.34) * 0.55 + 0.003;
	const frontY = topAt(0.04) * 0.5 + 0.003;
	const wheelAt: [number, number, number] = [0, wheelY, uz(WHEEL_U)];
	const parts: Part[] = [
		{ g: createMouseShellGeometry(), m: shell, p: [0, 0.003, 0] },
		{
			g: new CylinderGeometry(0.0068, 0.0068, 0.005, 14),
			m: wheel,
			p: wheelAt,
			r: [0, 0, Math.PI / 2]
		},
		{
			g: new TorusGeometry(0.0068, 0.0013, 6, 16),
			m: materials.rubber,
			p: wheelAt,
			r: [0, 0, Math.PI / 2]
		},
		{ g: new TorusGeometry(0.0052, 0.0005, 4, 16), m: rgb, p: wheelAt, r: [0, 0, Math.PI / 2] },
		{
			g: new RoundedBoxGeometry(0.005, 0.0024, 0.009, 1, 0.001),
			m: seam,
			p: [0, topAt(0.27) + 0.0058, uz(0.27)]
		},
		{
			g: new RoundedBoxGeometry(0.0009, 0.006, seamLength, 1, 0.0003),
			m: seam,
			p: [0, seamY + 0.003, seamZ],
			r: [seamTilt, 0, 0]
		},
		{
			g: new SphereGeometry(1, 10, 7),
			m: grip,
			p: [halfWidthAt(0.5) - 0.0005, 0.012, uz(0.5)],
			s: [0.0035, 0.011, 0.04]
		},
		{
			g: new SphereGeometry(1, 10, 7),
			m: grip,
			p: [-halfWidthAt(0.5) + 0.0005, 0.012, uz(0.5)],
			s: [0.0035, 0.011, 0.04]
		},
		{
			g: new RoundedBoxGeometry(0.0035, 0.0055, 0.014, 1, 0.001),
			m: shell,
			p: [-sideX, sideY, uz(0.26)],
			r: [0, 0, 0.35]
		},
		{
			g: new RoundedBoxGeometry(0.0035, 0.0055, 0.012, 1, 0.001),
			m: shell,
			p: [-sideX, sideY, uz(0.4)],
			r: [0, 0, 0.35]
		},
		{
			g: new RoundedBoxGeometry(halfWidthAt(0.04) * 1.3, 0.0014, 0.003, 1, 0.0005),
			m: rgb,
			p: [0, frontY, uz(0.04) + 0.0012],
			r: [-0.5, 0, 0]
		},
		{
			g: new RingGeometry(0.0046, 0.0064, 16, 1, Math.PI * 0.62, Math.PI * 1.76),
			m: rgb,
			p: [0, topAt(0.72) + 0.0062, uz(0.72)],
			r: [-0.35, 0, 0]
		},
		{ g: new PlaneGeometry(0.1, 0.16), m: rgbHalo, p: [0, 0.0015, 0], r: [-Math.PI / 2, 0, 0] },
		{
			g: new RoundedBoxGeometry(halfWidthAt(0.14) * 1.5, 0.0024, 0.022, 1, 0.001),
			m: materials.rubber,
			p: [0, 0.0012, uz(0.14)]
		},
		{
			g: new RoundedBoxGeometry(halfWidthAt(0.86) * 1.5, 0.0024, 0.02, 1, 0.001),
			m: materials.rubber,
			p: [0, 0.0012, uz(0.86)]
		}
	];
</script>

<script lang="ts">
	import { T, useTask, useThrelte } from '@threlte/core';
	import Merged from '../Merged.svelte';

	let { position = [0, 0, 0], scale = 1 }: { position?: [number, number, number]; scale?: number } =
		$props();

	const { invalidate } = useThrelte();
	let elapsed = 0;
	let phase = 0.3;
	useTask(
		(delta) => {
			elapsed += delta;
			if (elapsed < 0.5) return;
			phase += elapsed * 0.05;
			elapsed = 0;
			tmp.setHSL(phase % 1, 0.85, 0.6);
			rgb.color.copy(tmp).multiplyScalar(1.8);
			rgbHalo.color.copy(tmp).lerp(white, 0.1);
			invalidate();
		},
		{ autoInvalidate: false }
	);
</script>

<T.Group {position} {scale} rotation.y={-0.22}>
	<Merged {parts} castShadow />
</T.Group>
