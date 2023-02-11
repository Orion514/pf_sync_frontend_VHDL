export class Requirement {
	requirement_no: number;	//������
	requirement_context: string;	//��������
	requirement_shortname: string;
	requirement_x: number;	//λ����Ϣ
	requirement_y: number;
	requirement_h: number;
	requirement_w: number;
	static newRequirement(no,name,x,y,h,w){
		let req = new Requirement()
		req.requirement_no=no
		req.requirement_context=name
		req.requirement_shortname = getShortname(name);
		req.requirement_x=x
		req.requirement_y=y
		req.requirement_h=h
		req.requirement_w=w
		return req
	}
	static newRequirementWithOld(old,name,shortname){
		let req = new Requirement()
		req.requirement_no = old.requirement_no
		req.requirement_context = name
		req.requirement_shortname = shortname;
		req.requirement_x = old.requirement_x
		req.requirement_y = old.requirement_y
		req.requirement_h = old.requirement_h
		req.requirement_w = old.requirement_w
		return req
	}
	static copyRequirement(old){
		let req = new Requirement()
		req.requirement_no = old.requirement_no
		req.requirement_context = old.requirement_context
		req.requirement_shortname = old.requirement_shortname ? old.requirement_shortname : getShortname(old.name);
		req.requirement_x = old.requirement_x
		req.requirement_y = old.requirement_y
		req.requirement_h = old.requirement_h
		req.requirement_w = old.requirement_w
		return req
	}
	getNo(){return this.requirement_no}	
	setNo(no){this.requirement_no=no}
	getName(){return this.requirement_context}	
    setName(name){this.requirement_context=name}
	getShortName(){
		return this.requirement_shortname
	}	
    setShortName(shortName){this.requirement_shortname=shortName}
	getX(){return this.requirement_x}
	setX(x){this.requirement_x=x}
    getY(){return this.requirement_y}
    setY(y){this.requirement_y=y}
    getH(){return this.requirement_h}
    setH(h){this.requirement_h=h}
	getW(){return this.requirement_w}
	setW(w){this.requirement_w=w}
}
function getShortname(name: string) {
	return name.replace(/\s+/g, "");
  }