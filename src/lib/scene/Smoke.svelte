<script lang="ts">
	import { T, useTask, useThrelte } from '@threlte/core';
	import { Color, Mesh, PlaneGeometry, ShaderMaterial } from 'three';
	import { getPortfolioState } from '#lib/state/index.js';

	const portfolio = getPortfolioState();
	const { invalidate, size } = useThrelte();

	const material = new ShaderMaterial({
		transparent: true,
		depthTest: false,
		depthWrite: false,
		uniforms: {
			uTime: { value: 0 },
			uReveal: { value: 0 },
			uAspect: { value: 1 },
			uTint: { value: new Color('#6cb6f6') }
		},
		vertexShader: `
			varying vec2 vUv;
			void main() {
				vUv = uv;
				gl_Position = vec4(position.xy, 0.0, 1.0);
			}
		`,
		fragmentShader: `
			precision highp float;
			uniform float uTime;
			uniform float uReveal;
			uniform float uAspect;
			uniform vec3 uTint;
			varying vec2 vUv;
			float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
			float noise(vec2 p) {
				vec2 i = floor(p);
				vec2 f = fract(p);
				f = f * f * (3.0 - 2.0 * f);
				return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
			}
			float fbm(vec2 p) {
				float v = 0.0;
				float a = 0.5;
				mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
				for (int i = 0; i < 4; i++) {
					v += a * noise(p);
					p = m * p;
					a *= 0.5;
				}
				return v;
			}
			void main() {
				vec2 p = vec2(vUv.x * uAspect, vUv.y);
				float t = uTime * 0.06;
				vec2 q = vec2(fbm(p * 1.4 + t), fbm(p * 1.4 - t * 0.6 + 3.1));
				float n = fbm(p * 2.0 + q * 1.5 + vec2(0.0, -t * 1.6));
				vec2 c = vec2(0.5 * uAspect, 0.5);
				float d = distance(p, c) / length(c);
				float r = uReveal;
				float rr = max(0.0, (r - 0.18) / 0.82);
				float hole = smoothstep(rr * 1.5 - 0.28, rr * 1.5 + 0.28, d + (n - 0.5) * 0.7);
				float keep = max(hole, 1.0 - smoothstep(0.0, 0.28, rr));
				float alpha = keep * (1.0 - smoothstep(0.86, 1.0, rr));
				vec3 dark = vec3(0.05, 0.056, 0.075);
				vec3 light = vec3(0.34, 0.38, 0.46);
				float shade = smoothstep(0.3, 0.95, n);
				vec3 col = mix(dark, light, shade) + uTint * 0.08 * smoothstep(0.65, 1.0, n);
				col *= 0.85 + 0.15 * smoothstep(0.2, 0.9, fbm(p * 5.0 + q * 2.0 - vec2(0.0, t * 2.5)));
				gl_FragColor = vec4(col, alpha);
			}
		`
	});
	const mesh = new Mesh(new PlaneGeometry(2, 2), material);
	mesh.frustumCulled = false;
	mesh.renderOrder = 1000;

	let current = 0;
	useTask(
		(delta) => {
			const target = portfolio.introStarted ? portfolio.introProgress : 0;
			current += (target - current) * Math.min(1, delta * 3.2);
			if (Math.abs(target - current) < 0.001) current = target;
			const visible = current < 0.995;
			mesh.visible = visible;
			if (!visible) return;
			material.uniforms.uTime.value += delta;
			material.uniforms.uReveal.value = current;
			material.uniforms.uAspect.value = $size.width / Math.max(1, $size.height);
			invalidate();
		},
		{ autoInvalidate: false }
	);

	$effect(() => () => {
		material.dispose();
		mesh.geometry.dispose();
	});
</script>

<T is={mesh} />
