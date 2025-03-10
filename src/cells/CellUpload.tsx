import { App } from "../App";
import * as React from "react";
import { FlexiTableCellReact, stateFlexiTableCellReact } from "../components/FlexiTableCell.react";
import { AppReact } from "../components/App.react";
import { EventApp, EventServer, iAppEvent } from "../Events";
import { AppUtils } from "../AppUtils";
import { iSTORE } from "../Interfaces";
const axios = require('axios');

export interface sCellUpload extends stateFlexiTableCellReact {
	uploading ?: Array<string>
}
export class CellUpload extends FlexiTableCellReact<{}> {
state : sCellUpload;
setState : (state:sCellUpload) => void;
// classNames ?:Set<string>;
static activeSource : CellUploadIcon;
isOver;
selectFilesOver;
constructor (props) {
	super(props);
	// this.enableClickEditing = false;
	this.editModeSameAsViewMode = true;
	// this.contentOverride = 'herrro';
	this.state.uploading = [];
	this.cssWordBreakAll = false;
	// this.classNames = new Set(['editable']);
}
componentDidMount () {
	App.emiter.on(EventServer.nm.UploadURL, this.uploadToUrl, this);
	// AppReact.emiter.off(EventApp.nm.FileUploadProgress, this.uploadProgress.bind(this));
}
componentWillUnmount () {
	App.emiter.off(EventServer.nm.UploadURL, this.uploadToUrl, this);
	// AppReact.emiter.off(EventApp.nm.FileUploadProgress, this.uploadProgress.bind(this));
}
uploadProgress (eve : EventServer, progressEvent) {
	let percentCompleted = Math.round( (progressEvent.loaded * 100) / progressEvent.total );
	App.emit(new EventApp(EventApp.nm.FileUploadProgress
		, {filename:eve.data.dbObj.filename, percents:percentCompleted} as iAppEvent));
	console.log(percentCompleted);
}
uploadToUrl (eve : EventServer) { let _:CellUpload = this;
	if (eve.eventRequest.data['targetInstance'] != this.id()) return;
	//console.log(_.state);
	let filenameToSave = eve.data.dbObj.filename;
	let file:File = eve.eventRequest.data['file'];
	if (AppUtils.isArray(_.state.editingValue)) {
		_.state.editingValue.push(filenameToSave);
		_.state.uploading.push(filenameToSave);
		_.setState({editingValue:_.state.editingValue, uploading:_.state.uploading});
	} else {App.warn('editingValue is not Array!');}
	// this.setState({});
	axios.post(eve.data.dbObj.url, file, {
		headers: { /*"Content-Length": file.size.toString(),*/
			"Content-Type": file.type,
			'Access-Control-Allow-Origin': '*'
		},
		mode: 'no-cors',
		onUploadProgress : _.uploadProgress.bind(_, eve)
		//onUploadProgress: function (progressEvent, eve :EventServer) {
			/*let percentCompleted = Math.round( (progressEvent.loaded * 100) / progressEvent.total );
			App.emit(new EventApp(EventApp.nm.FileUploadProgress
				, {filename:eve.data.dbObj.filename, percents:percentCompleted} as iAppEvent));
			console.log(percentCompleted);*/
		//}
	}).catch(function (error) {
		console.log('axios post catch', error);
	}).then(function (response) {
		console.warn('load complete ' + filenameToSave);
		//console.log('uploadToURL response', AppUtils.isArray(_.state.editingValue), _.state
		//	, App.STORE.configDB['fileUploadDir']+filenameToSave);
		_.state.uploading.splice(_.state.uploading.indexOf(filenameToSave), 1);
		_.setState({uploading:_.state.uploading});
		/*setTimeout(() => {
			App.emit(new EventApp(EventApp.nm.UploadComplete
			, {targetInstance: eve.eventRequest.data['targetInstance'], filename: filenameToSave, size: file.size} as iAppEvent));
		}, 1000);*/
	});
	//console.warn(eve.eventRequest.data['targetInstance'], eve.data.dbObj, eve.data.dbObj.url, eve.data.dbObj.filename);
}

// imgIcon (img : React.JSX.Element, key : number) : React.JSX.Element {
// 	return
// }
onDeleteIcon (filename:number) {
	this.state.editingValue.splice(this.state.editingValue.indexOf(filename), 1);
	this.setState({editingValue: this.state.editingValue});
}
filesSelected (ev) {
	let files:FileList = ev.currentTarget.files;
	if (files.length>0) {
		//this.classNames.add('inTransition');
	}

	for (let i = 0; i < files.length; i++) {
		let file:File = files[i];
		console.log('preparing file upload', file);
		if (file.name) App.emit(new EventApp(EventApp.nm.RequestUploadUrl, {targetInstance:this.id(), type:file.type, name:file.name, file:file} as iAppEvent));
		else App.warn('Filename empty', file);
	}
	// this.forceUpdate();
	//this.setState({requestFiles:files.length});
	//this.forceUpdate();
}
uploadForm () {
	//return <React.Fragment></React.Fragment>;
	return <CellUploadIcon isUploading={false} key={'upload'} type='upload' store={this.props.store} filename={''} parent={this} />;
}
contentModeView () : React.JSX.Element {
	// return <React.Fragment>herrrrrrrrrooo</React.Fragment>;
	let files:Array<React.JSX.Element >= [];
	let incValue:any = this.cell().value;
	let isUploading = false;
	if (!incValue) {
		incValue = [];
	}
	//console.log('CELL UPLOAD contentModeView state', this.state);
	if (Array.isArray(incValue)) {
		incValue.forEach((filename:string, indx:number) => {
			isUploading = this.state.uploading.indexOf(filename) > -1;
			files.push(<CellUploadIcon key={filename} isUploading={isUploading} type='img' store={this.props.store} filename={filename} parent={this} />);
		});
	}

	//files.push(<CellUploadIcon key={'upload'} type='upload' store={this.props.store} filename={''} parentID={this} />);
	return <div style={{maxWidth:'999px', display:'flex', flexWrap:'wrap', color:'white'}}>
		{files}{this.state.isEditing ? this.uploadForm() : ''}</div>;
}
// contentModeEdit () {
// 	return this.contentModeView();
// }
}
export interface sCellUploadIcon {imageURL?:string, isOver ?:boolean, loading ?:boolean, loadingError ?:boolean, progress ?:number, isLoaded?:boolean}
export class CellUploadIcon extends React.Component
	<{store:iSTORE, parent:CellUpload, filename:string, type: 'img' | 'upload', isUploading:boolean}, {}> {

	state : sCellUploadIcon;
	setState : (state:sCellUploadIcon) => void;
	constructor (props) {
		super(props);
		this.state = {loading:true, imageURL:''};
		//console.log('cell upload construct', this.props);
	}
	reqImage () {
		if (this.props.type == 'img') {
			App.emit(new EventApp(EventApp.nm.ImageURLreq, {filename:this.props.filename} as iAppEvent));
		}
	}
	componentDidUpdate() {
		if (!this.state.imageURL && !this.props.isUploading) this.reqImage();
	}
	componentDidMount () {
		// App.emiter.on(EventServer.nm.UploadURL, this.uploadToUrl, this);
		App.emiter.on(EventApp.nm.FileUploadProgress, this.onProgress, this);
		App.emiter.on(EventApp.nm.UploadComplete, this.uploadComplete, this);
		App.emiter.on(EventApp.nm.DocumentMouseUP, this.onMouseUpDocument, this);
		App.emiter.on(EventServer.nm.ImageURL, this.onImageURL, this);
		//this.getImage(this.props.filename);
		if (!this.state.imageURL && !this.props.isUploading) this.reqImage();
	}
	componentWillUnmount () {
		// console.log('unmount cell upload');
		// App.emiter.off(EventServer.nm.UploadURL, this.uploadToUrl, this);
		App.emiter.off(EventApp.nm.FileUploadProgress, this.onProgress, this);
		App.emiter.off(EventApp.nm.UploadComplete, this.uploadComplete, this);
		App.emiter.off(EventApp.nm.DocumentMouseUP, this.onMouseUpDocument, this);
		App.emiter.off(EventServer.nm.ImageURL, this.onImageURL, this);
	}
	onImageURL (eve : EventServer) {
		//console.log(eve);
		if (this.props.filename == eve.eventRequest.data.filename) {
			this.setState({imageURL:eve.data+''});
			// this.setState({imageURL:eve.data+'=s100'});
		}
	}
	onMouseDown () {
		CellUpload.activeSource = this;
	}
	onMouseUpDocument (e) {
		//console.log(CellUpload.activeSource.idIcon()/*, CellUpload.activeSource*/);
		//if (CellUpload.activeSource && CellUpload.activeSource.idIcon && CellUpload.activeSource.idIcon() != this.idIcon()) {
		// if (CellUpload.activeSource && [...CellUpload.activeSource.classList.values()].indexOf('uploadBlock') > -1) {
		// 	console.log(CellUpload.activeSource.idIcon(), this.idIcon());
		//}
	}
	idIcon () {
		return this.props.parent.id() + (this.props.filename ? this.props.filename : 'upload');
	}
	onMouseUp (e) {
		let source:CellUploadIcon = CellUpload.activeSource;
		let targ:CellUploadIcon = this;
		let lastPos:number;
		if (source && source.idIcon() != this.idIcon()) {
			// same cell
			// console.log('same cell');
			if (targ.props.parent.state.editingValue.indexOf(source.props.filename) > -1) {
				// clear source pos
				targ.props.parent.state.editingValue.splice(targ.props.parent.state.editingValue.indexOf(source.props.filename), 1);
				// insert source in targ pos
				lastPos = targ.props.filename ? targ.props.parent.state.editingValue.indexOf(targ.props.filename)
					: targ.props.parent.state.editingValue.length;
				targ.props.parent.state.editingValue.splice(lastPos, 0, source.props.filename);
				targ.props.parent.setState({editingValue:targ.props.parent.state.editingValue});
			// different cell
			} else {
				source.props.parent.state.editingValue.splice(source.props.parent.state.editingValue.indexOf(source.props.filename), 1);
				lastPos = targ.props.filename ? targ.props.parent.state.editingValue.indexOf(targ.props.filename)
					: targ.props.parent.state.editingValue.length;
				targ.props.parent.state.editingValue.splice(lastPos, 0, source.props.filename);
				targ.props.parent.setState({editingValue:targ.props.parent.state.editingValue, isEditing:true});
				source.props.parent.setState({editingValue:source.props.parent.state.editingValue, isEditing:true});
			}
			// console.log(CellUpload.activeSource.props.filename, this.props.filename);
		}
	}
	onMouseOut (e) {
		let ele:HTMLElement = e.currentTarget;
		ele.classList.remove('dragOverLeft');
		// CellUpload.activeSource = null;
		// console.log('mouse out', ele.id);
	}
	clickDelete (key:number, eve) {
		if (confirm('Delete image?')) {
			console.log('delete icon', key);
			this.props.parent.onDeleteIcon(key);
			// this.state.editingValue.splice(key, 1);
			// this.setState({editingValue: this.state.editingValue});
		}
	}
	onMouseMove (e) {
		//console.log(e.currentTarget);
		if (CellUpload.activeSource && CellUpload.activeSource.idIcon() != e.currentTarget.id && App.mouseIsDown) {
			// CellUpload.activeSource = this;
			// console.log('new over target', e.currentTarget.id);
			e.currentTarget.classList.add('dragOverLeft');
		}
		//if (App.mouseIsDown)
	}
	onMouseOver () {}
	imageLoaded (e) {
		this.setState({loading:false});
	}
	imageErrored (e) {
		this.setState({loading:false, loadingError:true});
	}
	onProgress (eve :EventApp) {
		if (eve.data.filename==this.props.filename) {
			this.setState({progress:eve.data.percents});
			//this.progress = eve.data['percents'];
			//this.forceUpdate();
		}
	}
	uploadComplete (eve :EventApp) {
		if (eve.data.filename==this.props.filename) {
			console.warn('load complete icon ' + this.props.filename);
			this.setState({loading: false, isLoaded: true});
		}
	}
	uploadForm () {
		return <span style={{backgroundColor: '#0D1B24', padding: '30px 10px'}}
					 className={this.props.parent.selectFilesOver ? 'dragOverLeft' : ''}
					 id={this.idIcon()}
					 onMouseUp={this.onMouseUp.bind(this)} onMouseOver={this.onMouseMove.bind(this)}
					 onMouseOut={this.onMouseOut.bind(this)}>File uploads are disabled{/* <input type="file" accept="image/*" multiple
																	onChange={this.props.parent.filesSelected.bind(this.props.parent)}/> */}</span>;
	}

	render () {
		let classNames = new Set(['imgWrap']);
		let imgContent;
		//console.log('Cell Upload render');
		let isUploading = this.props.parent.state.uploading && this.props.parent.state.uploading.indexOf(this.props.filename)>-1;
		if (this.state.loading && !isUploading) classNames.add('inTransition');
		else if (this.state.loadingError) classNames.add('imgError');

		//console.log(this.props.filename, this.state.progress, this.state.loading);
		if (isUploading) {
			imgContent = <React.Fragment>
				<span className="material-icons">cloud_upload</span>{this.state.progress + '%'}</React.Fragment>;
		} else {

			let imgTag = !this.state.imageURL ? '' : <img style={{maxWidth:'103px'}}
				onLoad={this.imageLoaded.bind(this)}
				onError={this.imageErrored.bind(this)}
				src={this.state.imageURL} />;

			imgContent = <a href={/* App.STORE.configDB.fileUploadDir+ */this.props.filename} target="_blank"
							title="Open full image">{imgTag}</a>
		}

		if (this.props.type == 'upload') return this.uploadForm();
		else return <div title="Drag to move" id={this.props.parent.id()+this.props.filename} className={'uploadBlock '+(this.state.isOver?'dragOverLeft':'')}
					onMouseUp={this.onMouseUp.bind(this)} onMouseMove={this.onMouseMove.bind(this)}
					onMouseOut={this.onMouseOut.bind(this)} onMouseDown={this.onMouseDown.bind(this)}/*draggable={true}  onDragStart={this.dragStart.bind(this)}
					onDragOver={this.dragOver.bind(this)} onDragLeave={this.dragLeave.bind(this)}   onMouseDown={this.onMouseDown.bind(this)}
					 onDragEnd={this.onDragEnd.bind(this)}*/>{/*this.props.keyp.substr(-5)*/}
			<div className="tools"><span className="moveIcons">⇄⇄⇄</span>
				<span className="x" title="Click to delete" onClick={this.clickDelete.bind(this, this.props.filename)}>×</span></div>
			<div className={[...classNames].join(' ')}>{imgContent}</div></div>
	}
}