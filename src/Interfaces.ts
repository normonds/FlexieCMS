import { eServerItemModifyState } from "./Events";
import { iCategoriesReference } from "./cells/CellCatReference";
import * as React from "react";

export class eCookie {
	static APP_LIST : string = '__flexi_app_list';
	static APP_ACTIVE : string = '__flexi_app_active';
}
export class WarningLevel {
	static ERROR : string = 'error'
	static WARNING : string = 'warning';
	static LOG: string = 'log';
}
export interface iFlexiCell {
	JSONvalue ?: string;
	valueType ?: string;
	lastModifyResult ?: eServerItemModifyState;
	inTransition ?: boolean;
	value ?: any;
	col ?: string;
	isEditing ?: boolean;
}
export interface iFlexiRow {
	rowParentID ?: string;
	rowID : string;
	tools ?: string;
	editable ?: boolean;
	deletable ?: boolean;
	cells : Array<iFlexiCell>;
}
export interface iFlexiTableConfField {
	refTable ?: string;
	refCol ?: string;
	refIdCol ?: string;
	catSelect ?: string;
	name ?: string;
	label ?: string;
	type ?: eFieldType;
	settings ?: {} | string;
}
export interface iFlexiTableConfs {
	description ?: string
	rowCount ?: number
	showFullTexts ?: boolean
	maxFieldChars ?: number
	flexiAppMetaTable ?: string
	onInsertNewAddAuthEmailToField ?: string
	categoriesParentTitleField ?: string
	name ?: string
	subtable ?: string
	tableType ?: string
	rowsPerPage ?: number
	fullTextsMinLength ?: number
	cellDirection ?: string
	idCol ?: string
	fields ?: Array<iFlexiTableConfField>
}
export interface iFlexiTable {
	//showFullTexts ?: boolean;
	// categoriesParentTitleField ?: string;
	subtable ?: iFlexiTable;
	subtableName ?: string;
	fields ?: Map<string, iFlexiTableConfField>;
	conf ?: iFlexiTableConfs;
	// idCol ?: string;
	// cellDirection ?: CellDirection;
	id ?: string;
	cols : Map<string, string>;
	// tableType ?: string;
	// labels ?: Map<string, string>;
	//description ?: string;
	canCreateRows ?: boolean;
	insertButton ?: string;
	rows : Array<iFlexiRow>;
	searchLabel ?: string;
	searchTerm ?: string;
	searchBar ?: string;
	lastTimeElapsed ?: string;
	reqDuration ?: number;
	//maxRows ?: number;
	skipPages ?: number;
	// rowsPerPage ?: number;
	inTransition ?: boolean;
}
export interface iFlexiHeader {
	label ?: string;
	codename ?: string;
	tableTabs ?: Array<iFlexiHeaderTab>;
	tableTabSelected ?: string;
}
export interface iFlexiHeaderTab {
	label ?: string;
	codename ?: string;
}
export interface iFlexiDBconf {
	tablesConf ?: {[name :string]:iFlexiTableConfs},
	defaultTable ?: string,
	//fileUploadUrl ?: string,
	fileUploadDir ?: string,
	fileThumbUrl ?: string,
	confTableJsonFields ?: string,
	rowsPerPage ?: number,
	maxFieldChars ?: number,
	tables ?: string
}
export interface iSTORE {
	moveUnusedFilesResp ?: any;
	warnings ?: Map<string,React.JSX.Element>;
	adminAllowAnonUsers ?: true;
	isAdminApp ?: boolean;
	configDBisEmpty ?: boolean;
	adminApp: { id: string; db: string };
	appList ?: { id: string; db: string }[];
	appDB ?: string;
	appID ?: string;
	urlRow ?: string;
	urlCol ?: string;
	urlTable ?: string,
	subtables ?: {[name :string] :iFlexiTable}
	showSettings ?: boolean;
	isDirectEditingEnabled ?: boolean;
	isShowValuesEnabled ?: boolean;
	configDB ?: iFlexiDBconf;
	catReferences : Map<string, iCategoriesReference>;
	isDevMode ?: boolean;
	isAuthorized ?: boolean;
	pageTitle ?: string;
	authorizedName ?: string;
	authorizedEmail ?: string;
	devModeLabel ?: string;
	footer ?: string;
	header ?: iFlexiHeader;
	tables ?: { [name :string] : iFlexiTable};
	tableActive ?: string;
}
export enum DBType {
	MONGODB = 'mongodb'
}
export enum CellDirection {
	HORIZONTAL = 'horizontal',
	VERTICAL = 'vertical'
}
export enum eFieldType {
	STRING = 'string',
	FLEXI_APP_URL = 'flexiAppURL',
	DATE_AS_STAMP = 'dateAsStamp',
	EDITOR_FULL = 'editorFull',
	FILE_UPLOAD = 'fileUpload',
	CAT_REFERENCE = 'catReference'
}