import { chromium } from 'playwright';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const input = (name: string) => readFileSync(join(root, 'textures', name)).toString('base64');
const output = (name: string, dataUrl: string) =>
	writeFileSync(join(root, 'src/lib/assets', name), Buffer.from(dataUrl.split(',')[1], 'base64'));

type Job = {
	source: string;
	target: string;
	width: number;
	band: number;
	grain: number;
	seed: number;
	quality: number;
};

const jobs: Job[] = [
	{
		source: 'rug-albedo.jpg',
		target: 'rug-albedo.jpg',
		width: 512,
		band: 0.14,
		grain: 0.22,
		seed: 7,
		quality: 0.85
	},
	{
		source: 'rug-normal.jpg',
		target: 'rug-normal.jpg',
		width: 512,
		band: 0.14,
		grain: 0,
		seed: 0,
		quality: 0.9
	},
	{
		source: 'rug-roughness.jpg',
		target: 'rug-roughness.jpg',
		width: 512,
		band: 0.14,
		grain: 0.16,
		seed: 7,
		quality: 0.8
	},
	{
		source: 'rug-ao.jpg',
		target: 'rug-ao.jpg',
		width: 512,
		band: 0.14,
		grain: 0,
		seed: 0,
		quality: 0.8
	},
	{
		source: 'wall-albedo.jpg',
		target: 'wall-albedo.jpg',
		width: 1024,
		band: 0.08,
		grain: 0.1,
		seed: 11,
		quality: 0.85
	},
	{
		source: 'wall-normal.jpg',
		target: 'wall-normal.jpg',
		width: 1024,
		band: 0.08,
		grain: 0,
		seed: 0,
		quality: 0.9
	},
	{
		source: 'wall-roughness.jpg',
		target: 'wall-roughness.jpg',
		width: 1024,
		band: 0.08,
		grain: 0.1,
		seed: 11,
		quality: 0.8
	},
	{
		source: 'wall-ao.jpg',
		target: 'wall-ao.jpg',
		width: 1024,
		band: 0.08,
		grain: 0,
		seed: 0,
		quality: 0.8
	},
	{
		source: 'wood-albedo.jpg',
		target: 'wood-albedo.jpg',
		width: 512,
		band: 0.06,
		grain: 0,
		seed: 0,
		quality: 0.85
	},
	{
		source: 'wood-normal.jpg',
		target: 'wood-normal.jpg',
		width: 512,
		band: 0.06,
		grain: 0,
		seed: 0,
		quality: 0.9
	},
	{
		source: 'wood-roughness.jpg',
		target: 'wood-roughness.jpg',
		width: 512,
		band: 0.06,
		grain: 0,
		seed: 0,
		quality: 0.8
	},
	{
		source: 'wood-ao.jpg',
		target: 'wood-ao.jpg',
		width: 512,
		band: 0.06,
		grain: 0,
		seed: 0,
		quality: 0.8
	}
];

const pageScript = `
	const mulberry = (seed) => () => {
		seed |= 0;
		seed = (seed + 0x6d2b79f5) | 0;
		let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
	const decode = async (b64, width) => {
		const img = new Image();
		img.src = 'data:image/jpeg;base64,' + b64;
		await img.decode();
		const h = Math.round((img.height / img.width) * width);
		const c = document.createElement('canvas');
		c.width = width;
		c.height = h;
		c.getContext('2d').drawImage(img, 0, 0, width, h);
		return c;
	};
	const seamless = (c, band) => {
		const w = c.width, h = c.height;
		const ctx = c.getContext('2d');
		const src = ctx.getImageData(0, 0, w, h).data;
		const out = ctx.createImageData(w, h);
		const bx = w * band, by = h * band, hx = Math.floor(w / 2), hy = Math.floor(h / 2);
		const weight = (d, b) => { if (d >= b) return 0; const t = 1 - d / b; return t * t * (3 - 2 * t); };
		for (let y = 0; y < h; y++) {
			const wy = weight(Math.min(y, h - 1 - y), by);
			const sy = (y + hy) % h;
			for (let x = 0; x < w; x++) {
				const k = Math.max(weight(Math.min(x, w - 1 - x), bx), wy);
				const i = (y * w + x) * 4;
				const j = (sy * w + ((x + hx) % w)) * 4;
				for (let n = 0; n < 3; n++) out.data[i + n] = src[i + n] + (src[j + n] - src[i + n]) * k;
				out.data[i + 3] = 255;
			}
		}
		ctx.putImageData(out, 0, 0);
		return c;
	};
	const grain = (c, amount, seed) => {
		if (!amount) return c;
		const ctx = c.getContext('2d');
		const image = ctx.getImageData(0, 0, c.width, c.height);
		const rand = mulberry(seed);
		for (let i = 0; i < image.data.length; i += 4) {
			const n = 1 + (rand() - 0.5) * amount;
			image.data[i] *= n; image.data[i + 1] *= n; image.data[i + 2] *= n;
		}
		ctx.putImageData(image, 0, 0);
		return c;
	};
	window.bakeMap = async (job) => {
		const c = grain(seamless(await decode(job.b64, job.width), job.band), job.grain, job.seed);
		return c.toDataURL('image/jpeg', job.quality);
	};
	window.bakeFloor = async (albedoB64, roughB64) => {
		const TILE = 256, TX = 6, TY = 4, W = TILE * TX, H = TILE * TY, grout = 3;
		const tile = (c) => { const t = document.createElement('canvas'); t.width = W; t.height = H; const ctx = t.getContext('2d'); for (let y = 0; y < 2; y++) for (let x = 0; x < 2; x++) ctx.drawImage(c, x * W / 2, y * H / 2, W / 2, H / 2); return t; };
		const albedo = tile(grain(seamless(await decode(albedoB64, 1024), 0.1), 0.16, 3));
		const rough = tile(grain(seamless(await decode(roughB64, 1024), 0.1), 0.2, 5));
		const rand = mulberry(42);
		const variants = Array.from({ length: TX * TY }, () => ({ tone: 0.48 + rand() * 0.24, polish: (rand() - 0.5) * 0.3 }));
		const seam = (x, y, g) => { const lx = x % TILE, ly = y % TILE; const e = Math.min(lx, TILE - lx, ly, TILE - ly); return e < g ? 1 - e / g : 0; };
		const actx = albedo.getContext('2d'), rctx = rough.getContext('2d');
		const ai = actx.getImageData(0, 0, W, H), ri = rctx.getImageData(0, 0, W, H);
		const normal = document.createElement('canvas'); normal.width = W; normal.height = H;
		const nctx = normal.getContext('2d'); const ni = nctx.createImageData(W, H);
		for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
			const i = (y * W + x) * 4;
			const v = variants[Math.floor(y / TILE) * TX + Math.floor(x / TILE)];
			const s = seam(x, y, grout), bevel = seam(x, y, grout * 2);
			const tone = v.tone * (1 - s) + 0.22 * s;
			ai.data[i] *= tone; ai.data[i + 1] *= tone; ai.data[i + 2] *= tone;
			const r = ri.data[i] / 255 + v.polish;
			const rv = Math.min(255, Math.max(0, (r * (1 - s) + 0.95 * s) * 255));
			ri.data[i] = ri.data[i + 1] = ri.data[i + 2] = rv;
			const lx = x % TILE, ly = y % TILE;
			const sx = lx < TILE / 2 ? 1 : -1, sy = ly < TILE / 2 ? 1 : -1;
			const nearX = Math.min(lx, TILE - lx) < Math.min(ly, TILE - ly);
			const slope = bevel * 0.16 * (1 - s);
			ni.data[i] = (0.5 + (nearX ? sx * slope : 0)) * 255;
			ni.data[i + 1] = (0.5 + (nearX ? 0 : -sy * slope)) * 255;
			ni.data[i + 2] = 255 - bevel * 20;
			ni.data[i + 3] = 255;
		}
		actx.putImageData(ai, 0, 0); rctx.putImageData(ri, 0, 0); nctx.putImageData(ni, 0, 0);
		return [albedo.toDataURL('image/jpeg', 0.86), rough.toDataURL('image/jpeg', 0.8), normal.toDataURL('image/jpeg', 0.9)];
	};
`;

type Baker = {
	bakeMap: (job: Job & { b64: string }) => Promise<string>;
	bakeFloor: (albedo: string, rough: string) => Promise<[string, string, string]>;
};

const browser = await chromium.launch();
const page = await browser.newPage();
await page.setContent('<!doctype html><html><body></body></html>');
await page.addScriptTag({ content: pageScript });
for (const job of jobs) {
	const dataUrl = await page.evaluate((j) => (window as unknown as Baker).bakeMap(j), {
		...job,
		b64: input(job.source)
	});
	output(job.target, dataUrl);
	console.log('baked', job.target);
}
const [albedo, rough, normal] = await page.evaluate(
	([a, r]) => (window as unknown as Baker).bakeFloor(a, r),
	[input('floor-albedo.jpg'), input('floor-roughness.jpg')]
);
output('floor-albedo.jpg', albedo);
output('floor-roughness.jpg', rough);
output('floor-normal.jpg', normal);
console.log('baked floor atlas');
await browser.close();
