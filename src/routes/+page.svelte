<script lang="ts">
	import { onMount } from 'svelte';
	import type { Component } from 'svelte';
	import { getPortfolioState, STORY_SCREENS } from '#lib/state/index.js';
	import LoadingScreen from '#lib/components/intro/LoadingScreen.svelte';
	import ScrollHint from '#lib/components/intro/ScrollHint.svelte';
	import ChapterRail from '#lib/components/intro/ChapterRail.svelte';

	const portfolio = getPortfolioState();

	let Scene = $state<Component | null>(null);
	let scrollY = $state(0);
	let innerHeight = $state(1);

	onMount(async () => {
		const module = await import('#lib/scene/MainScene.svelte');
		Scene = module.default;
		portfolio.markModuleReady();
	});

	$effect(() => {
		portfolio.setStory(scrollY / innerHeight);
	});
</script>

<svelte:head>
	<title>Henry Alexandre · Portfolio FiveM</title>
	<meta
		name="description"
		content="Portfolio d'Henry Alexandre, développeur FiveM : scripts, interfaces et systèmes sur mesure pour serveurs GTA V."
	/>
</svelte:head>

<svelte:window bind:scrollY bind:innerHeight />

<LoadingScreen />
<ChapterRail />

<div class="relative -mt-16 md:-mt-[76px]" style="height: calc(100svh * {1 + STORY_SCREENS})">
	<section class="sticky top-0 h-svh w-full overflow-hidden">
		{#if Scene}
			<Scene />
		{/if}
		<ScrollHint />
	</section>
</div>
