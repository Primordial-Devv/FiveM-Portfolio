import { CanvasTexture, SRGBColorSpace } from 'three';

export const notebookContent = {
	name: 'Henry Alexandre',
	greeting: "Salut, moi c'est",
	role: 'Développeur FiveM & Web',
	intro: [
		"Développeur passionné avec plus de 10 ans d'expérience entre le développement FiveM, le scripting Lua et les technologies web modernes. Je conçois des expériences de jeu immersives portées par des systèmes serveur solides.",
		"Au fil des années, j'ai mené de nombreux projets : serveurs roleplay, frameworks sur mesure, interfaces NUI et environnements multijoueurs optimisés. Je couvre toute la chaîne, de l'UI/UX côté joueur à l'architecture serveur, en passant par le pilotage des équipes.",
		'Toujours partant pour de nouveaux défis et pour collaborer sur des projets ambitieux qui repoussent les limites du jeu et du web.'
	],
	availability: 'Disponible pour de nouvelles missions',
	skills: [
		{
			icon: 'globe',
			title: 'Web Developer',
			text: 'Applications et interfaces modernes avec Svelte, Vue, TypeScript et Tailwind, du design system au déploiement.'
		},
		{
			icon: 'gamepad',
			title: 'FiveM Developer',
			text: 'Scripting Lua client et serveur, frameworks, métiers et systèmes de gameplay sur mesure, pensés performance.'
		},
		{
			icon: 'cube',
			title: 'Game Developer',
			text: 'Mécaniques de jeu, boucles de progression et économie : des systèmes vivants qui donnent envie de revenir.'
		},
		{
			icon: 'kanban',
			title: 'Project Manager',
			text: 'Cadrage, priorisation et suivi des équipes : des projets livrés dans les temps, avec une vision claire.'
		}
	],
	facts: [
		{ label: 'Expérience', value: '10 ans +' },
		{ label: 'Terrain', value: 'FiveM · Web' },
		{ label: 'Mode', value: 'Freelance' }
	],
	why: 'Je code pour que des joueurs vivent de bons moments ensemble, sans jamais penser à la technique.',
	values: [
		{ title: 'Fiabilité', text: 'Ce que je livre tourne, et continue de tourner soir après soir.' },
		{
			title: 'Clarté',
			text: 'Du code documenté, des décisions expliquées, des équipes autonomes.'
		},
		{
			title: 'Respect du joueur',
			text: 'Des interfaces fluides, zéro friction inutile, zéro triche tolérée.'
		}
	],
	next: 'La suite se trouve plus bas : Projets, puis Expérience.'
};

const W = 1024;
const H = 1424;
const LINE = 56;
const MARGIN = 118;
const INK = '#1e2a3f';
const INK_SOFT = 'rgba(30, 42, 63, 0.72)';
const INK_BODY = 'rgba(30, 42, 63, 0.9)';
const ACCENT = '#2f7fcf';

function mulberry(seed: number) {
	return () => {
		seed |= 0;
		seed = (seed + 0x6d2b79f5) | 0;
		let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

function paper(ctx: CanvasRenderingContext2D, seed: number) {
	ctx.fillStyle = '#f1ecdf';
	ctx.fillRect(0, 0, W, H);
	const rand = mulberry(seed);
	const image = ctx.getImageData(0, 0, W, H);
	for (let i = 0; i < image.data.length; i += 4) {
		const n = (rand() - 0.5) * 9;
		image.data[i] += n;
		image.data[i + 1] += n;
		image.data[i + 2] += n;
	}
	ctx.putImageData(image, 0, 0);
	ctx.strokeStyle = 'rgba(90, 130, 190, 0.2)';
	ctx.lineWidth = 1.5;
	for (let y = 160; y < H - 60; y += LINE) {
		ctx.beginPath();
		ctx.moveTo(60, y);
		ctx.lineTo(W - 56, y);
		ctx.stroke();
	}
	ctx.strokeStyle = 'rgba(205, 86, 96, 0.4)';
	ctx.beginPath();
	ctx.moveTo(MARGIN - 18, 40);
	ctx.lineTo(MARGIN - 18, H - 40);
	ctx.stroke();
}

function font(weight: number, size: number) {
	return `${weight} ${size}px Inter, "Helvetica Neue", system-ui, sans-serif`;
}

function mono(size: number) {
	return `500 ${size}px "JetBrains Mono", "SF Mono", Menlo, monospace`;
}

function wrap(
	ctx: CanvasRenderingContext2D,
	text: string,
	x: number,
	y: number,
	max: number,
	lh: number
) {
	const words = text.split(' ');
	let line = '';
	let cy = y;
	for (const word of words) {
		const test = line ? `${line} ${word}` : word;
		if (ctx.measureText(test).width > max && line) {
			ctx.fillText(line, x, cy);
			line = word;
			cy += lh;
		} else line = test;
	}
	if (line) ctx.fillText(line, x, cy);
	return cy + lh;
}

function header(ctx: CanvasRenderingContext2D, label: string, page: string) {
	ctx.fillStyle = INK_SOFT;
	ctx.font = mono(19);
	ctx.textBaseline = 'alphabetic';
	ctx.fillText(label.toUpperCase(), MARGIN, 92);
	ctx.textAlign = 'right';
	ctx.fillText(page, W - 64, 92);
	ctx.textAlign = 'left';
}

function heading(ctx: CanvasRenderingContext2D, num: string, title: string, y: number) {
	ctx.fillStyle = ACCENT;
	ctx.font = mono(20);
	ctx.fillText(num, MARGIN, y);
	ctx.fillStyle = INK;
	ctx.font = font(700, 40);
	ctx.fillText(title, MARGIN + 54, y + 2);
	ctx.strokeStyle = 'rgba(47, 127, 207, 0.55)';
	ctx.lineWidth = 3;
	ctx.beginPath();
	ctx.moveTo(MARGIN, y + 22);
	ctx.lineTo(MARGIN + 54 + ctx.measureText(title).width, y + 22);
	ctx.stroke();
}

function highlight(
	ctx: CanvasRenderingContext2D,
	text: string,
	x: number,
	y: number,
	size: number
) {
	ctx.font = font(600, size);
	const w = ctx.measureText(text).width;
	ctx.fillStyle = 'rgba(255, 214, 90, 0.55)';
	ctx.beginPath();
	ctx.roundRect(x - 10, y - size * 0.82, w + 20, size * 1.1, 6);
	ctx.fill();
	ctx.fillStyle = INK;
	ctx.fillText(text, x, y);
}

function tape(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, angle: number) {
	ctx.save();
	ctx.translate(x, y);
	ctx.rotate(angle);
	ctx.fillStyle = 'rgba(214, 226, 240, 0.72)';
	ctx.fillRect(-w / 2, -16, w, 32);
	ctx.restore();
}

function photoFrame(ctx: CanvasRenderingContext2D, image: HTMLImageElement | null) {
	const x = MARGIN;
	const y = 180;
	const w = 420;
	const h = 500;
	ctx.save();
	ctx.translate(x + w / 2, y + h / 2);
	ctx.rotate(-0.035);
	ctx.shadowColor = 'rgba(20, 24, 36, 0.28)';
	ctx.shadowBlur = 26;
	ctx.shadowOffsetY = 10;
	ctx.fillStyle = '#fbfaf6';
	ctx.fillRect(-w / 2, -h / 2, w, h);
	ctx.shadowColor = 'transparent';
	const px = -w / 2 + 22;
	const py = -h / 2 + 22;
	const pw = w - 44;
	const ph = h - 96;
	if (image) {
		const scale = Math.max(pw / image.width, ph / image.height);
		const sw = pw / scale;
		const sh = ph / scale;
		ctx.drawImage(image, (image.width - sw) / 2, (image.height - sh) / 2, sw, sh, px, py, pw, ph);
	} else {
		const g = ctx.createLinearGradient(px, py, px + pw, py + ph);
		g.addColorStop(0, '#1b2230');
		g.addColorStop(1, '#2d3a4f');
		ctx.fillStyle = g;
		ctx.fillRect(px, py, pw, ph);
		ctx.fillStyle = 'rgba(255,255,255,0.08)';
		ctx.beginPath();
		ctx.arc(px + pw / 2, py + ph * 0.4, 72, 0, Math.PI * 2);
		ctx.fill();
		ctx.beginPath();
		ctx.ellipse(px + pw / 2, py + ph * 0.86, 130, 95, 0, Math.PI, 0);
		ctx.fill();
		ctx.fillStyle = 'rgba(255,255,255,0.55)';
		ctx.font = mono(18);
		ctx.textAlign = 'center';
		ctx.fillText('PHOTO', px + pw / 2, py + ph - 24);
		ctx.textAlign = 'left';
	}
	ctx.fillStyle = INK_SOFT;
	ctx.font = font(500, 22);
	ctx.fillText('Henry, 2025', px, h / 2 - 30);
	ctx.restore();
	tape(ctx, x + 80, y - 2, 150, -0.35);
	tape(ctx, x + w - 60, y + 8, 140, 0.3);
}

function finish(canvas: HTMLCanvasElement) {
	const texture = new CanvasTexture(canvas);
	texture.colorSpace = SRGBColorSpace;
	texture.anisotropy = 8;
	return texture;
}

function canvas() {
	const c = document.createElement('canvas');
	c.width = W;
	c.height = H;
	const ctx = c.getContext('2d');
	if (!ctx) throw new Error('2d context unavailable');
	return { c, ctx };
}

function note(
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	w: number,
	h: number,
	text: string,
	color: string,
	angle: number
) {
	ctx.save();
	ctx.translate(x, y);
	ctx.rotate(angle);
	ctx.shadowColor = 'rgba(20, 24, 36, 0.25)';
	ctx.shadowBlur = 20;
	ctx.shadowOffsetY = 8;
	ctx.fillStyle = color;
	ctx.fillRect(0, 0, w, h);
	ctx.shadowColor = 'transparent';
	ctx.fillStyle = INK;
	ctx.font = font(600, 28);
	wrap(ctx, text, 26, 58, w - 52, 38);
	ctx.restore();
}

function glyph(ctx: CanvasRenderingContext2D, icon: string, x: number, y: number) {
	ctx.save();
	ctx.translate(x, y);
	ctx.fillStyle = 'rgba(47, 127, 207, 0.14)';
	ctx.strokeStyle = 'rgba(47, 127, 207, 0.45)';
	ctx.lineWidth = 2;
	ctx.beginPath();
	ctx.roundRect(0, 0, 64, 64, 14);
	ctx.fill();
	ctx.stroke();
	ctx.translate(32, 32);
	ctx.strokeStyle = ACCENT;
	ctx.fillStyle = ACCENT;
	ctx.lineWidth = 3;
	ctx.lineCap = 'round';
	ctx.lineJoin = 'round';
	if (icon === 'gamepad') {
		ctx.beginPath();
		ctx.roundRect(-18, -9, 36, 20, 9);
		ctx.stroke();
		ctx.beginPath();
		ctx.moveTo(-10, -3);
		ctx.lineTo(-10, 5);
		ctx.moveTo(-14, 1);
		ctx.lineTo(-6, 1);
		ctx.stroke();
		ctx.beginPath();
		ctx.arc(8, -1, 2.2, 0, Math.PI * 2);
		ctx.arc(13, 3, 2.2, 0, Math.PI * 2);
		ctx.fill();
	} else if (icon === 'globe') {
		ctx.beginPath();
		ctx.arc(0, 0, 16, 0, Math.PI * 2);
		ctx.stroke();
		ctx.beginPath();
		ctx.ellipse(0, 0, 7, 16, 0, 0, Math.PI * 2);
		ctx.stroke();
		ctx.beginPath();
		ctx.moveTo(-16, 0);
		ctx.lineTo(16, 0);
		ctx.moveTo(-13, -8);
		ctx.lineTo(13, -8);
		ctx.moveTo(-13, 8);
		ctx.lineTo(13, 8);
		ctx.stroke();
	} else if (icon === 'cube') {
		ctx.beginPath();
		for (let i = 0; i < 6; i++) {
			const a = -Math.PI / 2 + (i * Math.PI) / 3;
			ctx.lineTo(Math.cos(a) * 17, Math.sin(a) * 17);
		}
		ctx.closePath();
		ctx.stroke();
		ctx.beginPath();
		ctx.moveTo(0, 0);
		ctx.lineTo(0, 17);
		ctx.moveTo(0, 0);
		ctx.lineTo(-14.7, -8.5);
		ctx.moveTo(0, 0);
		ctx.lineTo(14.7, -8.5);
		ctx.stroke();
	} else {
		for (const [i, h] of [22, 14, 30].entries()) {
			ctx.beginPath();
			ctx.roundRect(-18 + i * 13, -16, 10, h, 3);
			ctx.stroke();
		}
	}
	ctx.restore();
}

function card(
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	w: number,
	h: number,
	skill: { icon: string; title: string; text: string }
) {
	ctx.fillStyle = 'rgba(255, 255, 255, 0.42)';
	ctx.strokeStyle = 'rgba(30, 42, 63, 0.3)';
	ctx.lineWidth = 2;
	ctx.beginPath();
	ctx.roundRect(x, y, w, h, 18);
	ctx.fill();
	ctx.stroke();
	glyph(ctx, skill.icon, x + 26, y + 26);
	ctx.fillStyle = INK;
	ctx.font = font(700, 25);
	ctx.fillText(skill.title, x + 26, y + 136);
	ctx.fillStyle = INK_BODY;
	ctx.font = font(500, 21);
	wrap(ctx, skill.text, x + 26, y + 172, w - 52, 29);
}

export function drawIntroPage(image: HTMLImageElement | null) {
	const { c, ctx } = canvas();
	const content = notebookContent;
	paper(ctx, 3);
	header(ctx, 'À propos', '01');
	photoFrame(ctx, image);
	const rx = MARGIN + 470;
	ctx.fillStyle = INK_SOFT;
	ctx.font = font(500, 24);
	ctx.fillText(content.greeting, rx, 236);
	ctx.fillStyle = INK;
	ctx.font = font(700, 50);
	const nameEnd = wrap(ctx, content.name, rx, 290, W - rx - 70, 54);
	ctx.fillStyle = ACCENT;
	ctx.font = font(600, 24);
	ctx.fillText(content.role.toUpperCase(), rx, nameEnd - 10);
	ctx.strokeStyle = 'rgba(47, 127, 207, 0.5)';
	ctx.lineWidth = 3;
	ctx.beginPath();
	ctx.moveTo(rx, nameEnd + 18);
	ctx.lineTo(rx + 120, nameEnd + 18);
	ctx.stroke();
	let y = 772;
	ctx.fillStyle = INK;
	ctx.font = font(500, 24);
	for (const paragraph of content.intro) {
		y = wrap(ctx, paragraph, MARGIN, y, W - MARGIN - 80, 42) + 14;
	}
	highlight(ctx, content.availability, MARGIN, y + 40, 26);
	ctx.fillStyle = INK_SOFT;
	ctx.font = mono(18);
	ctx.fillText('→ tourner la page', W - 300, H - 70);
	return finish(c);
}

export function drawSkillsPage() {
	const { c, ctx } = canvas();
	const content = notebookContent;
	paper(ctx, 7);
	header(ctx, 'Compétences clés', '02');
	heading(ctx, '01', 'Compétences clés', 190);
	const gap = 24;
	const cw = (W - MARGIN - 70 - gap) / 2;
	const ch = 300;
	content.skills.forEach((skill, i) => {
		const x = MARGIN + (i % 2) * (cw + gap);
		const y = 250 + Math.floor(i / 2) * (ch + gap);
		card(ctx, x, y, cw, ch, skill);
	});
	const qy = 250 + 2 * (ch + gap) + 70;
	heading(ctx, '02', 'Pourquoi je fais ça', qy);
	ctx.fillStyle = INK;
	ctx.font = font(600, 29);
	wrap(ctx, content.why, MARGIN, qy + 80, W - MARGIN - 90, 44);
	return finish(c);
}

export function drawValuesPage() {
	const { c, ctx } = canvas();
	const content = notebookContent;
	paper(ctx, 11);
	header(ctx, 'Ma façon de travailler', '03');
	heading(ctx, '03', 'En quelques chiffres', 190);
	const fx = MARGIN;
	const fy = 250;
	const fw = (W - MARGIN - 70) / content.facts.length;
	content.facts.forEach((fact, i) => {
		const x = fx + i * fw;
		ctx.fillStyle = ACCENT;
		ctx.font = mono(19);
		ctx.fillText(fact.label.toUpperCase(), x, fy + 30);
		ctx.fillStyle = INK;
		ctx.font = font(700, 40);
		ctx.fillText(fact.value, x, fy + 84);
	});
	ctx.strokeStyle = 'rgba(30, 42, 63, 0.35)';
	ctx.lineWidth = 2;
	ctx.beginPath();
	ctx.moveTo(fx, fy + 118);
	ctx.lineTo(W - 70, fy + 118);
	ctx.stroke();
	heading(ctx, '04', 'Ma façon de travailler', fy + 212);
	let vy = fy + 306;
	for (const [i, value] of content.values.entries()) {
		ctx.fillStyle = ACCENT;
		ctx.font = font(700, 48);
		ctx.fillText(`0${i + 1}`, MARGIN, vy);
		ctx.fillStyle = INK;
		ctx.font = font(700, 34);
		ctx.fillText(value.title, MARGIN + 96, vy - 20);
		ctx.fillStyle = INK_BODY;
		ctx.font = font(500, 30);
		wrap(ctx, value.text, MARGIN + 96, vy + 28, W - MARGIN - 170, 42);
		vy += 190;
	}
	note(ctx, MARGIN + 40, H - 290, 580, 150, content.next, '#ffe79a', -0.035);
	return finish(c);
}
