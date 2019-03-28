import * as React from "react";
import { FlexiTableCellReact } from "../components/FlexiTableCell.react";
import { iFlexiCell } from "../Interfaces";
import { AppUtils } from "../AppUtils";
import { App } from "../App";

// interface sCellDate extends stateFlexiTableCellReact {date?:string, time?:string}
export class CellFlexiAppURL<P> extends FlexiTableCellReact<{}> {
// state : (state:stateFlexiTableCellReact) => void;
constructor (props) {
	super(props);
	this.showEditTools = this.enableClickEditing = false;
}
contentModeEdit () : JSX.Element {
	return <React.Fragment>{this.props.col}</React.Fragment>;
}
gotoApp (path :Array<string>, e) {
	App.switchApp(path[0], path[1]);
}
contentModeView () : JSX.Element {
	let url = '', app_id = '', app_db = '';
	this.props.table.rows[this.props.rowIndx].cells.forEach((cell:iFlexiCell, indx:number) => {
		if (cell.col == 'app_id') {
			app_id = cell.value;
		} else if (cell.col  == 'app_db') {
			app_db = cell.value;
		}
	});
	if (app_id && app_db) url += '/' + app_id + '/' + app_db;
	return <React.Fragment><a href="#" onClick={this.gotoApp.bind(this, [app_id, app_db])}>{url}</a></React.Fragment>;
	// } else
}
}