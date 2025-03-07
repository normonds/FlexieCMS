// import { iServerResponseWrap, iUpdateItemRequest } from "../Interfaces";
// import { FlexiTableOld } from "../../to.delete/old/FlexiTableOld";
import { AppReact } from "./App.react";
import { EventApp, iAppEvent, EventServer } from "../Events";
import { App } from "../App";
import { iServerEvent } from "src/Interfaces";
// const prettyPrint = require('json-pretty-html').default;
// import * as AWS from 'aws-sdk';a
const axios = require('axios');

export class FlexiMongoXHR {

static url;
static db : string = 'db';
static googleAccessToken : string;
static googleIdToken : string;
static init () {
	App.emiter.on(EventApp.nm.TablesListRequest, FlexiMongoXHR.makeRequest);
	App.emiter.on(EventApp.nm.TableGetRequest, FlexiMongoXHR.makeRequest);
	App.emiter.on(EventApp.nm.ItemUpdateRequest, FlexiMongoXHR.makeRequest);
	App.emiter.on(EventApp.nm.RowInsertNewRequest, FlexiMongoXHR.makeRequest);
	App.emiter.on(EventApp.nm.RowDeleteRequest, FlexiMongoXHR.makeRequest);
	//App.emiter.on(EventApp.nm.RequestUploadUrl, FlexiMongoXHR.makeRequest);
	App.emiter.on(EventApp.nm.RequestUploadUrl, (event : EventApp) => {
		let startTime = new Date().getTime();
		axios.post(AppReact.confServer.fileUploadUrl, {name:event.data.name, type:event.data.type}).then(function (response) {
			AppReact.info('response', FlexiMongoXHR.url, response);
			if (response.data) {
				response.data.__flexi_servEve = EventServer.nm.UploadURL;
				AppReact.info('processResponse', response.data);
				//{url:urlObj.uri, filename:urlObj.tableID}, {url:'someurl', data:data}
				FlexiMongoXHR.processResponse({__flexi_servEve:EventServer.nm.UploadURL,
					dbObj:{url:response.data.uri, filename:response.data.name}}, event, startTime);
			} else {
				AppReact.warn(EventServer.nm.ResponseNoData, event);
			}
		}).catch(function (error) {
			AppReact.error(error);
		});
	});
}
// {tableName:this.confRef.tableName, rowID:this.rowID}
static makeRequest (event : EventApp) {
	let startTime = Date.now();
	let query:any = {eventName:event.eventName, data:event.data};
	if (FlexiMongoXHR.googleAccessToken && FlexiMongoXHR.googleIdToken) {
		query.google_access_token = FlexiMongoXHR.googleAccessToken;
		query.google_id_token = FlexiMongoXHR.googleIdToken;
	}
	AppReact.info('request', FlexiMongoXHR.url, query);
	axios.post(FlexiMongoXHR.url, query).then(function (response) {
		AppReact.info('response', FlexiMongoXHR.url, response);
		if (response.data) {
			AppReact.info('processResponse', response.data);
			FlexiMongoXHR.processResponse(response.data, event, startTime);
		} else {
			AppReact.warn(EventServer.nm.ResponseNoData, event);
		}
	}).catch(function (error) {
		AppReact.error(error);
	});
}
static processResponse (data : iServerEvent, requestEvent : EventApp, startTime : number) {
	if (data.__flexi_servEve) {
		App.emit(new EventServer(data.__flexi_servEve, data, requestEvent, startTime));
	} else AppReact.warn(EventServer.nm.MalformedServerEvent, data);
}

}