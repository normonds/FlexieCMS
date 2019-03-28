import * as React from "react";
import { BaseClass, pBaseClass, sBaseClass } from "./BaseClass";
import { BaseClass3 } from "./BaseClass3";

export interface pBaseClass2 { prope2?:string }
export interface sBaseClass2  { base2?:string, shoot?:string }
// export

export class BaseClass2<P> extends BaseClass<P & pBaseClass2> {
	state : sBaseClass2;
	//setState : (params : sBaseClass2) => void;
	// setState : function(sBaseClass2)
	constructor(props, context?: any) {
		super(props);
		this.state = {base2:'s'};
		// this.setState({base2:'a'});
		//
	}

	componentDidMount () {
		this.setState({base2:'a'});
		//console.log('MOUNT', 'FlexiBase', this.props);
	}
	render () {
		//let a = this.state.base2;
		return <BaseClass />;
	}
}
