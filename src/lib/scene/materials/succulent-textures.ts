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

const mix = (a: number[], b: number[], t: number) => a.map((v, i) => v + (b[i] - v) * t);

export function createLeafTexture(width = 128, height = 256) {
	const { c, ctx } = canvas(width, height);
	const rand = mulberry(31);
	const base = [150, 182, 168];
	const mid = [184, 206, 200];
	const tip = [196, 190, 194];
	const image = ctx.createImageData(width, height);
	for (let y = 0; y < height; y++) {
		const v = y / height;
		const color =
			v < 0.55 ? mix(base, mid, v / 0.55) : mix(mid, tip, Math.pow((v - 0.55) / 0.45, 1.3));
		for (let x = 0; x < width; x++) {
			const u = (x / width) * 2 - 1;
			const edge = 1 - Math.pow(Math.abs(u), 3) * 0.25;
			const bloom = 1 + (rand() - 0.5) * 0.05;
			const i = (y * width + x) * 4;
			const col = color.map((k) => k * edge * bloom);
			image.data[i] = col[0];
			image.data[i + 1] = col[1];
			image.data[i + 2] = col[2];
			image.data[i + 3] = 255;
		}
	}
	ctx.putImageData(image, 0, 0);
	ctx.strokeStyle = 'rgba(255,255,255,0.05)';
	ctx.lineWidth = 1;
	for (let i = 0; i < 18; i++) {
		const x = rand() * width;
		ctx.beginPath();
		ctx.moveTo(x, height);
		ctx.quadraticCurveTo(
			x + (rand() - 0.5) * 10,
			height * 0.5,
			width / 2 + (x - width / 2) * 0.3,
			0
		);
		ctx.stroke();
	}
	const texture = new CanvasTexture(c);
	texture.colorSpace = SRGBColorSpace;
	texture.anisotropy = 8;
	return texture;
}

export function createSoilTexture(size = 128) {
	const { c, ctx } = canvas(size, size);
	const rand = mulberry(53);
	const image = ctx.createImageData(size, size);
	for (let i = 0; i < image.data.length; i += 4) {
		const n = 0.6 + rand() * 0.6;
		image.data[i] = 30 * n;
		image.data[i + 1] = 24 * n;
		image.data[i + 2] = 19 * n;
		image.data[i + 3] = 255;
	}
	ctx.putImageData(image, 0, 0);
	for (let i = 0; i < 90; i++) {
		const r = 1 + rand() * 2.5;
		const l = 70 + rand() * 60;
		ctx.fillStyle = `rgb(${l},${l * 0.95},${l * 0.88})`;
		ctx.beginPath();
		ctx.arc(rand() * size, rand() * size, r, 0, Math.PI * 2);
		ctx.fill();
	}
	const texture = new CanvasTexture(c);
	texture.colorSpace = SRGBColorSpace;
	texture.wrapS = RepeatWrapping;
	texture.wrapT = RepeatWrapping;
	return texture;
}

export function createPotTexture(size = 256) {
	const { c, ctx } = canvas(size, size);
	const rand = mulberry(71);
	const image = ctx.createImageData(size, size);
	for (let y = 0; y < size; y++) {
		const band = 1 + Math.sin((y / size) * Math.PI * 2 * 9) * 0.025;
		for (let x = 0; x < size; x++) {
			const i = (y * size + x) * 4;
			const n = (0.9 + rand() * 0.2) * band;
			image.data[i] = 186 * n;
			image.data[i + 1] = 104 * n;
			image.data[i + 2] = 72 * n;
			image.data[i + 3] = 255;
		}
	}
	ctx.putImageData(image, 0, 0);
	for (let i = 0; i < 160; i++) {
		const r = 3 + rand() * 22;
		const light = rand() > 0.45;
		const g = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
		g.addColorStop(0, light ? 'rgba(255,230,210,0.14)' : 'rgba(60,25,15,0.16)');
		g.addColorStop(1, 'rgba(0,0,0,0)');
		ctx.save();
		ctx.translate(rand() * size, rand() * size);
		ctx.fillStyle = g;
		ctx.fillRect(-r, -r, r * 2, r * 2);
		ctx.restore();
	}
	const texture = new CanvasTexture(c);
	texture.colorSpace = SRGBColorSpace;
	texture.wrapS = RepeatWrapping;
	texture.wrapT = RepeatWrapping;
	texture.repeat.set(2, 1);
	texture.anisotropy = 8;
	return texture;
}
