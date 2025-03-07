import * as React from "react";
import { AppReact } from "./App.react";
import { EventApp, EventServer, iAppEvent } from "../Events";
import { AuthReact } from "./Auth.react";
import { App } from "../App";
import { AppUtils } from "../AppUtils";
import { iFlexiHeaderTab, iSTORE } from "../Interfaces";
import { AuthStitch } from "./AuthStitch";
import { DemoData } from "./DemoData";


export class Header extends React.Component<{store:iSTORE}, {}> {

tables : Array<React.JSX.Element> = [];

constructor (props) {
	super(props);
	AppReact.log('CONSTRUCTOR', 'Header', this.props);
}
componentDidMount () {
	//App.log('MOUNT', 'Header');
}
componentWillUnmount () {}

toggleRoot (e :MouseEvent) {
	App.emit(EventApp.TOGGLE_MODE_DEV);
}
toogleDirectEditing () {
	App.emit(EventApp.TOGGLE_MODE_DIRECT_EDITING);
}
toogleShowRawValues () {
	App.emit(EventApp.TOGGLE_MODE_SHOW_RAW_VALUES);
}
tabClick (tableID :string, e) { let _:this = this;
	AppUtils.hrefStop(e);
	let reqData:iAppEvent = {tableID:tableID};
	App.emit(new EventApp(EventApp.CLICK_HEADER_TAB,  reqData));
}
tabDoubleClick (tableID :string, e) { let _:this = this;
	AppUtils.hrefStop(e);
	let reqData:iAppEvent = {tableID:tableID, forced:true};
	App.emit(new EventApp(EventApp.CLICK_HEADER_TAB,  reqData));
}
toggleSettings (e) {
	App.emit(EventApp.TOGGLE_SETTINGS);
}
restSampleData (e) {
	if (confirm('Restore sample data?')){
		DemoData.clearLocalDB()
		setTimeout(()=>{window.location.reload()}, 500)
	}
}

render () {
	//console.warn(this.props.store.header.tableTabs[0]);
	this.tables = [];
	this.props.store.header.tableTabs.forEach((tab:iFlexiHeaderTab, indx:number) => {
		let classNames:Set<string> = new Set();
		if (tab.codename == this.props.store.tableActive) classNames.add('selected');
		if (this.props.store.tables[tab.codename] && this.props.store.tables[tab.codename].inTransition) classNames.add('inTransition');
		if (!this.props.store.isDevMode && tab.codename.startsWith('__flexi_')) {
		} else {
			this.tables.push(<li key={indx} className={[...classNames].join(' ')}><a href="#"
																					 title="Double click to force reload from server"
																					 onClick={this.tabClick.bind(this, tab.codename)} onDoubleClick={this.tabDoubleClick.bind(this, tab.codename)}>{tab.label}</a></li>);
		}
	});
	let clearLocalDB = <>restore sample data</>
	let devModeLabel = 'dev mode';
	let toogleRootLabel = this.props.store.isDevMode ? <span>dev mode</span> : <span style={{opacity:0.2}}>dev mode</span>;
	let deLabel = 'DE';
	let deLabelOff = <span style={{opacity:0.2}}>DE</span>;
	let rawLabel = <span style={{fontSize:'90%'}}>raw data</span>;
	let rawLabelOff = <span style={{fontSize:'90%', opacity:0.2}}>raw data</span>;
	if (!this.props.store.isDevMode) {
		deLabelOff = <React.Fragment>de</React.Fragment>
		rawLabelOff = <span style={{fontSize:'90%', opacity:0.2}}>raw data</span>
		//clearLocalDB = <></>
	}

	//this.tables.push(<li></li>);
	//if (!AuthStitch.anonLoggedin) { toogleRootLabel = rawLabelOff = rawLabel = <></>; }
	return <div id="header"><ul className='tableList'>{this.tables}</ul>
		<AuthReact store={this.props.store}/>
		{/* <a className="material-icons" onClick={this.toggleSettings.bind(this)} href="#" style={{fontSize:'18px', position:'relative', top:'5px'}}>settings</a> */}
		{/*<span style={{width:'100px'}}></span>*/}
		<a href="#" className="devToggle" onClick={this.toggleRoot.bind(this)}>{toogleRootLabel}</a>
		{/*<span style={{width:'50px'}}></span>*/}
		{/* <a href="#" className="devToggle" onClick={this.toogleDirectEditing.bind(this)}>{this.props.store.isDirectEditingEnabled
			? deLabel : <React.Fragment>{deLabelOff}</React.Fragment>}</a> */}
		<a href="#" className="devToggle" onClick={this.toogleShowRawValues.bind(this)}>{this.props.store.isShowValuesEnabled
			? rawLabel : <React.Fragment>{rawLabelOff}</React.Fragment>}</a>
		{/* <a href="#" className="devToggle" onClick={()=>{App.log(App.STORE)}}>{this.props.store.isDevMode
			? 'L' : <React.Fragment></React.Fragment>}</a> */}
			<a href="#" className="devToggle"  style={{fontSize:'90%', opacity:0.2}} onClick={this.restSampleData.bind(this)}>{clearLocalDB}</a>
	</div>;

}

}