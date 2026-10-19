import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from 'three';

function mulberry(seed: number) {
	return () => {
		seed |= 0;
		seed = (seed + 0x6d2b79f5) | 0;
		let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

function canvas(width: number, height: number) {
	const c = document.createElement('canvas');
	c.width = width;
	c.height = height;
	const ctx = c.getContext('2d');
	if (!ctx) throw new Error('2d context unavailable');
	return { c, ctx };
}

function finish(c: HTMLCanvasElement, repeatX: number, repeatY: number, srgb: boolean) {
	const t = new CanvasTexture(c);
	if (srgb) t.colorSpace = SRGBColorSpace;
	t.wrapS = RepeatWrapping;
	t.wrapT = RepeatWrapping;
	t.repeat.set(repeatX, repeatY);
	t.anisotropy = 8;
	return t;
}

export function createLaminateMaps(width = 512, height = 256, repeatX = 3, repeatY = 1.2) {
	const rand = mulberry(89);
	const albedo = canvas(width, height);
	const rough = canvas(width, height);
	const a = albedo.ctx.createImageData(width, height);
	const r = rough.ctx.createImageData(width, height);
	const rows = new Float32Array(height);
	for (let y = 0; y < height; y++) rows[y] = (rand() - 0.5) * 0.14;
	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			const i = (y * width + x) * 4;
			const grain = rows[y] + Math.sin(x * 0.05 + y * 0.9) * 0.02 + (rand() - 0.5) * 0.05;
			const k = 1 + grain;
			a.data[i] = 38 * k;
			a.data[i + 1] = 40 * k;
			a.data[i + 2] = 45 * k;
			a.data[i + 3] = 255;
			const rv = (0.48 + grain * 0.9 + (rand() - 0.5) * 0.08) * 255;
			r.data[i] = rv;
			r.data[i + 1] = rv;
			r.data[i + 2] = rv;
			r.data[i + 3] = 255;
		}
	}
	albedo.ctx.putImageData(a, 0, 0);
	rough.ctx.putImageData(r, 0, 0);
	return {
		map: finish(albedo.c, repeatX, repeatY, true),
		roughnessMap: finish(rough.c, repeatX, repeatY, false)
	};
}

export function createPowderCoatBump(size = 128, repeat = 10) {
	const rand = mulberry(97);
	const { c, ctx } = canvas(size, size);
	const image = ctx.createImageData(size, size);
	for (let i = 0; i < image.data.length; i += 4) {
		const v = 128 + (rand() - 0.5) * 90;
		image.data[i] = v;
		image.data[i + 1] = v;
		image.data[i + 2] = v;
		image.data[i + 3] = 255;
	}
	ctx.putImageData(image, 0, 0);
	return finish(c, repeat, repeat, false);
}

export function createMousepadMaps(size = 256, repeatX = 18, repeatY = 6) {
	const rand = mulberry(113);
	const albedo = canvas(size, size);
	const bump = canvas(size, size);
	const a = albedo.ctx.createImageData(size, size);
	const b = bump.ctx.createImageData(size, size);
	const cell = 4;
	for (let y = 0; y < size; y++) {
		for (let x = 0; x < size; x++) {
			const i = (y * size + x) * 4;
			const wx = Math.pow(Math.sin((x / cell) * Math.PI), 2);
			const wy = Math.pow(Math.sin((y / cell) * Math.PI), 2);
			const weave =
				0.55 + ((0.45 * Math.max(wx, wy) * (((x / cell) | 0) + ((y / cell) | 0))) % 2) ? 1 : 0.85;
			const h = (0.4 + 0.6 * Math.max(wx, wy)) * weave;
			const n = 1 + (rand() - 0.5) * 0.1;
			const v = 6 + h * 9 * n;
			a.data[i] = v;
			a.data[i + 1] = v * 1.05;
			a.data[i + 2] = v * 1.2;
			a.data[i + 3] = 255;
			const bv = h * 255;
			b.data[i] = bv;
			b.data[i + 1] = bv;
			b.data[i + 2] = bv;
			b.data[i + 3] = 255;
		}
	}
	albedo.ctx.putImageData(a, 0, 0);
	bump.ctx.putImageData(b, 0, 0);
	return {
		map: finish(albedo.c, repeatX, repeatY, true),
		bumpMap: finish(bump.c, repeatX, repeatY, false)
	};
}

export function createBurntWoodMaps(width = 512, height = 256, repeatX = 3, repeatY = 1.1) {
	const rand = mulberry(131);
	const albedo = canvas(width, height);
	const rough = canvas(width, height);
	const bump = canvas(width, height);
	const a = albedo.ctx.createImageData(width, height);
	const r = rough.ctx.createImageData(width, height);
	const b = bump.ctx.createImageData(width, height);
	const cy = height * (1.4 + rand() * 0.6);
	const crackRows = new Float32Array(height);
	for (let y = 0; y < height; y++) crackRows[y] = rand();
	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			const i = (y * width + x) * 4;
			const dy = (y - cy) / height;
			const dx = (x - width * 0.5) / width;
			const dist = Math.sqrt(dy * dy + dx * dx * 0.08);
			const wobble = Math.sin(x * 0.04) * 0.01 + Math.sin(x * 0.013 + y * 0.05) * 0.008;
			const ring = Math.pow(0.5 + 0.5 * Math.sin((dist + wobble) * Math.PI * 2 * 22), 1.6);
			const crack = Math.pow(Math.max(0, Math.sin((x / 9 + crackRows[y] * 3) * Math.PI)), 14);
			const char = Math.min(1, ring * 0.7 + crack * 0.6 + (rand() - 0.5) * 0.12);
			const base = 5 + (1 - char) * 9;
			a.data[i] = base + char * 2;
			a.data[i + 1] = base * 0.96;
			a.data[i + 2] = base * 0.9;
			a.data[i + 3] = 255;
			const rv = (0.3 + char * 0.45 + (rand() - 0.5) * 0.06) * 255;
			r.data[i] = rv;
			r.data[i + 1] = rv;
			r.data[i + 2] = rv;
			r.data[i + 3] = 255;
			const bv = (0.65 - crack * 0.5 - ring * 0.15) * 255;
			b.data[i] = bv;
			b.data[i + 1] = bv;
			b.data[i + 2] = bv;
			b.data[i + 3] = 255;
		}
	}
	albedo.ctx.putImageData(a, 0, 0);
	rough.ctx.putImageData(r, 0, 0);
	bump.ctx.putImageData(b, 0, 0);
	return {
		map: finish(albedo.c, repeatX, repeatY, true),
		roughnessMap: finish(rough.c, repeatX, repeatY, false),
		bumpMap: finish(bump.c, repeatX, repeatY, false)
	};
}
