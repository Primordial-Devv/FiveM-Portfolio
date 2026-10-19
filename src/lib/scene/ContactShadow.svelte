<script lang="ts">
	import { untrack } from 'svelte';
	import { T, useTask, useThrelte } from '@threlte/core';
	import {
		Color,
		Mesh,
		MeshBasicMaterial,
		MeshDepthMaterial,
		OrthographicCamera,
		PlaneGeometry,
		ShaderMaterial,
		WebGLRenderTarget
	} from 'three';
	import { HorizontalBlurShader } from 'three/examples/jsm/shaders/HorizontalBlurShader.js';
	import { VerticalBlurShader } from 'three/examples/jsm/shaders/VerticalBlurShader.js';

	let {
		position = [0, 0, 0],
		width = 10,
		height = 10,
		blur = 1,
		far = 10,
		opacity = 1,
		resolution = 512
	}: {
		position?: [number, number, number];
		width?: number;
		height?: number;
		blur?: number;
		far?: number;
		opacity?: number;
		resolution?: number;
	} = $props();

	const { scene, renderer, invalidate } = useThrelte();
	const w = untrack(() => width);
	const h = untrack(() => height);
	const size = untrack(() => resolution);
	const depth = untrack(() => far);
	const radius = untrack(() => blur);

	const renderTarget = new WebGLRenderTarget(size, size);
	renderTarget.texture.generateMipmaps = false;
	const renderTargetBlur = new WebGLRenderTarget(size, size);
	renderTargetBlur.texture.generateMipmaps = false;

	const planeGeometry = new PlaneGeometry(w, h).rotateX(Math.PI / 2);
	const blurPlane = new Mesh(planeGeometry);
	blurPlane.visible = false;

	const depthMaterial = new MeshDepthMaterial({ depthTest: false, depthWrite: false });
	depthMaterial.onBeforeCompile = (shader) => {
		shader.uniforms.uColor = { value: new Color('#000000') };
		shader.fragmentShader = `uniform vec3 uColor;\n${shader.fragmentShader}`
			.replace('vec4( vec3( 1.0 - fragCoordZ ), opacity );', 'vec4( uColor, 1.0 - fragCoordZ );')
			.replace('vec4(vec3(1.0-fragCoordZ),opacity);', 'vec4(uColor,1.0-fragCoordZ);');
	};

	const horizontalBlur = new ShaderMaterial({ ...HorizontalBlurShader, depthTest: false });
	const verticalBlur = new ShaderMaterial({ ...VerticalBlurShader, depthTest: false });
	const shadowCamera = new OrthographicCamera(-w / 2, w / 2, h / 2, -h / 2, 0, depth);
	shadowCamera.rotation.x = Math.PI / 2;
	const shadowMaterial = new MeshBasicMaterial({
		map: renderTarget.texture,
		transparent: true,
		opacity: untrack(() => opacity),
		depthWrite: false
	});

	const blurPass = (amount: number) => {
		blurPlane.visible = true;
		blurPlane.material = horizontalBlur;
		horizontalBlur.uniforms.tDiffuse.value = renderTarget.texture;
		horizontalBlur.uniforms.h.value = amount / 256;
		renderer.setRenderTarget(renderTargetBlur);
		renderer.render(blurPlane, shadowCamera);
		blurPlane.material = verticalBlur;
		verticalBlur.uniforms.tDiffuse.value = renderTargetBlur.texture;
		verticalBlur.uniforms.v.value = amount / 256;
		renderer.setRenderTarget(renderTarget);
		renderer.render(blurPlane, shadowCamera);
		blurPlane.visible = false;
	};

	const renderShadow = () => {
		const background = scene.background;
		const override = scene.overrideMaterial;
		const clearAlpha = renderer.getClearAlpha();
		scene.background = null;
		scene.overrideMaterial = depthMaterial;
		renderer.setClearAlpha(0);
		renderer.setRenderTarget(renderTarget);
		renderer.render(scene, shadowCamera);
		scene.overrideMaterial = override;
		blurPass(radius);
		blurPass(radius * 0.4);
		renderer.setRenderTarget(null);
		scene.background = background;
		renderer.setClearAlpha(clearAlpha);
		invalidate();
	};

	const { stop } = useTask(
		() => {
			stop();
			renderShadow();
		},
		{ autoInvalidate: false }
	);

	$effect(() => () => {
		renderTarget.dispose();
		renderTargetBlur.dispose();
		planeGeometry.dispose();
		depthMaterial.dispose();
		horizontalBlur.dispose();
		verticalBlur.dispose();
		shadowMaterial.dispose();
	});
</script>

<T.Group {position}>
	<T is={shadowCamera} />
	<T is={blurPlane} />
	<T.Mesh rotation.x={-Math.PI / 2} material={shadowMaterial} renderOrder={1}>
		<T.PlaneGeometry args={[w, h]} />
	</T.Mesh>
</T.Group>
