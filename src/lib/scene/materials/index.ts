import {
	AdditiveBlending,
	Color,
	DoubleSide,
	MeshBasicMaterial,
	MeshPhysicalMaterial,
	MeshStandardMaterial,
	Vector2
} from 'three';

const std = (options: ConstructorParameters<typeof MeshStandardMaterial>[0]) =>
	new MeshStandardMaterial(options);

export const materials = {
	floor: std({
		color: '#ffffff',
		roughness: 1,
		metalness: 0.02,
		envMapIntensity: 0.12,
		normalScale: new Vector2(0.5, 0.5)
	}),
	stone: std({
		color: '#4e5058',
		roughness: 1,
		metalness: 0,
		normalScale: new Vector2(0.8, 0.8),
		aoMapIntensity: 1,
		envMapIntensity: 0.2
	}),
	stoneSide: std({
		color: '#464850',
		roughness: 1,
		metalness: 0,
		normalScale: new Vector2(0.8, 0.8),
		aoMapIntensity: 1,
		envMapIntensity: 0.2
	}),
	lineBlue: std({
		color: '#0a1220',
		emissive: new Color('#7fc0ff'),
		emissiveIntensity: 1.6,
		roughness: 0.3
	}),
	ledWarm: std({
		color: '#1a1208',
		emissive: new Color('#ffcf8a'),
		emissiveIntensity: 2.2,
		roughness: 0.4
	}),
	glowBlue: new MeshBasicMaterial({
		color: '#2f7ad0',
		transparent: true,
		opacity: 0.11,
		blending: AdditiveBlending,
		depthWrite: false
	}),
	glowWarm: new MeshBasicMaterial({
		color: '#c98a3a',
		transparent: true,
		opacity: 0.22,
		blending: AdditiveBlending,
		depthWrite: false
	}),
	ceiling: std({ color: '#1e232b', roughness: 0.95, metalness: 0 }),
	cornice: std({ color: '#5c6068', roughness: 0.38, metalness: 0.9, envMapIntensity: 0.8 }),
	ceilingPaint: std({
		color: '#ffffff',
		roughness: 0.96,
		metalness: 0,
		normalScale: new Vector2(0.35, 0.35),
		envMapIntensity: 0.15
	}),
	wallPanel: std({ color: '#1b2029', roughness: 0.85, metalness: 0 }),
	slat: std({ color: '#565b66', roughness: 0.62, metalness: 0.05 }),
	slatWood: std({
		color: '#9c948a',
		roughness: 1,
		metalness: 0,
		normalScale: new Vector2(0.8, 0.8),
		aoMapIntensity: 1,
		envMapIntensity: 0.3
	}),
	slatBoard: std({
		color: '#4a4540',
		roughness: 1,
		metalness: 0,
		normalScale: new Vector2(0.6, 0.6),
		aoMapIntensity: 1,
		envMapIntensity: 0.15
	}),
	coveLight: std({
		color: '#0a0c10',
		emissive: new Color('#dbe6f5'),
		emissiveIntensity: 0.9,
		roughness: 0.4
	}),
	rug: new MeshPhysicalMaterial({
		color: '#363942',
		roughness: 1,
		metalness: 0,
		sheen: 0.35,
		sheenRoughness: 0.9,
		sheenColor: new Color('#4c515a'),
		normalScale: new Vector2(1, 1),
		aoMapIntensity: 1,
		envMapIntensity: 0.1
	}),
	leaf: std({ color: '#2c333a', roughness: 0.8, metalness: 0, side: DoubleSide }),
	foliage: std({ color: '#30492f', roughness: 0.72, metalness: 0, side: DoubleSide }),
	vine: std({ color: '#2a3a26', roughness: 0.85, metalness: 0 }),
	soil: std({ color: '#15120f', roughness: 1, metalness: 0 }),
	deskTop: std({
		color: '#ffffff',
		roughness: 1,
		metalness: 0.04,
		bumpScale: 0.5,
		envMapIntensity: 0.2
	}),
	deskPad: std({
		color: '#8c9098',
		roughness: 0.98,
		metalness: 0,
		bumpScale: 0.35,
		envMapIntensity: 0.08
	}),
	deskPadEdge: std({
		color: '#0b1220',
		emissive: new Color('#3f8fe0'),
		emissiveIntensity: 0.45,
		roughness: 0.7
	}),
	deskFrame: std({ color: '#15171b', roughness: 0.62, metalness: 0.35, bumpScale: 0.05 }),
	deskSteel: std({ color: '#3b3f47', roughness: 0.42, metalness: 0.9, envMapIntensity: 0.9 }),
	wood: std({ color: '#2c2f36', roughness: 0.6, metalness: 0 }),
	metalDark: std({ color: '#15171b', roughness: 0.45, metalness: 0.75 }),
	metalBlack: std({ color: '#0a0b0e', roughness: 0.3, metalness: 0.9, envMapIntensity: 0.9 }),
	metalGrey: std({ color: '#5c6068', roughness: 0.38, metalness: 0.9, envMapIntensity: 0.8 }),
	metalBrushed: std({ color: '#3b3f47', roughness: 0.38, metalness: 0.9 }),
	aluminium: std({ color: '#8d939c', roughness: 0.42, metalness: 0.95 }),
	logoIce: std({
		color: '#cfe2f7',
		emissive: new Color('#6cb6f6'),
		emissiveIntensity: 0.28,
		roughness: 0.3,
		metalness: 0.7,
		envMapIntensity: 1.4
	}),
	plasticBlack: std({ color: '#111216', roughness: 0.62, metalness: 0 }),
	plasticGrey: std({ color: '#2a2d33', roughness: 0.55, metalness: 0 }),
	rubber: std({ color: '#0b0b0d', roughness: 0.95, metalness: 0 }),
	fabric: std({ color: '#191b20', roughness: 1, metalness: 0 }),
	mesh: std({
		color: '#ffffff',
		roughness: 0.88,
		metalness: 0,
		side: DoubleSide,
		alphaTest: 0.5
	}),
	chairFrame: std({ color: '#121317', roughness: 0.5, metalness: 0.15, bumpScale: 0.08 }),
	chairPlastic: std({ color: '#0f1013', roughness: 0.6, metalness: 0.05, bumpScale: 0.1 }),
	armPad: std({ color: '#141518', roughness: 0.85, metalness: 0, bumpScale: 0.06 }),
	cushion: new MeshPhysicalMaterial({
		color: '#272b32',
		roughness: 0.96,
		metalness: 0,
		sheen: 0.25,
		sheenRoughness: 0.9,
		sheenColor: new Color('#7b8291'),
		bumpScale: 1.2
	}),
	piping: std({ color: '#3a3f49', roughness: 0.9, metalness: 0 }),
	keycap: std({ color: '#ffffff', roughness: 0.5, metalness: 0 }),
	serverUnit: std({ color: '#ffffff', roughness: 1, metalness: 0.7, envMapIntensity: 0.6 }),
	grille: std({ color: '#ffffff', roughness: 0.6, metalness: 0.4 }),
	ledGlow: new MeshBasicMaterial({
		color: '#ffffff',
		transparent: true,
		opacity: 0.85,
		blending: AdditiveBlending,
		depthWrite: false
	}),
	ceramic: std({ color: '#d9dde3', roughness: 0.3, metalness: 0 }),
	pcb: std({ color: '#101a1c', roughness: 0.6, metalness: 0.2 }),
	accentGlow: std({
		color: '#0a0c10',
		emissive: new Color('#6cb6f6'),
		emissiveIntensity: 1.6,
		roughness: 0.4
	}),
	stripWarm: std({
		color: '#0a0c10',
		emissive: new Color('#9ed0fb'),
		emissiveIntensity: 0.9,
		roughness: 0.4
	}),
	screenOff: std({
		color: '#05070a',
		emissive: new Color('#0b1220'),
		emissiveIntensity: 0.6,
		roughness: 0.25,
		metalness: 0.1
	}),
	rackGlass: new MeshPhysicalMaterial({
		color: '#7f97b3',
		roughness: 0.06,
		metalness: 0,
		transparent: true,
		opacity: 0.16,
		envMapIntensity: 1.4,
		depthWrite: false
	}),
	rackDisplay: std({
		color: '#0a0f16',
		emissive: new Color('#7fb3e6'),
		emissiveIntensity: 1.1,
		roughness: 0.5
	}),
	glass: new MeshPhysicalMaterial({
		color: '#9fb3c8',
		roughness: 0.08,
		metalness: 0,
		transparent: true,
		opacity: 0.18,
		side: DoubleSide,
		envMapIntensity: 1.2
	})
};

export const palette = {
	accent: '#6cb6f6',
	violet: '#a18cff',
	success: '#5ad19a',
	warning: '#f5c26b'
};
