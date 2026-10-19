<script lang="ts">
	import { Button } from '#lib/components/ui/button/index.js';
	import { MenuToggleIcon } from '#lib/components/ui/menu-toggle-icon/index.js';
	import { cn } from '#lib/utils.js';
	import SikuMark from './SikuMark.svelte';
	import { getPortfolioState } from '#lib/state/index.js';

	const portfolio = getPortfolioState();

	const links = [
		{ label: 'Qui je suis', href: '#about', section: 'about' },
		{ label: 'Projets', href: '#projects', section: 'projects' },
		{ label: 'Expérience', href: '#experience', section: 'experience' },
		{ label: 'Contact', href: '#contact', section: 'contact' }
	];
	const active = (section: string) => portfolio.section === section;

	let scrollY = $state(0);
	let open = $state(false);
	const scrolled = $derived(scrollY > 10);

	$effect(() => {
		document.body.style.overflow = open ? 'hidden' : '';
		return () => {
			document.body.style.overflow = '';
		};
	});
</script>

<svelte:window bind:scrollY />

<header
	class={cn(
		'sticky top-0 z-50 mx-auto w-full max-w-6xl border-b border-transparent md:rounded-[var(--sk-radius-panel)] md:border md:transition-all md:duration-300 md:ease-out',
		{
			'sk-glass md:top-4 md:max-w-5xl': scrolled && !open,
			'bg-sk-panel/90': open
		}
	)}
	style="opacity: {portfolio.reveal}; transform: translateY({(1 - portfolio.reveal) *
		-12}px); pointer-events: {portfolio.reveal > 0.4 ? 'auto' : 'none'}"
>
	<nav
		class={cn(
			'flex h-16 w-full items-center justify-between px-5 md:h-[76px] md:px-7 md:transition-all md:ease-out',
			{ 'md:px-4': scrolled }
		)}
	>
		<a href="/" class="group flex items-center gap-3.5" aria-label="Portfolio, accueil">
			<SikuMark class="brand-mark size-9" />
			<span class="sk-brand text-[19px] tracking-tight">Portfolio</span>
		</a>

		<ul class="hidden items-center gap-1 md:flex" aria-label="Navigation principale">
			{#each links as link (link.label)}
				<li>
					<a
						class={cn('nav-link', { 'is-active': active(link.section) })}
						href={link.href}
						aria-current={active(link.section) ? 'location' : undefined}
					>
						{link.label}
					</a>
				</li>
			{/each}
		</ul>

		<div class="hidden items-center gap-2 md:flex">
			<Button
				variant="ghost"
				class="h-10 px-3.5 text-[15px] text-sk-muted hover:text-sk-body"
				href="https://github.com/Primordial-Devv"
				target="_blank"
				rel="noreferrer"
			>
				GitHub
			</Button>
			<Button class="h-10 px-5 text-[15px]" href="#contact">Me contacter</Button>
		</div>

		<Button
			size="icon"
			variant="outline"
			class="md:hidden"
			aria-label="Menu"
			aria-expanded={open}
			onclick={() => (open = !open)}
		>
			<MenuToggleIcon {open} class="size-5" duration={300} />
		</Button>
	</nav>

	<div
		class={cn(
			'fixed top-16 right-0 bottom-0 left-0 z-50 flex flex-col overflow-hidden border-y bg-sk-panel/95 backdrop-blur-lg md:hidden',
			open ? 'block' : 'hidden'
		)}
	>
		<div
			data-slot={open ? 'open' : 'closed'}
			class="flex h-full w-full flex-col justify-between gap-y-2 p-4 ease-out data-[slot=closed]:animate-out data-[slot=closed]:zoom-out-95 data-[slot=open]:animate-in data-[slot=open]:zoom-in-95"
		>
			<ul class="grid gap-y-1">
				{#each links as link, i (link.label)}
					<li>
						<a
							class={cn('mobile-link', { 'is-active': active(link.section) })}
							href={link.href}
							aria-current={active(link.section) ? 'location' : undefined}
							onclick={() => (open = false)}
						>
							<span class="sk-mono text-[11px] text-sk-muted">0{i + 1}</span>
							{link.label}
						</a>
					</li>
				{/each}
			</ul>
			<div class="flex flex-col gap-2">
				<Button
					variant="outline"
					class="w-full"
					href="https://github.com/Primordial-Devv"
					target="_blank"
					rel="noreferrer"
				>
					GitHub
				</Button>
				<Button class="w-full" href="#contact" onclick={() => (open = false)}>Me contacter</Button>
			</div>
		</div>
	</div>
</header>

<style>
	.brand-mark {
		color: var(--sk-text);
		transition: transform 200ms ease;
	}
	.group:hover .brand-mark {
		transform: rotate(-12deg);
	}
	.nav-link {
		display: inline-flex;
		align-items: center;
		height: 40px;
		padding: 0 14px;
		border-radius: 10px;
		font-size: 15px;
		font-weight: 500;
		letter-spacing: 0.01em;
		color: var(--sk-text-muted, inherit);
		position: relative;
		transition:
			color 160ms ease,
			background-color 160ms ease;
	}
	.nav-link::after {
		content: '';
		position: absolute;
		left: 14px;
		right: 14px;
		bottom: 8px;
		height: 1.5px;
		border-radius: 2px;
		background: var(--sk-accent);
		transform: scaleX(0);
		transform-origin: left;
		transition: transform 200ms ease;
	}
	.nav-link:hover {
		color: var(--sk-text, inherit);
	}
	.nav-link:hover::after,
	.nav-link.is-active::after {
		transform: scaleX(1);
	}
	.nav-link.is-active {
		color: var(--sk-text, inherit);
	}
	.mobile-link.is-active {
		color: var(--sk-accent);
	}
	.nav-link:focus-visible {
		outline: 2px solid var(--sk-accent);
		outline-offset: 2px;
	}
	.mobile-link {
		display: flex;
		align-items: center;
		gap: 14px;
		padding: 14px 12px;
		border-radius: 12px;
		font-size: 17px;
		font-weight: 500;
	}
	.mobile-link:hover {
		background: var(--sk-accent-tint);
	}
</style>
