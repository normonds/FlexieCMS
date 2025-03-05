import { describe } from "node:test"
import { App } from "../App"
import { eFieldType } from "../Interfaces"

export class DemoData {
	static query (tableID : string, data : any) : Promise<any> {
		let res = {}
		console.log('DemoData', tableID, data)
		if (tableID == App.configTableName) {
			let temp = {
				tablesConf:JSON.stringify({
					defaultTable:{
						description:'Table description',
						name: 'Herro',
						idCol:'_id',
						fields:[{name:'fieldd', label:'Field', type:eFieldType.STRING}]
					} , FullTable:{}}),
				tables: 'defaultTable,FullTable', 
				defaultTable:'defaultTable'
			}
			res = [temp]
		} else res = [
			{_id:"507f191e810c19729de860ea", fieldd:32}
			, {_id:"507f1f77bcf86cd799439011", fieldd:45}
		]
		return new Promise((resolve, reject) => {	resolve(res) })
	}
}