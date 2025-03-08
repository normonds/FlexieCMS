import * as EventEmitter from "eventemitter3";
import * as React from "react";
import { Header } from "./Header";
// import { iFlexiTable_, FlexiTableOld } from "../../to.delete/old/FlexiTableOld";
// import { iFlexiTableLayout } from "../Interfaces";
// import { DynamoDBwrap } from "./DynamoDBwrap";
// import { FlexiMongoXHR } from "./FlexiMongoXHR";
import { EventApp, EventServer } from "../Events";
// import { MongoStitchXHR } from "./MongoStitchXHR";
// import { sFlexiTableRow } from "../../to.delete/old/FlexiTableRow";
import { App } from "../App";
import { DBType, iSTORE } from "../Interfaces";
import { FlexiTableReact } from "./FlexiTable.react";
// import { AuthStitch } from "./AuthStitch";
import { AppUtils } from "../AppUtils";
import { FlexiTableStatic } from "../FlexiTableStatic";
import { AuthGoogle } from "./AuthGoogle";
import { MongoStitchXHR } from "./MongoStitchXHR";
const axios = require('axios');
// import * as AWS from 'aws-sdk';
// import 'bootstrap/dist/css/bootstrap.css';
// import * as ReactDataGrid from 'react-data-grid';
// import { Example } from './DataGrid';

// declare var AWS;
// import { Editors,	Filters,	Formatters,	Toolbar,	Menu,	Data,	DraggableHeader } from 'react-data-grid-addons';
// import { Example } from "./DataGrid";
// const { DropDownEditor } = Editors;
/*const { AutoComplete: AutoCompleteEditor, DropDownEditor } = Editors;
const { DropDownFormatter } = Formatters;

// options for priorities autocomplete editor
const priorities = [{ id: 0, title: 'Critical' }, { id: 1, title: 'High' }, { id: 2, title: 'Medium' }, { id: 3, title: 'Low'} ];
const PrioritiesEditor = <AutoCompleteEditor options={priorities} />;*/

interface FlexiDebug {
	requests : boolean, responses : boolean, warnings : boolean, verbose : boolean, mounts:boolean, mouseMoves:boolean
	, constructors:boolean
}
export interface sApp {mainTable?:string}
export interface  iConfServer {tablesConf:string, defaultTable:string, fileUploadDir:string, fileThumbUrl:string, fileUploadUrl:string, tables:string,
	confTableJsonFields:string}

interface iAppReactProps {
	store:iSTORE
}

export class AppReact extends React.Component<iAppReactProps ,{}> {

static FIELD_CAT_PARENT = '__flexi_parent_cat';
static EMPTY_TABLE : string = "____removeMainTable____";
static FIELD_CAT_DEPTH : string = '__flexi_cat_depth';
static FIELD_TYPE_CAT_REFERENCE : string = 'catReference';

state : sApp;
setState : (state : sApp, callback?: ()=>void) => void;
static error (... args) { console.error(... args); }
static config = {
	//fileDir: 'https://storage.googleapis.com/nooni-lv.appspot.com/flexi-imgs/',
	//urlUpload:"https://europe-west1-nooni-lv.cloudfunctions.net/get-file-upload-url",
	confTable:"__flexi_conf"
	//confTableJsonFields:['tables','tablesConf']
};
static confServer:iConfServer;

static db : string = '';
static curr : AppReact;
//static defaultTable : string = '__flexi_conf';
// static viewAsRoot = false;

static debug : FlexiDebug = { constructors:false, mouseMoves:false, verbose: false, requests : false, responses : true, warnings : true, mounts: false};
// static emiter : EventEmitter;
/*static emit (event : EventApp | EventServer) {
	//App.info('emit', event.eventName, event.data);
	App.emiter.emit(event.eventName, event);
	AppReact.emiter.emit(event.eventName, event);
}*/
static warn (... args) { console.warn(... args); }
static log (... args) {
	if (!AppReact.debug.mounts && args[0] && args[0]=='UN MOUNT') return;
	if (!AppReact.debug.mounts && args[0] && args[0]=='MOUNT') return;
	if (!AppReact.debug.constructors && args[0] && args[0]=='CONSTRUCTOR') return;
	console.log(... args);
}
static verb (... args) {	if (AppReact.debug.verbose) console.log(... args);}
static info (... args) {

	let color = 'lime';
	if (typeof args[0] == 'string' && args[0].startsWith('request')) color = 'orange';
	else if (typeof args[0] == 'string' && args[0].startsWith('response')) color = 'lime';

	if (args.length==2) {
		console.info('%c' + args[0], 'color:'+color+';font-size:110%', args[1]);
	} else if (args.length==3) {
		console.info('%c' + args[0], 'color:'+color+';font-size:110%', args[1],args[2]);
	} else console.info(... args);
}
static icon () {
	// return <span className="material-icons">cloud_download</span>
}
constructor (props) {
	super(props);
	AppReact.verb('App constructor');
	// AppReact.curr = this;
	// AppReact.emiter = new EventEmitter();
	this.state = {};
}

componentDidMount () { AppReact.verb('App mount'); }
/*
deleteUnusedImgsReq (aStr : Array<string>) {
	//http://localhost:5002/flexi-cms/us-central1/getAllFlexiFiles
	// let url  = 'http://localhost:5002/flexi-cms/us-central1/getAllFlexiFiles';
	axios.post(url, {files:aStr}).then(function (response) {
		//AppReact.info('response', FlexiMongoXHR.url, response);
		console.log('deleteUnusedImgsReq', response.data);
	}).catch(function (error) {
		App.warn(error);
	});
}
runFileFindOnDB (files : Array<string>, toDelete, startTime) {

	if (!files.length) {
		this.deleteUnusedImgsReq(toDelete);
		console.warn('End of files!', ((Date.now()-startTime)/1000).toFixed(2)+'secs', toDelete);
	} else {
		let filenameToCheck = files.pop();
		AuthStitch.refDB.collection("products").find({
			"img_upload": {
				//$in:['2018_11_23T11_17_59.615Z_franz.kruger_Vorweihnacht.jpg','2018_11_22T12_02_46.989Z_7.jpg']
				$in: [filenameToCheck]
			}
		}, {}).toArray().then(items => {
			if (items.length==0) toDelete.push(filenameToCheck);
			console.log(`Successfully found ${items.length} documents for ${filenameToCheck}`);
			this.runFileFindOnDB(files, toDelete, startTime);

			return items
		}).catch(err => {
			console.error(`Failed to find documents: ${err} for ${filenameToCheck}`);
			// console.log('toDelete',toDelete);
			this.runFileFindOnDB(files, toDelete, startTime);
		});
	}
}
findNonReferencedImagesInDB () { let _ = this;
	axios.get('https://europe-west1.cloudfunctions.net/getAllFlexiFiles').then(function (response) {
		//AppReact.info('response', FlexiMongoXHR.url, response);
		console.log(typeof response.data, response.data);
		if (AppUtils.isArray(response.data)) {
			// response.data.forEach((fileStr, indx) => {
			_.runFileFindOnDB(response.data, [], Date.now());
			// });
		}
	}).catch(function (error) {
		App.warn(error);
	});
	//console.log();

}
*/
changeApp (e) {
	let split = e.target.value.split(' - ');
	App.switchApp(split[0], split[1]);
	//alert(e.target.value.split(' - '));
}
showSettings () {
	let appListOptions = [];
	let defaultValue = '';
	let value = '';

	if (AppUtils.isArray(this.props.store.appList)) {
		this.props.store.appList.forEach((appConf: any, indx: number) => {
			value = appConf.id + '/' + appConf.db;
			if (this.props.store.appID == appConf.id && this.props.store.appDB == appConf.db) {
				defaultValue = value;
			}
			appListOptions.push(<div key={value}><a href={'/'+value}>{value}</a></div>);
		});
	}
	// let appList = <select key="select_app" defaultValue={defaultValue} onChange={this.changeApp.bind(this)}>{appListOptions}</select>;
	let adminAppLink = <a href={'/'+this.props.store.adminApp.id+'/'+this.props.store.adminApp.db}>Admin App</a>;
	return <div className="tableWrap" key="settings">
		<fieldset><legend><h2>Settings</h2></legend>
		<h3>Switch app</h3>
		<div>{adminAppLink}</div>
		<br/>
		<div>{appListOptions}</div>
		<br/>
		<div><a href="#" onClick={App.moveUnusedUploadedImages}>Move Unused Uploaded Images</a>
			 &nbsp; {App.STORE.moveUnusedFilesResp}</div>
		</fieldset>
		<br/>

	</div>;
}

 /*static img (img :string, params :string = '') : Promise<any> {
	if (App.dbType == DBType.MONGODB) return AuthStitch.img(img, params);
}*/
render () {
	 //console.warn('App render', this.props.store);
	let table = <React.Fragment></React.Fragment>;
	let out = [<Header key="header" store={this.props.store}/>];
	if (this.props.store.configDBisEmpty) {
		out.push(<div key="emptyConfigWarning" className="tableWrap">Config table is found but empty <button onClick={FlexiTableStatic.createEmptyConfigRow}>Create Config table with default values</button></div>);
	}
	if (!this.props.store.authorizedEmail) {
		out.push(<div className="tableWrap" key="about">Flexie CMS is partially-finished/abandoned react cms system made
		 in 2019 intended to be database agnostic and work with various database backends through connectors. First backend connector was made to work with MongoDB database using its cloud application platform MongoDB Realms (then called Stitch). <a target="_blank" href="https://github.com/normonds/flexiecms-2019">View this project on 
		 github.com</a><br/><br/>It is now in demo mode using local storage with sample data.<br/>
		 <b>&bull; DEV mode</b> (button near login) - turns on database names for columns and shows field
		  types. Information for these fields and various cms settings is stored in __flexi_conf table. 
		  CMS was intended to be used by average web users in client mode (default) 
		 or DEV MODE (click it near the login button) for developers<br/>
		 
		 <b>&bull; RAW mode</b> (click it near the login button) : it shows uprocessed database fields
		 </div>);

	}
	if (this.props.store.showSettings) {
		out.push(this.showSettings());
	}
	let keymainTable = this.props.store.tableActive ? this.props.store.tableActive : 'mainTable';

	if (this.props.store.authorizedEmail) {
		out.push(<FlexiTableReact key={keymainTable} store={this.props.store} table={this.props.store.tables[this.props.store.tableActive]}/>);
	}
	if (this.state.mainTable != AppReact.EMPTY_TABLE) {
		// let outConf = {tableID: this.state.mainTable};
		// if (this.state.mainTable == 'test-collection') outConf['subtable'] = {tableID: 'subtable'};
		// if (this.state.mainTable) out.push(<FlexiTableOld key="oldtable" store={this.props.store} config={outConf} waitForItems={true} depth={0}/>);
	}
	//out.push(<i>wrejhwe rwkehrwek rwekrhwerh</i>);
	out.push(<div key="appWarningContainer" id="appWarningContainer">{[...this.props.store.warnings.values()].reverse()}</div>);
	// out.push(<AuthGoogle />);
	return out;
}

static formatTableCol (colKey : string, colLabel : string) {
	let colLabelDimmed:any = '';//colLabel ? colLabel : colKey;
	let colLabelFull = colKey;
	if (App.STORE.isDevMode) {
		colLabelDimmed = colLabel ? <span style={{opacity: 0.4}}>{colLabel}</span> : '';
	} else {
		colLabelFull = colLabel ? colLabel : colKey;
	}
	//let colKeyOut = colLabel ? colLabel : colKey;
	return <React.Fragment>{colLabelFull}&nbsp;{colLabelDimmed}</React.Fragment>;
}

}
