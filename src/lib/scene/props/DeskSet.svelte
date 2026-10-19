<script lang="ts" module>
	import {
		BackSide,
		BoxGeometry,
		CircleGeometry,
		ConeGeometry,
		CylinderGeometry,
		DoubleSide,
		LatheGeometry,
		MeshStandardMaterial,
		SphereGeometry,
		TorusGeometry,
		Vector2
	} from 'three';
	import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
	import { materials } from '../materials/index.js';
	import type { Part } from '../merge.js';
	import { RISER } from '../layout.js';

	const R = RoundedBoxGeometry;
	const X90: [number, number, number] = [Math.PI / 2, 0, 0];
	const Z90: [number, number, number] = [0, 0, Math.PI / 2];

	const mugOuter = new MeshStandardMaterial({
		color: '#17181c',
		roughness: 0.22,
		metalness: 0.05,
		envMapIntensity: 1.1
	});
	const mugInner = new MeshStandardMaterial({
		color: '#eceae4',
		roughness: 0.25,
		metalness: 0,
		side: BackSide
	});
	const mugRim = new MeshStandardMaterial({ color: '#a7abb3', roughness: 0.3, metalness: 1 });
	const mugDecal = new MeshStandardMaterial({
		color: '#ffffff',
		roughness: 0.35,
		metalness: 0.6,
		transparent: true,
		depthWrite: false
	});
	const coffee = new MeshStandardMaterial({ color: '#1a0f08', roughness: 0.25, metalness: 0 });
	const coaster = new MeshStandardMaterial({ color: '#2c2f36', roughness: 0.4, metalness: 0.9 });
	const coasterTop = new MeshStandardMaterial({ color: '#15161a', roughness: 0.9, metalness: 0 });
	const penBody = new MeshStandardMaterial({
		color: '#0c0d10',
		roughness: 0.18,
		metalness: 0.6,
		envMapIntensity: 1.2
	});
	const penGrip = new MeshStandardMaterial({ color: '#15171b', roughness: 0.8, metalness: 0.1 });
	const penTrim = new MeshStandardMaterial({ color: '#cfd3d9', roughness: 0.2, metalness: 1 });
	const headsetFoam = new MeshStandardMaterial({ color: '#111216', roughness: 0.98, metalness: 0 });
	const headsetShell = new MeshStandardMaterial({
		color: '#0e0f12',
		roughness: 0.42,
		metalness: 0.35
	});
	const headsetTrim = new MeshStandardMaterial({ color: '#8f949c', roughness: 0.35, metalness: 1 });
	const headsetBandTop = new MeshStandardMaterial({
		color: '#2a2d33',
		roughness: 0.5,
		metalness: 0.9
	});
	const headsetMesh = new MeshStandardMaterial({ color: '#1a1b1f', roughness: 0.9, metalness: 0 });
	const headsetBadge = new MeshStandardMaterial({ color: '#3d4046', roughness: 0.3, metalness: 1 });
	const standMetal = new MeshStandardMaterial({
		color: '#9a9fa7',
		roughness: 0.4,
		metalness: 0.95
	});
	const standDark = new MeshStandardMaterial({ color: '#0d0e11', roughness: 0.8, metalness: 0.2 });
	const standPad = new MeshStandardMaterial({ color: '#141518', roughness: 0.9, metalness: 0 });
	const speakerBox = new MeshStandardMaterial({
		color: '#0f1013',
		roughness: 0.28,
		metalness: 0.2
	});
	const speakerBaffle = new MeshStandardMaterial({
		color: '#1a1c21',
		roughness: 0.85,
		metalness: 0
	});
	const speakerCone = new MeshStandardMaterial({
		color: '#30343b',
		roughness: 0.55,
		metalness: 0.35,
		side: DoubleSide
	});
	const speakerSurround = new MeshStandardMaterial({
		color: '#0a0b0d',
		roughness: 0.95,
		metalness: 0
	});
	const speakerDome = new MeshStandardMaterial({ color: '#b9bec6', roughness: 0.25, metalness: 1 });
	const phoneFrame = new MeshStandardMaterial({
		color: '#5a5e66',
		roughness: 0.28,
		metalness: 1,
		envMapIntensity: 1.3
	});
	const phoneBack = new MeshStandardMaterial({ color: '#0d0e11', roughness: 0.5, metalness: 0.3 });
	const phoneButton = new MeshStandardMaterial({ color: '#4a4e56', roughness: 0.3, metalness: 1 });
	const phoneGlass = new MeshStandardMaterial({
		color: '#07080a',
		roughness: 0.06,
		metalness: 0.25,
		envMapIntensity: 1.8
	});
	const phoneScreen = new MeshStandardMaterial({
		color: '#030405',
		roughness: 0.03,
		metalness: 0.15,
		envMapIntensity: 2
	});
	const phoneLens = new MeshStandardMaterial({ color: '#0a1118', roughness: 0.1, metalness: 0.6 });

	const mugGeometry = new LatheGeometry(
		[
			new Vector2(0, 0),
			new Vector2(0.034, 0),
			new Vector2(0.038, 0.004),
			new Vector2(0.041, 0.02),
			new Vector2(0.0425, 0.05),
			new Vector2(0.0415, 0.085),
			new Vector2(0.0405, 0.098)
		],
		48
	);
	const mugInnerGeometry = new LatheGeometry(
		[
			new Vector2(0, 0.006),
			new Vector2(0.036, 0.006),
			new Vector2(0.0395, 0.05),
			new Vector2(0.0385, 0.098)
		],
		48
	);
	const DECAL_ARC = 0.07 / 0.0427;

	const place = (origin: [number, number, number], yaw: number, local: Part[]): Part[] =>
		local.map((part) => {
			const [x, y, z] = part.p ?? [0, 0, 0];
			const [rx, ry, rz] = part.r ?? [0, 0, 0];
			return {
				...part,
				p: [
					origin[0] + x * Math.cos(yaw) + z * Math.sin(yaw),
					origin[1] + y,
					origin[2] - x * Math.sin(yaw) + z * Math.cos(yaw)
				],
				r: [rx, ry + yaw, rz]
			};
		});

	const mugParts = place([0.62, 0, 0.26], -0.7, [
		{ g: new CylinderGeometry(0.058, 0.058, 0.005, 40), m: coaster, p: [0, 0.0025, 0] },
		{ g: new CylinderGeometry(0.054, 0.054, 0.001, 40), m: coasterTop, p: [0, 0.0055, 0] },
		{ g: mugGeometry, m: mugOuter, p: [0, 0.006, 0] },
		{ g: mugInnerGeometry, m: mugInner, p: [0, 0.006, 0] },
		{ g: new CylinderGeometry(0.0385, 0.0385, 0.002, 48), m: coffee, p: [0, 0.086, 0] },
		{ g: new TorusGeometry(0.0405, 0.0022, 10, 56), m: mugRim, p: [0, 0.104, 0], r: X90 },
		{
			g: new CylinderGeometry(0.0427, 0.0427, 0.07, 32, 1, true, -DECAL_ARC / 2, DECAL_ARC),
			m: mugDecal,
			p: [0, 0.055, 0]
		},
		{
			g: new TorusGeometry(0.026, 0.0072, 14, 32, Math.PI),
			m: mugOuter,
			p: [0.038, 0.056, 0],
			r: [0, 0, -Math.PI / 2],
			s: [1, 1.2, 1]
		}
	]);

	const headsetLocal: Part[] = [
		{ g: new CylinderGeometry(0.085, 0.09, 0.014, 40), m: standMetal, p: [0, 0.007, 0] },
		{ g: new CylinderGeometry(0.078, 0.078, 0.001, 40), m: standDark, p: [0, 0.0145, 0] },
		{ g: new CylinderGeometry(0.009, 0.011, 0.32, 20), m: standMetal, p: [0, 0.175, 0] },
		{ g: new SphereGeometry(0.012, 16, 12), m: standMetal, p: [0, 0.34, 0] },
		{ g: new R(0.03, 0.11, 0.06, 2, 0.012), m: standMetal, p: [0, 0.345, 0], r: Z90 },
		{ g: new R(0.1, 0.006, 0.05, 2, 0.003), m: standPad, p: [0, 0.362, 0] }
	];
	const HY = 0.282;
	const headset: Part[] = [
		{
			g: new TorusGeometry(0.096, 0.008, 12, 36, Math.PI),
			m: headsetShell,
			p: [0, HY + 0.08, 0],
			r: Z90
		},
		{
			g: new TorusGeometry(0.1, 0.0045, 8, 36, Math.PI),
			m: headsetBandTop,
			p: [0, HY + 0.08, 0],
			r: Z90
		},
		{
			g: new TorusGeometry(0.089, 0.012, 12, 24, Math.PI - 1.1),
			m: headsetFoam,
			p: [0, HY + 0.078, 0],
			r: [0, 0, Math.PI / 2 + 0.55]
		},
		{
			g: new CylinderGeometry(0.004, 0.0055, 0.09, 10),
			m: headsetShell,
			p: [-0.112, HY - 0.055, 0.02],
			r: [0.9, 0, 0.35]
		},
		{ g: new SphereGeometry(0.009, 12, 10), m: headsetFoam, p: [-0.128, HY - 0.093, 0.055] },
		{
			g: new CylinderGeometry(0.0022, 0.0022, 0.05, 8),
			m: headsetTrim,
			p: [0.1, HY - 0.06, 0.005],
			r: [0.3, 0, 0]
		}
	];
	for (const side of [-1, 1]) {
		const cx = side * 0.104;
		const tilt = -side * 0.08;
		headset.push(
			{ g: new R(0.008, 0.09, 0.016, 2, 0.003), m: headsetShell, p: [side * 0.097, HY + 0.03, 0] },
			{ g: new BoxGeometry(0.0085, 0.03, 0.006), m: headsetTrim, p: [side * 0.097, HY + 0.055, 0] },
			{
				g: new CylinderGeometry(0.012, 0.012, 0.03, 16),
				m: headsetShell,
				p: [side * 0.1, HY - 0.02, 0],
				r: Z90
			},
			{
				g: new CylinderGeometry(0.048, 0.044, 0.034, 32),
				m: headsetShell,
				p: [cx, HY - 0.02, 0],
				r: [0, 0, Math.PI / 2 + tilt]
			},
			{
				g: new CylinderGeometry(0.049, 0.049, 0.003, 32),
				m: headsetTrim,
				p: [cx + side * 0.0175, HY - 0.02, 0],
				r: [0, 0, Math.PI / 2 + tilt]
			},
			{
				g: new TorusGeometry(0.032, 0.0025, 8, 36),
				m: headsetTrim,
				p: [cx + side * 0.0195, HY - 0.02, 0],
				r: [0, Math.PI / 2, tilt]
			},
			{
				g: new CircleGeometry(0.012, 24),
				m: headsetBadge,
				p: [cx + side * 0.0196, HY - 0.02, 0],
				r: [0, (side * Math.PI) / 2, tilt]
			},
			{
				g: new TorusGeometry(0.036, 0.013, 12, 32),
				m: headsetFoam,
				p: [cx - side * 0.02, HY - 0.02, 0],
				r: [0, Math.PI / 2, tilt]
			},
			{
				g: new CircleGeometry(0.03, 24),
				m: headsetMesh,
				p: [cx - side * 0.014, HY - 0.02, 0],
				r: [0, (-side * Math.PI) / 2, tilt]
			}
		);
	}
	const headsetParts = place([-1.56, 0, 0.14], 0.5, [
		...headsetLocal,
		...place([0, 0, 0], Math.PI / 2, headset)
	]);

	const penParts = place([-0.98, 0, 0.3], 0.16, [
		...place([0.15, 0.0065, 0.03], 0, [
			{ g: new CylinderGeometry(0.0055, 0.0055, 0.1, 20), m: penBody, r: [Math.PI / 2, 0, 0.08] },
			{
				g: new CylinderGeometry(0.0052, 0.0048, 0.02, 20),
				m: penGrip,
				p: [0.0044, 0, 0.0548],
				r: [Math.PI / 2, 0, 0.08]
			},
			{
				g: new ConeGeometry(0.0048, 0.014, 20),
				m: penTrim,
				p: [0.0058, 0, 0.0717],
				r: [-Math.PI / 2, 0, 0.08]
			},
			{
				g: new CylinderGeometry(0.0057, 0.0057, 0.01, 20),
				m: penTrim,
				p: [-0.0044, 0, -0.0548],
				r: [Math.PI / 2, 0, 0.08]
			},
			{ g: new SphereGeometry(0.0057, 16, 12), m: penTrim, p: [-0.005, 0, -0.0618] },
			{
				g: new R(0.0024, 0.05, 0.005, 1, 0.001),
				m: penTrim,
				p: [0.0042, 0.0068, -0.032],
				r: [Math.PI / 2, 0, 0.08]
			},
			{ g: new TorusGeometry(0.0056, 0.0006, 6, 24), m: penTrim, r: [0, 0, 0.08] }
		])
	]);

	const phoneParts = place([0.98, 0, 0.12], -0.32, [
		{ g: new R(0.0795, 0.0104, 0.168, 3, 0.011), m: phoneFrame, p: [0, 0.0052, 0] },
		{ g: new R(0.0775, 0.0108, 0.166, 3, 0.0105), m: phoneBack, p: [0, 0.0054, 0] },
		{ g: new R(0.0765, 0.0012, 0.165, 3, 0.0102), m: phoneGlass, p: [0, 0.0108, 0] },
		{ g: new BoxGeometry(0.0725, 0.0002, 0.161), m: phoneScreen, p: [0, 0.0116, 0] },
		{
			g: new CircleGeometry(0.0032, 20),
			m: phoneLens,
			p: [0, 0.0119, -0.073],
			r: [-Math.PI / 2, 0, 0]
		},
		{ g: new R(0.012, 0.0004, 0.0014, 1, 0.0005), m: phoneBack, p: [0, 0.0119, -0.0805] },
		{ g: new R(0.0014, 0.0058, 0.024, 1, 0.0006), m: phoneButton, p: [0.0402, 0.0056, 0.014] },
		{ g: new R(0.0014, 0.0058, 0.015, 1, 0.0006), m: phoneButton, p: [-0.0402, 0.0056, -0.016] },
		{ g: new R(0.0014, 0.0058, 0.015, 1, 0.0006), m: phoneButton, p: [-0.0402, 0.0056, 0.004] },
		{ g: new R(0.0014, 0.0045, 0.007, 1, 0.0006), m: phoneButton, p: [-0.0402, 0.0056, -0.034] },
		{ g: new R(0.011, 0.0006, 0.0034, 1, 0.0008), m: phoneBack, p: [0, 0.0052, 0.0845], r: X90 }
	]);

	const SPEAKER_X = RISER.width / 2 + 0.2;
	const speakerLocal = (side: number): Part[] => [
		{ g: new R(0.16, 0.024, 0.2, 1, 0.006), m: materials.metalBlack, p: [0, 0.012, 0] },
		{ g: new BoxGeometry(0.14, 0.006, 0.18), m: materials.rubber, p: [0, 0.027, 0] },
		{ g: new R(0.17, 0.33, 0.22, 2, 0.012), m: speakerBox, p: [0, 0.195, 0] },
		{ g: new R(0.15, 0.31, 0.012, 1, 0.006), m: speakerBaffle, p: [0, 0.195, 0.108] },
		{ g: new TorusGeometry(0.05, 0.006, 8, 28), m: materials.metalBrushed, p: [0, 0.25, 0.117] },
		{
			g: new CylinderGeometry(0.046, 0.018, 0.012, 28, 1, true),
			m: speakerCone,
			p: [0, 0.25, 0.115],
			r: X90
		},
		{ g: new TorusGeometry(0.045, 0.004, 8, 28), m: speakerSurround, p: [0, 0.25, 0.112] },
		{
			g: new SphereGeometry(0.018, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2),
			m: speakerDome,
			p: [0, 0.25, 0.112],
			r: X90
		},
		{ g: new TorusGeometry(0.022, 0.004, 8, 24), m: materials.metalBrushed, p: [0, 0.095, 0.117] },
		{
			g: new SphereGeometry(0.014, 14, 9, 0, Math.PI * 2, 0, Math.PI / 2),
			m: speakerDome,
			p: [0, 0.095, 0.116],
			r: X90
		},
		{
			g: new CylinderGeometry(0.021, 0.021, 0.002, 24),
			m: speakerSurround,
			p: [0, 0.095, 0.1125],
			r: X90
		},
		{ g: new R(0.11, 0.004, 0.004, 1, 0.001), m: materials.metalBrushed, p: [0, 0.045, 0.116] },
		{ g: new BoxGeometry(0.004, 0.004, 0.0012), m: materials.accentGlow, p: [0.06, 0.045, 0.116] },
		{
			g: new CylinderGeometry(0.028, 0.028, 0.006, 20),
			m: materials.rubber,
			p: [side * 0.062, 0.195, -0.112],
			r: X90
		},
		{
			g: new CylinderGeometry(0.022, 0.022, 0.004, 20),
			m: speakerBox,
			p: [side * 0.062, 0.195, -0.114],
			r: X90
		}
	];
	const speakerParts = [-1, 1].flatMap((side) =>
		place([-0.2 + side * SPEAKER_X, 0, -0.26], -side * 0.28, speakerLocal(side))
	);

	export const deskParts: Part[] = [
		...mugParts,
		...headsetParts,
		...penParts,
		...phoneParts,
		...speakerParts
	];
	let ready = false;
	export function ensureDeskTextures(
		decalTex: () => import('three').Texture,
		brushed: () => { map: import('three').Texture; roughnessMap: import('three').Texture }
	) {
		if (ready) return;
		ready = true;
		const decal = decalTex();
		mugDecal.map = decal;
		mugDecal.alphaMap = decal;
		mugDecal.needsUpdate = true;
		const b = brushed();
		b.map.repeat.set(2, 1);
		b.roughnessMap.repeat.set(2, 1);
		standMetal.map = b.map;
		standMetal.roughnessMap = b.roughnessMap;
		standMetal.needsUpdate = true;
	}
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import Merged from '../Merged.svelte';
	import { createSikuDecalTexture } from '../materials/figurine-textures.js';
	import { createBrushedMaps } from '../materials/rack-textures.js';

	onMount(() => {
		ensureDeskTextures(createSikuDecalTexture, createBrushedMaps);
	});
</script>

<Merged parts={deskParts} castShadow receiveShadow />
