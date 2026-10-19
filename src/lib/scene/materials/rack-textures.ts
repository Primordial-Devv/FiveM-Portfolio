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

export function createBrushedMaps(width = 512, height = 64) {
	const rand = mulberry(5);
	const albedo = canvas(width, height);
	const rough = canvas(width, height);
	const a = albedo.ctx.createImageData(width, height);
	const r = rough.ctx.createImageData(width, height);
	const rows = new Float32Array(height);
	for (let y = 0; y < height; y++) rows[y] = (rand() - 0.5) * 0.18;
	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			const i = (y * width + x) * 4;
			const streak = rows[y] + (rand() - 0.5) * 0.06;
			const v = 150 * (1 + streak);
			a.data[i] = v;
			a.data[i + 1] = v * 1.03;
			a.data[i + 2] = v * 1.08;
			a.data[i + 3] = 255;
			const rv = (0.42 + streak * 0.9 + (rand() - 0.5) * 0.08) * 255;
			r.data[i] = rv;
			r.data[i + 1] = rv;
			r.data[i + 2] = rv;
			r.data[i + 3] = 255;
		}
	}
	albedo.ctx.putImageData(a, 0, 0);
	rough.ctx.putImageData(r, 0, 0);
	const map = new CanvasTexture(albedo.c);
	map.colorSpace = SRGBColorSpace;
	map.wrapS = RepeatWrapping;
	map.wrapT = RepeatWrapping;
	map.anisotropy = 8;
	const roughnessMap = new CanvasTexture(rough.c);
	roughnessMap.wrapS = RepeatWrapping;
	roughnessMap.wrapT = RepeatWrapping;
	roughnessMap.anisotropy = 8;
	return { map, roughnessMap };
}

export function createGrilleTexture(cols = 40, rows = 4, cell = 12) {
	const { c, ctx } = canvas(cols * cell, rows * cell);
	ctx.fillStyle = '#343a44';
	ctx.fillRect(0, 0, c.width, c.height);
	ctx.fillStyle = '#05060a';
	for (let y = 0; y < rows; y++) {
		for (let x = 0; x < cols; x++) {
			const cx = x * cell + cell / 2 + (y % 2 ? cell / 2 : 0);
			const cy = y * cell + cell / 2;
			ctx.beginPath();
			ctx.arc(cx, cy, cell * 0.33, 0, Math.PI * 2);
			ctx.fill();
		}
	}
	const texture = new CanvasTexture(c);
	texture.colorSpace = SRGBColorSpace;
	texture.wrapS = RepeatWrapping;
	texture.wrapT = RepeatWrapping;
	texture.anisotropy = 8;
	return texture;
}

export function createGrilleAlpha(cells = 24, cell = 12) {
	const { c, ctx } = canvas(cells * cell, cells * cell);
	ctx.fillStyle = '#ffffff';
	ctx.fillRect(0, 0, c.width, c.height);
	ctx.fillStyle = '#000000';
	for (let y = 0; y < cells; y++) {
		for (let x = 0; x < cells; x++) {
			const cx = x * cell + cell / 2 + (y % 2 ? cell / 2 : 0);
			const cy = y * cell + cell / 2;
			ctx.beginPath();
			ctx.arc(cx, cy, cell * 0.4, 0, Math.PI * 2);
			ctx.fill();
		}
	}
	const texture = new CanvasTexture(c);
	texture.wrapS = RepeatWrapping;
	texture.wrapT = RepeatWrapping;
	return texture;
}
