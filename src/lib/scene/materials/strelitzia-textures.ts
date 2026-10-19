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

export function createStrelitziaLeafTexture(width = 256, height = 512) {
	const canvas = document.createElement('canvas');
	canvas.width = width;
	canvas.height = height;
	const ctx = canvas.getContext('2d');
	if (!ctx) throw new Error('2d context unavailable');
	const rand = mulberry(61);
	const image = ctx.createImageData(width, height);
	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			const i = (y * width + x) * 4;
			const u = x / width - 0.5;
			const v = y / height;
			const vein = 0.5 + 0.5 * Math.sin((Math.abs(u) * 2.2 + v * 0.9) * Math.PI * 2 * 26);
			const veinShade = 0.92 + Math.pow(vein, 6) * 0.16;
			const edge = 1 - Math.pow(Math.abs(u) * 2, 4) * 0.2;
			const age = 0.9 + v * 0.1;
			const n = (rand() - 0.5) * 0.05;
			const k = veinShade * edge * age + n;
			image.data[i] = 24 * k;
			image.data[i + 1] = 58 * k;
			image.data[i + 2] = 30 * k;
			image.data[i + 3] = 255;
		}
	}
	ctx.putImageData(image, 0, 0);
	const rib = ctx.createLinearGradient(width / 2 - 6, 0, width / 2 + 6, 0);
	rib.addColorStop(0, 'rgba(120,150,80,0)');
	rib.addColorStop(0.5, 'rgba(140,170,90,0.55)');
	rib.addColorStop(1, 'rgba(120,150,80,0)');
	ctx.fillStyle = rib;
	ctx.fillRect(width / 2 - 6, 0, 12, height);
	const texture = new CanvasTexture(canvas);
	texture.colorSpace = SRGBColorSpace;
	texture.anisotropy = 8;
	return texture;
}
