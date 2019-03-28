/*
import * as React from "react";
import { App, iFlexiCell, iFlexiTable, iSTORE } from "./App";
import { FlexiTableRow } from "./FlexiTableRow";
import { AppReact } from "./App.react";
import { AppUtils } from "./AppUtils";
import { FlexiTableCellEditable } from "./FlexiTableCellEditable";
import { FlexiTableCell } from "./FlexiTableCell";
import { FlexiTableCellReact } from "./FlexiTableCell.react";

export class FlexiTableCellEditableReact<P> extends FlexiTableCellReact<P> {
	constructor (props) {
		super(props);
	}
	render () {
		let cell:iFlexiCell = this.props.tableID.rows[this.props.rowIndx].cells[this.props.cellIndx];

		let out:any = AppUtils.wrapValueWithType(AppReact.cellVal(cell.value), cell.value);
		return <td className="editable">{out}</td>;
	}
}*/
