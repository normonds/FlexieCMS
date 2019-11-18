import { AppReact } from "./components/App.react";

import * as EventEmitter from "eventemitter3";
import { eTableType, eServerItemModifyState, EventApp, EventServer, iAppEvent } from "./Events";
import * as ReactDOM from "react-dom";
import * as React from "react";
import { AuthStitch } from "./components/AuthStitch";
import { MongoStitchXHR } from "./components/MongoStitchXHR";
import { AppUtils } from "./AppUtils";
import { Categories, CellCatReference, iCategoriesReference } from "./cells/CellCatReference";
import { FlexiTableStatic } from "./FlexiTableStatic";
import { DBType, eCookie, iFlexiCell, iFlexiTable, iFlexiTableConfField, iFlexiTableConfs, iSTORE, WarningLevel } from "./Interfaces";
const BSON = require('bson');
const ObjectID = BSON.ObjectId;



export class App {
	static configTableName = '__flexi_conf';
	static STORE : iSTORE;
	static emiter : EventEmitter;
	static flexiToolsColName : string = '__flexi_tools_TH';
	static COL_NAME_TABLES_CONF = 'tablesConf';
	// static configDB : {tablesConf ?: any} = {};
	static dbType : DBType = DBType.MONGODB;
	// static FIELD_CAT_DEPTH : string = '__flexi_cat_depth';
	static FIELD_PARENT: string = '__flexi_parent';
	static FIELD_CAT_PARENT : string = '__flexi_parent_cat';
	static FIELD_APP_URL : string = '__flexi_AppURL';
	static FIELD_ROW_ID : string = '_id';
	static categoriesUseBarColumn :boolean = false;
	static mouseIsDown : boolean = false;
	static obje:Object = {};
	//lala : string ='12312';
	static errorClear (id : string) {
		App.STORE.warnings.delete(id);
		App.update();
	}
	erro () {
		let app = new App();
		app.erro();
		//app.lala = '123';
		App.errorClearAll(null);
		App.emiter.removeAllListeners();
	}
	static errorClearAll (id : string) {
		App.STORE.warnings.clear();
		App.update();
		//let pp:App = new App();
	}
	static log (warning: any, warnLevel = WarningLevel.LOG) {
		console.error(warning);
		let id = Math.random().toString();
		if (typeof warning == 'object') {
			//console.log(warning);
			warning = <span>{AppUtils.objToJSX(warning)}</span>;
			//warning = AppUtils.objToJSX({herro:"234234", yello:123, mello:{lala:"2432",yala:[1,"32323",false,true]}});
		}
		App.STORE.warnings.set(id, <div className={warnLevel + ''} key={id}>
			<button className="white" onClick={App.errorClear.bind(this, id)}>close</button>
			<button className="white" onClick={App.errorClearAll.bind(this, id)}>all</button>
			&nbsp;{warning}</div>);
		console.log(App.STORE.warnings);
		App.update();

	}
	static logError (warning : any) {
		App.log (warning , WarningLevel.ERROR);
	}
	static warn (... params) {		console.warn(...params);	}
	static emit (event : EventApp | EventServer | string, data ?:any) {
		//App.info('emit', event.eventName, event.data);
		if (typeof event == 'string') { App.emiter.emit(event, data);
		} else { App.emiter.emit(event.eventName, event);	}
	}
	static update () {
		// let starttime = Date.now();
		ReactDOM.render(<AppReact store={App.STORE}/>, document.getElementById("root"));
		// console.log('ReactDOM.render', Date.now()-starttime);
	}
	constructor () {
		App.emiter = new EventEmitter();
		document.addEventListener(EventApp.nm.DocumentMouseDOWN, (ev)=>{
			App.mouseIsDown = true;
			App.emit(new EventApp(EventApp.nm.DocumentMouseDOWN, ev));
		}, false);
		document.addEventListener(EventApp.nm.DocumentMouseUP, (ev)=>{
			//console.log('doc mouse up');
			App.mouseIsDown = false;
			App.emit(new EventApp(EventApp.nm.DocumentMouseUP, ev));
		}, false);
		// App.emiter.on(EventServer.nm.TablesList, App.setTablesListServer);
		window.addEventListener('popstate', App.windowPopState);

		App.emiter.on(EventApp.CLICK_HEADER_TAB, App.lastTableClickedF);
		App.emiter.on(EventApp.USER_AUTHORIZED, App.userAuthorized);
		App.emiter.on(EventApp.USER_DEAUTHORIZED, App.userDeauthorized);
		App.emiter.on(EventApp.TOGGLE_MODE_DEV, App.toggleDevMode);
		App.emiter.on(EventApp.TOGGLE_MODE_DIRECT_EDITING, App.toggleDirectEditing);
		App.emiter.on(EventApp.TOGGLE_MODE_SHOW_RAW_VALUES, App.toggleShowRawValues);
		App.emiter.on(EventApp.TOGGLE_SETTINGS, App.toggleSettings);

		App.emiter.on(EventApp.nm.TablesList, App.setTablesList);
		App.emiter.on(EventApp.nm.TableGetRequest, App.tableGetRequest);
		App.emiter.on(EventServer.nm.Cell, App.renderCell);

		App.STORE = {warnings:new Map(), adminAllowAnonUsers:true, isAdminApp:false, adminApp:{id:'flexi-cms-elihz', db:'flexi-cms-confs'}
		, isDevMode:false, showSettings:false, isDirectEditingEnabled:false, pageTitle:'FlexieCMS', header:{tableTabs:[]}
			, tables:{}, catReferences:new Map(), subtables:{}};

		FlexiTableStatic.subscribeToEvents(App.emiter);
		/*App.STORE.appList = [
			{id:'ritmainstituts-shop-rafyj', db:'ritmainstituts-shop'}
			,{id:'ri-stitch-piwyk', db:'noonidb'}
			, {id:'flexi-cms-elihz', db:'flexi-cms-conf'}
		];*/

		// AuthStitch.init('ri-stitch-piwyk', 'noonidb');
		//AuthStitch.renderLogin();
	}
	init () {
		//console.warn(AppUtils.getCookie());
		//AppUtils.setCookie(JSON.stringify(App.STORE.appList), 10);
		// App.logError('herro');
		App.readAndSetUrlVarsIfExists();

		if (App.STORE.appID && App.STORE.appDB) {
			AppUtils.storageSave(eCookie.APP_ACTIVE, [App.STORE.appID, App.STORE.appDB]);
		}

		let cookieAppActive, cookieAppList;
		try {
			cookieAppActive = AppUtils.storageGet(eCookie.APP_ACTIVE);
			cookieAppList = AppUtils.storageGet(eCookie.APP_LIST);
		} catch (e) {
			console.warn('JSON cookie parse error' + e);
		}

		console.warn(cookieAppList, cookieAppActive);
		if (cookieAppList) App.STORE.appList = cookieAppList;

		if (!App.STORE.appID || !App.STORE.appDB) {
			if (cookieAppActive && cookieAppActive[0] && cookieAppActive[1]) {
				console.log('reading cookie', cookieAppActive);
				App.STORE.appID = cookieAppActive[0];
				App.STORE.appDB = cookieAppActive[1];
			} else {
				console.log('not reading cookie', window.location.pathname);
				// if (!App.STORE.appID) App.STORE.appID = 'ritmainstituts-shop-rafyj';
				// if (!App.STORE.appDB) App.STORE.appDB = 'ritmainstituts-shop';
				// if (!App.STORE.appID)
					App.STORE.appID = App.STORE.adminApp.id;
				// if (!App.STORE.appDB)
					App.STORE.appDB = App.STORE.adminApp.db;
				App.STORE.isAdminApp = true;
			}
		}
		App.STORE.isDevMode = App.readDevModeClientPref();
		AuthStitch.init(App.STORE.appID, App.STORE.appDB);

		if (App.STORE.urlRow && App.STORE.urlCol && App.STORE.urlTable) {}
		else App.update();
	}

	static windowPopState (eve) {
		App.readAndSetUrlVarsIfExists();
		//console.log('windowPopState');
		FlexiTableStatic.loadTable(App.STORE.tableActive, eTableType.FULL);
		//App.lastTableClickedF(new EventApp(EventApp.CLICK_HEADER_TAB, {tableID:App.STORE.tableActive} as iAppEvent));
	}
	static readAndSetUrlVarsIfExists () {
		let path = window.location.pathname.split('/');
		path.shift();
		if (path[0]) App.STORE.appID = path[0];
		if (path[1]) App.STORE.appDB = path[1];
		if (path[2]) App.STORE.urlTable = path[2];
		if (path[3]) App.STORE.urlRow = path[3];
		if (path[4]) App.STORE.urlCol = path[4];
		App.setActiveTable(path[2]);
	}
	static lastTableClickedF (eve : EventApp) {
		//console.log('history.pushState');
		App.setActiveTable(eve.data.tableID);
		history.pushState({}, App.STORE.tableActive, '/'+App.STORE.appID +'/'+ App.STORE.appDB +'/'+ App.STORE.tableActive);
		FlexiTableStatic.loadTable(App.STORE.tableActive, eTableType.FULL, eve.data.forced);
	}
	static switchApp (id: string, db: any) {
		AppUtils.storageSave(eCookie.APP_ACTIVE, [id, db]);
		window.location.assign('/'+id+'/'+db);
	}
	static setActiveTable (table : string) {
		if (table) {
			App.STORE.tableActive = table;
			document.title = App.STORE.pageTitle + ' / ' + App.STORE.tableActive;
		}
	}
	static readDevModeClientPref () {
		return Boolean(AppUtils.storageGet('__flexi_'+App.STORE.appID+'_'+App.STORE.appDB+'_devMode'));
	}
	static toggleDevMode () {
		App.STORE.isDevMode = !App.STORE.isDevMode;
		AppUtils.storageSave('__flexi_'+App.STORE.appID+'_'+App.STORE.appDB+'_devMode', App.STORE.isDevMode);
		App.update();
	}
	static toggleDirectEditing () {
		App.STORE.isDirectEditingEnabled = !App.STORE.isDirectEditingEnabled;
		App.update();
	}
	static toggleShowRawValues () {
		App.STORE.isShowValuesEnabled = !App.STORE.isShowValuesEnabled;
		App.update();
	}
	static toggleSettings () {
		App.STORE.showSettings = !App.STORE.showSettings;
		App.update();
	}
	static tableGetRequest (eve : EventApp) {
		App.update();
	}
	static setTablesList (eve :any) {
		console.log('setTablesListServer', eve);
		// static setTablesList (eve : EventApp) {
		// console.log('setTablesList', eve.data);
		//setTimeout(App.setTablesList, 3000, {data:['herro',Math.random().toString()]});
		App.STORE.header.tableTabs = [];
		if (Array.isArray(eve.data)) {
			eve.data.forEach((label:string, indx:number) => {
				App.STORE.header.tableTabs.push({label:label, codename:label});
			});
		}
		App.STORE.header.tableTabs.push({label:App.configTableName, codename:App.configTableName});
		if (!App.STORE.tableActive) {
			if (App.STORE.configDB.defaultTable) {
				App.setActiveTable(App.STORE.configDB.defaultTable);
			} else if (App.STORE.header.tableTabs.length>0 && App.STORE.header.tableTabs[0].codename) {
				App.setActiveTable(App.STORE.header.tableTabs[0].codename);
			} else {
				App.setActiveTable(App.configTableName);
			}
		}
		FlexiTableStatic.loadTable(App.STORE.tableActive, eTableType.FULL);
			// App.emit(new EventApp(EventApp.nm.TableGetRequest
			// 	, {tableType:eTableType.FULL, tableID:App.STORE.configDB.defaultTable} as iAppEvent));
		// FlexiTableStatic.loadTable(App.STORE.tableActive, eTableType.FULL);
		//App.update();
	}
	static userDeauthorized (email :string) {
		App.STORE.isAuthorized = false;
		App.update();
	}
	static userAuthorized (email :string) {
		//console.log('user auth');
		App.STORE.isAuthorized = true;
		App.STORE.authorizedName = email;
		App.STORE.authorizedEmail = email;
		if (App.STORE.urlRow && App.STORE.urlCol) {
			// $project:{ [App.FIELD_ROW_ID]:App.STORE.urlRow/*, descr:App.STORE.urlCol*/ }
			App.emit(new EventApp(EventApp.nm.reqCell

				,{tableID: App.STORE.urlTable, col:App.STORE.urlCol, id:App.STORE.urlRow} as iAppEvent));
		} else {
			App.emit(new EventApp(EventApp.nm.TableGetRequest, {tableID: App.configTableName} as iAppEvent));
			App.update();
		}

	}
	static renderCell (eve :EventServer) {
		//console.log(eve.data.dbObj[0][eve.eventRequest.data.col]);
		AppUtils.toggleStylesheet('flexi.css', false);
		document.getElementById('body-wrap').innerHTML = eve.data.dbObj[0][eve.eventRequest.data.col];
	}

	static moveUnusedUploadedImages () {
		App.STORE.moveUnusedFilesResp = <div style={{display:'inline-block'}} className="inTransition"></div>;
		AuthStitch.stitchClient.callFunction('moveDBunusedFiles', [''])
		.then(resp => {
			App.STORE.moveUnusedFilesResp = resp.hasOwnProperty('length') ? resp.length + ' files changed' : resp;
			console.log(resp);
			App.update();
		}).catch(err => {
			App.logError(err);
			App.STORE.moveUnusedFilesResp = '';
			App.update();
		});
		App.update();
	}
}