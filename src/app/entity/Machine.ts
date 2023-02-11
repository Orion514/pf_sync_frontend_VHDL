export class Machine{
	machine_name: string;	//��������
	machine_shortName: string;	//������д
	machine_x: number;	//λ����Ϣ
	machine_y: number;
	machine_h: number;
	machine_w: number;
	static newMachine(name,shortName,x,y,w,h){
		let  machine =  new Machine()
		machine.machine_name=name
		machine.machine_shortName=shortName
		machine.machine_x=x
		machine.machine_y=y
		machine.machine_h=h
		machine.machine_w=w
		return machine
	}
	static newMachineWithOld(old, name,shortName){
		console.log(old)
		let  machine =  new Machine()
		machine.machine_name=name
		machine.machine_shortName=shortName
		machine.machine_x=old.machine_x
		machine.machine_y=old.machine_y
		machine.machine_h=old.machine_h
		machine.machine_w=old.machine_w
		return machine
	}
	static copyMachine(old) {
		if (old == null) return null;
		let machine = new Machine();
		machine.machine_name = old.name;
		machine.machine_shortName = old.shortname == "M" ? "M1" : old.machine_shortName; //for text syn,M is a keyword
		machine.machine_x=old.machine_x
		machine.machine_y=old.machine_y
		machine.machine_h=old.machine_h
		machine.machine_w=old.machine_w
		return machine;
	  }
	getName(){return this.machine_name}
	setName(name){this.machine_name=name}

	getShortName(){return this.machine_shortName}
	setShortName(shortName){this.machine_shortName=shortName}
	
	getX(){return this.machine_x}
    getY(){return this.machine_y}
    getH(){return this.machine_h}
	getW(){return this.machine_w}
	
    setX(x){this.machine_x=x}
    setY(y){this.machine_y=y}
    setH(h){this.machine_h=h}
	setW(w){this.machine_w=w}
}