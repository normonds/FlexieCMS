import * as React from "react";
import { App } from "../App";
import { iFlexiRow, iFlexiTable, iSTORE } from "../Interfaces";
// import { FlexiTableRow } from "../../to.delete/old/FlexiTableRow";
import { FlexiTableRowReact } from "./FlexiTableRow.react";
import { FlexiTableCaptionReact } from "./FlexiTableCaption.react";
import { AppReact } from "./App.react";
import { FlexiTableStatic } from "../FlexiTableStatic";

export class FlexiTableReact extends React.Component<{store:iSTORE, table:iFlexiTable, rowParentID?:string} ,{}> {
	constructor (props) {
		super(props);
		// console.log('TABLE', this.props.store.tables[0]);
	}
	render () {
		let out = [], cols = [], tbody = [];//, tableID:iFlexiTable = this.props.store.tables[0];
		let table = this.props.table;

		if (table) {
			 // console.warn('tableID render ' + tableID.id);
			let i=0, colLabel, colKey;

			if (FlexiTableStatic.isHorizontal(table)) {
				table.cols.forEach((label: string, col: string) => {
					if (this.props.store.isDevMode || label || col==App.flexiToolsColName) {
						colLabel = label ? label : '';
						colKey = col == App.flexiToolsColName ? '' : col;
						cols.push(<th key={i++} className="sticky-colnames">{AppReact.formatTableCol(colKey, colLabel)}</th>);
					}
				});
				tbody.push(<tr key='cols'>{cols}</tr>);
			}

			table.rows.forEach((row:iFlexiRow, indx: number) => {
				if ((this.props.rowParentID && this.props.rowParentID == row.rowParentID)
						|| (!this.props.rowParentID)) {
					// out.push(this.props.parentRowID + ' - ' +row.rowParentID);
					out.push(<FlexiTableRowReact key={row.rowID} store={this.props.store} table={table} rowIndx={indx}/>);
				}
			});

			tbody.push(out);

		}
		let description;
		if (this.props.table) {
			description =  FlexiTableStatic.conf(this.props.table.id).description ? FlexiTableStatic.conf(this.props.table.id).description : '';
		}
		//console.log('out', out);
		return <div className="tableWrap" ><div style={{margin:'12px 0 6px 6px'}} dangerouslySetInnerHTML={{__html:description}} /><table className="table-style-0"><tbody>
			<FlexiTableCaptionReact store={this.props.store} table={table} rowParentID={this.props.rowParentID} />
			{tbody}</tbody></table>
		</div>;
	}
}