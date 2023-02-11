import { Line } from './Line';
import { Phenomenon } from './Phenomenon';
export class Interface extends Line {
	interface_no: number;
	interface_name: string;
	interface_description: string;
	interface_from: string;
	interface_to: string;
	phenomenonList: Phenomenon[];
	interface_x1: number;
	interface_y1: number;
	interface_x2: number;
	interface_y2: number;
	static newInterface(no, name, description, from, to, phe, x1, y1, x2, y2) {
		let int = new Interface()
		int.interface_no = no
		int.interface_name = name
		int.interface_description = description
		int.interface_from = from
		int.interface_to = to
		int.phenomenonList = phe
		int.interface_x1 = x1
		int.interface_y1 = y1
		int.interface_x2 = x2
		int.interface_y2 = y2
		return int
	}
	static newInterfaceWithOld(old, phenomenonList, description) {
		let int = new Interface()
		int.interface_no = old.interface_no
		int.interface_name = old.interface_name
		int.interface_description = description
		int.interface_from = old.interface_from
		int.interface_to = old.interface_to
		int.phenomenonList = phenomenonList
		int.interface_x1 = old.interface_x1
		int.interface_y1 = old.interface_y1
		int.interface_x2 = old.interface_x2
		int.interface_y2 = old.interface_y2
		return int
	}
	static getDescription1(name, pheList) {
		//a:M!{on},P!{off}
		let s = "";
		s = s + name + ":";
		let s1 = "";
		let s2 = "";
		let desList = [];
		for (let phe of pheList) {
			let flag = false;
			for (let des of desList) {
				if (phe.phenomenon_from == des[0]) {
					des.push(phe.phenomenon_name);
					flag = true;
					break;
				}
			}
			if (!flag) {
				desList.push([phe.phenomenon_from, phe.phenomenon_name]);
			}
		}
		//console.log(desList);
		for (let des of desList) {
			s += des[0] + "!{";
			for (let item of des.slice(1)) {
				s += item + ",";
			}
			s = s.slice(0, -1);
			s += "},";
		}
		s = s.slice(0, -1);
		//console.log(s);
		return s;
	}
	static copyInterface(old) {
		let int = new Interface()
		int.interface_no = old.interface_no
		int.interface_name = old.interface_name
		int.interface_from = old.interface_from
		int.interface_to = old.interface_to
		console.log("old.phenomenonList=", old.phenomenonList)
		if (old.phenomenonList != undefined) {
			int.phenomenonList = old.phenomenonList
			int.interface_description = Interface.getDescription1(int.interface_name, old.phenomenonList)
		}
		else int.phenomenonList = new Array<Phenomenon>();
		int.interface_description = Interface.getDescription1(int.interface_name, int.phenomenonList)
		int.interface_x1 = old.interface_x1
		int.interface_y1 = old.interface_y1
		int.interface_x2 = old.interface_x2
		int.interface_y2 = old.interface_y2
		return int
	}
	getNo() { return this.interface_no }
	setNo(no) { this.interface_no = no }

	getName() { return this.interface_name }
	setName(name) { this.interface_name = name }

	getDescription() { return this.interface_description }
	setDescription(description) { this.interface_description = description }

	getFrom() { return this.interface_from }
	setFrom(from) { this.interface_from = from }

	getTo() { return this.interface_to }
	setTo(to) { this.interface_to = to }

	getX1() { return this.interface_x1 }
	setX1(x1) { this.interface_x1 = x1 }

	getY1() { return this.interface_y1 }
	setY1(y1) { this.interface_y1 = y1 }

	getX2() { return this.interface_x2 }
	setX2(x2) { this.interface_x2 = x2 }

	getY2() { return this.interface_y2 }
	setY2(y2) { this.interface_y2 = y2 }
	getPhenomenonList() { return this.phenomenonList }
	setPhenomenonList(phenomenonList) { this.phenomenonList = phenomenonList }
}