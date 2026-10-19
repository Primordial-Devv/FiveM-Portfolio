import { type Color, Euler, Quaternion, Vector3 } from 'three';

export type InstanceItem = {
	position?: [number, number, number];
	rotation?: [number, number, number];
	scale?: number | [number, number, number];
	color?: Color;
};

const q = new Quaternion();
const qg = new Quaternion();
const e = new Euler();
const v = new Vector3();

export function placeIn(
	group: { position: [number, number, number]; rotationY: number },
	position: [number, number, number],
	rotation: [number, number, number] = [0, 0, 0],
	scale: number | [number, number, number] = 1
): InstanceItem {
	v.set(...position).applyAxisAngle(new Vector3(0, 1, 0), group.rotationY);
	qg.setFromAxisAngle(new Vector3(0, 1, 0), group.rotationY);
	q.setFromEuler(e.set(...rotation));
	qg.multiply(q);
	e.setFromQuaternion(qg);
	return {
		position: [group.position[0] + v.x, group.position[1] + v.y, group.position[2] + v.z],
		rotation: [e.x, e.y, e.z],
		scale
	};
}
