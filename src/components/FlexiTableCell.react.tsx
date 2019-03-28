import * as React from "react";
import { App } from "../App";
import { eFieldType, iFlexiCell, iFlexiTableConfField } from "../Interfaces";
// import { FlexiTableRow } from "../../to.delete/old/FlexiTableRow";
import { AppReact } from "./App.react";
import { AppUtils, eCellValType } from "../AppUtils";
import { eServerItemModifyState, EventApp, iAppEvent } from "../Events";
import { Editor } from '@tinymce/tinymce-react';
import { SyntheticEvent } from "react";
import { iCellProps } from "./FlexiTableRow.react";
const BSON = require('bson');
const ObjectID = BSON.ObjectId;

export interface stateFlexiTableCellReact {
	editingValue ?:any, isEditing ?:boolean, date ?:string, time ?:string
}
export class FlexiTableCellReact<P> extends React.Component<iCellProps , {}> {
state : stateFlexiTableCellReact;
setState : (state:stateFlexiTableCellReact, onSetState ?: () => void) => void;
showEditTools : boolean = true;
convertCellOnSaveTo : string;
enableClickEditing : boolean = true;
editModeSameAsViewMode : boolean = false;
cssWordBreakAll : boolean = true;
classNames : Set<string> = new Set(['editable']);
// classNames ?:Set<string>;
constructor (props) {
	super(props);
	this.state = {editingValue:this.cell().value, isEditing:false};
	// console.warn('constructor', this.cell().value.toString());
	// console.log(JSON.stringify(this.state));
	// this.classNames = new Set(['editable']);
}
rowID () {
	return this.props.table.rows[this.props.rowIndx].rowID;
}
setDirectEditing (isDirectEditing: boolean) {
	this.showEditTools = !isDirectEditing;
	this.editModeSameAsViewMode = isDirectEditing;
}
onClick (e:React.MouseEvent<HTMLElement>) {
	if (!this.state.isEditing) {
		this.setState({isEditing:true});
	}
}
userCancelEdit (e ?:React.MouseEvent<HTMLElement>) {
	this.setState({isEditing:false});
}
userSaveEdit (e ?:React.MouseEvent<HTMLElement>) {
	let isSaved = this.emitEdit();

	if (isSaved) this.setState({isEditing:false});
	// if (this.convertCellOnSaveTo || (this.state.editingValue != null && this.state.editingValue !== this.cell())) {

		// this.classNames.add('inTransition');
		// this.processAndSetStateValue(value);
	// } else console.log('Not saving cell!');
}
emitEdit (delet : boolean = false) : boolean {
	let value:any = this.state.editingValue;
	let notModifiedReason = '', alertInfo = '';

	if (delet) value = undefined;
	else if (this.convertCellOnSaveTo) {
		if (value == null) value = this.cell().value;
		// console.warn(this.convertCellOnSaveTo);
		switch (this.convertCellOnSaveTo) {
			case eCellValType.JS_STR : {
				if (this.props.table.id == App.configTableName && this.props.col==App.COL_NAME_TABLES_CONF) {
					try {
						let temp = JSON.parse(value);
					} catch (e) {
						App.warn(e);
						alertInfo = notModifiedReason = 'Error parsing JSON:' + e + ', value:' + value;
						//alert = notModifiedReason;
					}
				} else if (typeof value == 'object') value = JSON.stringify(value);
				else value = value.toString();
				break;
			}
			case eCellValType.JS_ARRAY :
			case eCellValType.JS_OBJ : {
				// console.warn('converting json');
				if (typeof value == 'object') {
					//notModifiedReason = 'JSON parse Inc value is already object'; break;
				} else {
					try {
						value = JSON.parse(value);
					} catch (e) {
						App.warn(e);
						alertInfo = notModifiedReason = 'Error parsing JSON:' + e + ', value:' + value;
						//alert = notModifiedReason;
					}
				}
				break;
			}
			case eCellValType.JS_NUMBER : {
				let toVal;
				try {
					toVal = Number.parseFloat(value);
				} catch (e) {}
				if (isNaN(toVal)) {
					alertInfo = notModifiedReason = value + "is not a number";
					//alert(notModifiedReason);
					//App.warn('Value to save is not convertible to number!', value);
				} else {
					value = toVal;
				}
				break;
			}
			case eCellValType.OBJECT_ID : {
				try { value = new ObjectID(value); } catch (e) {
					//alert(e);
					alertInfo = notModifiedReason = "Error converting to ObjectId! " + e;
				}
				break;
			}
		}
	} /*else if (value === this.cell().value) {
		notModifiedReason = 'Save value same as inc value!';
	}*/

	if (notModifiedReason) {
		App.warn('Not saving value: ' + notModifiedReason);
		if (alertInfo) alert(alertInfo);
		return false;
	}

	console.log('to save', typeof value, value);

	// this.htmlEditor = '';
	//App.log('textareaBlur', this.textarea.props, this.textarea.valueOf(), this.textarea.toString());
	let ret:iAppEvent = {db:AppReact.db, tableID:this.props.table.id, col:this.props.col, id:this.rowID(), val:value
		, rowIndx:this.props.rowIndx, cellIndx:this.props.cellIndx};
	let jsonError = false, json;
	/*if (this.props.tableID.id==App.configTableName && App.configDBconfServer.confTableJsonFields.split(',').indexOf(this.props.col)>-1) {
		try {
			json = JSON.parse(value);
		} catch (e) {
			jsonError = e;
		}}*/
	if (jsonError !== false) {
		alert(jsonError['name'] + ": "+ jsonError['message']);
	}
	App.emit(new EventApp(EventApp.nm.ItemUpdateRequest, ret));
	this.onSavePost();
	return true;
}
onSavePost () {}
handleKeyPress (e:React.MouseEvent<HTMLElement>) {
	//console.log(e.keyCode);
	if ((e as any).keyCode==27) { // escape
		this.setState({isEditing:false});
	} else {
		//console.log(e.nativeEvent.target);
		//this.setState({editingValue:false});
	}
}
handleChange (e:any) {
	this.setState({isEditing:true, editingValue:e.nativeEvent.target.value});
	//console.log(e.nativeEvent.target.value);
}
isEmpty () {
	return this.props.cellIndx==null;
}
confCol () : iFlexiTableConfField {
	return this.props.table.fields.get(this.props.col);
}
/*
	One of matching strings if string array is provided.
 */
confColHasSettingFlag (vari : string | string[]) : boolean {

	let ret = false;
	if (typeof vari === 'string') return this.confCol().settings && this.confCol().settings.toString().indexOf(vari)>-1;
	else if (AppUtils.isArray(vari)) {
		vari.forEach((val:string, indx:number) => {
			if (this.confCol().settings && this.confCol().settings.toString().indexOf(val)) ret = true;
		});
	}
	return ret;
}
cell () : iFlexiCell {
	let ret:iFlexiCell;
	try {
		if (this.props.cellIndx!=undefined) ret = this.props.table.rows[this.props.rowIndx].cells[this.props.cellIndx];
	} catch (e) {
		console.warn('FlexiTableCellReact', 'Error parsing cell path!');
	}
	if (ret != undefined) {
		ret.valueType = AppUtils.cellType(ret.value);
	} else ret = {value:'', col:this.props.col, valueType:eCellValType.UNDEFINED};
	/*if (typeof ret.value == 'object') {
		try {
			ret.JSONvalue = JSON.stringify(ret.value);
		} catch (e) {
			App.warn('Error JSON parsing cell value' + e);
		}
	}*/
	return ret;
	//return this.props.tableID.rows[this.props.rowIndx].cells[this.props.cellIndx];
}
confirmDelete (e:any) {
	if (confirm('Delete cell?')) {
		this.setState({isEditing:false});
		this.emitEdit(true);
	}
}
handleEditorChange (e) {
	this.setState({isEditing:true, editingValue:e.target.getContent()});
	AppReact.log('Full editor was updated:', e.target.getContent());
}
editorLoadContent (e) {
	//document.getElementById(e.target.id).scrollIntoView();
	document.getElementById(this.idControls()).scrollIntoView();
	console.log('Editor loaded!', e);
}
id () {
	return this.props.table.id+'_'+this.props.rowIndx+'_'+this.props.col+'_';
}
idControls () {
	return 'editor_' + this.props.table.id+'_'+this.props.rowIndx+'_'+this.props.col;
}
contentModeView () : JSX.Element { return null;}
contentModeEdit () : JSX.Element {	return null; }
jsxFullEditor (editingValue : string) : JSX.Element {
	return <Editor
		initialValue={editingValue} onInit={this.editorLoadContent.bind(this)} onChange={this.handleEditorChange.bind(this)}
		init={{
			width: 600, height: 400, plugins: 'link image code',
			toolbar: 'undo redo | bold italic | alignleft aligncenter alignright | code'
		}}
	/>;
}
changeCellType (e) {
	this.convertCellOnSaveTo = e.target.value;
	// console.log('changeCellType' , e.target.value);
}
jsxEditingTools () : JSX.Element {
	let butDelete;
	let typeSelect;

	if (this.props.store.isDevMode) {
		butDelete = <a style={{cursor: 'pointer', verticalAlign: 'bottom'}}
					   onClick={this.confirmDelete.bind(this)} className="material-icons">delete</a>;
		//let selectDefaultVal;
		let defaultValueType = this.cell().valueType;
		this.convertCellOnSaveTo = defaultValueType;
	// console.log(this.cell());
		typeSelect = <React.Fragment>&nbsp;type:<select
			onChange={this.changeCellType.bind(this)} defaultValue={defaultValueType}>
			<option value=''>&lt;don't change&gt;</option>
			<option value={eCellValType.JS_STR}>string</option><option value={eCellValType.JS_OBJ}>JSON (object)</option>
			<option value={eCellValType.JS_ARRAY}>JSON (array)</option>
			<option value={eCellValType.JS_NUMBER}>number</option><option value={eCellValType.OBJECT_ID}>ObjectId</option>
		</select></React.Fragment>
	}
	return <React.Fragment><div id={this.idControls()} className="cell-editing-tools"><button
		onClick={this.userSaveEdit.bind(this)}>Save</button>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<button
		className="white" onClick={this.userCancelEdit.bind(this)}>Cancel</button>&nbsp;{butDelete}{typeSelect}</div>
	</React.Fragment>;
}
valToStr (anyVal : any) : string {
	if (anyVal == null) return '';
	let ret : string = anyVal.toString();
	if (typeof anyVal == 'object') {
		// console.log(anyVal, anyVal.constructor.name);
		try {
			ret = JSON.stringify(anyVal);
		} catch (e) {
			App.warn('Error JSON parsing cell value' + e);
		}
	}
	return ret;
}
basicFieldEditor (editingValue : any) : JSX.Element { let _ = this;
	let longestLine = 40, linesCount =2;
	if (typeof editingValue == 'string') {
		let lines = editingValue.split(/\r\n|\r|\n/);
		linesCount = lines.length;
		lines.forEach((line: string, indx: number) => {
			if (line.length > longestLine) longestLine = line.length;
		});

		if (longestLine > 100) longestLine = 100;

		let extraChars = editingValue.length - linesCount*longestLine;
		let extraLines = 0;
		if (extraChars>0) {extraLines = Math.ceil(extraChars/longestLine);}
		linesCount += extraLines;

		if (linesCount > 35) linesCount = 35; else if (linesCount < 2) linesCount = 2;
	}
	setTimeout(() => {
		let refControls = document.getElementById(this.idControls());
		if (refControls && refControls.getBoundingClientRect().top < 0) {
			try {refControls.scrollIntoView();} catch (e) {}
		}
	}, 500);
	return <textarea autoFocus onKeyUp={_.handleKeyPress.bind(_)} style={this.editorStyle()} cols={longestLine} rows={linesCount}
					 onChange={_.handleChange.bind(_)} value={this.valToStr(editingValue)}/>
}
isConfTable () :boolean {
	return this.props.table.id == App.configTableName;
}
editorStyle () {
	return {};
	if (this.isConfTable() && this.props.col==App.COL_NAME_TABLES_CONF) return {minWidth:'700px', minHeight:'380px'};
}
onClickViewContent (link, e) {
	AppUtils.hrefStop(e);
	window.open(link, '_blank');
}
linkToCell () : string {
	return '/'+this.props.store.appID+'/'+this.props.store.appDB+'/'+this.props.table.id+'/'+this.rowID()+'/'+this.props.col;
}
render () { let _:FlexiTableCellReact<P> = this;
	let cell :iFlexiCell = _.cell();
	let confs :iFlexiTableConfField = _.props.table.fields.get(_.props.col);
	if (!confs) confs = {};
	let outValue:any = !_.isEmpty() ? cell.value : '';//AppUtils.wrapValueWithType(AppReact.cellVal(cell.value), cell.value) : '';
	let out :any = <React.Fragment></React.Fragment>;
	let outEditTools :JSX.Element;
	let style = {}, addViewAsHTML = <React.Fragment></React.Fragment>;
	let shortenedOutText = '';

	// console.log('Cell RENDER');
	let editingValue:string, textarea:JSX.Element;
	out = outValue;

	// console.log(this.state.isEditing, this.props.store.isDirectEditingEnabled);
	if (this.state.isEditing && this.props.store.isDirectEditingEnabled) {
		editingValue = _.state.editingValue!=null ? _.state.editingValue : cell.value;
		out = <div>{_.jsxEditingTools()}{_.basicFieldEditor(editingValue)}</div>;
	} else if (this.state.isEditing && this.enableClickEditing) {
		editingValue = _.state.editingValue!=null ? _.state.editingValue : cell.value;

		if (this.props.store.isDirectEditingEnabled) {
			textarea = _.basicFieldEditor(editingValue);
		// } else if (conf.type == eFieldType.DATE_AS_STAMP) {
		// 	textarea = _.dateEditor(editingValue);
		} else if (confs.type == eFieldType.EDITOR_FULL) {
			textarea = _.jsxFullEditor(editingValue);
		} else {
			textarea = _.basicFieldEditor(editingValue);
		}

		out = textarea;

		let overrideContent;
		if (this.editModeSameAsViewMode) {
			overrideContent = _.contentModeView();
		} else overrideContent = _.contentModeEdit();

		if (overrideContent) {
			out = overrideContent;
		}

		outEditTools = _.showEditTools ? _.jsxEditingTools() : <React.Fragment></React.Fragment>;

	} else {

		if (typeof out == 'object') {
			out = this.valToStr(out);
		}

		if (!this.props.store.isShowValuesEnabled) {
			let overrideContent = _.contentModeView();
			//console.warn(this.props.table);
			if (overrideContent) {
				out = overrideContent;
			} else {
				let outTypeof = typeof out;

				if (outTypeof == 'string' && /<[a-z][\s\S]*>/i.test(out)) addViewAsHTML = <React.Fragment><a
					href={ this.linkToCell()} className="viewContent" onClick={this.onClickViewContent.bind(this, this.linkToCell())}
					>view&nbsp;as&nbsp;html&nbsp;<i className="material-icons" style={{fontSize: '14px'}}>open_in_new</i>
				</a></React.Fragment>;

				if (this.confCol() && this.confCol().type == eFieldType.EDITOR_FULL) {
					out = out.replace(/<(?:.|\n)*?>/gm, '').replace (/&#{0,1}[a-z0-9]+;/ig, "");
				}

				if (((this.confCol() && (this.confCol().type == eFieldType.EDITOR_FULL || this.confCol().type == eFieldType.STRING))
					|| !this.confCol()) && outTypeof == 'string'
					&& !this.props.table.conf.showFullTexts && out.length>this.props.table.conf.maxFieldChars) {
					shortenedOutText = out.substr(0, this.props.table.conf.maxFieldChars) + ' ...';
				}

			}
		}

	}

	if (cell.inTransition) this.classNames.add('inTransition');
	else {
		this.classNames.delete('inTransition');
		if (cell.lastModifyResult == eServerItemModifyState.MODIFIED) this.classNames.add('saveSuccess');
		else if (cell.lastModifyResult == eServerItemModifyState.MODIFY_ERROR) this.classNames.add('saveError');
	}

	if (shortenedOutText) out = <React.Fragment>{shortenedOutText}&nbsp;</React.Fragment>;
	out = <React.Fragment>{outEditTools}<div className={this.cssWordBreakAll ? 'cell-content-wrap' : ""}>{out}{addViewAsHTML}</div></React.Fragment>;

	if (_.isEmpty()) this.classNames.add('cell-no-def');
	else {
		this.classNames.delete('cell-no-def');
		if (this.props.store.isDevMode) {
			out = AppUtils.wrapValueWithType(AppUtils.cellVal(cell.value), out, cell.value);
		}
	}

	// React.createElement(type:'td')
	let props = {className:[... this.classNames].join(' '),  onClick:_.onClick.bind(_)};
	let cellElement = React.createElement('td', props, out);
	//return <td style={this.style()} onClick={}>{out}</td>;
	return cellElement;
}

}