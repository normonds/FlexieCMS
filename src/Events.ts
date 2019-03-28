// import { FlexiTableOld } from "../../to.delete/old/FlexiTableOld";

export enum eTableType {
	CAT_REFERENCE = 'catReference',
	FULL = 'full',
	SUBTABLE = 'subtable',
	CATEGORIES = 'categories',
	STANDARD = 'standard'
}
export enum eServerItemModifyState {
	MODIFIED  = 'modified',
	MODIFIED_NOT = 'not modified',
	MODIFY_ERROR = 'modify error'
}
export interface iServerEventDBobj {
	db? : string,
	idCol? : string,
	idColSecondary? : string
	insertedId? : string | number;
	insertedCount? : number;
	nModified? : number;
	deletedCount? : number;
	id? : string | number;
	url? : string;
	filename? : string;
	modifiedCount? : any;
	modifiedState? : eServerItemModifyState;
	res? : any;
}
export interface iServerEvent {
	dbObj : iServerEventDBobj ;
	authorized? : boolean,
	__flexidb_duration? : number;
	__flexi_servEve? : string;
	__flexidb_error? : Object;
	__flexidb_info? : Object;
}
/*export class EventAppError {
	data : any;
	eventName : string;
	constructor (eventName : string, data:any) {
		this.eventName = eventName;
		this.data = data;
	}
}*/
export class EventServer {
	
	static nm = {
		Cell : 												'serverCell',
		TableCountRows :					'serverTableCountAll',
		MalformedServerEvent : 	'serverMalformedServerEvent',
		ResponseNoData :  				'serverResponseNoData',
		ItemUpdate :  							'serverItemUpdate',
		DatabaseConnError : 			'serverDatabaseConnError',
		NoCommandSpecified : 		'serverNoCommandSpecified',
		CatchError : 								'serverCatchError',
		TablesList :  								'serverTablesList',
		DatabasesList :  						'serverDatabasesList',
		Table :  										'serverTable',
		TableInfo :  								'serverTableInfo',
		RowInsertNew :  					'serverRowInsertNew',
		RowDelete :  							'serverRowDelete',
		UploadURL : 								'serverUploadURL',
		ImageURL: 								'serverImageURL'
	}
	
	data : iServerEvent;
	eventName : string;
	eventRequest: EventApp;
	startTime : number;
	duration : number;


	constructor (eventName : string, data:iServerEvent, requestEvent : EventApp, startTime : number) {
		this.eventName = eventName;
		this.data = data;
		this.eventRequest = requestEvent;
		this.startTime = startTime;
	}

}
/*export enum TableType {
	CATEGORIES = 'categories',
	CAT_REFERENCE = 'catReference',
	FULL = 'main'
}*/
export interface iAppEvent {
	countRows ?: boolean;
	colCatTitle ?: string;
	parentTable ?: string,
	parentRowIDs ?: Array<string>,
	skip? : number,
	parentID?: string;
	query?: object;
	db? : string,
	tableType ?: eTableType,
	tableID ?: string,
	forced ?: boolean,
	tableConf ?: any,
	// tableRef? : FlexiTableOld,
	id? : string | number,
	id2? : string | number,
	col? : string,
	val? : any,
	limit? : number,
	filename? : string,
	name? : string,
	type? : string,
	options? : object,
	searchTerm? : string,
	cellIndx ?: number;
	rowIndx ?: number;
	percents ?: number;
	settings ?: any;
}
export class EventApp {
	static nm = {
		reqCell : 											'appReqCell',
		RootViewToggle : 						'appRootViewToggle',
		TablesList:										'appTablesList',
		TableCountRows :						'appTableCountAll',
		UserIsAuthorized : 					'appUserIsAuthorized',
		FileUploadProgress : 				'appFileUploadProgress',
		DatabasesListRequest : 		'appDatabasesListRequest',
		TablesListRequest : 					'appListTablesRequest',
		TableGetRequest :					'appGetTableRequest',
		HeaderMount : 							'appHeaderMount',
		ItemUpdateRequest : 				'appUpdateItemRequest',
		CancelUpdateItem : 					'appCancelUpdateItem',
		RowInsertNewRequest : 		'appInsertNewRowRequest',
		RowDeleteRequest : 				'appDeleteRowRequest',
		DocumentMouseUP : 				'mouseup',
		DocumentMouseDOWN : 		'mousedown',
		DocumentDragEnd : 				'dragend',
		DocumentDragOver :  			'dragover',
		DragOverDropTarget :  			'appDragOverDropTarget',
		RequestUploadUrl :  				'appRequestUploadUrl',
		UploadStart :								'appUploadStart',
		UploadComplete :						'appUploadComplete',
		OverRowTools :							'appOverRowTools',
		OutRowTools :								'appOutRowTools',
		ImageURL : 			 						'appImageURL',
		ImageURLreq : 							'appImageURLreq'
	};

	data : iAppEvent;
	eventName : string;
	static CLICK_HEADER_TAB :string =				'EventApp.CLICK_HEADER_TAB';
	static USER_AUTHORIZED :string =					'EventApp.USER_AUTHORIZED';
	static USER_DEAUTHORIZED: string = 			'EventApp.USER_DEAUTHORIZED';
	static TOGGLE_MODE_DEV :string =				'EventApp.TOGGLE_MODE_DEV';
	static REACT_AUTH_LOGIN: string =				'EventApp.REACT_AUTH_LOGIN';
	static REACT_AUTH_LOGOUT: string =			'EventApp.REACT_AUTH_LOGOUT';
	static COUNT_ROWS: string = 							'EventApp.COUNT_ROWS';
	static TOGGLE_MODE_DIRECT_EDITING: string = 'EventApp.TOGGLE_MODE_DIRECT_EDITING';
	static TOGGLE_MODE_SHOW_RAW_VALUES: string = 'EventApp.TOGGLE_MODE_SHOW_RAW_VALUES';

	startTime ?: number;
	static ON_CONF_SET : string = 'EventApp.ON_CONF_SET';
	static TOGGLE_SETTINGS: string = 'EventApp.TOGGLE_SETTINGS';
	static REQ_CAT_REFERENCES: string = 'EventApp.REQ_CAT_REFERENCES';
	static REACT_AUTH_LOGIN_ANONYMOUS: string = 'EventApp.REACT_AUTH_LOGIN_ANONYMOUS';
	constructor (eventName : string, data?:any) {
		this.eventName = eventName;
		this.data = data;
	}

}