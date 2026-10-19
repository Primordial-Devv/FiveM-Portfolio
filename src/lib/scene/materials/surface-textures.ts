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

function finish(canvas: HTMLCanvasElement, repeatX: number, repeatY: number, srgb: boolean) {
	const texture = new CanvasTexture(canvas);
	if (srgb) texture.colorSpace = SRGBColorSpace;
	texture.wrapS = RepeatWrapping;
	texture.wrapT = RepeatWrapping;
	texture.repeat.set(repeatX, repeatY);
	texture.anisotropy = 8;
	return texture;
}

export function createGlowTexture(size = 128) {
	const canvas = document.createElement('canvas');
	canvas.width = size;
	canvas.height = size;
	const ctx = canvas.getContext('2d');
	if (ctx) {
		const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
		g.addColorStop(0, 'rgba(255,255,255,0.5)');
		g.addColorStop(0.2, 'rgba(255,255,255,0.42)');
		g.addColorStop(0.5, 'rgba(255,255,255,0.18)');
		g.addColorStop(1, 'rgba(255,255,255,0)');
		ctx.fillStyle = g;
		ctx.fillRect(0, 0, size, size);
	}
	const texture = new CanvasTexture(canvas);
	texture.colorSpace = SRGBColorSpace;
	return texture;
}

export function createPaintMaps(size = 512, repeat = 6) {
	const albedo = document.createElement('canvas');
	const normal = document.createElement('canvas');
	albedo.width = albedo.height = size;
	normal.width = normal.height = size;
	const actx = albedo.getContext('2d');
	const nctx = normal.getContext('2d');
	if (!actx || !nctx) return { map: null, normalMap: null };
	const rand = mulberry(97);
	const height = new Float32Array(size * size);
	for (let i = 0; i < height.length; i++) height[i] = rand();
	const soft = new Float32Array(size * size);
	for (let y = 0; y < size; y++) {
		for (let x = 0; x < size; x++) {
			let sum = 0;
			for (let dy = -1; dy <= 1; dy++) {
				for (let dx = -1; dx <= 1; dx++) {
					sum += height[((y + dy + size) % size) * size + ((x + dx + size) % size)];
				}
			}
			soft[y * size + x] = sum / 9;
		}
	}
	const a = actx.createImageData(size, size);
	const n = nctx.createImageData(size, size);
	const at = (x: number, y: number) => soft[((y + size) % size) * size + ((x + size) % size)];
	for (let y = 0; y < size; y++) {
		for (let x = 0; x < size; x++) {
			const i = (y * size + x) * 4;
			const h = at(x, y);
			const v = 236 + (h - 0.5) * 14;
			a.data[i] = v;
			a.data[i + 1] = v;
			a.data[i + 2] = v * 0.99;
			a.data[i + 3] = 255;
			const dx = (at(x + 1, y) - at(x - 1, y)) * 1.5;
			const dy = (at(x, y + 1) - at(x, y - 1)) * 1.5;
			const len = Math.hypot(dx, dy, 1);
			n.data[i] = ((-dx / len) * 0.5 + 0.5) * 255;
			n.data[i + 1] = ((dy / len) * 0.5 + 0.5) * 255;
			n.data[i + 2] = ((1 / len) * 0.5 + 0.5) * 255;
			n.data[i + 3] = 255;
		}
	}
	actx.putImageData(a, 0, 0);
	nctx.putImageData(n, 0, 0);
	return {
		map: finish(albedo, repeat, repeat, true),
		normalMap: finish(normal, repeat, repeat, false)
	};
}
