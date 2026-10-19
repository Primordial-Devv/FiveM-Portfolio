<script lang="ts">
	import './layout.css';
	import favicon from '#lib/assets/favicon.svg';
	import type { LayoutProps } from './$types';
	import { ModeWatcher } from 'mode-watcher';
	import { Toaster } from '#lib/components/ui/sonner/index.js';
	import { setPortfolioState } from '#lib/state/index.js';
	import Background from '#lib/components/layout/Background.svelte';
	import Header from '#lib/components/layout/Header.svelte';

	let { children }: LayoutProps = $props();

	setPortfolioState();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<ModeWatcher defaultMode="dark" track={false} />
<Toaster />
<Background />

<div class="relative flex min-h-svh flex-col text-sk-body">
	<Header />
	<main class="flex-1">
		{@render children()}
	</main>
</div>
