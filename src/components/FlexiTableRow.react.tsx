import * as React from "react";
import { App } from "../App";
import { eFieldType, iFlexiCell, iFlexiTable, iFlexiTableConfField, iSTORE } from "../Interfaces";
// import { FlexiTableRow } from "../../to.delete/old/FlexiTableRow";
import { FlexiTableCellReact } from "./FlexiTableCell.react";
import { AppReact } from "./App.react";
import { EventApp } from "../Events";
import { CellUpload } from "../cells/CellUpload";
import { CellDate } from "../cells/CellDate";
import { CellCatReference } from "../cells/CellCatReference";
import { FlexiTableReact } from "./FlexiTable.react";
import { FlexiTableStatic } from "../FlexiTableStatic";
import { CellFlexiAppURL } from "../cells/CellFlexiAppURL";
// import { iFlexiTable__ } from "./FlexiTableOld";

export interface iCellProps {
	store : iSTORE, key:string | number, table:iFlexiTable, col:string, rowIndx:number, cellIndx ?:number
}
export class FlexiTableRowReact extends React.Component<{store:iSTORE, table:iFlexiTable, rowIndx:number} ,{}> {
	constructor (props) {
		super(props);
	}
	deleteRow (e) {
		let delStr = 'Delete?';
		let rowID = this.props.table.rows[this.props.rowIndx].rowID;
		if (this.props.store.isDevMode) delStr += ' (' + this.props.table.id + ':' + rowID+')';
		if (confirm(delStr))
			FlexiTableStatic.reactDeleteRow(this.props.table, this.props.rowIndx, rowID);
	}
	toolsCell (key : string | number = 'tools-cell') {
		return <th key={key}><a className="material-icons"  style={{cursor:'pointer'}}
								onClick={this.deleteRow.bind(this)}>delete</a></th>
	}
	createElement (field : iFlexiTableConfField, props : iCellProps) : React.JSX.Element {
		let classs : any = FlexiTableCellReact;

		if (!field) field = {};
		// console.log(confCol.type);
		if (field.type == eFieldType.FLEXI_APP_URL) {
			classs = CellFlexiAppURL;
		} else if (field.type == eFieldType.FILE_UPLOAD) {
			classs = CellUpload;
		} else if (field.type == eFieldType.DATE_AS_STAMP) {
			classs = CellDate;
		} else if (field.type == eFieldType.CAT_REFERENCE) {
			classs = CellCatReference;
		}

		let cell = React.createElement(classs, props);
		return cell;
	}
	render () {
		let out = [], hasCell, i = 0, cellReact, cellReactProps:iCellProps ,celli = 0;
		let rowID;
		if (this.props.table.rows[this.props.rowIndx] && this.props.table.rows[this.props.rowIndx].cells) {
			rowID = this.props.table.rows[this.props.rowIndx].rowID;
			// if (this.props.)
			//console.log(this.props.tableID.cols);
			this.props.table.cols.forEach((colLabel :string, colKey :string) => {
				if (colKey == App.flexiToolsColName && !FlexiTableStatic.isHorizontal(this.props.table)) {
				} else if (this.props.store.isDevMode || this.props.table.id==App.configTableName || colLabel || colKey==App.flexiToolsColName) {
					hasCell = false;

					cellReactProps = {key:colKey, store:this.props.store, table:this.props.table
						, col:colKey, rowIndx:this.props.rowIndx};
					//
					this.props.table.rows[this.props.rowIndx].cells.forEach((cell: iFlexiCell, cellIndx: number) => {
						if (colKey == cell.col) {
							hasCell = true;

							cellReactProps.cellIndx = cellIndx;
							cellReact = this.createElement(this.props.table.fields.get(colKey), cellReactProps);
							// console.log('1',cellReact);
							// let cellReact2 = <FlexiTableCellReact key={colKey} store={this.props.store} tableID={this.props.tableID}
							// 								 col={colKey} rowIndx={this.props.rowIndx} cellIndx={cellIndx} />;
							// console.log('2', cellReact2);
							if (FlexiTableStatic.isHorizontal(this.props.table)) {
								out.push(cellReact);
							} else {
								out.push(<tr key={colKey+'_'+Math.random()}><th>{AppReact.formatTableCol(cell.col, colLabel)}</th>{cellReact}</tr>);
							}
							// out.push(<td key={indx}>{indx}</td>);
						}
					});

					if (!hasCell) {
						cellReact = this.createElement(this.props.table.fields.get(colKey), cellReactProps);
						// cellReact = <FlexiTableCellReact key={colKey} store={this.props.store} tableID={this.props.tableID}
						// 								 col={colKey} rowIndx={this.props.rowIndx} />;
						if (colKey == App.flexiToolsColName && FlexiTableStatic.isHorizontal(this.props.table)) out.push(this.toolsCell(i++));
						else if (FlexiTableStatic.isHorizontal(this.props.table)) out.push(cellReact);
						else out.push(<tr key={colKey}><th>{AppReact.formatTableCol(colKey, colLabel)}</th>{cellReact}</tr>);
					}
				}

			});
			if (!FlexiTableStatic.isHorizontal(this.props.table) && this.props.table.subtableName) {
				//FlexiTableStatic.loadTable()
				out.push(<tr key="subtable"><td colSpan={2}><FlexiTableReact
					store={this.props.store} table={this.props.store.tables[this.props.table.subtableName]}
					rowParentID={rowID}/></td></tr>);
			}
		}
		if (FlexiTableStatic.isHorizontal(this.props.table)) {
			return <tr>{out}</tr>;
		} else return <tr>{this.toolsCell()}<td className="clear"><table className="table-style-vertical">
			<tbody>{out}</tbody></table></td></tr>;
	}
}