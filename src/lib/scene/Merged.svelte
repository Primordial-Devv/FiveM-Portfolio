<script lang="ts">
	import { untrack } from 'svelte';
	import { T } from '@threlte/core';
	import { mergeParts, type Part } from './merge.js';

	let {
		parts,
		castShadow = false,
		receiveShadow = false,
		position = [0, 0, 0],
		rotation = [0, 0, 0],
		scale = 1
	}: {
		parts: Part[];
		castShadow?: boolean;
		receiveShadow?: boolean;
		position?: [number, number, number];
		rotation?: [number, number, number];
		scale?: number | [number, number, number];
	} = $props();

	const groups = untrack(() => mergeParts(parts));

	$effect(() => () => {
		for (const group of groups) group.geometry.dispose();
	});
</script>

<T.Group {position} {rotation} scale={typeof scale === 'number' ? [scale, scale, scale] : scale}>
	{#each groups as group, i (i)}
		<T.Mesh
			geometry={group.geometry}
			material={group.material}
			castShadow={castShadow && !group.material.transparent}
			{receiveShadow}
		/>
	{/each}
</T.Group>
