import { CanvasTexture, SRGBColorSpace } from 'three';

export type ScreenKind = 'left' | 'center' | 'right';

const W = 1024;
const H = 576;
const SCALE = 1.5;
const accent = '#6cb6f6';
const violet = '#a18cff';

function panel(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
	ctx.fillStyle = 'rgba(255,255,255,0.045)';
	ctx.strokeStyle = 'rgba(255,255,255,0.09)';
	ctx.beginPath();
	ctx.roundRect(x, y, w, h, 10);
	ctx.fill();
	ctx.stroke();
}

function line(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, alpha = 0.3) {
	ctx.fillStyle = `rgba(255,255,255,${alpha})`;
	ctx.beginPath();
	ctx.roundRect(x, y, w, 8, 4);
	ctx.fill();
}

function base(ctx: CanvasRenderingContext2D) {
	const bg = ctx.createLinearGradient(0, 0, 0, H);
	bg.addColorStop(0, '#0c0f15');
	bg.addColorStop(1, '#07090d');
	ctx.fillStyle = bg;
	ctx.fillRect(0, 0, W, H);
	const haze = ctx.createRadialGradient(W / 2, -40, 20, W / 2, -40, 520);
	haze.addColorStop(0, 'rgba(108,182,246,0.16)');
	haze.addColorStop(1, 'rgba(108,182,246,0)');
	ctx.fillStyle = haze;
	ctx.fillRect(0, 0, W, H);
	ctx.fillStyle = 'rgba(255,255,255,0.05)';
	ctx.fillRect(0, 52, W, 1);
	ctx.fillStyle = accent;
	ctx.beginPath();
	ctx.roundRect(28, 20, 12, 12, 3);
	ctx.fill();
	line(ctx, 52, 22, 90, 0.55);
	line(ctx, W - 140, 22, 24, 0.25);
	line(ctx, W - 104, 22, 24, 0.25);
	line(ctx, W - 68, 22, 40, 0.25);
}

function drawLeft(ctx: CanvasRenderingContext2D) {
	base(ctx);
	panel(ctx, 28, 80, 240, H - 110);
	for (let i = 0; i < 7; i++) {
		line(ctx, 52, 112 + i * 44, 90 + ((i * 37) % 70), i === 1 ? 0.8 : 0.3);
		if (i === 1) {
			ctx.fillStyle = accent;
			ctx.fillRect(28, 104 + i * 44, 3, 26);
		}
	}
	panel(ctx, 292, 80, W - 320, H - 110);
	ctx.strokeStyle = 'rgba(108,182,246,0.5)';
	ctx.lineWidth = 2;
	ctx.beginPath();
	for (let i = 0; i <= 24; i++) {
		const x = 320 + i * ((W - 376) / 24);
		const y = 360 - Math.sin(i * 0.55) * 60 - Math.cos(i * 1.3) * 30;
		if (i === 0) ctx.moveTo(x, y);
		else ctx.lineTo(x, y);
	}
	ctx.stroke();
	for (let i = 0; i < 4; i++) line(ctx, 320, 440 + i * 24, 180 - i * 30, 0.2);
}

function drawCenter(ctx: CanvasRenderingContext2D) {
	base(ctx);
	ctx.fillStyle = 'rgba(255,255,255,0.92)';
	ctx.font = '600 44px Inter, system-ui, sans-serif';
	ctx.fillText('FIVEM', 72, 220);
	ctx.fillText('DEVELOPMENT', 72, 274);
	ctx.font = '500 15px Inter, system-ui, sans-serif';
	ctx.fillStyle = 'rgba(255,255,255,0.45)';
	ctx.fillText('SCRIPTS   ·   MAPS   ·   SYSTEMS   ·   OPTIMISATION', 74, 318);
	ctx.strokeStyle = 'rgba(158,208,251,0.35)';
	ctx.lineWidth = 1.5;
	let seed = 7;
	const rand = () => {
		seed = (seed * 9301 + 49297) % 233280;
		return seed / 233280;
	};
	for (let i = 0; i < 36; i++) {
		const x1 = 600 + rand() * 380;
		const y1 = 110 + rand() * 380;
		ctx.beginPath();
		ctx.moveTo(x1, y1);
		ctx.lineTo(x1 + (rand() - 0.5) * 160, y1 + (rand() - 0.5) * 160);
		ctx.stroke();
		ctx.fillStyle = i % 5 === 0 ? accent : 'rgba(255,255,255,0.5)';
		ctx.beginPath();
		ctx.arc(x1, y1, i % 5 === 0 ? 4 : 2, 0, Math.PI * 2);
		ctx.fill();
	}
	const glow = ctx.createRadialGradient(790, 300, 10, 790, 300, 260);
	glow.addColorStop(0, 'rgba(108,182,246,0.18)');
	glow.addColorStop(1, 'rgba(108,182,246,0)');
	ctx.fillStyle = glow;
	ctx.fillRect(560, 70, 440, 460);
}

function drawRight(ctx: CanvasRenderingContext2D) {
	base(ctx);
	line(ctx, 40, 84, 150, 0.6);
	ctx.fillStyle = '#5ad19a';
	ctx.beginPath();
	ctx.arc(W - 60, 88, 5, 0, Math.PI * 2);
	ctx.fill();
	const cells = [
		['Players', 0.5],
		['Uptime', 0.98],
		['CPU', 0.24],
		['Memory', 0.42]
	] as const;
	cells.forEach(([label, ratio], i) => {
		const x = 40 + (i % 2) * 480;
		const y = 120 + Math.floor(i / 2) * 210;
		panel(ctx, x, y, 450, 180);
		ctx.fillStyle = 'rgba(255,255,255,0.5)';
		ctx.font = '500 16px Inter, system-ui, sans-serif';
		ctx.fillText(label.toUpperCase(), x + 24, y + 40);
		ctx.fillStyle = 'rgba(255,255,255,0.92)';
		ctx.font = '600 38px Inter, system-ui, sans-serif';
		ctx.fillText(`${Math.round(ratio * 100)}%`, x + 24, y + 92);
		ctx.strokeStyle = i % 2 ? violet : accent;
		ctx.lineWidth = 2;
		ctx.beginPath();
		for (let k = 0; k <= 20; k++) {
			const px = x + 24 + k * 20;
			const py = y + 150 - Math.abs(Math.sin(k * 0.7 + i)) * 36 * ratio - 6;
			if (k === 0) ctx.moveTo(px, py);
			else ctx.lineTo(px, py);
		}
		ctx.stroke();
	});
}

const painters: Record<ScreenKind, (ctx: CanvasRenderingContext2D) => void> = {
	left: drawLeft,
	center: drawCenter,
	right: drawRight
};

export function createScreenTexture(kind: ScreenKind) {
	const canvas = document.createElement('canvas');
	canvas.width = W * SCALE;
	canvas.height = H * SCALE;
	const ctx = canvas.getContext('2d');
	if (ctx) {
		ctx.scale(SCALE, SCALE);
		painters[kind](ctx);
	}
	const texture = new CanvasTexture(canvas);
	texture.colorSpace = SRGBColorSpace;
	texture.anisotropy = 4;
	return texture;
}
