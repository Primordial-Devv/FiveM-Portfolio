<script lang="ts">
	import { untrack } from 'svelte';
	import { T, useThrelte } from '@threlte/core';
	import { type BufferGeometry, type Color, InstancedMesh, type Material, Object3D } from 'three';
	import type { InstanceItem } from './instances.js';

	let {
		geometry,
		material,
		items,
		colors,
		castShadow = false,
		receiveShadow = false
	}: {
		geometry: BufferGeometry;
		material: Material;
		items: InstanceItem[];
		colors?: Color[];
		castShadow?: boolean;
		receiveShadow?: boolean;
	} = $props();

	const { invalidate } = useThrelte();
	const proxy = new Object3D();
	const mesh = untrack(() => {
		const instanced = new InstancedMesh(geometry, material, items.length);
		items.forEach((item, i) => {
			proxy.position.set(...(item.position ?? [0, 0, 0]));
			proxy.rotation.set(...(item.rotation ?? [0, 0, 0]));
			const scale = item.scale ?? 1;
			if (typeof scale === 'number') proxy.scale.setScalar(scale);
			else proxy.scale.set(...scale);
			proxy.updateMatrix();
			instanced.setMatrixAt(i, proxy.matrix);
			if (item.color) instanced.setColorAt(i, item.color);
		});
		instanced.computeBoundingSphere();
		return instanced;
	});

	$effect(() => {
		if (!colors) return;
		colors.forEach((color, i) => mesh.setColorAt(i, color));
		if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
		invalidate();
	});

	$effect(() => () => mesh.dispose());
</script>

<T is={mesh} {castShadow} {receiveShadow} />
