<script lang="ts">
	import { useTask, useThrelte } from '@threlte/core';
	import { getPortfolioState } from '#lib/state/index.js';

	const { renderer, scene, camera, autoRender, invalidate } = useThrelte();
	const portfolio = getPortfolioState();
	let cancelled = false;

	let samples: number[] = [];
	let probing = false;
	const { stop } = useTask(
		(delta) => {
			if (probing) {
				samples.push(delta);
				if (samples.length < 24) return;
				probing = false;
				probe.stop();
				const sorted = [...samples].sort((a, b) => a - b);
				const median = sorted[sorted.length >> 1];
				if (median > 0.034) renderer.setPixelRatio(Math.min(renderer.getPixelRatio(), 1));
				if (median > 0.07) renderer.setPixelRatio(0.75);
				invalidate();
				return;
			}
			stop();
			renderer.compileAsync(scene, camera.current).then(() => {
				if (cancelled) return;
				autoRender.set(true);
				portfolio.markSceneReady();
				samples = [];
				probing = true;
				probe.start();
				invalidate();
			});
		},
		{ autoInvalidate: false }
	);
	const probe = useTask(() => invalidate(), { autoStart: false });

	$effect(() => () => {
		cancelled = true;
	});
</script>
