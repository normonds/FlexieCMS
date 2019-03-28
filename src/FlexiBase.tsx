import * as React from "react";
import { iSTORE } from "./Interfaces";
// import { iFlexiTable__ } from "FlexiTableOld";

export interface FlexiBaseProps { store ?: iSTORE }
export interface FlexiBaseState { baser?:string }

export class FlexiBase<P> extends React.Component<P & FlexiBaseProps> {
constructor(props: P, context?: any) {
	super(props);
}
baseFunc () {
	return 'yoo';
}
componentDidMount () {
	//console.log('MOUNT', 'FlexiBase', this.props);
}
render () {
	return <React.Fragment/>;
}
}