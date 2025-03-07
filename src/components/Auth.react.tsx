import * as React 				from "react";
import { App } 	from "../App";
import { EventApp } 			from "../Events";
import { iSTORE } from "../Interfaces";

export class AuthReact extends React.Component<{store:iSTORE} ,{}> {

constructor (props) { super(props); }
logout	 			(e : MouseEvent) {		App.emit(EventApp.REACT_AUTH_LOGOUT);		}
login					 (e : MouseEvent) {		App.emit(EventApp.REACT_AUTH_LOGIN);			}
loginAnon		 (e : MouseEvent) {		App.emit(EventApp.REACT_AUTH_LOGIN_ANONYMOUS);			}
render () {
	let anonLogin = this.props.store.adminAllowAnonUsers
		? <button onClick={this.loginAnon.bind(this)}>Anonymous Login</button> : <React.Fragment/>;
	let notLoggedIn = <React.Fragment>
		{/* <button onClick={this.login.bind(this)}>Login with Google account</button> */} {anonLogin}
	</React.Fragment>;
	let loggedIn = <React.Fragment><span className="auth-email" style={{opacity:0.5, fontSize:'90%', fontStyle:'italic'}}>&nbsp;{this.props.store.authorizedName}</span>&nbsp;&nbsp;
		<button onClick={this.logout.bind(this)}>Log out</button></React.Fragment>
	let link = this.props.store.authorizedName ? loggedIn : notLoggedIn;
	return <span>{link}</span>;
}

}