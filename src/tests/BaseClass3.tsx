import * as React from "react";
import { BaseClass } from "./BaseClass";
import { BaseClass2, sBaseClass2 } from "./BaseClass2";

export interface pBaseClass3 {  }
export interface sBaseClass3  { base3?:string }

export class BaseClass3<P> extends BaseClass2<P & pBaseClass3> {
	//state : sBaseClass3;
	constructor(props, conte?) {
		super(props);
		this.state = {base2:'b0'};
		//this.setState({base34:'b'});
	}
	componentWillMount () {
		this.setState({base2:'b'});
	}
	componentDidMount () {

	}
	render () {
		let a = this.state.base2;
		return <BaseClass2 prope2={this.state.base2}/>;
	}
}
