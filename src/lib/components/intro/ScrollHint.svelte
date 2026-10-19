<script lang="ts">
	import { getPortfolioState } from '#lib/state/index.js';

	const portfolio = getPortfolioState();
	let root = $state<HTMLDivElement>();
	const opacity = $derived(
		portfolio.introStarted ? Math.max(0, 1 - portfolio.introProgress * 4) : 0
	);

	$effect(() => {
		if (!portfolio.introStarted || !root) return;
		const el = root;
		import('gsap').then(({ gsap }) => {
			gsap.fromTo(
				el.querySelectorAll('[data-rise]'),
				{ y: 24, opacity: 0 },
				{ y: 0, opacity: 1, duration: 1, stagger: 0.12, ease: 'power3.out', delay: 0.2 }
			);
		});
	});
</script>

<div
	bind:this={root}
	class="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center gap-7"
	style="opacity: {opacity}"
	aria-hidden={opacity === 0}
>
	<p data-rise class="sk-mono text-[11px] tracking-[0.42em] text-white/60 uppercase">
		Faites défiler pour entrer
	</p>
	<h2 data-rise class="sk-brand text-center text-[clamp(30px,5vw,64px)] tracking-tight text-white">
		Bienvenue dans l'atelier
	</h2>
	<div data-rise class="mt-4 flex flex-col items-center gap-3">
		<div class="line relative h-20 w-px overflow-hidden">
			<span class="dot absolute top-0 left-0 h-6 w-px"></span>
		</div>
		<svg viewBox="0 0 16 16" class="chevron size-4 text-white/70" fill="none" aria-hidden="true">
			<path d="M3 6l5 5 5-5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
		</svg>
	</div>
</div>

<style>
	.line {
		background: rgba(255, 255, 255, 0.14);
	}
	.dot {
		background: linear-gradient(180deg, transparent, var(--sk-accent));
		animation: slide 1.8s cubic-bezier(0.65, 0, 0.35, 1) infinite;
	}
	.chevron {
		animation: nudge 1.8s ease-in-out infinite;
	}
	@keyframes slide {
		0% {
			transform: translateY(-100%);
		}
		100% {
			transform: translateY(400%);
		}
	}
	@keyframes nudge {
		0%,
		100% {
			transform: translateY(0);
			opacity: 0.6;
		}
		50% {
			transform: translateY(4px);
			opacity: 1;
		}
	}
</style>
