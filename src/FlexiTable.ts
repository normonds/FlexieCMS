import { CellDirection, iFlexiRow, iFlexiTable, iFlexiTableConfField, iFlexiTableConfs } from "./Interfaces";

export class FlexiTable implements iFlexiTable {
	private table : iFlexiTable;
	// private rows
	constructor () {

	}
	get id () : string {
		return this.table.id;
	}
	get cols () : Map<string, string> {
		return new Map();
	}
	get canCreateRows () : boolean {
		return true;
	}
	caption: string;
	categoriesParentTitleField: string;
	cellDirection: CellDirection;
	conf: iFlexiTableConfs;
	fields: Map<string, iFlexiTableConfField>;
	get idCol () : string{
		return '';
	}
	inTransition: boolean;
	insertButton: string;
	lastTimeElapsed: string;
	maxRows: number;
	reqDuration: number;
	rows: Array<iFlexiRow>;
	rowsPerPage: number;
	searchBar: string;
	searchLabel: string;
	searchTerm: string;
	showFullTexts: boolean;
	skipPages: number;
	subtable: iFlexiTable;
	subtableName: string;
	tableType: string;

}