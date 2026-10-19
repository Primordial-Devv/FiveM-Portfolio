<script lang="ts">
	import { getPortfolioState, milestones } from '#lib/state/index.js';

	const portfolio = getPortfolioState();
	const visible = $derived(portfolio.reveal);
	const index = $derived(portfolio.milestoneIndex);
	const label = $derived(portfolio.milestone?.label ?? '');
	let toastKey = $state(-1);
	let armed = false;

	$effect(() => {
		const current = index;
		if (!armed) {
			armed = true;
			return;
		}
		if (current < 0) return;
		toastKey = current;
		const timer = setTimeout(() => (toastKey = -1), 2600);
		return () => clearTimeout(timer);
	});
</script>

<aside
	class="pointer-events-none fixed top-1/2 right-6 z-40 hidden -translate-y-1/2 flex-col items-end gap-5 md:flex"
	style="opacity: {visible}"
	aria-hidden={visible === 0}
>
	{#each milestones as step, i (step.id)}
		<div class="flex items-center gap-3">
			<span
				class="sk-mono text-[10px] tracking-[0.3em] uppercase transition-all duration-500"
				style="opacity: {i === index ? 1 : 0}; transform: translateX({i === index ? 0 : 8}px)"
			>
				{step.label}
			</span>
			<span class="sk-mono text-[10px] text-white/45">0{i + 1}</span>
			<span
				class="dot block size-2 rounded-full transition-all duration-500"
				class:is-done={i < index}
				class:is-active={i === index}
			></span>
		</div>
	{/each}
	<div class="rail absolute top-0 -right-px bottom-0 w-px">
		<span class="rail-fill block w-full" style="height: {portfolio.storyProgress * 100}%"></span>
	</div>
</aside>

{#if toastKey >= 0}
	{#key toastKey}
		<div
			class="toast pointer-events-none fixed bottom-10 left-1/2 z-40 flex -translate-x-1/2 items-center gap-4"
			role="status"
		>
			<span class="line block h-px w-10"></span>
			<span class="sk-mono text-[11px] tracking-[0.42em] text-white/85 uppercase">
				0{toastKey + 1} · {label}
			</span>
			<span class="line block h-px w-10"></span>
		</div>
	{/key}
{/if}

<style>
	.dot {
		background: rgba(255, 255, 255, 0.22);
		box-shadow: 0 0 0 0 transparent;
	}
	.dot.is-done {
		background: rgba(255, 255, 255, 0.55);
	}
	.dot.is-active {
		background: var(--sk-accent);
		box-shadow: 0 0 0 5px var(--sk-accent-ring);
		transform: scale(1.3);
	}
	.rail {
		background: rgba(255, 255, 255, 0.08);
		transform: translateX(22px);
	}
	.rail-fill {
		background: linear-gradient(to bottom, transparent, var(--sk-accent));
		transition: height 120ms linear;
	}
	.toast {
		animation: toast 2.6s cubic-bezier(0.2, 0.8, 0.2, 1) both;
	}
	.line {
		background: linear-gradient(90deg, transparent, var(--sk-accent));
		transform-origin: right;
		animation: line 2.6s ease both;
	}
	.line:last-child {
		background: linear-gradient(90deg, var(--sk-accent), transparent);
		transform-origin: left;
	}
	@keyframes toast {
		0% {
			opacity: 0;
			transform: translate(-50%, 14px);
		}
		14%,
		80% {
			opacity: 1;
			transform: translate(-50%, 0);
		}
		100% {
			opacity: 0;
			transform: translate(-50%, -8px);
		}
	}
	@keyframes line {
		0% {
			transform: scaleX(0);
		}
		22%,
		100% {
			transform: scaleX(1);
		}
	}
</style>
