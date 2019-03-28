// import { iServerResponseWrap, iUpdateItemRequest } from "../Interfaces";
// import { FlexiTableOld } from "../../to.delete/old/FlexiTableOld";
import { AppReact } from "./App.react";
import { EventApp } from "../Events";
import { App } from "../App";
let prettyPrint = require('json-pretty-html').default;
// import * as AWS from 'aws-sdk';

declare var AWS;
export class DynamoDBwrap {
static dynamoDB;
static tableInfos : Object = {};
static createValObject (value) {
	let out = {};
	if (!isNaN(value)) {
		out['N'] = value;
	} else {
		out['S'] = value;
	}
	return out;
}
static init (config : Object) {

	AWS.config.update(config);
	DynamoDBwrap.dynamoDB = new AWS.DynamoDB();

	App.emiter.on(EventApp.nm.TablesListRequest, function() {
		DynamoDBwrap.dynamoDB.listTables(DynamoDBwrap.listTablesReceive); });
	App.emiter.on(EventApp.nm.TableGetRequest, function(req:string) {
		DynamoDBwrap.getTable(req)});
	// AppReact.emiter.on(EventApp.nm.ItemUpdateRequest, function(obj : iUpdateItemRequest) {
	// 	DynamoDBwrap.updateItem(obj); });


	/*DynamoDBwrap.getTable(App.curr.activeTable, function(data, duration) {
		App.log(data, duration);
		App.curr.activeTable.duration = duration;
		App.curr.activeTable.items = data;
		App.emiter.emit(EventApp.nm.TableLoad, App.curr.activeTable.tableID);
	});*/
}
/*static getTableReceive (data, duration) {
	App.log(data, duration);

	//App.curr.activeTable.duration = duration;
	//App.curr.activeTable.items = data;
	App.emiter.emit(EventApp.nm.GetTableResponse, {duration:duration, items:data});
}*/
static listTablesReceive (err, data) {
	if (err) {AppReact.log(err);return;}
	//App.log(data.TableNames);
	for (let i in data.TableNames) {
		DynamoDBwrap.getTableInfo(data.TableNames[i]);
	}
	//App.emiter.emit(EventApp.nm.ListTablesResponse, data.TableNames);
}
static getTable (tableName : string) {
	if (!DynamoDBwrap.tableInfos.hasOwnProperty(tableName)) {
		console.warn('Table ' + tableName + ' info not found!');
		return;
	}
	//ref.config.tableID = tableID;
	//DynamoDBwrap.dynamoDB;

	let timeStart = Date.now();
	// scan params
	var params = {
		/*ExpressionAttributeValues: {
			":topic": {
				S: "PHRASE"
			}
		},*/
		//FilterExpression: "contains (Subtitle, :topic)",
		//ProjectionExpression: "id,referer,event",
		TableName: tableName,
		Limit: 10,
	};

	//query params
	var params2 = {
		/*ExpressionAttributeValues: {
			':s': {N: '2'},
			':e' : {N: '09'},
			':topic' : {S: 'PHRASE'}
		},*/
		KeyConditionExpression: "id_type = :val",
		ExpressionAttributeValues: {":val": {"S": "header"}},
		//KeyConditionExpression: 'type = header',
		//ProjectionExpression: 'id,referer',
		//FilterExpression: 'contains (Subtitle, :topic)',
		TableName: tableName,
		Limit: 10,
	};
	//DynamoDBwrap.getTableInfo(tableName.tableID) ;
	DynamoDBwrap.dynamoDB.scan(params, function(err, data) {
		if (err) {
			// FlexiTableOld.log("Error", err);
		} else {
			let ret = [];
			data.Items.forEach(function(element, index, array) {
				//FlexiTableOld.log(JSON.stringify(element));
				//App.log(element);
				ret.push(element);
			});
			//ref.renderServerData(ret);
			/*App.emiter.emit(EventApp.nm.GetTableResponse, {
				duration:Date.now()-timeStart, items:ret, tableID:tableName, getIDCol:DynamoDBwrap.getIdCol(tableName)
				, idColSecondary:DynamoDBwrap.getIdColSecondary(tableName)});*/
		}
	});
	//var dynamoDB = new AWS.DynamoDB();
}
/*static updateItem (incUpdtItem : iUpdateItemRequest) {
	// tableID : iFlexiTable__, col, id, link
	AppReact.log(incUpdtItem);
	//return;
	let expressionObject = {};
	AppReact.log(isNaN(incUpdtItem.value));
	if (!isNaN(incUpdtItem.value)) {
		expressionObject['N'] = incUpdtItem.value;
	} else {
		expressionObject['S'] = incUpdtItem.value;
	}
	//DynamoDBwrap.tableInfos[incUpdtItem.tableID.config.tableID]

	let tableKeys = {};
	if (incUpdtItem.table.getIDCol) tableKeys[incUpdtItem.table.getIDCol] = DynamoDBwrap.createValObject(incUpdtItem.rowID);
	if (incUpdtItem.table.idColSecondary) tableKeys[incUpdtItem.table.idColSecondary] = DynamoDBwrap.createValObject(incUpdtItem.rowID2);

	var params = {
		//TableName:incUpdtItem.tableID.tableID,
		Key:tableKeys,

		//UpdateExpression: "set info.rating = :r, info.plot=:p, info.actors=:a",
		UpdateExpression: "SET #col=:a",
		ExpressionAttributeNames: {
			"#col": incUpdtItem.col
		},
		ExpressionAttributeValues:{
			//":r":5.5,
			//":p":"Everything happens all at once.",
			":a":DynamoDBwrap.createValObject(incUpdtItem.value)
		},
		ReturnValues:"UPDATED_NEW"
	};

	AppReact.log("Updating the item...", params);

	DynamoDBwrap.dynamoDB.updateItem(params, function(err, data) {
		if (err) {data = err;	}
		let respWrap:iServerResponseWrap = {received:data, sent:incUpdtItem};
		//App.emiter.emit(EventApp.nm.ServerResponse, respWrap);
		var html = prettyPrint(data, data.dimensions);
		FlexiTableOld.log(html);
	});
}*/
static getTableInfo (tableName : string) {
	DynamoDBwrap.dynamoDB.describeTable({TableName: tableName}, function(err, data) {
		if (err) {
			// FlexiTableOld.log(err, err.stack);
			return;
		}
		AppReact.log('describing tableID ' + tableName, data);
		DynamoDBwrap.tableInfos[tableName] = data;
		//var html = prettyPrint(data, data.dimensions);
		//App.emiter.emit(EventApp.nm.TableInfoReceive, data);
		/*if (App.defaultTable==tableName) {
			App.emiter.emit(EventApp.nm.TableGetRequest, tableName);
		}*/
	});
}
static getIdColSecondary (tableName) {	// partition key
	return DynamoDBwrap.getIdCol(tableName, 0);
}
static getIdCol (tableName, num : number = 1) {
	if (!DynamoDBwrap.tableInfos.hasOwnProperty(tableName)) {
		console.warn('Not found ' + tableName, DynamoDBwrap.tableInfos); 	return;
	}
	let ret = null;
	try {
		ret = DynamoDBwrap.tableInfos[tableName].Table.KeySchema[num].AttributeName;
	} catch (e) {
		AppReact.log(e);
		//ret = '<id-col-not-found>';
	}
	return ret;
}

}