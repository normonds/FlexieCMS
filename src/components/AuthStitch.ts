import {
	Stitch,
	RemoteMongoClient,
	AnonymousCredential,
	GoogleRedirectCredential,
	StitchAppClient,
	RemoteMongoDatabase

} from "mongodb-stitch-browser-sdk";

import { EventApp, EventServer, iAppEvent } from "../Events";
import { App } from "../App";
import { MongoStitchXHR } from "./MongoStitchXHR";
import { file } from "googleapis/build/src/apis/file";
//import StitchAppClient from './mongodb-stitch-browser-core/dist/esm/core/StitchAppClient.d.ts'
// export interface sAuthStitch { link?:string, userEmail?:string }
export class AuthStitch {
	static stitchClient : StitchAppClient;// = Stitch.defaultAppClient;
	static refDB : RemoteMongoDatabase;// =
	static dbDefault;
	static appURL : string = 'https://flexiecms.ml';
	static init (appId : string, dbDefault : string) {
		// Stitch.defaultAppClient
		// App.logError({});
		// App.logError([]);
		// App.logError(new Map([['kk','ll']]));
		// App.logError(new Set(['aa']));
		//return;
		console.log('appURL', AuthStitch.appURL);
		AuthStitch.dbDefault = dbDefault;
		AuthStitch.stitchClient = Stitch.initializeDefaultAppClient(appId);
		if (!Stitch.defaultAppClient) {
			console.warn('Stitch client not initialized!');
		} else {
			AuthStitch.refDB = AuthStitch.stitchClient.getServiceClient(RemoteMongoClient.factory, 'mongodb-atlas')
				//.refDB('ritmainstituts-shop');
				// .refDB('flexi-cms-elihz');
				.db(dbDefault);

			MongoStitchXHR.init();
			App.emiter.off(EventApp.REACT_AUTH_LOGIN, AuthStitch.login);
			App.emiter.off(EventApp.REACT_AUTH_LOGOUT, AuthStitch.logout);
			App.emiter.off(EventApp.REACT_AUTH_LOGIN_ANONYMOUS, AuthStitch.loginAnon);

			App.emiter.on(EventApp.REACT_AUTH_LOGIN, AuthStitch.login);
			App.emiter.on(EventApp.REACT_AUTH_LOGIN_ANONYMOUS, AuthStitch.loginAnon);
			App.emiter.on(EventApp.REACT_AUTH_LOGOUT, AuthStitch.logout);
			App.emiter.on(EventApp.nm.ImageURLreq, AuthStitch.imgURLReq);
			//App.emit(new EventApp(EventApp.nm.ImageURLreq, this.props.filename));
			let hasRedirect = AuthStitch.redirectIfAvailable();
			if (!hasRedirect) AuthStitch.renderLogin();
		}
	}
	static login (e ?: any) {
		 if (!AuthStitch.stitchClient.auth.isLoggedIn || !Stitch.defaultAppClient.auth.user.profile['data'].email) {
			console.log('not logged in', AuthStitch.stitchClient.auth.hasRedirectResult());
			let redirURL = window.location.hostname == 'localhost' ? 'http://'+window.location.host
				: AuthStitch.appURL;
			const credential = new GoogleRedirectCredential(redirURL);//"http://localhost/flexi/dist/"
			Stitch.defaultAppClient.auth.loginWithRedirect(credential);
		} else {
			 AuthStitch.renderLogin();
			//console.log('logged in', Stitch.defaultAppClient.auth.user.profile['data'].email), Stitch.defaultAppClient.auth.user;
		}
	}
	static renderLogin () {
		if (AuthStitch.stitchClient.auth.isLoggedIn) {
			let email = Stitch.defaultAppClient.auth.user.profile['data'].email;
			console.log('logged in', email, Stitch.defaultAppClient.auth['authInfo']);
			if (!email) email = 'Anonymous User';
			App.emit(EventApp.USER_AUTHORIZED, email);
		} else {

			console.log('not logged in');
		}
	}
	static redirectIfAvailable () : boolean {
		if (AuthStitch.stitchClient.auth.hasRedirectResult()) {
			console.log("hasRedirectResult");
			AuthStitch.stitchClient.auth.handleRedirectResult().then(user => {
				console.log("handleRedirectResult", user);
				AuthStitch.renderLogin();
			}).catch((err) => {
				console.warn(err);
				console.log('Trying login with AnonymousCredential');
				AuthStitch.loginAnon();
				//Stitch.defaultAppClient.auth.loginWithRedirect();
			});
			return true;
		} else return false;
	}
	static loginAnon () {
		AuthStitch.stitchClient.auth.loginWithCredential(new AnonymousCredential()).then((user)=>{
			console.log('Anon logged in');
			AuthStitch.renderLogin();
		}).catch((err)=>{
			App.logError(err);
		});
	}
	static logout (e) {
		console.log(AuthStitch.stitchClient);
		AuthStitch.stitchClient.auth.logout();
		setTimeout(()=>location.reload(), 500);
	}
	// static componentDidMount () {
	// 	this.redirectIfAvailable();
	// 	this.renderLogin();
	// }
	static pendingImages:Set<string> = new Set();
	static loadedImages:Map<string,string> = new Map();
	static imgURLReq (eveApp : EventApp) {
		let fileToRequest = eveApp.data.filename;
		let startTime = Date.now();
		if (AuthStitch.pendingImages.has(fileToRequest)) {
			// console.log('pending Image', fileToRequest);
			return;
		} else if (AuthStitch.loadedImages.has(fileToRequest)) {
			// console.log('cached Image', fileToRequest);
			let event = new EventServer(EventServer.nm.ImageURL, AuthStitch.loadedImages.get(fileToRequest) as any, eveApp, startTime);
			event.duration = Date.now()-startTime;
			AuthStitch.pendingImages.delete(fileToRequest);
			App.emit(event);
			return;
		}

		AuthStitch.pendingImages.add(fileToRequest);

		AuthStitch.stitchClient.callFunction('getAppEngineImage', [fileToRequest]).then(resp => {
			// console.log('loaded image', fileToRequest, resp);
			let event = new EventServer(EventServer.nm.ImageURL, resp, eveApp, startTime);
			event.duration = Date.now()-startTime;
			AuthStitch.pendingImages.delete(fileToRequest);
			AuthStitch.loadedImages.set(fileToRequest, resp);
			App.emit(event);
			//App.emit(new EventServer(EventApp.nm.ImageURL, {filename:resp} as iAppEvent));
		}).catch(err => App.logError(err));
	}
}