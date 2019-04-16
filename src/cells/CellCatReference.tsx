///<reference path="../components/FlexiTableCell.react.tsx"/>
import { FlexiTableCellReact, stateFlexiTableCellReact } from "../components/FlexiTableCell.react";
import * as React from "react";
import { App } from "../App";
import { iFlexiCell, iFlexiRow, iFlexiTableConfField } from "../Interfaces";
import { iCellProps } from "../components/FlexiTableRow.react";
// import { FlexiTableOld } from "../../to.delete/old/FlexiTableOld";
// import { iFlexiTableLayout } from "../Interfaces";
import { eTableType, EventApp, EventServer, iAppEvent } from "../Events";
import { AppReact } from "../components/App.react";
import { AppUtils } from "../AppUtils";

export interface iCategoriesReference {
	items:Array<iFlexiRow>, jsxOptions:Map<string,JSX.Element>, catIDsIDs:Map<string, any>, catIDsTitle:Map<string, string>
	, catIDsTitleSpaced: Map<string, string>, catIDsNumerated:Map<string,string>
}
export class Categories {
	static processCatRefs (items : Array<any>, colTitle : string, tableID : string, settings : string = '') : void {

		let catIDsIDs:Map<string,string> = new Map();
		let catIDsTitle:Map<string,string> = new Map();
		let catIDsCell:Map<string,iFlexiCell> = new Map();
		let catIDsTitleSpaced:Map<string,string> = new Map();
		let catIDsNumerated:Map<string,string> = new Map();
		let jsxOptions:Map<string,JSX.Element> = new Map();
		jsxOptions.set('', <option key="TOP" value="">&lt;TOP&gt;</option>);
		let cellCat, cellTitle;
		items.forEach((row:iFlexiRow, indxRow:number) => {
			// console.log(row.cells);
			cellCat = '';
			cellTitle = '';
			row.cells.forEach((cell:iFlexiCell, indxCell:number) => {
				if (cell.col == App.FIELD_CAT_PARENT) {
					cellCat = cell.value;
					catIDsCell.set(row.rowID, cell);
					// console.log(row.rowID, cell.value);
					// catIDsTitle.set(row.rowID, cell.value);
				} else if (cell.col == colTitle) {
					cellTitle = cell.value;
				}
			});
			catIDsIDs.set(row.rowID, cellCat);
			catIDsTitle.set(row.rowID, cellTitle);

		});
		let arrangedMap = Categories.processLevel(catIDsIDs, new Map());

		var o2 = Categories.mapToObjectRec(arrangedMap);
		// console.log(JSON.stringify(o2, null, '  '));

		let retMap = new Map();
		Categories.addPath(arrangedMap, retMap, '');
		// console.log('path', retMap);



		//console.warn(retMap);
		let strSpace = '';
		retMap.forEach((val:string, key:string) => {
			// console.log('retMap', key, val);
			// if (catIDsCell.get(key)) {
				if (val.split('.').length==1) {
					strSpace = /*String.fromCharCode(160) + String.fromCharCode(160)+*/ '↑ ';
					//catIDsCell.get(key).value = catIDsTitle.get(key);
					catIDsTitleSpaced.set(key, strSpace + '' + catIDsTitle.get(key));
					catIDsNumerated.set(key, val);
				} else {
					strSpace = val.replace(/./g, String.fromCharCode(160) + String.fromCharCode(160)) + '↑ ';
					//catIDsCell.get(key).value = strSpace + catIDsTitle.get(catIDsIDs.get(key));// + val;
					catIDsTitleSpaced.set(key, strSpace + '' +  catIDsTitle.get(key));
					catIDsNumerated.set(key, val);
				}
			// }
		});

		Categories.rearrangeRows(items, catIDsNumerated);

		let optionKey, optionVal;
		items.forEach((row:iFlexiRow, indxRow:number) => {
			optionKey = optionVal = '';
			row.cells.forEach((cell:iFlexiCell, indxCell:number) => {
				if (cell.col == App.FIELD_CAT_PARENT) {
					optionKey = cell.value;
					//cell.value = catIDsIDs.get(row.rowID);
				} else if (cell.col == colTitle) {
					optionVal = cell.value;
				}
			});
			jsxOptions.set(row.rowID, <option key={row.rowID} value={row.rowID}>{/*row.rowID*/}{
				catIDsNumerated.get(row.rowID) + ' ' + catIDsTitle.get(row.rowID)}</option>);
		});
		//console.warn(catIDsTitle, catIDsTitleSpaced);

		let ret:iCategoriesReference = {catIDsTitleSpaced:catIDsTitleSpaced, items:items, jsxOptions:jsxOptions
			, catIDsIDs:catIDsIDs, catIDsTitle:catIDsTitle, catIDsNumerated:catIDsNumerated};
		// console.log('processCatRefs', ret);
		//return ret;
		console.warn('processCatRefs', tableID, colTitle, settings, ret);
		App.STORE.catReferences.set(tableID, ret);
	}
	static rearrangeRows (rows : Array<iFlexiRow>, mapIDsNumerated : Map<string,string>) {
		// console.log('start rearrange', rows.length, mapIDsNumerated.size);
		rows.sort((a:iFlexiRow, b:iFlexiRow) => {
			// console.log('rearrange', mapIDsNumerated.get(a.rowID), mapIDsNumerated.get(b.rowID));
			if (mapIDsNumerated.get(a.rowID) < mapIDsNumerated.get(b.rowID)) {
				return -1;
			}
			if (mapIDsNumerated.get(a.rowID) > mapIDsNumerated.get(b.rowID)) {
				return 1;
			}
			return 0;
		});
		//console.log('end rearrange', rows);
	}
	static getCatColCell (row : iFlexiRow) : iFlexiCell {
		let ret = null;
		row.cells.forEach((cell:iFlexiCell, indx:number) => {
			if (cell.col==App.FIELD_CAT_PARENT) ret = cell;
		});
		return ret;
	}
	static addPath (map : Map<string,any>, retMap : Map<string, string>, path : string) : string {
		let indx = 1;
		let ret = new Map();
		let path2 = path ? path+'.' : '';
		map.forEach((value:any, key:string) => {
			if (value.size) {
				retMap.set(key, Categories.addPath(value, retMap, path2+(indx++)));
			} else {
				retMap.set(key, path2+String(indx++));
			}
		});
		return path;// + '.'+ret.size.toString();
	}
	static searchForSubs (str : string, map : Map<string,string>/*, toPopulate : Map<string, any>*/) {
		let ret : Map<string, any> = new Map();
		map.forEach((value:string, key:string) => {
			if (value == str) {
				//toPopulate.set(value, new Map());//Categories.searchForSubs(value, map, toPopulate));
				//ret.set(key, new Map());
				ret.set(key, Categories.searchForSubs(key, map));
			}
		});
		//console.log('populated', toPopulate);
		return ret;
	}
	static processLevel (map : Map<string,string>, retMap : Map<string, any>) {
		map.forEach((value:string, key:string) => {
			// console.log(key, value);
			if (!value) {
				retMap.set(key, new Map());
			}
		});
		map.forEach((value:string, key:string) => {
			if (retMap.has(value)) {
				retMap.get(value).set(key, Categories.searchForSubs(key, map));
			}
		});
		return retMap;
	}
	static  mapToObject(o, m) {
		for(let[k,v] of m) { o[k] = v }
	}
	static mapToObjectRec (m) {
		let lo = {}
		for(let[k,v] of m) {
			if(v instanceof Map) {
				lo[k] = Categories.mapToObjectRec(v)
			}
			else {
				lo[k] = v
			}
		}
		// console.log(lo);
		return lo
	}
	static refreshCatReferences (table, col) {
		App.emit(new EventApp(EventApp.nm.TableGetRequest, {tableID:table, col:col
			, query:{$project:{[col]: 1, [App.FIELD_CAT_PARENT]:1}}, tableType:eTableType.CAT_REFERENCE, limit:999} as iAppEvent));
	}
}
// interface sCellDate extends stateFlexiTableCellReact {date?:string, time?:string}
export class CellCatReference<P> extends FlexiTableCellReact<{}> {
// state : (state:stateFlexiTableCellReact) => void;
	//props : iFlexiCell;
constructor (props) {
	super(props);
	// this.classNames.add('prev-arrow');
	// console.log(this.classNames);
	if (this.confColHasSettingFlag(['radio','checkbox'])) {
		this.setDirectEditing(true);
	}
}
componentDidMount () {
	App.emiter.on(EventServer.nm.ItemUpdate, this.onItemUpdate, this);
}
componentWillUnmount () {}
onItemUpdate (eve : EventServer) {
	// rearrange cats on parent change
	let reqData = eve.eventRequest.data;
	if (reqData.col == this.props.col && reqData.tableID==this.props.table.id
		&& this.props.table.rows[this.props.rowIndx].rowID==reqData.id && this.props.table.conf.tableType == eTableType.CATEGORIES) {
		if (this.props.table.conf.tableType == eTableType.CATEGORIES) {
			console.warn('rearranging rows');
			Categories.processCatRefs(this.props.table.rows, this.props.table.conf.categoriesParentTitleField, this.props.table.id);
			App.update();
		}
	}
}

onChange (e) {
	let field:iFlexiTableConfField = this.props.table.fields.get(this.props.col);
	let value:any;
	if (field.catSelect != 'multiple') {
		value = e.nativeEvent.target.value;
	} else {
		// alert(JSON.stringify(confCol));
		value = [];
		let options = e.target.options;
		for (let i = 0, l = options.length; i < l; i++) {
			if (options[i].selected) {
				value.push(options[i].value);
			}
		}
	}


	if (this.props.table.conf.tableType == eTableType.CATEGORIES && this.props.table.rows[this.props.rowIndx].rowID == value) {
		alert('You can\'t set parentID as self!');
	} else {
		this.setState({editingValue:value});
	}
}
/*onSavePost () {

}*/
onChangeRadio (val, type :string) { let _:CellCatReference<P> = this;
//console.log(val, type, eve);
	if (type == 'checkbox') {
		console.log(val);
		if (!AppUtils.isArray(this.state.editingValue)) {
			this.state.editingValue = [this.state.editingValue];
		}

		if (this.state.editingValue.indexOf(val) > -1) {
			this.state.editingValue.splice(this.state.editingValue.indexOf(val), 1);
		} else {
			this.state.editingValue.push(val);
		}

		this.setState({editingValue:this.state.editingValue}, () => {
			_.userSaveEdit();
			//console.log(this.state.editingValue);
		});
	} else {
		this.setState({editingValue: val}, () => {
			_.userSaveEdit();
		});
	}
}
radioEditingJSX (options :iCategoriesReference, type : 'radio' | 'checkbox') :JSX.Element[] {
	//console.log([...options.catIDsTitle.values()]);
	let ret = [];
	let checked;
	let inputName = this.id()+ type + (type=='checkbox' ? '[]' : '');
	options.catIDsTitle.forEach((val:string, key:string) => {
		if (AppUtils.isArray(this.state.editingValue)) {
			checked = this.state.editingValue.indexOf(key)>-1;
		} else  checked = key == this.state.editingValue;
		ret.push(<label key={key}><input onChange={this.onChangeRadio.bind(this, key, type)} checked={checked} type={type}
										 name={inputName} value={key} />{val}</label>);
	});
	return ret;
}
contentModeEdit () : JSX.Element {
	let refTable = this.props.table.fields.get(this.props.col).refTable;
	let catRefs :iCategoriesReference = this.props.store.catReferences.get(refTable);
	let field:iFlexiTableConfField = this.props.table.fields.get(this.props.col);
	let newMap = new Map(catRefs.jsxOptions);
	let multiple = false, multiSize = 1, editVal = this.state.editingValue;
	let select;

	/*if (this.confCol().typeSub == 'radio') {
		editVal = [ this.state.editingValue];
	} else*/
	if (field.catSelect == 'multiple' || AppUtils.isArray(editVal)) {
		multiple = true; multiSize = 10;
		if (!AppUtils.isArray(editVal)) editVal = [this.state.editingValue];
	}
	//newMap.delete(this.props.tableID.rows[this.props.rowIndx].rowID);
	//console.log('cat refs', newMap, options.jsxOptions);
	//let select = new React.Component();
	let selectProps:any = {};
	if (multiple) { selectProps.multiple = multiple; selectProps.size = multiSize; }
	selectProps.onChange=this.onChange.bind(this);
	selectProps.value = editVal;

	//console.log(this.confCol().settings);

	if (this.confColHasSettingFlag('checkbox')) {
		select = this.radioEditingJSX(catRefs, 'checkbox');
	} else if (this.confColHasSettingFlag('radio')) {
		select = this.radioEditingJSX(catRefs, 'radio');
		/*console.log([...options.catIDsTitle.values()]);
		select = [];
		let checked;
		options.catIDsTitle.forEach((val:string, key:string) => {
			checked = key == this.state.editingValue;
			select.push(<label key={key}><input onChange={this.onChangeRadio.bind(this, key)} checked={checked} type="radio"
					   name={this.id()+'radio'} value={key}/>{val}</label>);
		});*/
	} else select = React.createElement('select', selectProps,[...newMap]);

	// let select = <select multiple={multiple} size={multiSize} onChange={this.onChange.bind(this)} value={editVal}>{[...newMap]}</select>;
	return <React.Fragment><div>{this.props.store.isDevMode ? this.state.editingValue : ''}</div>{select}</React.Fragment>;
}
contentModeView () {
	let refTable = this.props.table.fields.get(this.props.col).refTable;
	let options :iCategoriesReference = this.props.store.catReferences.get(refTable);
	let out:any =[], outPre;

	if (!options) out = '!ref tableID not found!';
	else if (this.props.table.conf.tableType == eTableType.CATEGORIES) {
		outPre = options.catIDsTitleSpaced.get(this.state.editingValue);
		if (outPre === undefined && this.state.editingValue.length > 0) {
			outPre = <span className="errorColor">&lt;PARENT NOT FOUND&gt;</span>;

		}
		out = outPre;
	} else if (this.confColHasSettingFlag('checkbox')) {
		out = this.radioEditingJSX(options, 'checkbox');
	} else if (this.confColHasSettingFlag('radio')) {
		out = this.radioEditingJSX(options, 'radio');
	} else if (AppUtils.isArray(this.state.editingValue)) {
		let temp = [];
		this.state.editingValue.forEach((item:string, indx:number) => {
			if (options.catIDsTitle.has(item)) temp.push(options.catIDsTitle.get(item) + '');
			else temp.push(<span className="errorColor">&lt;NOT FOUND&gt;</span>);
		});
		out = temp.join(', ');
	} else {

		let outNumbers = options.catIDsNumerated.get(this.state.editingValue);
		let outTitle = options.catIDsTitle.get(this.state.editingValue);
		if (this.state.editingValue == '') {
			out = '';
		} else if (!options.catIDsNumerated.has(this.state.editingValue) && !options.catIDsTitle.has(this.state.editingValue)) {
			out = <span className="errorColor">&lt;NOT FOUND&gt;</span>;
		} else out = /*outNumbers + ' '+*/ outTitle;
	}
	if (!out) out = <span style={{opacity:0.5}}>&lt;TOP&gt;</span>;
	// if (confCol && confCol.type == eFieldType.DATE_AS_STAMP) {
	return <React.Fragment>{out}</React.Fragment>;
	// } else
}

}