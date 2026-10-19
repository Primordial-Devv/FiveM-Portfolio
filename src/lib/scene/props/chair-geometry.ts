import {
	BufferGeometry,
	CatmullRomCurve3,
	Float32BufferAttribute,
	TubeGeometry,
	Vector3
} from 'three';

export const BACK_HEIGHT = 0.56;

function halfWidth(v: number) {
	const base = 0.205 + 0.03 * Math.sin(Math.PI * v);
	let round = 1;
	if (v > 0.8) {
		const t = (v - 0.8) / 0.2;
		round = Math.sqrt(Math.max(0, 1 - t * t * 0.72));
	} else if (v < 0.12) {
		const t = (0.12 - v) / 0.12;
		round = Math.sqrt(Math.max(0, 1 - t * t * 0.45));
	}
	return base * round;
}

function depth(u: number, v: number) {
	const lumbar = 0.04 * Math.sin(Math.PI * Math.min(v / 0.72, 1));
	const lean = -0.11 * v * v;
	const cup = -0.03 * (1 - (2 * u - 1) ** 2) * (0.4 + 0.6 * v);
	return lumbar + lean + cup;
}

export function backrestPoint(u: number, v: number) {
	return new Vector3((2 * u - 1) * halfWidth(v), v * BACK_HEIGHT, depth(u, v));
}

export function createBackPanelGeometry(columns = 26, rows = 40) {
	const positions: number[] = [];
	const uvs: number[] = [];
	const indices: number[] = [];
	for (let r = 0; r <= rows; r++) {
		const v = r / rows;
		for (let c = 0; c <= columns; c++) {
			const u = c / columns;
			const p = backrestPoint(u, v);
			positions.push(p.x, p.y, p.z);
			uvs.push(u, v);
		}
	}
	for (let r = 0; r < rows; r++) {
		for (let c = 0; c < columns; c++) {
			const a = r * (columns + 1) + c;
			const b = a + columns + 1;
			indices.push(a, b, a + 1, b, b + 1, a + 1);
		}
	}
	const geometry = new BufferGeometry();
	geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
	geometry.setAttribute('uv', new Float32BufferAttribute(uvs, 2));
	geometry.setIndex(indices);
	geometry.computeVertexNormals();
	return geometry;
}

export function createBackFrameGeometry(radius = 0.017) {
	const points: Vector3[] = [];
	const steps = 18;
	for (let i = 0; i <= steps; i++) points.push(backrestPoint(0, i / steps));
	for (let i = 1; i < 8; i++) points.push(backrestPoint(i / 8, 1));
	for (let i = steps; i >= 0; i--) points.push(backrestPoint(1, i / steps));
	for (let i = 7; i >= 1; i--) points.push(backrestPoint(i / 8, 0));
	const curve = new CatmullRomCurve3(points, true, 'catmullrom', 0.4);
	return new TubeGeometry(curve, 220, radius, 10, true);
}

export function createSpineGeometry() {
	const curve = new CatmullRomCurve3([
		new Vector3(0, -0.07, 0.1),
		new Vector3(0, -0.04, -0.02),
		new Vector3(0, 0.02, -0.035),
		new Vector3(0, 0.12, -0.02)
	]);
	return new TubeGeometry(curve, 24, 0.022, 10, false);
}

export function createPipingGeometry(
	width: number,
	depth: number,
	corner: number,
	radius = 0.0045
) {
	const points: Vector3[] = [];
	const hw = width / 2 - corner;
	const hd = depth / 2 - corner;
	const step = 0.02;
	const corners = [
		[hw, hd, 0],
		[-hw, hd, Math.PI / 2],
		[-hw, -hd, Math.PI],
		[hw, -hd, Math.PI * 1.5]
	];
	for (let c = 0; c < 4; c++) {
		const [cx, cz, start] = corners[c];
		for (let i = 0; i <= 8; i++) {
			const a = start + (i / 8) * (Math.PI / 2);
			points.push(new Vector3(cx + Math.cos(a) * corner, 0, cz + Math.sin(a) * corner));
		}
		const [nx, nz, nextStart] = corners[(c + 1) % 4];
		const from = new Vector3(
			cx + Math.cos(start + Math.PI / 2) * corner,
			0,
			cz + Math.sin(start + Math.PI / 2) * corner
		);
		const to = new Vector3(nx + Math.cos(nextStart) * corner, 0, nz + Math.sin(nextStart) * corner);
		const length = from.distanceTo(to);
		const n = Math.max(1, Math.round(length / step));
		for (let i = 1; i < n; i++) points.push(from.clone().lerp(to, i / n));
	}
	const curve = new CatmullRomCurve3(points, true, 'centripetal');
	return new TubeGeometry(curve, points.length * 2, radius, 8, true);
}
