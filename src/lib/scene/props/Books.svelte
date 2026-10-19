<script lang="ts" module>
	import { BoxGeometry, Color, MeshStandardMaterial } from 'three';
	import { createLinenTexture, createPagesTexture } from '../materials/figurine-textures.js';

	const coverGeometry = new BoxGeometry(1, 1, 1);
	const pageGeometry = new BoxGeometry(1, 1, 1);
	const bandGeometry = new BoxGeometry(1, 1, 1);
	const coverMaterial = new MeshStandardMaterial({
		color: '#ffffff',
		roughness: 0.92,
		metalness: 0
	});
	const pageMaterial = new MeshStandardMaterial({
		color: '#ffffff',
		roughness: 0.95,
		metalness: 0
	});
	const bandMaterial = new MeshStandardMaterial({
		color: '#ffffff',
		roughness: 0.4,
		metalness: 0.6
	});
	const tones = [
		'#2b3a55',
		'#2a2d33',
		'#5a2a2e',
		'#2f4a3a',
		'#d2c7b0',
		'#4a5466',
		'#8a6a2e',
		'#3c2e26',
		'#6b2f3f',
		'#1f2b3a'
	].map((hex) => new Color(hex));
	const gold = new Color('#c9a654');
	const cream = new Color('#e9e2d2');
	let ready = false;
	const ensure = () => {
		if (ready) return;
		ready = true;
		coverMaterial.map = createLinenTexture();
		pageMaterial.map = createPagesTexture();
		coverMaterial.needsUpdate = true;
		pageMaterial.needsUpdate = true;
	};
</script>

<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import Instances from '../Instances.svelte';
	import type { InstanceItem } from '../instances.js';

	type Row = { y: number; from: number; to: number; seed: number; flat?: number };
	let { rows = [] }: { rows?: Row[] } = $props();
	const config = untrack(() => rows);

	onMount(ensure);

	let state = 17;
	const rand = () => {
		state = (state * 1664525 + 1013904223) % 4294967296;
		return state / 4294967296;
	};

	const covers: InstanceItem[] = [];
	const pages: InstanceItem[] = [];
	const bands: InstanceItem[] = [];

	const addBook = (
		x: number,
		y: number,
		w: number,
		h: number,
		d: number,
		tone: Color,
		lean: number
	) => {
		const rot: [number, number, number] = [0, 0, lean];
		covers.push({ position: [x, y, 0], rotation: rot, scale: [w, h, d], color: tone });
		pages.push({
			position: [x, y - 0.002, -0.006],
			rotation: rot,
			scale: [w - 0.004, h - 0.012, d - 0.008]
		});
		const bandColor = rand() > 0.5 ? gold : cream;
		const z = d / 2 + 0.0008;
		for (const dy of [h * 0.38, -h * 0.4]) {
			bands.push({
				position: [x - Math.sin(lean) * dy, y + Math.cos(lean) * dy, z],
				rotation: rot,
				scale: [w * 0.86, 0.0035, 0.0012],
				color: bandColor
			});
		}
		if (rand() > 0.35) {
			bands.push({
				position: [x - Math.sin(lean) * h * 0.1, y + Math.cos(lean) * h * 0.1, z],
				rotation: rot,
				scale: [w * 0.6, h * 0.16, 0.001],
				color: bandColor.clone().multiplyScalar(0.75)
			});
		}
	};

	for (const row of config) {
		state = row.seed * 9973 + 5;
		let x = row.from;
		const limit = row.to - (row.flat ? 0.2 : 0);
		while (x < limit) {
			const w = 0.018 + rand() * 0.03;
			const h = 0.17 + rand() * 0.1;
			const d = 0.13 + rand() * 0.04;
			const tone = tones[Math.floor(rand() * tones.length)];
			const last = x + w + 0.03 >= limit;
			const lean = last && !row.flat ? -0.16 : 0;
			addBook(
				x + w / 2 + (lean ? 0.02 : 0),
				row.y + h / 2 + (lean ? -0.004 : 0),
				w,
				h,
				d,
				tone,
				lean
			);
			x += w + 0.003;
		}
		if (row.flat) {
			let y = row.y;
			for (let k = 0; k < row.flat; k++) {
				const w = 0.022 + rand() * 0.02;
				const h = 0.19 + rand() * 0.06;
				const d = 0.14 + rand() * 0.03;
				const tone = tones[Math.floor(rand() * tones.length)];
				const cx = row.to - 0.1 + (rand() - 0.5) * 0.02;
				const cy = y + w / 2;
				covers.push({
					position: [cx, cy, 0],
					rotation: [0, (rand() - 0.5) * 0.2, Math.PI / 2],
					scale: [w, h, d],
					color: tone
				});
				pages.push({
					position: [cx, cy, -0.006],
					rotation: [0, 0, Math.PI / 2],
					scale: [w - 0.004, h - 0.012, d - 0.008]
				});
				y += w;
			}
		}
	}
</script>

<Instances
	geometry={coverGeometry}
	material={coverMaterial}
	items={covers}
	castShadow
	receiveShadow
/>
<Instances geometry={pageGeometry} material={pageMaterial} items={pages} />
<Instances geometry={bandGeometry} material={bandMaterial} items={bands} />
