export const KEY_UNIT = 0.019;

export type KeyDef = {
	id: string;
	label: string;
	row: number;
	x: number;
	z: number;
	width: number;
	accent: boolean;
};

type RowSpec = [label: string, width?: number][];

const rows: RowSpec[] = [
	[
		['Esc'],
		['F1'],
		['F2'],
		['F3'],
		['F4'],
		['F5'],
		['F6'],
		['F7'],
		['F8'],
		['F9'],
		['F10'],
		['F11'],
		['F12'],
		['PrtSc'],
		['Pause'],
		['Del']
	],
	[
		['`'],
		['1'],
		['2'],
		['3'],
		['4'],
		['5'],
		['6'],
		['7'],
		['8'],
		['9'],
		['0'],
		['-'],
		['='],
		['Backspace', 2],
		['PgUp']
	],
	[
		['Tab', 1.5],
		['Q'],
		['W'],
		['E'],
		['R'],
		['T'],
		['Y'],
		['U'],
		['I'],
		['O'],
		['P'],
		['['],
		[']'],
		['\\', 1.5],
		['PgDn']
	],
	[
		['Caps', 1.75],
		['A'],
		['S'],
		['D'],
		['F'],
		['G'],
		['H'],
		['J'],
		['K'],
		['L'],
		[';'],
		["'"],
		['Enter', 2.25],
		['Home']
	],
	[
		['Shift', 2.25],
		['Z'],
		['X'],
		['C'],
		['V'],
		['B'],
		['N'],
		['M'],
		[','],
		['.'],
		['/'],
		['Shift', 1.75],
		['Up'],
		['End']
	],
	[
		['Ctrl', 1.25],
		['Win', 1.25],
		['Alt', 1.25],
		['Space', 6],
		['Alt'],
		['Fn'],
		['Ctrl'],
		['Left'],
		['Down'],
		['Right']
	]
];

const accentKeys = new Set(['Esc', 'Enter', 'Space']);

export const KEYBOARD_UNITS = 16;
export const KEYBOARD_ROWS = rows.length;

export const keys: KeyDef[] = rows.flatMap((row, rowIndex) => {
	let cursor = 0;
	return row.map(([label, width = 1], index) => {
		const x = (cursor + width / 2 - KEYBOARD_UNITS / 2) * KEY_UNIT;
		cursor += width;
		return {
			id: `${rowIndex}-${index}-${label}`,
			label,
			row: rowIndex,
			x,
			z: (rowIndex - (KEYBOARD_ROWS - 1) / 2) * KEY_UNIT,
			width,
			accent: accentKeys.has(label)
		};
	});
});
