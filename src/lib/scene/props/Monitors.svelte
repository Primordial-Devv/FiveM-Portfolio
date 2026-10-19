<script lang="ts">
	import { T } from '@threlte/core';
	import Monitor from './Monitor.svelte';
	import MonitorArm from './MonitorArm.svelte';
	import { HOUSING_T } from './monitor-geometry.js';

	let {
		position = [0, 0, 0],
		scale = 1,
		clampZ = -0.14
	}: { position?: [number, number, number]; scale?: number; clampZ?: number } = $props();

	const Y = 0.36;
	const SIDE_X = 0.625;
	const SIDE_Z = 0.075;
	const SIDE_ROT = 0.34;
	const MOUNT_Z = -HOUSING_T - 0.03;
	const mount = (x: number, z: number, rot: number): [number, number, number] => [
		x + Math.sin(rot) * MOUNT_Z,
		Y,
		z + Math.cos(rot) * MOUNT_Z
	];
	const center = mount(0, 0, 0);
	const left = mount(-SIDE_X, SIDE_Z, SIDE_ROT);
	const right = mount(SIDE_X, SIDE_Z, -SIDE_ROT);
</script>

<T.Group {position} {scale}>
	<Monitor kind="left" position={[-SIDE_X, Y, SIDE_Z]} rotation={SIDE_ROT} />
	<Monitor kind="center" position={[0, Y, 0]} />
	<Monitor kind="right" position={[SIDE_X, Y, SIDE_Z]} rotation={-SIDE_ROT} />
	<MonitorArm {clampZ} {center} {left} {right} />
</T.Group>
