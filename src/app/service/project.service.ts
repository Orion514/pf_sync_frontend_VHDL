import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Error } from '../entity/Error';
import { Phenomenon } from '../entity/Phenomenon';
import { Project } from '../entity/Project';
import { Node } from '../entity/Node';
import { ScenarioGraph } from '../entity/ScenarioGraph';
import { SubProblemDiagram } from '../entity/SubProblemDiagram';
import { RequirementPhenomenon } from '../entity/RequirementPhenomenon';
import {StrategyAdvice} from "../entity/StrategyAdvice";
import { Util } from '../entity/Util';

@Injectable({
	providedIn: 'root'
})
export class ProjectService {
	private emitChangeSource = new Subject<any>();
	changeEmitted$ = this.emitChangeSource.asObservable();
	sendProject(change: Project) {
		this.emitChangeSource.next(change);
	}

	private stepEmit = new Subject<any>();
	stepEmmited$ = this.stepEmit.asObservable();
	stepChange(step: number) {
		this.stepEmit.next(step);
	}

	private pdEmit = new Subject<any>();
	pdEmmited$ = this.pdEmit.asObservable();
	pdChange(problemDiagram) {
		this.pdEmit.next(problemDiagram);
	}

	private pheEmit = new Subject<any>();
	pheEmmited$ = this.pheEmit.asObservable();
	pheChange(phenomenon) {
		this.pheEmit.next(phenomenon);
	}

	private pOntShowEmit = new Subject<any>();
	pOntShowEmitted$ = this.pOntShowEmit.asObservable();
	pOntShow(on: boolean) {
		this.pOntShowEmit.next(on);
		//console.log("pOntShow on");
	}

	private eOntShowEmit = new Subject<any>();
	eOntShowEmitted$ = this.eOntShowEmit.asObservable();
	eOntShow(on: boolean) {
		this.eOntShowEmit.next(on);
		//console.log("eOntShow on");
	}

	private pNodesToDisplayEmit = new Subject<any>();
	pNodesToDisplayEmitted$ = this.pNodesToDisplayEmit.asObservable();
	sendPNodes(nodes: string[]) {
		this.pNodesToDisplayEmit.next(nodes);
	}

	private eNodesToDisplayEmit = new Subject<any>();
	eNodesToDisplayEmitted$ = this.eNodesToDisplayEmit.asObservable();
	sendENodes(nodes: string[]) {
		this.eNodesToDisplayEmit.next(nodes);
	}

	private owlAddEmit = new Subject<any>();
	owlAddEmitted$ = this.owlAddEmit.asObservable();
	sendOwlAdd(owlAdd: string) {
		this.owlAddEmit.next(owlAdd);
	}

	private uploadOWLEmit = new Subject<any>();
	uploadOWLEmitted$ = this.uploadOWLEmit.asObservable();
	uploadOWL(uploadOWL: Boolean) {
		this.uploadOWLEmit.next(uploadOWL);
	}

	private ontNameAddEmit = new Subject<any>();
	ontNameAddEmitted$ = this.ontNameAddEmit.asObservable();
	sendOntName(ontName: string) {
		this.ontNameAddEmit.next(ontName);
	}

	private eOntNameAddEmit = new Subject<any>();
	eOntNameAddEmitted$ = this.eOntNameAddEmit.asObservable();
	sendEOntName(eOntName: string) {
		this.eOntNameAddEmit.next(eOntName);
	}

	private pOntNameAddEmit = new Subject<any>();
	pOntNameAddEmitted$ = this.pOntNameAddEmit.asObservable();
	sendPOntName(pOntName: string) {
		this.pOntNameAddEmit.next(pOntName);
	}

	private spdEmit = new Subject<any>();
	spdEmitted$ = this.spdEmit.asObservable();
	spdChange(spdList: SubProblemDiagram[]) {
		this.spdEmit.next(spdList);
	}

	private scenarioEmit = new Subject<any>();
	scenarioEmitted$ = this.scenarioEmit.asObservable();
	scenarioChange(scenarioList: ScenarioGraph[]) {
		this.scenarioEmit.next(scenarioList);
	}

	private fullScenarioEmit = new Subject<any>();
	fullScenarioEmitted$ = this.fullScenarioEmit.asObservable();
	fullScenarioChange(fullScenarioGraph: ScenarioGraph) {
		this.fullScenarioEmit.next(fullScenarioGraph);
	}

	private newScenarioEmit = new Subject<any>();
	newScenarioEmitted$ = this.newScenarioEmit.asObservable();
	newScenarioChange(scenarioList: ScenarioGraph[]) {
		this.newScenarioEmit.next(scenarioList);
	}

	project: Project;
	constructor(
		private http: HttpClient,
	) { }

	httpOptions = {
		headers: new HttpHeaders({ 'Content-Type': 'application/json' })
	};

	getPhenomenon(project: Project) {
		let res = [];
		// console.log(project)
		this.getPhenomenon1(res, project.contextDiagram.interfaceList)
		this.getPhenomenon1(res, project.problemDiagram.referenceList)
		this.getPhenomenon1(res, project.problemDiagram.constraintList)
		for (let i = 0; i < res.length; i++) {
			for (let j = res.length - 1; j > i; j--) {
				if (res[j].phenomenon_no == res[i].phenomenon_no) {
					res.splice(j, 1);
				}
			}
		}
		return res;
	}

	getPhenomenon1(res, linkList) {
		for (let link of linkList) {
			for (let phe of link.phenomenonList) {
				res.push(phe);
			}
		}
		return res;
	}

	// getReference(project: Project) {
	// 	let res = [];
	// 	for (let ref of project.problemDiagram.referenceList) {
	// 		for (let phe of ref.phenomenonList) {
	// 			res.push(phe);
	// 		}

	// 	}
	// 	for (let con of project.problemDiagram.constraintList) {
	// 		for (let phe of con.phenomenonList) {
	// 			res.push(phe);
	// 		}
	// 	}
	// 	for (let i = 0; i < res.length; i++) {
	// 		for (let j = res.length - 1; j > i; j--) {
	// 			if (res[i].phenomenon_no == res[j].phenomenon_no) {
	// 				res.splice(j, 1);
	// 			}
	// 		}
	// 	}
	// 	//console.log(res);
	// 	return res;
	// }

	getReference(project: Project): Observable<RequirementPhenomenon[]>{
		const url = `http://localhost:8089/project/getReference`;
		return this.http.post<RequirementPhenomenon[]>(url, project, this.httpOptions);
	}

	checkCorrectness(project: Project): Observable<Error[]> {
		const url = `http://localhost:8089/project/checkCorrectness`;
		return this.http.post<Error[]>(url, project, this.httpOptions);
	}

	checkCorrectContext(project: Project): Observable<Error[]> {
		const url = `http://localhost:8089/project/checkCorrectContext`;
		return this.http.post<Error[]>(url, project, this.httpOptions);
	}

	checkCorrectProblem(project: Project): Observable<Error[]> {
		const url = `http://localhost:8089/project/checkCorrectProblem`;
		return this.http.post<Error[]>(url, project, this.httpOptions);
	}

	checkWellFormed(project: Project): Observable<Error[]> {
		const url = `http://localhost:8089/project/checkWellFormed`;
		return this.http.post<Error[]>(url, project, this.httpOptions);
	}

	getSubProblemDiagram(project: Project): Observable<Project> {
		console.log(project)
		const url = `http://localhost:8089/project/getSubProblemDiagram`;
		return this.http.post<Project>(url, project, this.httpOptions);
	}

	getBehIntList(project: Project, sgName: string): Observable<Phenomenon[]> {
		const url = `http://localhost:8089/project/getBehIntList/${sgName}`;
		return this.http.post<Phenomenon[]>(url, project, this.httpOptions);
	}

	getExpIntList(project: Project, sgName: string): Observable<Phenomenon[]> {
		const url = `http://localhost:8089/project/getExpIntList/${sgName}`;
		return this.http.post<Phenomenon[]>(url, project, this.httpOptions);
	}

	// getPreIntList(project: Project, sgName: string): Observable<Phenomenon[]> {
	// 	const url = `http://re4cps.org:8089/project/getPreIntList/${sgName}`;
	// 	return this.http.post<Phenomenon[]>(url, project, this.httpOptions);
	// }

	getIntList(project: Project, sgName: string): Observable<Phenomenon[]> {
		const url = `http://localhost:8089/project/getIntList/${sgName}`;
		return this.http.post<Phenomenon[]>(url, project, this.httpOptions);
	}

	getFullExpIntList(project: Project, sgName: string): Observable<Phenomenon[]> {
		const url = `http://localhost:8089/project/getFullExpIntList/${sgName}`;
		return this.http.post<Phenomenon[]>(url, project, this.httpOptions);
	}

	getRes(errList: Error[]): boolean {
		var res = true;
		// console.log(errList)
		for (var i = 0; i < errList.length; i++) {
			if (errList[i].errorList.length > 0) {
				res = false;
				return res;
			}
		}
		return res;
	}

	getStrategy(errMsg: string) {
		var type = errMsg.split(':')[0];
		var strategyList = [];
		switch (type) {
			case 'IntegrityError':
				var strategy = "If this interaction is unnecessary, you can remove the phenomenon in the problem graph."
				strategyList.push(strategy);
				break;
			case 'SynTaxError':
				strategyList.push("Interaction has wrong relationships");
				strategyList.push("Behavior order lines can only connect behaviorInteractions,");
				strategyList.push("Expected order lines can only connect expectedInteractions,");
				strategyList.push("Synchrocity lines can only connect behaviorInteractions and behaviorInteractions,");
				strategyList.push("Behavior enable lines can only from behaviorInteractions to expectedInteractions,");
				strategyList.push("expected enable lines can only from expectedInteractions to behaviorInteractions,");
				break;
			case 'SemanticError':
				strategyList.push("Strategy:Introducing New Problem");
				strategyList.push("When a scenario sce has undetermined expected interaction intR, after "
					+ "introducing a new domain d(i), the problem description p = {M,DS,IS,RS,SS}, "
					+ "where RS = {req1, req2, ~, reqN}, SS = {sce1, sce2, ~, sceN}, can be "
					+ "elaborated using the follwing steps:");
				strategyList.push("1. Introduce a domain d into DS; that is, DS=DS U(d). Then, two strategies can be adopted "
					+ "for accomplishing the model building. One is introducing a biddable domain b(d) as the model builder, "
					+ "which results in another new domain to be added in DS, i.e., DS=DS_[b(d). "
					+ "The other is developing an automatic model builder whose functionality needs to be included "
					+ "in the model building requirement.");
				strategyList.push("2. Identify new phenomena and interactions involving o(d) and other new domains. Add them into IS.");
				strategyList.push("3. Add a new requirement req(N+1)={building domain d} to RS, i.e., RS=RS U[req(n+1)]. "
					+ "Then, there is a refinement relationship between req(i) and req(n+1) that is, refinement(req(i), req(n+1)).");
				strategyList.push("Construct scenario sce(n+1) for req(n+1), SS=SS U{sce(n+1)}. For each scenario involving intR, "
					+ "update it so that intR can be determined uniformly.");
				break;
			case 'StateError':
				strategyList.push("Strategy:Introducing Model Domain");
				strategyList.push("When a model domain o(d)(o(d) represents the model domain of d) is introduced to separate the two concerns of the same domain, "
					+ "the problem description p = {M,DS,IS,RS,SS},where RS = {req1,req2,…,reqN}, SS = {sce1,sce2,…,sceN}, can be elaborated using "
					+ "the follwing steps:");
				strategyList.push("1. Introduce a domain o(d) into DS; that is, DS=DS U {o(d)}. Then, two strategies can be adopted for accomplishing the model "
					+ "building. One is introducing a biddable domain b(d) as the model builder, which results in another new domain to be added in DS, "
					+ "i.e., DS=DS U {b(d)}.The other is developing an automatic model builder whose functionality needs to be included in the model "
					+ "building requirement.");
				strategyList.push("2. Identify new phenomena and interactions involving o(d) and other new domains. Add them into IS;delete interations involving d "
					+ "in IS;IS=IS U {int[O(d)/d]}/int");
				strategyList.push("3. Split the original requirements into two separates sub-requirements,RS=RS U {req(n+1)}，where req(n+1) is for building o(d). "
					+ "Suppose req(i) ∈ RS is the requirement accomplishing original requirements using o(d).Therefore,there is a refinement relationship "
					+ "between req(i) and req(n+1), i.e., refinement(req(i), req(n+1)).");
				strategyList.push("4.According to these two requirements sets,do the following:");
				strategyList.push("a)Construct a new scenario sce(n+1),which is for realizing requirement req(n+1);");
				strategyList.push("b)Update the scenaior set involving sce(i), using new interations to replace old interaction to accomplish the original functions "
					+ "with o(d).");
				strategyList.push("Notice:");
				strategyList.push("1.IS=IS U {int[O(d)/d]}/int representing replacing d with o(d) in int. ");
				break;
		}
		return strategyList;

	}

	getScenarioGraph(project: Project, projectName: string): Observable<Project> {
		let userName = this.getUserName();
		const url = `http://localhost:8089/project/getScenarioGraph?userName=${userName}&projectName=${projectName}`;
		console.log(url)
		return this.http.post<Project>(url, project, this.httpOptions);
	}

	getFullScenarioGraph(project: Project): Observable<Project> {
		const url = `http://localhost:8089/project/getFullScenarioGraph`;
		console.log(url)
		return this.http.post<Project>(url, project, this.httpOptions);
	}

	getBreakdownScenarioGraph(project: Project): Observable<Project> {
		const url = `http://localhost:8089/project/getBreakdownScenarioGraph`;
		console.log(url)
		return this.http.post<Project>(url, project, this.httpOptions);
	}

	getConnIntList(project: Project, sgName: string): Observable<Phenomenon[]> {
		const url = `http://localhost:8089/project/getConnIntList/${sgName}`;
		return this.http.post<Phenomenon[]>(url, project, this.httpOptions);
	}

	deleteNode(sg: ScenarioGraph, node: Node) {
		console.log(node)
		var type = node.node_type;
		var nodeList: Node[];
		var lineList = sg.lineList;
		// if (type === 'BehInt' || type === 'ExpInt' || type === 'ConnInt'
		// || type === 'SendInt' || type === 'RecInt' || type === 'ExpSendInt' || type === 'ExpRecInt') {
		if (type === 'BehInt' || type === 'ExpInt' || type === 'ConnInt') {
			nodeList = sg.intNodeList;
		} else {
			nodeList = sg.ctrlNodeList;
		}
		for (var i = 0; i < nodeList.length; i++) {
			if (nodeList[i].node_type === node.node_type &&
				nodeList[i].node_no === node.node_no) {
				nodeList.splice(i, 1);
				break;
			}
		}
		// console.log(node.node_type + node.node_no);
		if (lineList != null) {
			for (var i = lineList.length - 1; i >= 0; i--) {
				if ((lineList[i].fromNode.node_type === node.node_type && lineList[i].fromNode.node_no === node.node_no)
					|| (lineList[i].toNode.node_type === node.node_type && lineList[i].toNode.node_no === node.node_no)) {
					// console.log(lineList[i].fromNode.node_type + lineList[i].fromNode.node_no);
					// console.log(lineList[i].toNode.node_type + lineList[i].toNode.node_no);
					lineList.splice(i, 1);
				}
			}
		}

	}

	deleteLine(sg: ScenarioGraph, lineName: string) {
		var lineList = sg.lineList;
		for (var i = 0; i < lineList.length; i++) {
			if ((lineList[i].line_type + lineList[i].line_no) === lineName) {
				lineList.splice(i, 1);
			}
		}
	}
	// 向后端申请对project的解耦策略应用建议，后端返回建议列表。列表每个元素对应一个可应用的策略，包含应用该策略的需要做的修改
	ckeckStrategy(project: Project): Observable<StrategyAdvice[]> {
		const url = `http://localhost:8089/project/ckeckStrategy`;
		return this.http.post<StrategyAdvice[]>(url, project, this.httpOptions);
	}
	
	  // 向后端申请忽略某条解耦建议
	ignoreStrategyAdvice(strategyAdvice: StrategyAdvice) {
		const url = `http://localhost:8089/project/ignoreStrategyAdvice`;
		return this.http.post<boolean>(url, strategyAdvice, this.httpOptions);
	}
	
	  // 向后端申请根据情景图生成软件需求规约并保存成txt文件
	saveSpecification(project: Project) {
		let userName = this.getUserName();
		const url = `http://localhost:8089/project/saveSpecification?userName=${userName}`;
		return this.http.post<StrategyAdvice[]>(url, project, this.httpOptions);
	}
	getUserName() {
		let username = "";
		if (document.cookie != null && document.cookie != "") {
		  let util = new Util();
		  username = util.cookieToJson()['username'];
		}
		return username ? username : "test";
	}
}
