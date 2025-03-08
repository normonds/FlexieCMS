import * as React from "react";
import { App } from "./App";
import { DBType } from "./Interfaces";
const BSON = require('bson');
const ObjectID = BSON.ObjectId;

export enum eCellValType {
	UNDEFINED = 'undef',
	JS_STR = 'jsStr',
	JS_OBJ = 'jsObj',
	OBJECT_ID = 'objID',
	JS_NUMBER = 'jsNum',
	JS_ARRAY = 'jsArr'
}
export class AppUtils {
	static isArray (obj : any) {
		return (obj && typeof obj === 'object' && obj.constructor === Array);
	}
	static wrapValueWithType (valToEval, toWrap:any, rawValue = '') : React.JSX.Element {
		// val = JSON.stringify(val);
		// console.warn(toWrap);
		let valType = AppUtils.cellType(rawValue);
		let valCss = /*App.viewAsRoot ? */AppUtils.cellCss(rawValue) /*: ''*/;
		let cellType = App.STORE.isDevMode ? <span style={{opacity:0.5, verticalAlign:'top'}}>
			<span className="cellInfoType">&nbsp;{valType}&nbsp;</span></span> : '';
		let valCssWrap = valCss == '' ? toWrap : <span style={valCss}>{toWrap}</span>;
		return <React.Fragment>{cellType}{valCssWrap}</React.Fragment>;
		/*return <div className="cellContWrap" /!*style={{'paddingRight':'50px'}}*!/>
			{cellType}
			{valCssWrap}
		</div>;*/
	}
	static mongoCellType (obj :any, type : 'value' | 'type' | 'css') : any {
		//if (typeof obj == 'object') console.log('*',obj, obj instanceof ObjectID, obj._bsontype);
		if (obj === null) return type == 'value' ? 'null' : 'jsNull';
		if (obj === undefined) return type == 'value' ? obj : 'jsUndefined';
		if (obj.$numberDouble) return type == 'value' ? obj.$numberDouble : '$numberDouble';
		else if (obj.$numberInt) return type == 'value' ? obj.$numberInt : '$numberInt';//obj.$numberInt;
		//else if (obj.$numberDouble) return type=='value' ? obj.$numberDouble : '$numberDouble';//obj.$numberDouble;
		else if (obj.$numberLong) return type == 'value' ? obj.$numberLong : '$numberLong';//obj.$numberLong;
		else if (typeof obj === 'string') return type == 'value' ? obj : eCellValType.JS_STR;
		else if (typeof obj === 'number') return type == 'value' ? obj : eCellValType.JS_NUMBER;
		else if (obj === true) return type == 'value' ? "true" : 'jsBool';//"true";
		else if (obj === false) return type == 'value' ? "false" : 'jsBool';//"false";
		else if (AppUtils.isArray(obj)) return type == 'value' ? JSON.stringify(obj) : eCellValType.JS_ARRAY;//return JSON.stringify(obj);
		else if (typeof obj === 'object' && obj._bsontype == 'ObjectId') return type == 'value' ? obj.$oid : eCellValType.OBJECT_ID;//obj.$oid;
		else if (typeof obj === 'object') {
			// if (obj.constructor.name == 'ObjectId')
			// else
				return type == 'value' ? obj.toString() : eCellValType.JS_OBJ;
		}//return obj.toString();

		else return obj;
	}
	static cellCss (obj :any) :any {
		let dataTypes = {
			'jsNull':															{css:{color:'red','fontWeight':'bold'}},
			'jsUndefined':											{css:{color:'red','fontWeight':'bold'}},
			[eCellValType.JS_STR]:						{css:{}},
			'$numberDouble':									{css:{color:'yellow','fontWeight':'bold'}},
			'$numberInt':											{css:{color:'yellow','fontWeight':'bold'}},
			'$numberLong':										{css:{color:'yellow','fontWeight':'bold'}},
			[eCellValType.OBJECT_ID]:			{css:{color:'MEDIUMORCHID','fontWeight':'bold'}},
			'jsBool':														{css:{color:'red','fontWeight':'bold'}},
			[eCellValType.JS_ARRAY]:				{css:{color:'red','fontWeight':'bold'}},
			[eCellValType.JS_OBJ]:						{css:{color:'red','fontWeight':'bold'}},
			[eCellValType.JS_NUMBER]:			{css:{color:'yellow','fontWeight':'bold'}}
		}
		if (App.dbType == DBType.MONGODB) {
			let ret = dataTypes[AppUtils.mongoCellType(obj, 'type')];
			if (!ret) ret = {css:{color:'fuchsia'}};
			return ret.css;
		}
	}
	static cellType (obj :any) :string {
		if (App.dbType == DBType.MONGODB) {
			return AppUtils.mongoCellType(obj, 'type');
		}
	}
	static cellVal (obj :any) {
		//return obj.toString();
		let ret;
		if (App.dbType == DBType.MONGODB) {
			ret = AppUtils.mongoCellType(obj, 'value');
		}
		//console.log(obj, ret);
		return ret;
	}
	static hrefStop (e) {
		if (typeof e.preventDefault === 'function') e.preventDefault();
		if (typeof e.preventDefault === 'function') e.stopPropagation();
		if (e.hasOwnProperty('nativeEvent') && typeof e.nativeEvent.stopImmediatePropagation === 'function')
			e.nativeEvent.stopImmediatePropagation();
	}
	/*static getCookie (name_ :string) {
		var name = name_+"=";
		var ca = document.cookie.split(';');
		for(var i = 0; i < ca.length; i++) {
			var c = ca[i];
			while (c.charAt(0) == ' ') {
				c = c.substring(1);
			}
			if (c.indexOf(name) == 0) {
				return c.substring(name.length, c.length);
			}
		}
		return "{}";
	}
	static setCookie (value :any, name_ :string, exdays : number) {
		value = JSON.stringify(value);
		console.log('setting flexi cookie', value);
		var d = new Date();
		d.setTime(d.getTime() + (exdays*24*60*60*1000));
		var expires = "expires="+ d.toUTCString();
		document.cookie =  name_+"=" + value + ";" + expires + ";path=/";
	}*/
	static storageRemove (key : string) {
		localStorage.removeItem(key)
	}
	static storageSave (key :string, value :any) {
		localStorage.setItem(key, JSON.stringify(value));
	}
	static storageGet (key :string) {
		let get = localStorage.getItem(key);
		if (get == undefined || get == null) return null;
		return JSON.parse(localStorage.getItem(key));
	}
	static objToJSX (obj, maxDepth:number = 3, depth:number=0) : React.JSX.Element[] {
		if (!obj) return obj;
		let step=[], ret = [], i=0;
		let childIsArray, childIsObject, childIsUndef, childIsNull;
		let isArray = typeof obj === 'object' && obj.constructor === Array;
		let isMap = typeof obj === 'object' && obj.constructor === Map;
		let isSet = typeof obj === 'object' && obj.constructor === Set;
		let isObject = typeof obj === 'object';
		let constrName = '';
		if (isObject) constrName = 'Object';

		if (isMap) constrName = 'Map';
		else if (isSet) constrName = 'Set';
		else if (isArray) constrName = 'Array';
		else if (obj.constructor && obj.constructor.name) constrName = obj.constructor.name;

		if (isMap || isSet) {obj = [...obj]}
		for (let key in obj) {//console.log(key, typeof key);
			if (key === 'constructor') continue;

			//console.log(obj[key], typeof obj[key]);
			childIsObject = obj[key]!== null && typeof obj[key] !== 'undefined' && typeof obj[key] === 'object';
			childIsArray = obj[key]!== null && typeof obj[key] !== 'undefined' && typeof obj[key] === 'object' && obj[key].constructor === Array;

			// if (typeof obj[key] === 'object' && obj[key].constructor === Array) step.push(<span>{'['}</span>);
			if (childIsObject) step.push(<span key={i++} className="pnct">{"\u007B"}</span>);

			if (isArray) step.push(<span key={i++} className="keyArr">{key}</span>);
			else step.push(<span key={i++} className="key">{key}</span>);

			if (key) step.push(<span key={i++} className="pnct">:</span>);

			if (childIsObject) {

				if (depth >= maxDepth) step.push(<span key={i++}>object, max depth ('{maxDepth}') reached!'</span>);
				else {
					if (childIsArray) step.push(<span key={i++} className="pnct">{'['}</span>);
					else if (childIsObject) step.push(<span key={i++} className="pnct">{"\u007B"}</span>);
					step.push(AppUtils.objToJSX(obj[key], maxDepth, depth + 1));
					if (childIsArray) step.push(<span key={i++} className="pnct">{']'}</span>);
					else if (childIsObject) step.push(<span key={i++} className="pnct">{'\u007D'}</span>);
				}
			} else if (obj[key] === null) {
				step.push(<span key={i++} className="keyword">null</span>);
			} else if (typeof obj[key] === 'undefined') {
				step.push(<span key={i++} className="keyword">undefined</span>);
			} else if (typeof obj[key] === 'string') {
				step.push(<span key={i++} className="str">{obj[key]}</span>);
			} else if (obj[key].toString) step.push(<span key={i++}>{obj[key].toString()}</span>);
			else step.push(<span key={i++}>{obj[key]}</span>);
			// if (typeof obj[key] === 'object' && obj[key].constructor === Array) step.push(']');
			if (childIsObject) step.push(<span key={i++} className="pnct">{'\u007D'}</span>);
			//aStep.push(step);
			step.push(<span key={i++} className="pnct">, </span>);
		}
		if (step.length>0) step.pop();
		if (depth==0) {
			if (isObject && obj.constructor && obj.constructor.name) {
				let cont = step.length > 0 ? <React.Fragment>
					<span key={i++} className="pnct">:{"\u007B"}</span>{step}<span key={i++} className="pnct">{"\u007D"}</span>
				</React.Fragment> : <span key={i++} className="pnct">:{'{}'}</span>;
				return [<span key={i++} className="jsOBJhtmlized"><span key={i++} className="key">{constrName}</span>{cont}</span>];
			}
			else return [<span key={i++} className="jsOBJhtmlized">{step}</span>];

		} else return step;
	}
	static toggleStylesheet (name, show) {
		let stylesheets = document.styleSheets;
		let length = stylesheets.length;
		let ss;
		for (let i = 0; i < length; i++) {
			ss = stylesheets[i];
			if (ss && ss.href && ss.href.indexOf(name) !== -1) {
				console.log(ss, ss.href);
				ss.disabled = !show;
			}
		}
	};
}