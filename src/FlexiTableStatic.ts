import { App } from "./App";
import { CellDirection, DBType, eCookie, eFieldType, iFlexiCell, iFlexiDBconf, iFlexiRow, iFlexiTable, iFlexiTableConfField, iFlexiTableConfs } from "./Interfaces";
import { eServerItemModifyState, eTableType, EventApp, EventServer, iAppEvent } from "./Events";
import EventEmitter = require("eventemitter3");
import { Categories } from "./cells/CellCatReference";
import { AuthStitch } from "./components/AuthStitch";
import { AppUtils } from "./AppUtils";
import { AppReact } from "./components/App.react";

export class FlexiTableStatic {

static subscribeToEvents (emiter : EventEmitter) {
	emiter.on(EventServer.nm.RowDelete, FlexiTableStatic.onDeleteRow);
	emiter.on(EventServer.nm.TableCountRows, FlexiTableStatic.onCountRows);
	emiter.on(EventServer.nm.RowInsertNew, FlexiTableStatic.onInsertNewRow);
	emiter.on(EventServer.nm.ItemUpdate, FlexiTableStatic.rowUpdate);
	emiter.on(EventServer.nm.Table, FlexiTableStatic.onServerTableData);
	emiter.on(EventApp.nm.ItemUpdateRequest, FlexiTableStatic.itemUpdateRequest);
	emiter.on(EventApp.REQ_CAT_REFERENCES, FlexiTableStatic.reqCatReferences);
}
static parseFields (table : iFlexiTable) : Map<string, iFlexiTableConfField> {
	let ret:Map<string, iFlexiTableConfField> = new Map();
	let fields:Array<iFlexiTableConfField>;
	if (App.STORE.configDB.tablesConf[table.id]) {
		fields = App.STORE.configDB.tablesConf[table.id].fields;
	}
	if (!fields) fields = [];
	fields.forEach((field: iFlexiTableConfField, indx: number) => {
		ret.set(field.name, field);
	});
	return ret;
}

static generateCols (items : Array<any>, table : iFlexiTable) : Map<string, string> {
	let cols:Map<string, string> = new Map();
	let colsLabel = new Map();
	let tableType = '?';
	let idCol = '_id';
	//this.generateLabels();
	cols.set(App.flexiToolsColName, '');

	let fields = new Array();
	if (App.STORE.configDB.tablesConf[table.id]) {
		fields = App.STORE.configDB.tablesConf[table.id].fields;
	}
	if (!fields)  fields = [];

	fields.forEach((val:any, index:number) => {
		cols.set(val.name, val.label ? val.label : ''); //{col:val.name, label:val.label});
		/*if  (!this.props.store.isDevMode && val.name==this.getIDCol) {
		} else {
			this.cols.push(val.name);
			if (val.label) this.colsLabel.set(val.name, val.label);
			else if (this.props.store.isDevMode) this.colsLabel.set(val.name, 'NO_LABEL');
		}*/
	});

	for (let i in items) {
		for (let n in items[i]) {
			// console.log(!App.curr.state.viewAsRoot && n==this.getIDCol);
			/*if (tableType==eTableType.CATEGORIES && n==App.FIELD_CAT_DEPTH) {
				if (!cols.has(n) && App.categoriesUseBarColumn) {
					cols.unshift(n);
				}
			} else*/
			if  (!App.STORE.isDevMode && n==idCol) {
			} else if ((App.STORE.isDevMode || colsLabel.size==0) && !cols.has(n)) {
				cols.set(n, '');
			}

		}
	}

	//console.log('generating cols', cols);
	//console.tableID([...cols]);
	return cols;
}
static reqCatReferences (eve : EventApp) {
	let data : any = eve.data;
	// console.warn('req cat reference tableID', data, data.col, data.settings);
	let settings:iFlexiTableConfField = data.settings;
	Categories.refreshCatReferences(settings.refTable, settings.refCol);
	// App.emit(new EventApp(EventApp.nm.TableGetRequest, {tableID:settings.refTable, col:settings.refCol
	// 	, query:{$project:{[settings.refCol]: 1, [App.FIELD_CAT_PARENT]:1}}, tableType:TableType.CAT_REFERENCE, limit:999} as iAppEvent));
}
static itemUpdateRequest (eve : EventApp) {
	try {
		let cell: iFlexiCell = App.STORE.tables[eve.data.tableID].rows[eve.data.rowIndx].cells[eve.data.cellIndx];
		if (cell) cell.inTransition = true;
	} catch (e) {}
	App.update();
}
static conf (tableID : string) : iFlexiTableConfs {
	if (App.STORE.configDB && App.STORE.configDB.tablesConf[tableID]) {
		//console.log(App.STORE.configDB.tablesConf);
		return App.STORE.configDB.tablesConf[tableID];
	} else return FlexiTableStatic.newTableConfs();
}
static updateAppListCookie (table : iFlexiTable) {
	if (!table) return;
	if (table.conf && table.conf.flexiAppMetaTable == 'true') {
		let entries =[], app_id, app_db;
		table.rows.forEach((row:iFlexiRow, indx:number) => {
			app_id=''; app_db='';
			row.cells.forEach((cell:iFlexiCell, indx:number) => {
				if (cell.col=='app_id') {
					app_id = cell.value;
				} else if (cell.col=='app_db') {
					app_db = cell.value;
				}
			});
			if (app_id && app_db) entries.push({id:app_id,db:app_db});
			//console.warn(row.cells);
		});
		AppUtils.storageSave(eCookie.APP_LIST, entries);
	}
}
static onServerTableData (eve : EventServer) {
	let reqData:iAppEvent = eve.eventRequest.data;
	let table:iFlexiTable = FlexiTableStatic.parse(eve);

	FlexiTableStatic.updateAppListCookie(table);
	//console.log('TABLE parse', reqData.tableType, tableID);
	table.fields.forEach((field: iFlexiTableConfField, indx: any) => {
		if (field.type == eFieldType.CAT_REFERENCE && field.refTable!=table.id) {
			console.log('REQ CAT_REFERENCE', field, field.refTable, field.refCol, field.refIdCol);
			let outData:iAppEvent = {
				tableID: table.id, col: field.refCol
				, settings: {refTable: field.refTable, refCol: field.refCol, refIdCol: field.refIdCol, fieldSettings:field.settings}
			};
			App.emit(new EventApp(EventApp.REQ_CAT_REFERENCES, outData));
		}
	});

	if (reqData.tableType == eTableType.FULL) {
		// console.warn('setting main tableID', table);
		if (table.subtableName) {
			table.subtable = App.STORE.subtables[table.id];
			// console.warn('SUBTABLE SET', table.subtable);
		}
		App.STORE.header.tableTabSelected = reqData.tableID;
		App.STORE.tables[reqData.tableID] = table;
		//App.emit(new EventApp(EventApp.nm.TableCountRows, {tableID:table.id, query:{}} as iAppEvent));
	}
	//console.log('SETTING CAT REFERENCES', reqData.tableType);
	if (reqData.tableType == eTableType.CAT_REFERENCE || table.conf.tableType == eTableType.CATEGORIES) {
		// console.log('SETTING CAT REFERENCES', reqData.tableType);
		let rowsToProcess: Array<iFlexiRow>;

		if (reqData.tableType ==eTableType.CAT_REFERENCE) {
			// console.log('cat refs', 'processing incoming rows for coll');
			rowsToProcess = table.rows;
		} else if (eve.eventRequest.data.tableType == eTableType.FULL) {
			rowsToProcess = table.rows;
			//App.STORE.catReferences.set(tableID.id, Categories.processCatRefs(rowsToProcess, reqData.col ? reqData.col : 'title'));
			// console.log('cat refs', 'processing incoming rows for categories');
		} else if (App.STORE.tableActive && App.STORE.tables[App.STORE.tableActive]) {
			// console.log('cat refs', 'processing existing rows');
			rowsToProcess = App.STORE.tables[App.STORE.tableActive].rows;
		}

		let colCatTitle;
		if (reqData.tableType == eTableType.FULL)
			colCatTitle = App.STORE.configDB.tablesConf[table.id].categoriesParentTitleField;
		else
			colCatTitle = reqData.col;

		if (rowsToProcess) {
			//console.log('to process', colCatTitle);
			Categories.processCatRefs(rowsToProcess, colCatTitle, table.id, reqData.settings);
		}
	}
	App.update();
}
static newTableConfs (rowsPerPage ?:number, maxFieldChars ?:number) : iFlexiTableConfs {
	// let conf : iFlexiTableConfs = {rowsPerPage:50, maxFieldChars:100, showFullTexts:false};
	let idCol = '_id';
	// if (App.dbType==DBType.MONGODB) {
	// 	idCol = '_id';
	// }
	if (!rowsPerPage)  rowsPerPage = 50;
	if (!maxFieldChars)  maxFieldChars = 50;
	let conf : iFlexiTableConfs = {//flexiAppMetaTable:null, rowsPerPage:50, maxFieldChars:100, showFullTexts:false};
		description : '',
		rowCount :-1,
		showFullTexts: false,
		maxFieldChars: maxFieldChars,
		flexiAppMetaTable: null,
		onInsertNewAddAuthEmailToField: null,
		categoriesParentTitleField: null,
		name: '',
		subtable: '',
		tableType: eTableType.FULL,
		rowsPerPage: rowsPerPage,
		cellDirection: CellDirection.HORIZONTAL,
		idCol: idCol,
		fields: []
	};
	return conf;
}
static newTable () : iFlexiTable {
	return {cols:new Map(), rows:[], fields:new Map(), conf:FlexiTableStatic.newTableConfs()};
}
static onCountRows (eve :EventServer) {
	let tableID = eve.eventRequest.data.tableID;
	if (!App.STORE.tables[tableID]) return;
	//console.log(App.STORE.tables, eve);
	if (!Number.isInteger(eve.data.dbObj as number)) return;
	FlexiTableStatic.conf(tableID).rowCount = eve.data.dbObj as number;
	//App.STORE.tables[tableID].maxRows =
	console.log(FlexiTableStatic.conf(tableID).rowCount);
	App.update();
}
static loadTable (tableID :string, tableType :eTableType, forced: boolean = false) {
	if (!App.STORE.tables[tableID] || forced) {
		console.warn('REQ_TABLE ', tableID, tableType/*, FlexiTableStatic.conf(tableID)*/);
		App.STORE.tables[tableID] = FlexiTableStatic.newTable();
		App.STORE.tables[tableID].inTransition = true;
		let reqData:iAppEvent = {countRows:true, tableType:tableType, tableID:tableID, limit:FlexiTableStatic.conf(tableID).rowsPerPage};
		//console.log('loadTable', FlexiTableStatic.conf(tableID));
			App.emit(new EventApp(EventApp.nm.TableGetRequest, reqData));
		// } catch (err) {
		// 	console.error('loadTable error', reqData, err);
		// }
	} else {
		console.log('REQ_TABLE cached', tableID, tableType);
		App.update();
	}
}
static onDeleteRow (eve : EventServer) {
	console.log('onDeleteRow', eve);
	let table:iFlexiTable = App.STORE.tables[eve.eventRequest.data.tableID];
	table.rows.splice(eve.eventRequest.data.rowIndx, 1);
	App.update();
}
static reactDeleteRow (table :iFlexiTable, rowIndx :number, rowID :string) {
	//console.log(tableID, rowIndx, rowID);
	let outData:iAppEvent = {tableID:table.id, rowIndx:rowIndx, id:rowID};
	App.emit(new EventApp(EventApp.nm.RowDeleteRequest, outData));
}
static reactInsertNew (tableID :string, rowParentID: any) {
	let tableConf = FlexiTableStatic.conf(tableID);
	let query = rowParentID ? {[App.FIELD_PARENT]: rowParentID} : {};
	// console.log(tableConf, App.STORE.configDB.tablesConf);
	if (tableConf.onInsertNewAddAuthEmailToField) {
		query[tableConf.onInsertNewAddAuthEmailToField] = App.STORE.authorizedEmail;
	}
	let outData:iAppEvent = {parentID:rowParentID, query:query, tableID:tableID};
	console.log('reactInsertNew', outData);
	App.emit(new EventApp(EventApp.nm.RowInsertNewRequest, outData));
}
static parse (eve :EventServer) {
	let reqData:iAppEvent = eve.eventRequest.data;
	let table:iFlexiTable = FlexiTableStatic.newTable();
	let row:iFlexiRow;
	let refConf:iFlexiTableConfs;
	let subtableHas : boolean = false;
	let subtableRowsReq: Array<string> = [];

	if (reqData.tableID == App.configTableName) {
		if (AppUtils.isArray(eve.data.dbObj) && (eve.data.dbObj as Array<any>).length==0) {
			console.warn('Flexi config table is found but empty');
			App.STORE.configDBisEmpty = true;
			return table;
		} else {
			App.STORE.configDBisEmpty = false;
			// config must be duplicated otherwise original data will be mutated: parsed and become js object
			App.STORE.configDB = JSON.parse(JSON.stringify(eve.data.dbObj[0]));
			// console.warn(App.STORE.configDB);
			let confUpdating = false;
			try {
				App.STORE.configDB.tablesConf = JSON.parse(App.STORE.configDB.tablesConf as any);
				confUpdating = true;
			} catch (e) {
				console.warn('Error parsing tablesConf', e);
			}
			let confEmpty :iFlexiTableConfs;
			let refConf :iFlexiTableConfs;
			let tabl:string;
			// let defaultRowsPerPage = App.STORE.configDB.rowsPerPage;
			for (tabl in App.STORE.configDB.tablesConf) {
				confEmpty = FlexiTableStatic.newTableConfs(App.STORE.configDB.rowsPerPage, App.STORE.configDB.maxFieldChars);
				refConf = App.STORE.configDB.tablesConf[tabl];

				if (refConf) {
					confEmpty.fields = refConf.fields;
					if (refConf.description) confEmpty.description = refConf.description;
					if (refConf.rowsPerPage > -1) confEmpty.rowsPerPage = refConf.rowsPerPage;
					if (refConf.cellDirection) confEmpty.cellDirection = refConf.cellDirection as CellDirection;
					if (refConf.tableType) confEmpty.tableType = refConf.tableType;
					if (refConf.idCol) confEmpty.idCol = refConf.idCol;
					if (refConf.cellDirection) confEmpty.cellDirection = refConf.cellDirection;
					if (refConf.categoriesParentTitleField) confEmpty.categoriesParentTitleField = refConf.categoriesParentTitleField;
					if (refConf.flexiAppMetaTable) confEmpty.flexiAppMetaTable = refConf.flexiAppMetaTable;
					if (refConf.onInsertNewAddAuthEmailToField) confEmpty.onInsertNewAddAuthEmailToField = refConf.onInsertNewAddAuthEmailToField;
				}
				App.STORE.configDB.tablesConf[tabl] = confEmpty;
			}

			console.log('SETTING TABLES CONF', App.STORE.configDB.tablesConf);
			if (confUpdating) {
				App.emit(EventApp.ON_CONF_SET);
				App.emit(new EventApp(EventApp.nm.TablesList, App.STORE.configDB.tables.split(',')));
				//App.update();
			}
		}

		// console.log(App.configDB);
	}

	// console.tableID('Table parse', eve.data.dbObj, reqData);
	if (Array.isArray(eve.data.dbObj)) {
		table.id = reqData.tableID;
		table.canCreateRows = true;
		table.conf = FlexiTableStatic.conf(table.id);

		//console.log('parsing ' + table.id, table, JSON.stringify(table));
		if (reqData.skip) table.skipPages = reqData.skip;
		//AppUtils.storageSave(FlexiTableStatic.clientStoragePrefix(tableID)+'_fullTexts', App.STORE.tables[tableID].showFullTexts);
		table.conf.showFullTexts = AppUtils.storageGet(FlexiTableStatic.clientStoragePrefix(table.id)+'_fullTexts');
		table.reqDuration = eve.duration;
		table.inTransition = false;
		table.insertButton = 'Insert New';
		table.rows  = [];
		table.fields = new Map();

		table.cols = FlexiTableStatic.generateCols(eve.data.dbObj, table);
		table.fields = FlexiTableStatic.parseFields(table);
		//tableID.labels = App.generateLabels(tableID.id);

		eve.data.dbObj.forEach((dbRow:any, rowIndx:number) => {
			row = {cells:[], rowID:null};
			for (let dbCellKey in dbRow) {

				//Object.values(row).forEach((cell:any, cellIndx:number) => {
				if (dbCellKey==table.conf.idCol) {
					row.rowID = dbRow[dbCellKey].toString();
				} else if (dbCellKey == App.FIELD_PARENT) {
					row.rowParentID = dbRow[dbCellKey].toString();
				}
				row.cells.push({value:dbRow[dbCellKey], col:dbCellKey});
			}
			if (refConf && refConf.subtable && row.rowID) {
				subtableHas = true;
				subtableRowsReq.push(row.rowID);
				//tableID.subtable = FlexiTableStatic.parse(refConf.subtable);
			}
			table.rows.push(row);
		});
		if (subtableHas) {
			table.subtableName = refConf.subtable;
			// console.warn(table.id + ' has subtable ' + table.subtableName);
			FlexiTableStatic.loadTable(refConf.subtable, eTableType.FULL);
			/*if (!App.STORE.subtables[refConf.subtable]) App.STORE.subtables[refConf.subtable] = FlexiTableStatic.newTable();
			table.subtableName = refConf.subtable;
			let eveData: iAppEvent = {
				tableType: eTableType.SUBTABLE, tableID: refConf.subtable, parentTable: table.id
				,query:{$match:{[App.FIELD_PARENT]:{$in:subtableRowsReq}}}
			};
			App.emit(new EventApp(EventApp.nm.TableGetRequest, eveData));*/
		} //else console.warn(table.id + ' has not subtable');
	}
	return table;
}
static onInsertNewRow (eve : EventServer) {
	let reqData:iAppEvent = eve.eventRequest.data;
	let refTable:iFlexiTable = App.STORE.tables[reqData.tableID];
	let rowID = eve.data.dbObj.insertedId as string;

	if (reqData.tableID == App.configTableName) {
		FlexiTableStatic.loadTable(App.configTableName, eTableType.FULL, true);
		//App.emit(new EventApp(EventApp.nm.TableGetRequest, {tableID:App.configTableName} as iAppEvent));
	} else {

		let row: iFlexiRow = {rowID: rowID.toString(), cells: [{col: refTable.conf.idCol, value: rowID}]};

		if (reqData.parentID) {
			row.cells.push({col: App.FIELD_PARENT, value: rowID.toString()});
			// row[App.FIELD_PARENT] = reqData.parentID;
			row.rowParentID = reqData.parentID;
		}

		console.log('inserting in ' + reqData.tableID, row, refTable);
		refTable.rows.unshift(row);
	}

	App.update();
}
static rowUpdate (eve :EventServer) {
	let reqData:iAppEvent = eve.eventRequest.data;
	let table : iFlexiTable = App.STORE.tables[reqData.tableID];
	let cell: iFlexiCell = App.STORE.tables[reqData.tableID].rows[reqData.rowIndx].cells[reqData.cellIndx];
	if (eve.eventRequest.data.val === undefined) {
		App.STORE.tables[reqData.tableID].rows[reqData.rowIndx].cells.splice(reqData.cellIndx, 1);
	} else {
		if (!cell) {
			cell = {value: '', isEditing: false, col: reqData.col};
			App.STORE.tables[reqData.tableID].rows[reqData.rowIndx].cells.push(cell);
		}
		cell.inTransition = false;
		if (eve.data.dbObj.modifiedState == eServerItemModifyState.MODIFIED) {
			cell.lastModifyResult = eServerItemModifyState.MODIFIED;
			cell.value = reqData.val;
		} else if (eve.data.dbObj.modifiedState == eServerItemModifyState.MODIFY_ERROR) {
			cell.lastModifyResult = eServerItemModifyState.MODIFY_ERROR;
		} else {
			cell.lastModifyResult = eServerItemModifyState.MODIFIED_NOT;
		}
	}
	if (cell.lastModifyResult == eServerItemModifyState.MODIFIED) {
		FlexiTableStatic.updateAppListCookie(table);
	}
	if (reqData.tableID == App.configTableName) {
		FlexiTableStatic.loadTable(App.configTableName, eTableType.FULL, true);
	}
	App.update();
	console.log('rowUpdate', eve);
}
static isHorizontal (table : iFlexiTable) : boolean {
	if (table.id == App.configTableName) return false;
	else return table.conf.cellDirection == CellDirection.HORIZONTAL;
}

static createEmptyConfigRow () {
	let query:iFlexiDBconf = {tablesConf:'{}' as any, tables:'', defaultTable:'', confTableJsonFields:'', fileThumbUrl:''
		, fileUploadDir:'', rowsPerPage:50};
	let req:iAppEvent = {tableID:App.configTableName, query:query};
	App.emit(new EventApp(EventApp.nm.RowInsertNewRequest, req));
	//console.log('creating empty config row');
}
static createQueryObjectFromSearchTerm (tableID : string, search : string) : object {
	let compositeQueryArray = [];
	let query = {};
	let searchTerm;
	let regexError = false;
	try {
		searchTerm = new RegExp(search, "i");
	} catch (e) {
		alert(e);
		regexError = true;
	}
	if (search) {
		//console.log('SEARCH', search, searchTerm);
		App.STORE.tables[tableID].cols.forEach((colLabel:string, colKey:string) => {
			compositeQueryArray.push({[colKey]: {$regex: searchTerm, $options: 'i'}});
		});
		query = {$or: compositeQueryArray};
	}
	return regexError ? null : query;
}
static gotoPage (tableID : string, page :number, searchTerm : string) {
	//console.log('page:'+page, 'skip', page*this.props.tableRef.rowsPerPage, this.props.tableRef.maxItemsCount);
	let data:iAppEvent = {
		db: AppReact.db, tableID: tableID,
		searchTerm: searchTerm,
		query: {$match:this.createQueryObjectFromSearchTerm(tableID, searchTerm)},
		skip : page*FlexiTableStatic.conf(tableID).rowsPerPage,
		limit: FlexiTableStatic.conf(tableID).rowsPerPage,
		tableType : eTableType.FULL
	};
	//console.log('gotopage', data);
	App.emit(new EventApp(EventApp.nm.TableGetRequest, data));
}
static clientStoragePrefix (tableID : string) : string {
	return '__flexi_'+App.STORE.appID+'_'+App.STORE.appDB + '_'+tableID;
}
static initTableIfDoesntExist (tableID : string) : boolean {
	if (!App.STORE.tables[tableID].conf) {
		App.STORE.tables[tableID].conf = FlexiTableStatic.newTableConfs();
		return true;
	} else return false;
}
static toggleFullTexts (tableID: string) {
	let currSetting:boolean;
	let newSetting:boolean;
	let storageGet:any = AppUtils.storageGet(FlexiTableStatic.clientStoragePrefix(tableID)+'_fullTexts');
	FlexiTableStatic.initTableIfDoesntExist(tableID);

	if (storageGet === false || storageGet === true) {
		currSetting = storageGet;
		//App.STORE.tables[tableID].conf.showFullTexts = !currSetting;
	}
	newSetting = !currSetting
	App.STORE.tables[tableID].conf.showFullTexts = newSetting;
	//FlexiTableStatic.saveOnClientFullTextOption(tableID);
	AppUtils.storageSave(FlexiTableStatic.clientStoragePrefix(tableID)+'_fullTexts', newSetting);
	App.update();
}
}