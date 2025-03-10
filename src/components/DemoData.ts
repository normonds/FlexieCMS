import { describe } from "node:test"
import { App } from "../App"
import { eFieldType, eTableType } from "../Interfaces"
import { AppUtils } from "../AppUtils";

export class DemoData {
	static db = {
		fullTable : [
			{_id:"507f191e810c19729de860ea", category:'67c9c908b3c3a282025b1594', radios:'67c9f0a16765ef96c9ffa5b7', title:'Dress'
				, descr:'Lorem ipsum <b>dolor sit amet</b>, consectetur adipiscing elit. Phasellus quis feugiat turpis, eu ullamcorper arcu. Proin blandit maximus est sit amet molestie. Vivamus maximus auctor nibh at pretium. Praesent vehicula placerat diam quis blandit. In ac mollis purus. Vestibulum vel felis in sem pretium hendrerit ac quis purus. Sed lacus ligula, aliquet eu velit in, tempor auctor tortor. Praesent aliquet in dolor ac blandit. Mauris sed urna in eros dictum faucibus. Curabitur aliquet sapien ligula, non laoreet nibh tincidunt non.'
				, checkbox: ["67c9f0a846c218febaf1d512","67c9f09691a5c340f0014bbb"]
				, images:['/andromeda.jpg','/sun.jpg','/cloud.jpg']}
			, {_id:"507f1f77bcf86cd799439011", category:'67c9c90f4eb1b39a3d1861e1', radios:'67c9f0a846c218febaf1d512', title:'Pants'
				, descr:'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus quis feugiat turpis, eu ullamcorper arcu. Proin blandit maximus est sit amet molestie. Vivamus maximus auctor nibh at pretium. Praesent vehicula placerat diam quis blandit. In ac mollis purus. Vestibulum vel felis in sem pretium hendrerit ac quis purus. Sed lacus ligula, aliquet eu velit in, tempor auctor tortor. Praesent aliquet in dolor ac blandit. Mauris sed urna in eros dictum faucibus. Curabitur aliquet sapien ligula, non laoreet nibh tincidunt non.', images:['/earth.jpg','/carina.jpg','/colony.jpg']}
		],
		categories : [
			{_id:"67c9c3a7acc66c58fce1f4b7", __flexi_parent_cat:'', title:'Dresses', descr:'All dresses'}
			, {_id:"67c9c908b3c3a282025b1594", __flexi_parent_cat:'67c9c3a7acc66c58fce1f4b7'
				, title:'Dresses for kids', descr:'Dresses for kids'}
			, {_id:"67c9ca2f8b561b66c3ab2087", __flexi_parent_cat:'67c9c3a7acc66c58fce1f4b7'
				, title:'Dresses for kidults', descr:'Dresses for kidults'}
			, {_id:"67c9d9e98c798741bd183add", __flexi_parent_cat:'67c9ca2f8b561b66c3ab2087'
				, title:'Dresses for kidults red', descr:'Dresses for kidults red'}
			, {_id:"67c9c90f4eb1b39a3d1861e1", __flexi_parent_cat:'67c9c3a7acc66c58fce1f4b7'
				, title:'Dresses for adults', descr:'Dresses for adults'}
			, {_id:"67c9c3b2210f5c9029b98877", __flexi_parent_cat:'', title:'Pants', descr:'Category for pants'}
		],
		subTable : [
			{_id:"67c9f09691a5c340f0014bbb", title:'S', descr:'Small'}
			, {_id:"67c9f0a16765ef96c9ffa5b7", title:'M', descr:'Medium'}
			, {_id:"67c9f0a846c218febaf1d512", title:'L', descr:'Large'}
		],
		subTable2 : [
			{_id:"67c9f09691a5c340f0014bba", __flexi_parent:'507f191e810c19729de860ea', title:'Title1', descr:'Descr1'}
			, {_id:"67c9f0a16765ef96c9ffa5b6",  __flexi_parent:'507f1f77bcf86cd799439011', title:'Title2', descr:'Descr2'}
			, {_id:"67c9f0a846c218febaf1d511",  __flexi_parent:'507f191e810c19729de860ea', title:'Title3', descr:'Descr3'}
		],
		__flexi_conf : [{
			tablesConf:JSON.stringify({
				fullTable:{
					description:'Category is referenced from CATEGORIES tabs',
					name: 'Products',
					idCol:'_id',
					tableType: eTableType.FULL,
					cellDirection : 'vertical',
					showFullTexts: true,
					maxFieldChars: 9999,
					fields:[
						{name:'category', label:'Category (complex nested select field using entries from another table)', type:'catReference', refTable:'categories', refCol:'title', refIdCol:'_id'},
						{name:'radios', label:'single select field using entries from another table', type:'catReference', refTable:'subTable', refCol:'title', refIdCol:'_id', settings:'radio'},
						{name:'checkbox', label:'single select field using entries from another table', type:'catReference', refTable:'subTable', refCol:'title', refIdCol:'_id', settings:'checkbox'},
						{name:'title', label:'Title (simple field)', type:'string'},
						{name:'descr', label:'Description (simple field)', type:'string'},
						{name:'images', label:'Images (file upload field)', type:'fileUpload'},
					],
					subtable: 'subTable2'
					/* subtable: {
						description:'',
						name: 'Subtable2',
						idCol:'_id',
						tableType: eTableType.SUBTABLE,
						fields:[
							{name:'title', label:'Title', type:'string'},
							{name:'descr', label:'Description', type:'string'},
						]
					} */
				}, categories:{
					description:'Nested categories',
					name: 'Categories',
					idCol:'_id',
					tableType: 'categories',
					categoriesParentTitleField: 'title',
					fields:[
						{name:'__flexi_parent_cat', label:'Category reference', type:'catReference', refTable:'categories', refCol:'title', refIdCol:'_id'},
						// {name:'name', label:'Product category', type:eFieldType.STRING},
						{name:'title', label:'Title', type:'string'},
						{name:'descr', label:'Description', type:'string'}
					]
				}, subTable:{
					description:'This table is meant to be referenced in other table\'s fields like checkbox or radio selection',
					name: 'Subtable',
					idCol:'_id',
					tableType: eTableType.STANDARD,
					fields:[
						{name:'title', label:'Title', type:'string'},
						{name:'descr', label:'Description', type:'string'},
					]
				}, subTable2:{
					description:'This is subtable for above table, its entries also can have subtables creating a subsubtable',
					name: 'Sub Table',
					idCol:'_id',
					tableType: eTableType.SUBTABLE,
					fields:[
						{name:'title', label:'Title', type:'string'},
						{name:'descr', label:'Description', type:'string'},
					]
				}
			}),
			tables: 'fullTable,categories,subTable', 
			defaultTable:'fullTable'
		}]
	}
	static dbLocked: boolean = false;
	static clearLocalDB () {
		console.log('clearLocalDB')
		AppUtils.storageRemove('flexiecms2019-db')
		DemoData.dbLocked = true
	}
	static dbCheck () {
		let db = AppUtils.storageGet('flexiecms2019-db')
		if (db) DemoData.db = db
		// let confCell = AppUtils.storageGet('flexiecms2019-confCell')
		// if (confCell) DemoData.confCell = confCell
		//return db
	}
	static dbSave () {
		if (!DemoData.dbLocked) AppUtils.storageSave('flexiecms2019-db', DemoData.db)
		// AppUtils.storageSave('flexiecms2019-confCell', DemoData.confCell)
	}

	// MUTATORS
	static searchIDandModify (tableID : string, id, col, val) {
		// DemoData.dbCheck()
		DemoData.db[tableID].forEach((row:any, index) => {
			if (row._id == id) {
				row[col] = val
			}
		})
		// DemoData.dbSave()
	}
	static query (tableID : string, event : string, data : any) : Promise<any> {
		DemoData.dbCheck()
		let res
		let countRows = 0
		
		res = DemoData.db[tableID]
		/* if (tableID == App.configTableName) {
			let temp = DemoData.confCell
			res = [temp]
		} else if (tableID == 'fullTable') {
			res = DemoData.db[tableID]
		} else if (tableID == 'categories') {
			res = DemoData.db[tableID]
		} else if (tableID == 'subTable') {
			res = DemoData.db[tableID]
		} else if (tableID == 'subTable2') {
			res = DemoData.db[tableID]
		} */

		if (event == 'updateOne' || event == 'serverItemUpdate') {
			//console.error(res, data.id.id, data.col, data.val)
			DemoData.searchIDandModify(tableID, data.id.id, data.col, data.val)
			res = {modifiedCount:1}
		} else if (event == 'aggregateCount') {
			res = [{count:res.length}]
		// } else if (event == 'updateOne') {
			// res = {modifiedCount:1}
		} else if (event == 'RowInsertNewRequest') {
			let insID = (Math.round(Math.random()*10000000000)).toString()
			let obj = {_id:insID}
			if (data[0].__flexi_parent) {
				obj['__flexi_parent'] = data[0].__flexi_parent
			}
			DemoData.db[tableID].unshift(obj)
			console.error(data, DemoData.db[tableID])
			res = {insertedId:insID}
		}
		console.info('demo-query', tableID, event, data, res)
		console.log(DemoData.db)
		DemoData.dbSave()
		return new Promise((resolve, reject) => {	resolve(res) })
	}
}