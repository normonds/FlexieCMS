import * as React from "react";
// import { pBaseClass3 } from "./BaseClass3";

// import React = require("react");
// import { BaseClass2 } from "./BaseClass2";
// import { Component } from "react";

export interface pBaseClass { prope?:string }
export interface sBaseClass { base1?:string,base2?:string }
// export interface cBaseClass {
// 	state : { base1?:string,base2?:string };
// 	setStates: () => boolean;
// }

/*declare module "react" {
	interface Component2 extends Component {
		state : sBaseClass;
		setState : (params: sBaseClass)=> void;
	}
}*/

export class BaseClass<P> extends React.Component<P & sBaseClass>  {
	setState :(any:any) => void;
	state : sBaseClass;
	constructor(props, context?: any) {
		super(props);
		//this.state = {base1:'init'};
	}
	baseFunc () {
		return 'yoo';
	}
	componentDidUpdate () {
		this.props;
		this.props.children;//a
	}
	componentDidMount () {
		//this.setState();
		this.setState({base1:'didMount', base2:'lala'});
		setTimeout(()=>{
			console.log('timeout');
			this.setState({base1:'timeout'});
		}, 2000);
		//console.log('MOUNT', 'FlexiBase', this.props);
	}
	render () {
		// return {'herro':1};
		return <div>BaseClass {this.state.base1}</div>;
	}
}