import { Line } from './Line';
import { RequirementPhenomenon } from './RequirementPhenomenon';
export class Constraint extends Line {
	constraint_no: number;
	constraint_name: string;
	constraint_description: string;
	constraint_from: string;
	constraint_to: string;
	constraint_x1: number;
	constraint_y1: number;
	constraint_x2: number;
	constraint_y2: number;
	phenomenonList: RequirementPhenomenon[];
	static newConstraint(no, name, description, from, to, phe, x1, y1, x2, y2) {
		let con = new Constraint()
		con.constraint_no = no
		con.constraint_name = name
		con.constraint_description = description
		con.constraint_from = from
		con.constraint_to = to
		con.phenomenonList = phe
		con.constraint_x1 = x1
		con.constraint_y1 = y1
		con.constraint_x2 = x2
		con.constraint_y2 = y2
		return con
	}
	static newConstraintWithOld(old, phenomenonList, description) {
		let con = new Constraint()
		con.constraint_no = old.constraint_no
		con.constraint_name = old.constraint_name
		con.constraint_from = old.constraint_from
		con.constraint_to = old.constraint_to
		con.constraint_x1 = old.constraint_x1
		con.constraint_y1 = old.constraint_y1
		con.constraint_x2 = old.constraint_x2
		con.constraint_y2 = old.constraint_y2
		con.constraint_description = description
		con.phenomenonList = phenomenonList
		return con
	}
	static copyConstraint(old) {
		let con = new Constraint()
		con.constraint_no = old.constraint_no
		con.constraint_name = old.constraint_name
		con.constraint_from = old.constraint_from
		con.constraint_to = old.constraint_to
		con.constraint_x1 = old.constraint_x1
		con.constraint_y1 = old.constraint_y1
		con.constraint_x2 = old.constraint_x2
		con.constraint_y2 = old.constraint_y2
		con.constraint_description = old.phenomenonList == undefined ? old.constraint_description : Constraint.getDescription1(con.constraint_name, old.phenomenonList)
		con.phenomenonList = old.phenomenonList == undefined ? new Array<RequirementPhenomenon>() : old.phenomenonList


		return con
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
	getNo() { return this.constraint_no }
	setNo(no) { this.constraint_no = no }

	getName() { return this.constraint_name }
	setName(name) { this.constraint_name = name }

	getDescription() { return this.constraint_description }
	setDescription(description) { this.constraint_description = description }

	getFrom() { return this.constraint_from }
	setFrom(from) { this.constraint_from = from }

	getTo() { return this.constraint_to }
	setTo(to) { this.constraint_to = to }

	getX1() { return this.constraint_x1 }
	setX1(x1) { this.constraint_x1 = x1 }

	getY1() { return this.constraint_y1 }
	setY1(y1) { this.constraint_y1 = y1 }

	getX2() { return this.constraint_x2 }
	setX2(x2) { this.constraint_x2 = x2 }

	getY2() { return this.constraint_y2 }
	setY2(y2) { this.constraint_y2 = y2 }
	getPhenomenonList() { return this.phenomenonList }
	setPhenomenonList(phenomenonList) { this.phenomenonList = phenomenonList }
}