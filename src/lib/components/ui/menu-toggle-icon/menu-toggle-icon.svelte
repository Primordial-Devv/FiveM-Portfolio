<script lang="ts">
	import type { SVGAttributes } from 'svelte/elements';
	import { cn } from '#lib/utils.js';

	let {
		open = false,
		duration = 300,
		class: className,
		...restProps
	}: SVGAttributes<SVGSVGElement> & { open?: boolean; duration?: number } = $props();
</script>

<svg
	viewBox="0 0 24 24"
	fill="none"
	stroke="currentColor"
	stroke-width="2"
	stroke-linecap="round"
	stroke-linejoin="round"
	aria-hidden="true"
	data-state={open ? 'open' : 'closed'}
	class={cn('menu-toggle', className)}
	style:--duration="{duration}ms"
	{...restProps}
>
	<line class="top" x1="4" y1="7" x2="20" y2="7" />
	<line class="middle" x1="4" y1="12" x2="20" y2="12" />
	<line class="bottom" x1="4" y1="17" x2="20" y2="17" />
</svg>

<style>
	.menu-toggle line {
		transform-origin: center;
		transition:
			transform var(--duration) cubic-bezier(0.22, 1, 0.36, 1),
			opacity var(--duration) ease;
	}

	.menu-toggle[data-state='open'] .top {
		transform: translateY(5px) rotate(45deg);
	}

	.menu-toggle[data-state='open'] .middle {
		opacity: 0;
		transform: scaleX(0);
	}

	.menu-toggle[data-state='open'] .bottom {
		transform: translateY(-5px) rotate(-45deg);
	}
</style>
