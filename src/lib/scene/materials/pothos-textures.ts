import { CanvasTexture, SRGBColorSpace } from 'three';

function mulberry(seed: number) {
	return () => {
		seed |= 0;
		seed = (seed + 0x6d2b79f5) | 0;
		let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

function valueNoise(rand: () => number, cells: number) {
	const lattice = new Float32Array(cells * cells);
	for (let i = 0; i < lattice.length; i++) lattice[i] = rand();
	return (u: number, v: number) => {
		const gx = u * cells;
		const gy = v * cells;
		const x0 = Math.floor(gx) % cells;
		const y0 = Math.floor(gy) % cells;
		let fx = gx - Math.floor(gx);
		let fy = gy - Math.floor(gy);
		fx = fx * fx * (3 - 2 * fx);
		fy = fy * fy * (3 - 2 * fy);
		const x1 = (x0 + 1) % cells;
		const y1 = (y0 + 1) % cells;
		const a = lattice[y0 * cells + x0];
		const b = lattice[y0 * cells + x1];
		const c = lattice[y1 * cells + x0];
		const d = lattice[y1 * cells + x1];
		return a + (b - a) * fx + (c - a + (a - b + d - c) * fx) * fy;
	};
}

export function createPothosLeafTexture(size = 256) {
	const canvas = document.createElement('canvas');
	canvas.width = size;
	canvas.height = size;
	const ctx = canvas.getContext('2d');
	if (!ctx) throw new Error('2d context unavailable');
	const rand = mulberry(83);
	const coarse = valueNoise(rand, 4);
	const medium = valueNoise(rand, 9);
	const fine = valueNoise(rand, 24);
	const image = ctx.createImageData(size, size);
	for (let y = 0; y < size; y++) {
		for (let x = 0; x < size; x++) {
			const i = (y * size + x) * 4;
			const u = x / size;
			const v = y / size;
			const blotch = coarse(u, v) * 0.55 + medium(u, v) * 0.3 + fine(u, v) * 0.15;
			const variegation = Math.pow(Math.max(0, blotch - 0.42) / 0.58, 1.6) * 0.75;
			const n = (rand() - 0.5) * 0.05;
			const g = [38, 84, 42];
			const y1 = [160, 176, 82];
			const r = g[0] + (y1[0] - g[0]) * variegation;
			const gg = g[1] + (y1[1] - g[1]) * variegation;
			const b = g[2] + (y1[2] - g[2]) * variegation;
			const shade = 0.86 + (1 - Math.abs(u - 0.5) * 1.6) * 0.14 + n;
			image.data[i] = r * shade;
			image.data[i + 1] = gg * shade;
			image.data[i + 2] = b * shade;
			image.data[i + 3] = 255;
		}
	}
	ctx.putImageData(image, 0, 0);
	ctx.strokeStyle = 'rgba(210,225,150,0.35)';
	ctx.lineWidth = 2.5;
	ctx.beginPath();
	ctx.moveTo(size / 2, size);
	ctx.lineTo(size / 2, size * 0.06);
	ctx.stroke();
	ctx.lineWidth = 1.2;
	ctx.strokeStyle = 'rgba(200,220,140,0.22)';
	for (let k = 0; k < 7; k++) {
		const y0 = size * (0.18 + k * 0.11);
		for (const dir of [-1, 1]) {
			ctx.beginPath();
			ctx.moveTo(size / 2, y0);
			ctx.quadraticCurveTo(
				size / 2 + dir * size * 0.2,
				y0 - size * 0.08,
				size / 2 + dir * size * 0.44,
				y0 - size * 0.16
			);
			ctx.stroke();
		}
	}
	const texture = new CanvasTexture(canvas);
	texture.colorSpace = SRGBColorSpace;
	texture.anisotropy = 8;
	return texture;
}
