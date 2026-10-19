<script lang="ts">
	import { T } from '@threlte/core';
	import { DESK } from './layout.js';
	import Desk from './props/Desk.svelte';
	import Monitors from './props/Monitors.svelte';
	import Keyboard from './props/Keyboard.svelte';
	import Mouse from './props/Mouse.svelte';
	import PC from './props/PC.svelte';
	import DeskSet from './props/DeskSet.svelte';
	import Notebook from './props/Notebook.svelte';

	const photos = import.meta.glob('../assets/photo.{jpg,jpeg,png,webp}', {
		eager: true,
		query: '?url',
		import: 'default'
	}) as Record<string, string>;
	const photo = Object.values(photos)[0];
	import DeskLamp from './props/DeskLamp.svelte';

	const top = DESK.height;
</script>

<T.Group position.z={DESK.z} scale={1.12}>
	<Desk />
	<T.Group position.y={top}>
		<Monitors
			position={[-0.2, 0, -0.34]}
			scale={1.22}
			clampZ={(-DESK.depth / 2 + 0.34 + 0.03) / 1.22}
		/>
		<Keyboard position={[-0.26, 0.004, 0.1]} scale={1.6} />
		<Mouse position={[0.3, 0.001, 0.22]} scale={1.15} />
		<PC position={[1.32, 0, -0.02]} />
		<DeskSet />
		<Notebook position={[-0.98, 0.004, 0.3]} rotation={0.16} photoUrl={photo} />
		<DeskLamp position={[1.1, 0.03, -DESK.depth / 2 + 0.02]} rotation={-0.3} />
	</T.Group>
</T.Group>
