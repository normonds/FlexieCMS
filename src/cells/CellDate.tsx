import { FlexiTableCellReact, stateFlexiTableCellReact } from "../components/FlexiTableCell.react";
import * as React from "react";
import { eFieldType } from "../Interfaces";
import { iCellProps } from "../components/FlexiTableRow.react";

interface sCellDate extends stateFlexiTableCellReact {date?:string, time?:string}
export class CellDate<P> extends FlexiTableCellReact<{}> {
// state : (state:stateFlexiTableCellReact) => void;
constructor (props) {
	super(props);
}
dateOnChange (e) {
	// console.log(e.currentTarget.value, e.currentTarget.type);
	// this.state.
	let outState:sCellDate = this.state;
	//outState.editingValue
	if (e.currentTarget.type=='date') {
		outState.date = e.currentTarget.value;
	}
	else if (e.currentTarget.type=='time') {
		outState.time = e.currentTarget.value;
	}
	let dateParsed:Array<string> = this.state.date.split('-');
	let timeParsed = this.state.time.split(':');
	let date = new Date();
	date.setFullYear(Number.parseFloat(dateParsed[0]));
	date.setMonth(Number.parseFloat(dateParsed[1])-1);
	date.setDate(Number.parseFloat(dateParsed[2]));
	date.setHours(Number.parseFloat(timeParsed[0]));
	date.setMinutes(Number.parseFloat(timeParsed[1]));

	let stampToSave = date.getTime();
	// console.warn(dateParsed, timeParsed, this.cell().value, stampToSave);
	if (!isNaN(stampToSave)) {
		outState.editingValue = stampToSave;
	} else console.warn('Error creating timestamp!', stampToSave);
	this.setState(outState);
}
contentModeEdit () : React.JSX.Element {
	try {
		let date = new Date(this.cell().value), timeForInput;
		let dateForInput = date.getFullYear()+'-';

		timeForInput = (date.getHours()<10 ? '0'+date.getHours() : date.getHours())
			+ ':' + (date.getMinutes()<10 ? '0'+date.getMinutes() : date.getMinutes());
		if (date.getMonth() < 9) {
			dateForInput += "0";
		}
		dateForInput += (date.getMonth() + 1) + '-';
		if(date.getDate() < 10) {
			dateForInput += "0";
		}
		dateForInput += date.getDate();
		// let yyyy_mm_dd = dd_mm_yyyy.replace(/(\d+)\/(\d+)\/(\d+)/g, "$3-$2-$1");

		dateForInput = this.state.date ? this.state.date : dateForInput;
		// console.log(timeForInput, this.state.date);
		timeForInput = this.state.time ? this.state.time : timeForInput;

		if (!this.state.date || !this.state.time) {
			// YYYY-MM-DD
			// HH:MM
			this.setState({date:dateForInput, time:timeForInput});
		}

		return <React.Fragment><input type="date" value={dateForInput} onChange={this.dateOnChange.bind(this)}/>
			<input type="time" value={timeForInput} onChange={this.dateOnChange.bind(this)}/></React.Fragment>;
	} catch (e) {
		console.log(e);
	}
	return <React.Fragment>Error parsing date!</React.Fragment>;
}
contentModeView () {
	// if (confCol && confCol.type == eFieldType.DATE_AS_STAMP) {
		return <React.Fragment>{new Date(this.cell().value).toString()}</React.Fragment>;
	// } else
}
}