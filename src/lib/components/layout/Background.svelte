<div class="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
	<div class="backdrop absolute inset-0"></div>
	<div class="grid-layer absolute inset-0"></div>
	<div class="grain absolute inset-0"></div>
	<div class="vignette absolute inset-0"></div>
</div>

<style>
	.backdrop {
		background:
			radial-gradient(70% 55% at 50% 42%, rgba(108, 182, 246, 0.14) 0%, transparent 62%),
			radial-gradient(42% 36% at 12% 8%, rgba(108, 182, 246, 0.1) 0%, transparent 70%),
			radial-gradient(40% 35% at 88% 90%, rgba(120, 110, 255, 0.08) 0%, transparent 70%),
			linear-gradient(180deg, #070a10 0%, #05070c 55%, #030408 100%);
	}

	.grid-layer {
		background-image:
			linear-gradient(rgba(158, 208, 251, 0.045) 1px, transparent 1px),
			linear-gradient(90deg, rgba(158, 208, 251, 0.045) 1px, transparent 1px);
		background-size: 56px 56px;
		mask-image: radial-gradient(60% 55% at 50% 50%, black 20%, transparent 85%);
		-webkit-mask-image: radial-gradient(60% 55% at 50% 50%, black 20%, transparent 85%);
	}

	.grain {
		opacity: 0.035;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)' opacity='0.9'/%3E%3C/svg%3E");
		background-size: 160px 160px;
	}

	.vignette {
		background: radial-gradient(80% 70% at 50% 50%, transparent 55%, rgba(2, 4, 8, 0.85) 100%);
	}
</style>
