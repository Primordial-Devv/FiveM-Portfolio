<script lang="ts">
	import { T } from '@threlte/core';
	import { ExtrudeGeometry, Shape } from 'three';
	import { materials } from '../materials/index.js';

	let { position = [0, 0, 0], size = 1 }: { position?: [number, number, number]; size?: number } =
		$props();

	const OUTER = 0.5;
	const INNER = 0.37;
	const GAP = 0.16;
	const start = Math.PI / 2 + GAP;
	const end = Math.PI / 2 - GAP + Math.PI * 2;

	const ring = new Shape();
	ring.moveTo(Math.cos(start) * OUTER, Math.sin(start) * OUTER);
	ring.absarc(0, 0, OUTER, start, end, false);
	ring.lineTo(Math.cos(end) * INNER, Math.sin(end) * INNER);
	ring.absarc(0, 0, INNER, end, start, true);
	ring.closePath();

	const geometry = new ExtrudeGeometry(ring, {
		depth: 0.07,
		curveSegments: 96,
		bevelEnabled: true,
		bevelThickness: 0.012,
		bevelSize: 0.012,
		bevelSegments: 3
	});
</script>

<T.Mesh {position} scale={size} castShadow receiveShadow material={materials.logoIce}>
	<T is={geometry} />
</T.Mesh>
