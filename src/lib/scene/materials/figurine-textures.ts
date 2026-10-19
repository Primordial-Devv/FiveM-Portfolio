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

function finish(c: HTMLCanvasElement, srgb: boolean) {
	const t = new CanvasTexture(c);
	if (srgb) t.colorSpace = SRGBColorSpace;
	t.wrapS = RepeatWrapping;
	t.wrapT = RepeatWrapping;
	t.anisotropy = 8;
	return t;
}

type Rgb = [number, number, number];

export function createWoodGrainTexture(light: Rgb, dark: Rgb, seed = 1, size = 256) {
	const { c, ctx } = canvas(size);
	const rand = mulberry(seed);
	const image = ctx.createImageData(size, size);
	const cx = size * (0.2 + rand() * 0.6);
	const cy = size * (1.6 + rand());
	const rings = 18 + rand() * 10;
	for (let y = 0; y < size; y++) {
		for (let x = 0; x < size; x++) {
			const i = (y * size + x) * 4;
			const dx = (x - cx) / size;
			const dy = (y - cy) / size;
			const dist = Math.sqrt(dx * dx + dy * dy * 0.35);
			const wobble = Math.sin(x * 0.11) * 0.012 + Math.sin(y * 0.07 + x * 0.03) * 0.01;
			const ring = Math.pow(0.5 + 0.5 * Math.sin((dist + wobble) * Math.PI * 2 * rings), 2.2);
			const fibre = (rand() - 0.5) * 0.08;
			const t = Math.min(1, Math.max(0, ring * 0.85 + fibre));
			image.data[i] = light[0] + (dark[0] - light[0]) * t;
			image.data[i + 1] = light[1] + (dark[1] - light[1]) * t;
			image.data[i + 2] = light[2] + (dark[2] - light[2]) * t;
			image.data[i + 3] = 255;
		}
	}
	ctx.putImageData(image, 0, 0);
	return finish(c, true);
}

export function createLeatherTexture(size = 256) {
	const { c, ctx } = canvas(size);
	const rand = mulberry(19);
	ctx.fillStyle = '#2a1d16';
	ctx.fillRect(0, 0, size, size);
	for (let i = 0; i < 2600; i++) {
		const r = 1.2 + rand() * 2.4;
		const l = rand() > 0.5;
		ctx.fillStyle = l ? 'rgba(90,64,48,0.35)' : 'rgba(10,6,4,0.4)';
		ctx.beginPath();
		ctx.arc(rand() * size, rand() * size, r, 0, Math.PI * 2);
		ctx.fill();
	}
	return finish(c, true);
}

export function createStoneTexture(base: Rgb, seed = 7, size = 256) {
	const { c, ctx } = canvas(size);
	const rand = mulberry(seed);
	const image = ctx.createImageData(size, size);
	for (let i = 0; i < image.data.length; i += 4) {
		const n = 0.86 + rand() * 0.28;
		image.data[i] = base[0] * n;
		image.data[i + 1] = base[1] * n;
		image.data[i + 2] = base[2] * n;
		image.data[i + 3] = 255;
	}
	ctx.putImageData(image, 0, 0);
	for (let i = 0; i < 220; i++) {
		const r = 2 + rand() * 14;
		const g = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
		const l = rand() > 0.5;
		g.addColorStop(0, l ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.16)');
		g.addColorStop(1, 'rgba(0,0,0,0)');
		ctx.save();
		ctx.translate(rand() * size, rand() * size);
		ctx.fillStyle = g;
		ctx.fillRect(-r, -r, r * 2, r * 2);
		ctx.restore();
	}
	return finish(c, true);
}

export function createMarbleTexture(size = 256) {
	const { c, ctx } = canvas(size);
	const rand = mulberry(41);
	ctx.fillStyle = '#0d0e11';
	ctx.fillRect(0, 0, size, size);
	ctx.lineCap = 'round';
	for (let i = 0; i < 9; i++) {
		ctx.strokeStyle = `rgba(210,214,222,${0.08 + rand() * 0.25})`;
		ctx.lineWidth = 0.6 + rand() * 1.8;
		ctx.beginPath();
		let x = rand() * size;
		let y = rand() * size;
		ctx.moveTo(x, y);
		for (let k = 0; k < 10; k++) {
			x += (rand() - 0.5) * 70;
			y += (rand() - 0.5) * 70;
			ctx.lineTo(x, y);
		}
		ctx.stroke();
	}
	return finish(c, true);
}

export function createLinenTexture(size = 128) {
	const { c, ctx } = canvas(size);
	const rand = mulberry(23);
	const image = ctx.createImageData(size, size);
	for (let y = 0; y < size; y++) {
		for (let x = 0; x < size; x++) {
			const i = (y * size + x) * 4;
			const weave = ((x % 2) + (y % 2)) % 2 ? 0.94 : 1.0;
			const v = 225 * weave * (0.95 + rand() * 0.1);
			image.data[i] = v;
			image.data[i + 1] = v;
			image.data[i + 2] = v;
			image.data[i + 3] = 255;
		}
	}
	ctx.putImageData(image, 0, 0);
	const t = finish(c, true);
	t.repeat.set(6, 6);
	return t;
}

export function createPagesTexture(size = 128) {
	const { c, ctx } = canvas(size);
	const rand = mulberry(29);
	ctx.fillStyle = '#e6dcc6';
	ctx.fillRect(0, 0, size, size);
	for (let y = 0; y < size; y += 2) {
		ctx.fillStyle = `rgba(90,70,40,${0.08 + rand() * 0.22})`;
		ctx.fillRect(0, y, size, 1);
	}
	const t = finish(c, true);
	t.repeat.set(1, 8);
	return t;
}

export function createSikuDecalTexture(size = 1024) {
	const { c, ctx } = canvas(size);
	ctx.clearRect(0, 0, size, size);
	const cx = size / 2;
	const cy = size / 2;
	const outer = size * 0.19;
	const inner = outer * 0.74;
	const gap = 0.16;
	const start = -Math.PI / 2 + gap;
	const end = -Math.PI / 2 - gap + Math.PI * 2;
	ctx.beginPath();
	ctx.arc(cx, cy, outer, start, end, false);
	ctx.arc(cx, cy, inner, end, start, true);
	ctx.closePath();
	ctx.fillStyle = '#c9ccd2';
	ctx.fill();
	const texture = new CanvasTexture(c);
	texture.colorSpace = SRGBColorSpace;
	texture.anisotropy = 8;
	return texture;
}

export function createPaperTexture(size = 512) {
	const { c, ctx } = canvas(size);
	ctx.fillStyle = '#efe9dc';
	ctx.fillRect(0, 0, size, size);
	const rand = mulberry(47);
	const image = ctx.getImageData(0, 0, size, size);
	for (let i = 0; i < image.data.length; i += 4) {
		const n = (rand() - 0.5) * 10;
		image.data[i] += n;
		image.data[i + 1] += n;
		image.data[i + 2] += n;
	}
	ctx.putImageData(image, 0, 0);
	ctx.strokeStyle = 'rgba(90, 130, 190, 0.22)';
	ctx.lineWidth = 1;
	for (let y = 64; y < size; y += 28) {
		ctx.beginPath();
		ctx.moveTo(40, y);
		ctx.lineTo(size - 32, y);
		ctx.stroke();
	}
	ctx.strokeStyle = 'rgba(200, 80, 90, 0.35)';
	ctx.beginPath();
	ctx.moveTo(72, 24);
	ctx.lineTo(72, size - 24);
	ctx.stroke();
	ctx.strokeStyle = 'rgba(40, 44, 52, 0.55)';
	ctx.lineWidth = 2;
	ctx.lineCap = 'round';
	for (let row = 0; row < 7; row++) {
		const y = 92 + row * 28;
		let x = 86;
		const end = 110 + rand() * 300;
		ctx.beginPath();
		ctx.moveTo(x, y - 4);
		while (x < end) {
			x += 6 + rand() * 10;
			ctx.quadraticCurveTo(x - 4, y - 10 + rand() * 12, x, y - 4 + (rand() - 0.5) * 6);
		}
		ctx.stroke();
	}
	const texture = new CanvasTexture(c);
	texture.colorSpace = SRGBColorSpace;
	texture.anisotropy = 8;
	return texture;
}
