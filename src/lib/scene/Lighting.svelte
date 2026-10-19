<script lang="ts">
	import { onMount } from 'svelte';
	import { T, useThrelte } from '@threlte/core';
	import ContactShadow from './ContactShadow.svelte';
	import { PMREMGenerator, type RectAreaLight } from 'three';
	import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
	import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js';
	import Spot from './Spot.svelte';
	import { ROOM } from './layout.js';

	const { renderer, scene } = useThrelte();

	RectAreaLightUniformsLib.init();

	onMount(() => {
		renderer.debug.checkShaderErrors = import.meta.env.DEV;
		const pmrem = new PMREMGenerator(renderer);
		const environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
		scene.environment = environment;
		scene.environmentIntensity = 0.1;
		renderer.toneMappingExposure = 1.0;
		pmrem.dispose();
		return () => {
			scene.environment = null;
			environment.dispose();
		};
	});

	const wall = ROOM.backWall;
	const SIDE_SPOTS = [-2.6];
	const WALL_W = ROOM.sideWall * 2;
	const top = ROOM.height;
	const aim = (x: number, y: number, z: number) => (light: RectAreaLight) => light.lookAt(x, y, z);
</script>

<T.HemisphereLight args={['#18202c', '#05060a', 0.1]} />

<Spot
	position={[0.6, 3.3, 2.2]}
	target={[-0.2, 0.8, 0.3]}
	intensity={18}
	color="#dfe7f3"
	angle={0.42}
	penumbra={0.85}
	castShadow
/>

<T.DirectionalLight position={[-1.4, 3.6, 0.4]} intensity={0.14} color="#9fc0e6" />

<T.RectAreaLight
	args={['#7ab4f2', 11, 4.6, 0.5]}
	position={[0, top - 0.5, wall + 0.18]}
	oncreate={aim(0, 1.9, wall)}
/>
{#each [-1, 1] as side (side)}
	<Spot
		position={[side * 2.85, top - 0.18, wall + 0.14]}
		target={[side * 2.85, 1.6, wall]}
		intensity={11}
		color="#ffcd8c"
		angle={0.46}
		penumbra={1}
	/>
{/each}

{#each [-1, 1] as side (side)}
	{#each SIDE_SPOTS as z (z)}
		<Spot
			position={[side * (ROOM.sideWall - 0.14), top - 0.18, z]}
			target={[side * ROOM.sideWall, 1.2, z]}
			intensity={8}
			color="#ffcd8c"
			angle={0.55}
			penumbra={1}
		/>
	{/each}
{/each}

<T.RectAreaLight
	args={['#ffcd8c', 6, WALL_W - 1.3, 0.03]}
	position={[0, 0.16, wall + 0.04]}
	oncreate={aim(0, 0, wall + 0.5)}
/>

<ContactShadow
	position={[0, 0.002, 0.6]}
	opacity={0.5}
	width={8}
	height={6}
	blur={2.4}
	far={1.6}
	resolution={512}
/>
