<script lang="ts">
	import { getPortfolioState } from '#lib/state/index.js';
	import SikuMark from '#lib/components/layout/SikuMark.svelte';

	const portfolio = getPortfolioState();
	let root = $state<HTMLDivElement>();
	let shown = $state(0);
	let dismissed = $state(false);
	let leaving = false;

	const percent = $derived(Math.round(shown * 100));

	$effect(() => {
		document.documentElement.style.overflow = dismissed ? '' : 'hidden';
		if (!dismissed) window.scrollTo(0, 0);
		return () => {
			document.documentElement.style.overflow = '';
		};
	});

	$effect(() => {
		const target = portfolio.loadProgress;
		let frame = 0;
		const step = () => {
			shown += (target - shown) * 0.12;
			if (Math.abs(target - shown) > 0.002) frame = requestAnimationFrame(step);
			else shown = target;
		};
		frame = requestAnimationFrame(step);
		return () => cancelAnimationFrame(frame);
	});

	$effect(() => {
		if (!portfolio.loaded || leaving || !root) return;
		leaving = true;
		const el = root;
		import('gsap').then(({ gsap }) => {
			const tl = gsap.timeline({
				delay: 0.35,
				onComplete: () => {
					dismissed = true;
					portfolio.startIntro();
				}
			});
			tl.to(el.querySelectorAll('[data-stagger]'), {
				y: -18,
				opacity: 0,
				duration: 0.5,
				stagger: 0.06,
				ease: 'power2.in'
			});
			tl.to(el, { clipPath: 'inset(0 0 100% 0)', duration: 0.8, ease: 'power4.inOut' }, '-=0.2');
		});
	});
</script>

{#if !dismissed}
	<div
		bind:this={root}
		class="loader fixed inset-0 z-[70] flex flex-col items-center justify-center overflow-hidden"
		role="status"
		aria-live="polite"
		aria-label="Chargement du portfolio"
	>
		<div class="halo" aria-hidden="true"></div>
		<SikuMark class="loader-mark size-14 text-white/90" />
		<p data-stagger class="sk-mono mt-10 text-[11px] tracking-[0.42em] text-sk-muted uppercase">
			Portfolio
		</p>
		<h1 data-stagger class="sk-brand mt-3 text-[clamp(28px,4.4vw,52px)] tracking-tight">
			Henry Alexandre
		</h1>
		<div data-stagger class="mt-12 flex w-[min(360px,70vw)] flex-col gap-3">
			<div class="track h-px w-full overflow-hidden">
				<div class="fill h-full" style="transform: scaleX({shown})"></div>
			</div>
			<div class="sk-mono flex justify-between text-[11px] tracking-[0.2em] text-sk-muted">
				<span>{portfolio.sceneReady ? 'Scène prête' : 'Chargement de la scène'}</span>
				<span>{percent}%</span>
			</div>
		</div>
	</div>
{/if}

<style>
	.loader {
		background: #05070c;
		clip-path: inset(0 0 0 0);
	}
	.halo {
		position: absolute;
		inset: 0;
		background: radial-gradient(60% 45% at 50% 48%, rgba(108, 182, 246, 0.14) 0%, transparent 70%);
	}
	:global(.loader-mark) {
		animation: spin 2.6s cubic-bezier(0.65, 0, 0.35, 1) infinite;
	}
	.track {
		background: rgba(255, 255, 255, 0.1);
	}
	.fill {
		background: linear-gradient(90deg, var(--sk-accent-hover), var(--sk-accent));
		transform-origin: left;
		box-shadow: 0 0 18px var(--sk-accent-glow);
	}
	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>
