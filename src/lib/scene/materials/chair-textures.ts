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

function canvas(size: number) {
	const c = document.createElement('canvas');
	c.width = size;
	c.height = size;
	const ctx = c.getContext('2d');
	if (!ctx) throw new Error('2d context unavailable');
	return { c, ctx };
}

function finish(c: HTMLCanvasElement, repeat: number, srgb: boolean) {
	const t = new CanvasTexture(c);
	if (srgb) t.colorSpace = SRGBColorSpace;
	t.wrapS = RepeatWrapping;
	t.wrapT = RepeatWrapping;
	t.repeat.set(repeat, repeat);
	t.anisotropy = 8;
	return t;
}

export function createTwillMaps(size = 256, repeat = 2.5) {
	const rand = mulberry(37);
	const albedo = canvas(size);
	const bump = canvas(size);
	const a = albedo.ctx.createImageData(size, size);
	const b = bump.ctx.createImageData(size, size);
	const period = 12;
	for (let y = 0; y < size; y++) {
		for (let x = 0; x < size; x++) {
			const i = (y * size + x) * 4;
			const diag = ((x + y * 2) % period) / period;
			const ridge = Math.pow(Math.sin(diag * Math.PI), 1.6);
			const thread = 0.6 + 0.4 * Math.pow(Math.sin((x / period) * Math.PI * 2), 2);
			const fibre = 1 + (rand() - 0.5) * 0.14;
			const h = (0.35 + ridge * 0.5) * thread;
			const v = (128 + (h - 0.5) * 230) * fibre;
			a.data[i] = v * 0.93;
			a.data[i + 1] = v * 0.95;
			a.data[i + 2] = v;
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
	return { map: finish(albedo.c, repeat, true), bumpMap: finish(bump.c, repeat, false) };
}

export function createMeshWeaveMaps(size = 128, repeat = 40) {
	const rand = mulberry(53);
	const alpha = canvas(size);
	const color = canvas(size);
	const cells = 4;
	const cell = size / cells;
	const thread = cell * 0.34;
	alpha.ctx.fillStyle = '#000000';
	alpha.ctx.fillRect(0, 0, size, size);
	color.ctx.fillStyle = '#000000';
	color.ctx.fillRect(0, 0, size, size);
	for (let k = 0; k < cells; k++) {
		const p = k * cell;
		alpha.ctx.fillStyle = '#ffffff';
		alpha.ctx.fillRect(p, 0, thread, size);
		alpha.ctx.fillRect(0, p, size, thread);
		const g1 = color.ctx.createLinearGradient(p, 0, p + thread, 0);
		g1.addColorStop(0, '#5e6470');
		g1.addColorStop(0.5, '#9aa2b0');
		g1.addColorStop(1, '#5e6470');
		color.ctx.fillStyle = g1;
		color.ctx.fillRect(p, 0, thread, size);
		const g2 = color.ctx.createLinearGradient(0, p, 0, p + thread);
		g2.addColorStop(0, '#555b66');
		g2.addColorStop(0.5, '#8c94a2');
		g2.addColorStop(1, '#555b66');
		color.ctx.fillStyle = g2;
		for (let j = 0; j < cells; j++) {
			const q = j * cell;
			if ((j + k) % 2 === 0) color.ctx.fillRect(q, p, thread, thread);
			else color.ctx.fillRect(q + thread, p, cell - thread, thread);
		}
	}
	const image = color.ctx.getImageData(0, 0, size, size);
	for (let i = 0; i < image.data.length; i += 4) {
		const n = 1 + (rand() - 0.5) * 0.12;
		image.data[i] *= n;
		image.data[i + 1] *= n;
		image.data[i + 2] *= n;
	}
	color.ctx.putImageData(image, 0, 0);
	return { alphaMap: finish(alpha.c, repeat, false), map: finish(color.c, repeat, true) };
}

export function createGrainBump(size = 128, repeat = 12, amount = 0.5) {
	const rand = mulberry(71);
	const { c, ctx } = canvas(size);
	const image = ctx.createImageData(size, size);
	for (let i = 0; i < image.data.length; i += 4) {
		const v = 128 + (rand() - 0.5) * 255 * amount;
		image.data[i] = v;
		image.data[i + 1] = v;
		image.data[i + 2] = v;
		image.data[i + 3] = 255;
	}
	ctx.putImageData(image, 0, 0);
	return finish(c, repeat, false);
}
