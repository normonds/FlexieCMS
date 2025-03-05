import * as React from "react";
import { FlexiBase, FlexiBaseProps } from "../FlexiBase";
// import { FlexiTableOld } from "../../to.delete/old/FlexiTableOld";
// import { Editor } from '@tinymce/tinymce-react';
// import { FlexiTableCell, FlexiTableCellProps } from "../../to.delete/old/FlexiTableCell";
import { AppReact } from "./App.react";
import { eTableType, EventApp, EventServer, iAppEvent } from "../Events";
import { App } from "../App";
import { iFlexiTable, iSTORE } from "../Interfaces";
import { MongoStitchXHR } from "./MongoStitchXHR";
import { FlexiTableStatic } from "../FlexiTableStatic";
import { stateFlexiTableCellReact } from "./FlexiTableCell.react";
import { v4 as uuidv4 } from 'uuid';
// export interface FlexiTableCaptionProps  extends FlexiTableCellProps {maxCount?:number, searchTerm?:string	}

export interface sFlexiTableCaption {
	searchTerm ?:string, addCol ?:string, gotoPage ?:string
}
export class FlexiTableCaptionReact extends React.Component<{store:iSTORE, table:iFlexiTable, rowParentID?:string} ,{}> {
state : sFlexiTableCaption;
defaultSearchString : string = '<search>';
defaultAddColString : string = '<add column>';
defaultGotoPageString : string = 'goto#';
fullTextLabelOn : React.JSX.Element = <React.Fragment>&larr; T &rarr;</React.Fragment>;
fullTextLabelOff : React.JSX.Element = <React.Fragment>&rarr; T &larr;</React.Fragment>;
// setState : ({this.state}) => void;
setState : (state:sFlexiTableCaption, onSetState ?: () => void) => void;
constructor (props) {
	super(props);
	// console.log('CAPTION constructor', this.props.tableID);
	this.state = {searchTerm:this.defaultSearchString, addCol:this.defaultAddColString, gotoPage:this.defaultGotoPageString};
	// this.classNames.add('cell-caption');
	// this.classNames.add('cell-caption-sticky');
}
componentDidMount () {
	// console.log('CAPTION mount');
}
componentWillUnmount () {
	// console.log('CAPTION unmount');
}
clickInsertNew () {
	// if (this.props.tableID.props.config.parentID) query = {'__flexi_parent':BSON.ObjectId(this.props.tableRef.props.config.parentID)};
	FlexiTableStatic.reactInsertNew(this.props.table.id, this.props.rowParentID);
}
searchInputBlur (e) {
	if (e.target.value == '') {
		this.setState({searchTerm:this.defaultSearchString});
	}
}
searchInputFocus (e) {
	// console.log('focus', e.target.value);
	if (e.target.value == this.defaultSearchString) {
		this.setState({searchTerm:''});
	}
}
searchInputChange (e) { let _ = this;
	let val = e.target.value;
	if (val == _.defaultSearchString) {
		val == '';
	}
	_.setState({searchTerm:val}, () => {
		// console.log(_.state);
	});
}
searchTerm () {
	return this.state.searchTerm == this.defaultSearchString ? '' : this.state.searchTerm;
}
searchInputKeyUp (e) {
	// console.log('key up', this.state);
	if (e.keyCode==13) { // enter
		let query = FlexiTableStatic.createQueryObjectFromSearchTerm(this.props.table.id, this.searchTerm());
		if (query!==null) {
			//query = this.createQueryObjectFromSearchTerm(searchTerm);
			let data:iAppEvent = {
				countRows: true,
				db: AppReact.db, tableID: this.props.table.id,
				searchTerm: this.searchTerm(),
				query: {$match:query},
				options: {},
				limit: this.props.table.conf.rowsPerPage,
				tableType : eTableType.FULL
			};
			App.emit(new EventApp(EventApp.nm.TableGetRequest, data));
		}
	}
}

gotoPage (page :number) {
	FlexiTableStatic.gotoPage(this.props.table.id, page, this.searchTerm());
}
onGotoPageChange (e) {
	//console.log(e.target.value);
	this.setState({gotoPage:e.target.value});
}
gotoPageFocus (e) {
	if (e.target.value == this.defaultGotoPageString) {
		//console.log('set state', e.target.value );
		this.setState({gotoPage:''});
	}
}
gotoPageBlur (e) {
	if (e.target.value == '') this.setState({gotoPage:this.defaultGotoPageString});
}
gotoPageKeyUp (e) {
	if (e.keyCode==13) { // enter
		this.gotoPage(e.target.value-1);
		//if (!this.props.table.cols.has(e.target.value)) this.props.table.cols.set(e.target.value, '');
		//App.update();
		//console.log(e.target.value);
	}
}
genPages () : React.JSX.Element {
	// console.log(this.props.table);
	let ret = [];
	let table:iFlexiTable = this.props.table;
	// console.log('gen pages', tableID.rowsPerPage, tableID.maxRows, tableID.skipPages);
	let rowCount = table.conf.rowCount;
	if (rowCount>0 && table.conf.rowsPerPage>0) {

		let pages: number = table.conf.rowsPerPage > 0 ? Math.ceil(rowCount / table.conf.rowsPerPage) : 1;
		// console.log('pages', pages);
		if (pages>1) {
			if (pages>9) ret.push(<React.Fragment key="goto"><input name="page" type="text" size={3} onChange={this.onGotoPageChange.bind(this)}
													   onFocus={this.gotoPageFocus.bind(this)} onBlur={this.gotoPageBlur.bind(this)}
													   onKeyUp={this.gotoPageKeyUp.bind(this)} value={this.state.gotoPage}
													   className="goto-page" />&nbsp;</React.Fragment>);
			let curPage = table.skipPages ? table.skipPages / table.conf.rowsPerPage : 0;
			let active = '';
			let activeDots = false;
			for (let i = 0; i < pages; i++) {
				if (i<5 || i>pages-5 || (i<=curPage+3 && i>=curPage-3)) {
					activeDots = false;
				} else {
					if (!activeDots) {ret.push(' . . . '); activeDots = true;}
					continue;
				}
				active = i == curPage ? 'active' : '';
				ret.push(<a href="#" className={active} key={i} onClick={this.gotoPage.bind(this, i)}>{i + 1}</a>);
			}
			ret.unshift('pages ');
		}

	} //else if () ret.push(<span key={uuidv1()} className="inTransition"></span>);
	return <span className="pageContainer">{ret}</span>;
}
createCol (e) {
	if (e.keyCode==13) { // enter
		if (!this.props.table.cols.has(e.target.value)) this.props.table.cols.set(e.target.value, '');
		App.update();
		//console.log(e.target.value);
	}
}
addColFocus (e) {
	if (e.target.value == this.defaultAddColString) this.setState({addCol:''});
}
addColBlur (e) {
	if (e.target.value == '') this.setState({addCol:this.defaultAddColString});
}
addColChange (e) {
	this.setState({addCol:e.target.value});
}
toggleFullTexts (e) {
	FlexiTableStatic.toggleFullTexts(this.props.table.id);
}
render () {
	// console.warn('RENDER Caption', this.state);
	// if (this.props.className) {
	// 	this.props.className.split(' ').forEach((val, index) => {
	// 		this.classNames.add(val);
	// 	});
	// }
	if (!this.props.table) return <React.Fragment></React.Fragment>;

	let classNames:Set<string> = new Set(['cell-caption', 'tableWrap']);
	if (!this.props.table.inTransition) {
		classNames.delete('inTransition');
	} else classNames.add('inTransition');
	//console.warn('RENDER Caption', this.props.className, [...this.classNames]);

	let insert = <React.Fragment></React.Fragment>, buttonAddCol = <React.Fragment></React.Fragment>;

	if (this.props.table.canCreateRows) insert = <button onClick={this.clickInsertNew.bind(this)}>Insert new</button>;
	if (this.props.store.isDevMode) {
		buttonAddCol = <span>	<input type="text" className="addCol" onKeyUp={this.createCol.bind(this)} value={this.state.addCol}
				   onChange={this.addColChange.bind(this)} onBlur={this.addColBlur.bind(this)} onFocus={this.addColFocus.bind(this)}/>
		</span>;
	}

	// let searchVal = this.state.searchTerm ? this.state.searchTerm : this.defaultSearchString;
	//console.log('searchval', searchVal, this.defaultSearchString, this.props.table.searchTerm);
	let fullTextLabel = this.props.table.conf.showFullTexts
		? this.fullTextLabelOff : this.fullTextLabelOn;
	let showFullTexts = <button title="toggle full texts" className="transparent" style={{fontSize:'12px',fontWeight:'normal'}}
								onClick={this.toggleFullTexts.bind(this)}>{fullTextLabel}</button>;
	let searchBar = <React.Fragment>&nbsp;&nbsp;&nbsp;
		<input className="search"
				onChange={this.searchInputChange.bind(this)}
				onKeyUp={this.searchInputKeyUp.bind(this)}
			 	onBlur={this.searchInputBlur.bind(this)}
				onFocus={this.searchInputFocus.bind(this)}
			type="text" value={this.state.searchTerm}/></React.Fragment>;
	let addMaxItems = this.props.table.conf.rowCount>-1 ? "/"+this.props.table.conf.rowCount : '';
	let length = this.props.table.rows.length ? this.props.table.rows.length+addMaxItems+' items' : '';
	return<tr><th className={[...classNames].join(' ')} colSpan={this.props.table.cols.size+1} style={{textAlign:'left'}}>
		{this.props.table.conf.name || this.props.table.id}
		&nbsp;&nbsp;{insert}
		&nbsp;&nbsp;<span style={{fontWeight:'normal', fontSize:'100%'}}>{length}</span>

		&nbsp;{showFullTexts}{searchBar}
		&nbsp;<i style={{opacity:0.3, fontWeight:'normal', fontSize:'80%'}}>{this.props.table.reqDuration}ms</i>
		&nbsp;{buttonAddCol}&nbsp;{this.genPages()}
	</th></tr>;
}
}