// import { iServerResponseWrap, iUpdateItemRequest } from "../Interfaces";
// import { FlexiTableOld } from "../../to.delete/old/FlexiTableOld";
import { AppReact } from "./App.react";
import { EventApp, iAppEvent, iServerEvent, EventServer, eServerItemModifyState, eTableType } from "../Events";
import { AuthReact } from "./Auth.react";
// const prettyPrint = require('json-pretty-html').default;
// import * as AWS from 'aws-sdk';a
// import BSON_ from "bson";
const BSON = require('bson');
const ObjectID = BSON.ObjectId;
// const ObjectID = require("bson-objectid");
import { FlexiMongoXHR } from "./FlexiMongoXHR";
import { App } from "../App";
import { AuthStitch } from "./AuthStitch";
const axios = require('axios');

/*window.insertt = function () {
	AuthStitch.refDB.collection('apps_stitch').insertOne({stitch_user: "@gmail.com"}).then((res: any) => {
		console.log(res);
	}).catch(e => {
		console.error(e);
	});
};*/
//var BSON = new BSON_();
// console.log(ObjectID("5a14179d01236a9fc1086df6"));
export class MongoStitchXHR {
	static idField : string = '_id';
	// static uploadUrl : string;
	// static url;
	// static googleAccessToken : string;
	// static googleIdToken : string;
	static init () {
		//console.log('MongoStitchXHR', 'init');
		App.emiter.on(EventApp.nm.reqCell, MongoStitchXHR.makeRequest);
		App.emiter.on(EventApp.nm.TablesListRequest, MongoStitchXHR.makeRequest);
		App.emiter.on(EventApp.nm.TableGetRequest, MongoStitchXHR.makeRequest);
		App.emiter.on(EventApp.nm.ItemUpdateRequest, MongoStitchXHR.makeRequest);
		App.emiter.on(EventApp.nm.RowInsertNewRequest, MongoStitchXHR.makeRequest);
		App.emiter.on(EventApp.nm.RowDeleteRequest, MongoStitchXHR.makeRequest);
		App.emiter.on(EventApp.nm.TableCountRows, MongoStitchXHR.makeRequest);
		App.emiter.on(EventApp.nm.RequestUploadUrl, MongoStitchXHR.makeRequestUploadUrl);


		//console.log(BSON.ObjectID('5bca3ac91c9d4400006040a5'));
	}

	static makeRequestUploadUrl (eveApp : EventApp) {
		//console.log('makeRequestUploadUrl', event.data);
		let startTime = new Date().getTime();
		// let uploadReqURL = App.STORE.configDB.fileUploadUrl;
		// if (!uploadReqURL) { App.logError('Upload url not set '); return; }

		AuthStitch.stitchClient.callFunction('getUploadUrl', [eveApp.data.name, eveApp.data.type]).then(resp => {
			// console.log('loaded image', fileToRequest, resp);
			if (resp.error || resp.errors) {
				App.logError(resp.error || resp.errors);
			} else {
				FlexiMongoXHR.processResponse({
					__flexi_servEve: EventServer.nm.UploadURL,
					dbObj: {url: resp.uri, filename: resp.name}
				}, eveApp, startTime);
				let event = new EventServer(EventServer.nm.ImageURL, resp, eveApp, startTime);
				event.duration = Date.now() - startTime;
				// AuthStitch.pendingImages.delete(fileToRequest);
				// AuthStitch.loadedImages.set(fileToRequest, resp);
				App.emit(event);
			}
			//App.emit(new EventServer(EventApp.nm.ImageURL, {filename:resp} as iAppEvent));
		});
		/*axios.post(uploadReqURL, {name:event.data.name, type:event.data.type}).then(function (response) {
			AppReact.info('response', FlexiMongoXHR.url, response);
			if (response.data) {
				response.data.__flexi_servEve = EventServer.nm.UploadURL;
				AppReact.info('processResponse', response.data);
				//{url:urlObj.uri, filename:urlObj.tableID}, {url:'someurl', data:data}
				FlexiMongoXHR.processResponse({__flexi_servEve:EventServer.nm.UploadURL,
					dbObj:{url:response.data.uri, filename:response.data.name}}, event, startTime);
			} else {
				App.warn(EventServer.nm.ResponseNoData, event);
			}
		}).catch(function (error) {
			App.warn(error);
		});*/
	}
	// {tableName:this.confRef.tableName, rowID:this.rowID}
	static makeRequest (event : EventApp) {
		let startTime = Date.now();
		let query: any = {eventName: event.eventName, data: event.data};
		let forLog = '';
		event.startTime = startTime;
		if (event.eventName) forLog += ''+event.eventName;
		if (event.data.tableID) forLog += ', tableID:'+event.data.tableID;
		if (event.data.id) forLog += ', id:'+event.data.id;
		if (event.data.parentID) forLog += ', parentID:'+event.data.parentID;
		//+', id:'+event.data.id+', parentID:'+event.data.parentID;
		AppReact.info('request '+forLog, query);
		if (!AuthStitch.stitchClient.auth.isLoggedIn) {
			App.logError('User not logged in. not querying database!');
			return;
		}

		if (event.eventName == EventApp.nm.TableCountRows) {

			AuthStitch.refDB.collection(event.data.tableID).count(event.data.query || {}).then((res: any) => {
				//console.log(new Date().getTime() - startTime, res);
				//console.log('Table count', event.data.tableID, res);
				MongoStitchXHR.processResponse({__flexi_servEve: EventServer.nm.TableCountRows, dbObj: res, __flexidb_duration: -1}, event, startTime);
			}).catch(e => {
				App.logError(e);
			});
			// INSERT NEW ROW
		} else if (event.eventName == EventApp.nm.RowDeleteRequest) {
			AuthStitch.refDB.collection(event.data.tableID).deleteOne({[MongoStitchXHR.idField]:new ObjectID(event.data.id)}).then((res: any) => {
				//console.log(new Date().getTime() - startTime, res);
				//res.getIDCol = '_id';
				MongoStitchXHR.processResponse({__flexi_servEve: EventServer.nm.RowDelete, dbObj: res, __flexidb_duration: -1}, event, startTime);
			}).catch(e => {
				App.logError(e);
			});
			// UPDATE ROW
		} else if (event.eventName == EventApp.nm.RowInsertNewRequest) {

			AuthStitch.refDB.collection(event.data.tableID).insertOne(event.data.query || {}).then((res: any) => {
				//console.log(new Date().getTime() - startTime, res);
				//res.getIDCol = '_id';
				MongoStitchXHR.processResponse({__flexi_servEve: EventServer.nm.RowInsertNew, dbObj: res, __flexidb_duration: -1}, event, startTime);
			}).catch(e => {
				App.logError(e);
			});
		// UPDATE ROW
		} else if (event.eventName == EventApp.nm.ItemUpdateRequest) {
			//console.log(event.data.id, BSON.ObjectId(event.data.id));
			// console.log(event.data.id, ObjectID(event.data.id), new ObjectId(event.data.id));

			let update;
			if (event.data.val == undefined) {
				update = {"$unset": {[event.data.col]: 1}};
			} else {
				update = {"$set": {[event.data.col]: event.data.val}};
			}

			AuthStitch.refDB.collection(event.data.tableID).updateOne({[MongoStitchXHR.idField]: new ObjectID(event.data.id)}, update,
				{upsert: false}).then((res: any) => {
				//console.log(new Date().getTime() - startTime, res);
				let retInfo: eServerItemModifyState;
				/*if (ewa.data.__flexidb_error) {
					App.warn(servEve.data.__flexidb_error);
				} else */
				if (res.nModified === 1 || res.modifiedCount === 1 || res.modifiedCount.$numberInt === "1") {
					retInfo = eServerItemModifyState.MODIFIED;
				} else if (res.nModified === 0 || res.modifiedCount === 1 || res.modifiedCount.$numberInt === "0") {
					retInfo = eServerItemModifyState.MODIFIED_NOT;
					AppReact.info(`Item wasn't modified`, event, res);
				} else {
					retInfo = eServerItemModifyState.MODIFY_ERROR;
					AppReact.warn('Error updating item', event, res);
					App.logError(res);
				}
				MongoStitchXHR.processResponse({__flexi_servEve: EventServer.nm.ItemUpdate, dbObj: {modifiedState: retInfo, res: res}, __flexidb_duration: -1}, event, startTime);
			}).catch(e => {
				App.logError(e);
			});

		// GET CELL
		} else if (event.eventName == EventApp.nm.reqCell) {
			let reqData:iAppEvent = event.data;
			let query = event.data.query ? event.data.query : {$match:{[MongoStitchXHR.idField]:new ObjectID(reqData.id)}};
			AuthStitch.refDB.collection(event.data.tableID).aggregate(
				[query,{$project:{[reqData.col]:1}}/*,{$skip:event.data.skip || 0}, {$limit:event.data.limit || 100}*/])
				.asArray().then((res: any) => {
				MongoStitchXHR.processResponse({__flexi_servEve: EventServer.nm.Cell, dbObj: res, __flexidb_duration:-1}, event, startTime);
			}).catch(e => {	App.logError(e);	});
		// GET TABLE ROWS
		} else if (event.eventName == EventApp.nm.TableGetRequest) {
			let query = event.data.query ? event.data.query : {$match:{}};
			AuthStitch.refDB.collection(event.data.tableID).aggregate(
				[query,{$sort:{[MongoStitchXHR.idField]:-1}},{$skip:event.data.skip || 0}, {$limit:event.data.limit || 100}])
				.asArray().then((res: any) => {
					MongoStitchXHR.processResponse({__flexi_servEve: EventServer.nm.Table, dbObj: res, __flexidb_duration:-1}, event, startTime);
					if (event.data.countRows) MongoStitchXHR.aggregateCount(event, query);
			}).catch(e => {	App.logError(e);	});

		}
	}
	static aggregateCount (event:EventApp, query :any) {
		let startTime = new Date().getTime();
		AuthStitch.refDB.collection(event.data.tableID).aggregate([query, {$count:'count'}]).asArray().then((res: any) => {
			let rows = 0;
			if (res[0] && res[0].count) { rows = res[0].count; }
			MongoStitchXHR.processResponse({__flexi_servEve: EventServer.nm.TableCountRows, dbObj: rows as any, __flexidb_duration:-1}
			, event, startTime);

		}).catch(e => {	App.logError(e);	});
	}
	static processResponse (data : iServerEvent, requestEvent : EventApp, startTime : number) {
		AppReact.info('response', data);
		if (data.__flexi_servEve) {
			let event = new EventServer(data.__flexi_servEve, data, requestEvent, startTime);
			event.duration = Date.now()-startTime;
			App.emit(event);
		} else AppReact.warn(EventServer.nm.MalformedServerEvent, data);
	}

}