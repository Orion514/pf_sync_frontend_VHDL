import { Injectable } from '@angular/core';
//import { template, element, text } from '@angular/core/src/render3';
import * as joint from 'node_modules/jointjs/dist/joint.js';
import { Subject, Subscription } from 'rxjs';
import { Constraint } from '../entity/Constraint';
import { ContextDiagram } from '../entity/ContextDiagram';
import { Interface } from '../entity/Interface';
import { Machine } from '../entity/Machine';
import { OntologyEntity } from '../entity/OntologyEntity';
import { Phenomenon } from '../entity/Phenomenon';
import { ProblemDiagram } from '../entity/ProblemDiagram';
import { ProblemDomain } from '../entity/ProblemDomain';
import { LSPMessageFactory } from "../LSP/LSPMessageFactory";
import { DiagramContentChangeEvent } from "../LSP/DiagramContentChangeEvent";
import { DiagramContentChangeEventFactory } from "../LSP/DiagramContentChangeEventFactory";
import { DiagramIdentifier } from "../LSP/DiagramIdentifier";
import { DidChangeDiagramParams } from "../LSP/DidChangeDiagramParams.";
import { DidOpenDiagramParams } from "../LSP/DidOpenDiagramParams";
import { Reference } from '../entity/Reference';
import { Node } from '../entity/Node';
import { Requirement } from '../entity/Requirement';
import { RequirementPhenomenon } from '../entity/RequirementPhenomenon';
import { ScenarioGraph } from '../entity/ScenarioGraph';
import { ComponentChoiceService } from '../service/component-choice.service';
import { FileService } from './file.service';
import { ProjectService } from './project.service';
import { CtrlNode } from '../entity/CtrlNode';
import { Line } from '../entity/Line';
import { SubProblemDiagram } from '../entity/SubProblemDiagram';
import { Project } from '../entity/Project';
import { Console } from 'console';
const svgPanZoom = require("svg-pan-zoom");
@Injectable({
  providedIn: 'root'
})
export class DrawGraphService {
  frontSize = 15;
  lastVersion: string;
  keyWords = [
    "M",,
    "C",
    "B",
    "X",
    "D",
    "CL",
    "DS",
    "SE",
    "AC",
    "AD",
    "PD",
    "DE",
    "P",
    "R",
    "?",
    "phenomenon",
    "event",
    "value",
    "instruction",
    "state",
    'signal',
  ];
  isOpen: boolean;
  frame = "";
  receiveFrame: boolean;
  position: any;
  spz = [];
  ham = [];
  eventsHandler: {
    haltEventListeners: string[];
    init: (options: any) => void;
    destroy: () => void;
  };
  heartbeatMechanismInterval: NodeJS.Timer;
  constructor(
    public component_choice_service: ComponentChoiceService,
    private fileService: FileService,
    private projectService: ProjectService) {
    projectService.stepEmmited$.subscribe(
      step => {
        this.step = step;
        // if (step == 3) {
        //   this.addinterfaceName();
        // }
      })
    this.openWebSocket();
    // projectService.changeEmitted$.subscribe(
    //   project => {
    //     this.project = project;
    //     console.log(this.project)
    //   }
    // )
    //this.project = new Project();
    //console.log(this.project);
  }

  ws: WebSocket;
  project = new Project();
  projectNew: Project;
  step = 1;
  papers = new Array<joint.dia.Paper>();
  clickedElement = null;
  clickedSceElement = null;
  tab1: string;
  tab2: string;
  selectPhes: Phenomenon[];
  isSaved = false;
  machine: Machine;
  problemDomain: ProblemDomain;
  interface: Interface;
  requirement: Requirement;
  reference: Reference;
  constraint: Constraint;
  selectedGraphIndex = 0;
  graphs = new Array<joint.dia.Graph>();
  phenomenonList = []
  referencePhenomenonList = new Array<RequirementPhenomenon>();
  constraintPhenomenonList = new Array<RequirementPhenomenon>();
  refPheList = new Array<Phenomenon>();
  initiatorList = new Array<String>();

  problemdomain_no = 1;
  requirement_no = 1;
  interface_no = 1;
  reference_no = 1;
  constraint_no = 1;
  phenomenon_no = 1;
  link_name_no = 1;
  delete_link=new Array<number>();
  delete_phe=new Array<number>();
  delete_req=new Array<number>();
  // delete_int=new Array<number>();
  // delete_ref=new Array<number>();
  // delete_con=new Array<number>();

  link_source = undefined;
  link_target = undefined;
  selectedId = undefined;
  selectedElement = undefined;
  selectedType: string;

  selectedLinkSource = undefined;
  selectedLinkTarget = undefined;

  selectedPhenomenonNo = undefined;
  selectedReferencePhenomenonNo = undefined;
  selectedConstraintPhenomenonNo = undefined;
  description = undefined;

  deleteListen = false;

  // PhysicalPropertys = ['Clock', 'Data Storage','Sensor Device','Actuator Device','Active Device']
  DomainTypes = ['Clock', 'Data Storage','Sensor','Actuator','Active Device','Passive Device'];
  // ['Causal', 'Biddable', 'Lexical']
  SampleDomainTypes = ['Clock', 'Data Storage','Sensor','Actuator','Active Device','Passive Device'];
  // ['C', 'B', 'X']
  phenomenonTypes = ['instruction','signal', 'state', 'value']

  projectAddress: string;
  version: string;
  interval;
  uri: string;

  initiator
  receiverList
  initiator_receiverList
  initiator_or_receiverList

  interfacePhes
  ontologyPhes
  interface_ontologyPhes
  messageId = 0
  projectName: string;
  type: string;
  source;
  target;
  winWidth: number;
  winHeigh: number;
  clickedLink = null;
  clickedToolView = null;
  clickedPaper: joint.dia.Paper;
  elementList = [];
  subscription: Subscription;
  startNodeList = [];
  endNodeList = [];
  decisionNodeList = [];
  mergeNodeList = [];
  branchNodeList = [];
  delayNodeList = [];
  ctrlType = ['Start', 'End', 'Decision', 'Merge', 'Branch', 'Delay']

  clickMachine: Machine;
  uploadOWLFlag: Boolean;

  private machineEmit = new Subject<any>();
  machineEmmited$ = this.machineEmit.asObservable();
  sendMachine(machine: Machine) {
    this.machineEmit.next(machine);
  }

  private domainEmit = new Subject<any>();
  domainEmmited$ = this.domainEmit.asObservable();
  sendDomain(domain: ProblemDomain) {
    this.domainEmit.next(domain);
  }

  private interfaceEmit = new Subject<any>();
  interfaceEmmited$ = this.interfaceEmit.asObservable();
  sendInterface(inte: Interface) {
    this.interfaceEmit.next(inte);
  }

  private referenceEmit = new Subject<any>();
  referenceEmmited$ = this.referenceEmit.asObservable();
  sendReference(reference: any) {
    this.referenceEmit.next(reference);
  }

  private decisionEmit = new Subject<any>();
  decisionEmmited$ = this.decisionEmit.asObservable();
  sendDecision(ctrlNode: CtrlNode) {
    this.decisionEmit.next(ctrlNode);
  }

  private delayEmit = new Subject<any>();
  delayEmmited$ = this.delayEmit.asObservable();
  sendDelay(ctrlNode: CtrlNode) {
    this.delayEmit.next(ctrlNode);
  }

  private conditionNodeEmit = new Subject<any>();
  conditionNodeEmmited$ = this.conditionNodeEmit.asObservable();
  sendConditionNode(node: Node) {
    this.conditionNodeEmit.next(node);
  }

  private conditionIntListEmit = new Subject<any>();
  conditionIntListEmmited$ = this.conditionIntListEmit.asObservable();
  editConditionInt(IntList: Phenomenon[]) {
    this.conditionIntListEmit.next(IntList);
  }

  private lineEmit = new Subject<any>();
  lineEmmited$ = this.lineEmit.asObservable();

  private intListEmit = new Subject<any>();
  intListEmmited$ = this.intListEmit.asObservable();
  editInt(IntList: Phenomenon[]) {
    this.intListEmit.next(IntList);
  }

  private preConditionEmit = new Subject<any>();
  preConditionEmmited$ = this.preConditionEmit.asObservable();
  editPreCondition(preCondition: Phenomenon[]) {
    this.preConditionEmit.next(preCondition);
  }

  private postConditionEmit = new Subject<any>();
  postConditionEmmited$ = this.postConditionEmit.asObservable();
  editPostCondition(postCondition: Phenomenon[]) {
    this.postConditionEmit.next(postCondition);
  }

  private intEmit = new Subject<any>();
  intEmmited$ = this.intEmit.asObservable();
  getInt(int: string) {
    // console.log('test:' + int);
    this.intEmit.next(int);
  }

  private editMachineEmit = new Subject<any>();
  editMachineEmmited$ = this.editMachineEmit.asObservable();
  sendEditMachine(machine: Machine) {
    this.editMachineEmit.next(machine);
  }
  isProjectNull = true;
  //==============================WebSocket=========================
  openWebSocket() {
    this.ws = new WebSocket('ws://localhost:8089/webSocket');
    var that = this
    this.ws.onopen = function () {
      console.log('client:draw ws connection is open');
      // that.ws.send('hello');
      that.heartbeatMechanismInterval = setInterval(function () {
        that.heartbeatMechanism();
      }, 30000);
      
    };
    this.ws.onmessage = function (e) {
      // var project = JSON.parse(e.data)
      console.log("=====收到了消息====draw===")
      var pro = JSON.parse(e.data);
      console.log(pro);
      console.log("============")
      var message = JSON.parse(e.data);
      let params = <DidChangeDiagramParams>message.params;
      that.lastVersion = params.diagram.lastVersion;
      // if(message.method == undefined || message.method == ""){
      //   that.update(pro);
      // }else 
      if (message.method == "Diagram/didChange") {
        // console.log("###Diagram/didChange###", message)
        let diagramContentChangeEvents = params.contentChanges;
        if (diagramContentChangeEvents[0].shapeType != "project"){
          let T0 = params.diagram.T0 == undefined ? 0 : params.diagram.T0;
          let T1 = params.diagram.T1 == undefined ? 0 : params.diagram.T1;
          let T2 = params.diagram.T2 == undefined ? 0 : params.diagram.T2;
          let T3 = params.diagram.T3 == undefined ? 0 : params.diagram.T3;
          let T4 = new Date().getTime();
          let Flag1 =
            params.diagram.Flag1 == undefined ? 0 : params.diagram.Flag1;
          let Flag2 =
            params.diagram.Flag2 == undefined ? 0 : params.diagram.Flag2;
          let Flag3 =
            params.diagram.Flag3 == undefined ? 0 : params.diagram.Flag3;
          let nodes =
            params.diagram.nodes == undefined ? 0 : params.diagram.nodes;
          let edges =
            params.diagram.edges == undefined ? 0 : params.diagram.edges;
          let ASTNodes =
            params.diagram.ASTNodes == undefined ? 0 : params.diagram.ASTNodes;

          that.sendTimeRecoder(
            that.lastVersion,
            params.diagram.version,
            T0,
            T1,
            T2,
            T3,
            T4,
            Flag1,
            Flag2,
            Flag3,
            nodes,
            edges,
            ASTNodes
          );
        }
        that.wsChange(diagramContentChangeEvents);
      } else if (message.method == "Diagram/changeLastVersion") {
      } else if (message.method == "Diagram/registered") {
        if (that.isOpen == true) {
          that.registed_second(message);
          console.log("重复收到 registered ");
          return;
        }
        that.registed_new(message);
        that.isOpen = true;
      }
      
      // that.setProject(project, project.title)
    };
    this.ws.onerror = function (e) {
      console.log('=================================error=======draw=========================', e);
    };
    this.ws.onclose = function (e) {
      console.log("=================================close==========draw=====================", e);
      that.openWebSocket();
      let interval_open = setInterval(function () {
        clearInterval(interval_open);
        that.register_new(that.projectAddress, that.version);
      }, 1000);

    }
  }
  //-----------接收消息---------
  registed_new(message) {
    this.isOpen = true;
    let params = message.params;
    let diagramContentChangeEvent = <DiagramContentChangeEvent>(
      params.contentChanges[0]
    );
    let pro: Project = diagramContentChangeEvent.newProject;
    let newProject = new Project();
    newProject.initProject(pro);
    this.setProject(newProject);
    this.drawDiagram(this.project);
    this.isProjectNull = false;
  }
  registed_second(message) {
    this.isOpen = true;
    let params = message.params;
    let diagramContentChangeEvent = <DiagramContentChangeEvent>(
      params.contentChanges[0]
    );
    this.wsProject(diagramContentChangeEvent);
    this.isProjectNull = false;
  }
  // update(pro) {
  //   // if(pro.title!=this.projectAddress){
  //   //   console.log(pro.title,"!=", this.projectAddress)
  //   //   return
  //   // }
  //   console.log('update的this指向：', this);
  //   this.wsdealId(pro.id)
  //   switch (pro.type) {
  //     case "add":
  //       this.wsadd(pro.shape, pro.new)
  //       break
  //     case "delete":
  //       this.wsdelete(pro.shape, pro.old)
  //       break
  //     case "change":
  //       this.wschange(pro.shape, pro.old, pro.new)
  //       break
  //   }
  // }
  // wsdealId(id) {
  //   if (this.messageId == id) {
  //     this.messageId += 1
  //     console.log("this.messageId=", this.messageId)
  //   } else {
  //     console.log("this.messageId=", this.messageId)
  //     console.log("id = ", id)
  //   }
  // }
  // wsadd(shape, new1) {
  //   console.log("==========wsadd", shape, new1)
  //   switch (shape) {
  //     case "mac":
  //       this.drawMachinews(new1)
  //       break
  //     case "pro":
  //       this.drawProblemDomainws(new1)
  //       break
  //     case "req":
  //       this.drawRequirementws(new1)
  //       break
  //     case "int":
  //       this.drawInterfacews(new1)
  //       break
  //     case "ref":
  //       this.drawReferencews(new1)
  //       break
  //     case "con":
  //       this.drawConstraintws(new1)
  //       break
  //   }
  // }
  // wsdelete(shape, old) {
  //   console.log('wsdelete的this指向：', this);
  //   switch (shape) {
  //     case "mac":
  //       this.deleteMachinews(old)
  //       break
  //     case "pro":
  //       this.deleteProblemDomainws(old)
  //       break
  //     case "req":
  //       this.deleteRequirementws(old)
  //       break
  //     case "int":
  //       console.log(old)
  //       this.deleteInterfacews(old)
  //       break
  //     case "ref":
  //       this.deleteReferencews(old)
  //       break
  //     case "con":
  //       this.deleteConstraintws(old)
  //       break
  //   }
  // }
  // wschange(shape, old, new1) {
  //   console.log(this.project)
  //   switch (shape) {
  //     case "mac":
  //       this.changeMachinews(old, new1)
  //       break
  //     case "pro":
  //       this.changeProblemDomainws(old, new1)
  //       break
  //     case "req":
  //       this.changeRequirementws(old, new1)
  //       break
  //     case "int":
  //       console.log(old, new1)
  //       this.changeInterfacews(old, new1)
  //       break
  //     case "ref":
  //       this.changeReferencews(old, new1)
  //       break
  //     case "con":
  //       this.changeConstraintws(old, new1)
  //       break
  //   }
  // }
  wsChange(diagramContentChangeEvents: DiagramContentChangeEvent[]) {
    console.log(diagramContentChangeEvents);
    for (let diagramContentChangeEvent of diagramContentChangeEvents) {
      let changeType = diagramContentChangeEvent.changeType;
      if (changeType == "delete") {
        this.wsChange1(diagramContentChangeEvent);
      }
    }
    for (let diagramContentChangeEvent of diagramContentChangeEvents) {
      let changeType = diagramContentChangeEvent.changeType;
      if (changeType != "delete") {
        this.wsChange1(diagramContentChangeEvent);
      }
    }
    this.graphs[0].removeCells(this.graphs[0].getCells());
    this.graphs[1].removeCells(this.graphs[1].getCells());
    this.drawContextDiagram(this.project.contextDiagram, this.graphs[0]);
    this.drawProblemDiagram(this.project.problemDiagram, this.graphs[1]);
    let pro = new Project();
    pro.initProject(this.project);
    console.log(pro);
    this.projectService.sendProject(this.project);
  }
  wsChange1(diagramContentChangeEvent: DiagramContentChangeEvent) {
    let shapeType = diagramContentChangeEvent.shapeType;
    switch (shapeType) {
      case "mac":
        this.wsMachine(diagramContentChangeEvent);
        break;
      case "pro":
        this.wsProblemDomain(diagramContentChangeEvent);
        break;
      case "req":
        this.wsRequirement(diagramContentChangeEvent);
        break;
      case "int":
        this.wsInterface(diagramContentChangeEvent);
        break;
      case "ref":
        this.wsReference(diagramContentChangeEvent);
        break;
      case "con":
        this.wsConstraint(diagramContentChangeEvent);
        break;
      case "project":
        this.wsProject(diagramContentChangeEvent);
    }
  }
  wsMachine(diagramContentChangeEvent) {
    let changeType = diagramContentChangeEvent.changeType;
    let oldShape = diagramContentChangeEvent.oldShape;
    let newShape = diagramContentChangeEvent.newShape;
    switch (changeType) {
      case "add":
        this.drawMachinews(newShape);
        break;
      case "delete":
        this.deleteMachinews(oldShape);
        break;
      case "change":
        this.changeMachinews(oldShape, newShape);
        break;
    }
  }
  wsProblemDomain(diagramContentChangeEvent) {
    let changeType = diagramContentChangeEvent.changeType;
    let oldShape = diagramContentChangeEvent.oldShape;
    let newShape = diagramContentChangeEvent.newShape;
    switch (changeType) {
      case "add":
        this.drawProblemDomainws(newShape);
        break;
      case "delete":
        this.deleteProblemDomainws(oldShape);
        break;
      case "change":
        this.changeProblemDomainws(oldShape, newShape);
        break;
    }
  }
  wsRequirement(diagramContentChangeEvent) {
    let changeType = diagramContentChangeEvent.changeType;
    let oldShape = diagramContentChangeEvent.oldShape;
    let newShape = diagramContentChangeEvent.newShape;
    switch (changeType) {
      case "add":
        this.drawRequirementws(newShape);
        break;
      case "delete":
        this.deleteRequirementws(oldShape);
        break;
      case "change":
        this.changeRequirementws(oldShape, newShape);
        break;
    }
  }
  wsInterface(diagramContentChangeEvent) {
    let changeType = diagramContentChangeEvent.changeType;
    let oldShape = diagramContentChangeEvent.oldShape;
    let newShape = diagramContentChangeEvent.newShape;
    switch (changeType) {
      case "add":
        this.drawInterfacews(newShape);
        break;
      case "delete":
        this.deleteInterfacews(oldShape);
        break;
      case "change":
        this.changeInterfacews(oldShape, newShape);
        break;
    }
  }
  wsReference(diagramContentChangeEvent) {
    let changeType = diagramContentChangeEvent.changeType;
    let oldShape = diagramContentChangeEvent.oldShape;
    let newShape = diagramContentChangeEvent.newShape;
    switch (changeType) {
      case "add":
        this.drawReferencews(newShape);
        break;
      case "delete":
        this.deleteReferencews(oldShape);
        break;
      case "change":
        this.changeReferencews(oldShape, newShape);
        break;
    }
  }
  wsConstraint(diagramContentChangeEvent) {
    let changeType = diagramContentChangeEvent.changeType;
    let oldShape = diagramContentChangeEvent.oldShape;
    let newShape = diagramContentChangeEvent.newShape;
    switch (changeType) {
      case "add":
        this.drawConstraintws(newShape);
        break;
      case "delete":
        this.deleteConstraintws(oldShape);
        break;
      case "change":
        this.changeConstraintws(oldShape, newShape);
        break;
    }
  }
  wsProject(diagramContentChangeEvent: DiagramContentChangeEvent) {
    let pro: Project = diagramContentChangeEvent.newProject;
    let newProject = new Project();
    newProject.initProject(pro);
    // this.project = newProject
    this.project.changeMachineWithNewProject(newProject);
    this.project.changeProblemDomainWithNewProject(newProject);
    this.project.changeRequirementWithNewProject(newProject);
    this.project.changeInterfaceWithNewProject(newProject);
    this.project.changeConstraintWithNewProject(newProject);
    this.project.changeReferenceWithNewProject(newProject);
    //画图
    this.drawDiagram(this.project);
  }
  //----------发送消息-----------
  // register(title, version) {
  //   if (version == undefined)
  //     version = "undefined"
  //   console.log("-----------draw--------register-----:", title, version)
  //   //取消注册之前的project
  //   if (this.project.title != undefined) {
  //     this.unregister(this.projectAddress, this.version)
  //   }
  //   var message = {
  //     "type": "register",
  //     "title": title,
  //     "version": version,
  //     "id": this.messageId
  //   }
  //   this.projectAddress = title
  //   this.version = version
  //   console.log("============send message=============")
  //   console.log(message)
  //   this.ws.send(JSON.stringify(message))
  // }
  register2(title, version: string, pro: Project) {
    console.log("-----------draw--------register2-----:", title, version)
    if (version == undefined) version = "undefined";
    version = version.replace(":", "_").replace(":", "_");
    //console.log(version);
    this.projectAddress = title;
    this.version = version;
    let username = this.fileService.getUserName()
    this.uri = username + "_" + title + "_" + version;
    // let diagram : DiagramItem = {uri:title+version,pro:pro}
    // let cd = pro.contextDiagram
    let diagram = {
      username: username,
      uri: this.uri,
      project: pro,
    };
    let params: DidOpenDiagramParams = { diagram: diagram };
    let message = LSPMessageFactory.getMessageNoFraming(
      this.messageId++,
      "Diagram/didOpen",
      params
    );
    // // console.log("===== diagram register =====");
    this.sendMessage2(this.ws, message);
  }
  register_new(title, version: string) {
    if (version == undefined) version = "undefined";
    version = version.replace(":", "_").replace(":", "_");
    this.projectAddress = title;
    this.version = version;
    let username = this.fileService.getUserName()
    this.uri = username + "_" + title + "_" + version;
    let diagram = {
      username: username,
      uri: this.uri,
      projectAddress: title,
      projectVersion: version,
    };
    let params = { diagram: diagram };
    let message = LSPMessageFactory.getMessageNoFraming(
      this.messageId++,
      "Diagram/register",
      params
    );
    this.sendMessage2(this.ws, message);
  }
  // unregister(title, version) {
  //   if (version == undefined)
  //     version = "undefined"
  //   console.log("-------------------unregister-----:", title, version)
  //   var message = {
  //     "type": "unregister",
  //     "title": title,
  //     "version": version,
  //     "id": this.messageId

  //   }
  //   console.log("================send message=================")
  //   console.log(message)
  //   this.ws.send(JSON.stringify(message));
  // }
  // change(type: string, shape: string, old, new1) {
  //   let version = this.version
  //   if (version == undefined)
  //     version = "undefined"
  //   console.log("this.messageId=", this.messageId);
  //   console.log("-------------------change-----:", this.projectAddress, version)
  //   var message = {
  //     "type": type,
  //     "title": this.projectAddress,
  //     "version": version,
  //     "id": this.messageId,
  //     "shape": shape,
  //     "old": old,
  //     "new": new1
  //   }
  //   console.log("============send message============")
  //   console.log(message)
  //   this.ws.send(JSON.stringify(message))
  // }
  unregister2() {
    let diagram: DiagramIdentifier = {
      uri: this.uri,
    };
    let params = { diagram: diagram };
    // let message = LSPFrameFactory.getFrame("Diagram/didClose", params)
    // // // console.log("=====send message=====")
    // console.log(message)
    // if (this.ws.readyState == WebSocket.OPEN)
    //   this.ws.send(JSON.stringify(message));

    let message = LSPMessageFactory.getMessageNoFraming(
      this.messageId++,
      "Diagram/TimeRecoder",
      params
    );
    this.sendMessage2(this.ws, message);
  }
  sendChangeShapeMessage(
    changeType: string,
    shapeType: string,
    oldShape,
    newShape
  ) {
    let version = this.version;
    if (version == undefined) version = "undefined";
    // // //console.log("this.messageId=",this.messageId)
    let diagram = {
      uri: this.uri,
      version: null,
      lastVersion: this.lastVersion,
      changeTime: new Date().getTime(),
      T0: new Date().getTime(),
      T1: 0,
      T2: 0,
      T3: 0,
      T4: 0,
      Flag1: 0,
      Flag2: 0,
      Flag3: 0,
      nodes:0, edges:0, ASTNodes:0
    };
    let contentChanges = [
      new DiagramContentChangeEventFactory().getShapeChangeEvent(
        shapeType,
        changeType,
        oldShape,
        newShape
      ),
    ];
    let params: DidChangeDiagramParams = {
      diagram: diagram,
      contentChanges: contentChanges,
    };
    // let frame = LSPFrameFactory.getFrame("Diagram/didChange", params)
    // console.log(frame)
    // console.log(this.project)
    // this.sendMessage(frame)
    let message = LSPMessageFactory.getMessageNoFraming(
      this.messageId++,
      "Diagram/didChange",
      params
    );
    this.sendMessage2(this.ws, message);
  }
  sendChangePositionMessage() {
    let version = this.version;
    if (version == undefined) version = "undefined";
    let params = {
      uri: this.uri,
      moveTimes: this.moveTimes,
    };
    let message = LSPMessageFactory.getMessageNoFraming(
      this.messageId++,
      "Diagram/moveTimes",
      params
    );
    this.sendMessage2(this.ws, message);
  }
  heartbeatMechanism() {
    let message = LSPMessageFactory.getMessageNoFraming(
      this.messageId++,
      "Diagram/heartbeatMechanism",
      null
    );
    this.sendMessage2(this.ws, message);
  }

  //没有分包，直接发送message
  sendMessage2(ws, message) {
    let i = 0;
    let that = this;
    let interval1 = setInterval(function () {
      if (ws.readyState == WebSocket.OPEN) {
        clearInterval(interval1);
        //console.log(message);
        ws.send(JSON.stringify(message));
      } else if (ws.readyState == WebSocket.CLOSED) {
        // // console.log("diagram.ws.readyState=CLOSED ", ws.readyState);
      } else if (ws.readyState == WebSocket.CLOSING) {
        // // console.log("diagram.ws.readyState=CLOSING ", ws.readyState);
      } else if (ws.readyState == WebSocket.CONNECTING) {
        // // console.log("diagram.ws.readyState=CONNECTING ", ws.readyState);
      }
    }, 1000);
  }
  sendTimeRecoder(lastVersion, version, T0, T1, T2, T3, T4, Flag1, Flag2, Flag3,nodes, edges, ASTNodes) {
    let timeRecoder = {
      uri: this.uri,
      lastVersion: lastVersion,
      version: version,
      T0: T0,
      T1: T1,
      T2: T2,
      T3: T3,
      T4: T4,
      Flag1: Flag1,
      Flag2: Flag2,
      Flag3: Flag3,
      nodes: nodes,
      edges: edges,
      ASTNodes: ASTNodes
    };
    let message = LSPMessageFactory.getMessageNoFraming(
      this.messageId++,
      "Diagram/TimeRecoder",
      timeRecoder
    );
    console.log("###diagram.sendTimeRecoder###")
    console.log(message)
    this.sendMessage2(this.ws, message);
  }
  //==========================编号==============================
  searchMaxPheNo(project) {
    let no = this.searchMaxPheNo1(0, project.contextDiagram.interfaceList)
    no = this.searchMaxPheNo1(no, project.problemDiagram.referenceList)
    no = this.searchMaxPheNo1(no, project.problemDiagram.constraintList)
    //console.log('searchMaxPheNo1');
    //console.log(no)
    return no
  }
  searchMaxPheNo1(no, linkList) {
    for (let link of linkList) {
      for (let phe of link.phenomenonList) {
        if (phe.phenomenon_no > no) {
          //console.log(phe.phenomenon_no + '>' + no);
          //console.log( )
          no = phe.phenomenon_no;
        }
      }
    }
    return no;
  }
  searchMaxLinkNameNo(project) {
    //console.log(project);
    let name = 'a';
    if (project.problemDiagram != undefined) {
      for (let reference of project.problemDiagram.referenceList) {
        name = this.compareLinkName(name, reference.reference_name)
        //console.log(name+"<"+reference.reference_name);
      }
      for (let constraint of project.problemDiagram.constraintList) {
        name = this.compareLinkName(name, constraint.constraint_name)
        //console.log(name+'<'+constraint.constraint_name);
      }
    }
    for (let my_interface of project.contextDiagram.interfaceList) {
      name = this.compareLinkName(name, my_interface.interface_name)
      //console.log(name+'<'+my_interface.interface_name);
    }
    //console.log(name);
    return this.getLinkNameNo(name);
  }
  compareLinkName(n1, n2) {
    for (let i of n2) {
      if (i < 'a' && i > 'z') {
        return n1
      }
    }
    if (n1.length > n2.length) {
      return n1
    } else if (n1.length < n2.length) {
      return n2
    } else if (n1 < n2) {
      return n2
    } else
      return n1
  }
  getlink_name(link_name_no) {
    let a = link_name_no % 26;
    let b = Math.floor(link_name_no / 26);
    if (a == 0) {
      a = 26;
      b -= 1;
    }
    let res = String.fromCharCode(96 + a);
    while (b > 0) {
      a = b % 26;
      b = Math.floor(b / 26);
      if (a == 0) {
        a = 26;
        b -= 1;
      }
      let temp = String.fromCharCode(96 + a);
      res = temp + res;
    }
    return res;
  }
  getLinkNameNo(name: string) {
    let no = 0;
    for (let i = 0; i < name.length; i++) {
      no *= 26;
      no = no + name.charCodeAt(i) - 96;
    }
    return no;
  }
  getShortName(name) {
    let len = name.length
    let flag = true
    let res = ''
    for (let i = 0; i < len; i++) {
      if (flag && (name.charAt(i) >= 'a' && name.charAt(i) <= 'z' || name.charAt(i) >= 'A' && name.charAt(i) <= 'Z')) {
        res += name.charAt(i)
        // console.log(res)
        flag = false
      }
      if (name.charAt(i) == '_' || name.charAt(i) == ' ') {
        console.log('_& :flag=true')
        flag = true
      }
      if (name.charAt(i) >= '0' && name.charAt(i) <= '9') {
        res += name.charAt(i)
      }
    }
    if(res == ''){
      res = 'PD' + this.problemdomain_no;
      this.problemdomain_no += 1;
    }
    while(true) {
      let conflicting_name = false;
      let num = 1;
      let ress=res;
      for (let pdi of this.project.contextDiagram.problemDomainList) {
        if (pdi.problemdomain_shortname == res) {
          conflicting_name = true;
          let lent=pdi.problemdomain_shortname.length;
          if(pdi.problemdomain_shortname.charAt(lent - 1) >= '0' && pdi.problemdomain_shortname.charAt(lent - 1) <= '9'){
            num = pdi.problemdomain_shortname.charCodeAt(lent - 1) - 48 + 1;
            ress = res.substring(0,lent - 1) + num;
          }else{
            ress += num;
          }
          console.log('ress:'+ress);
        }
      }
      if(!conflicting_name){
        break;
      }else{
        res = ress;
      }
    }
    console.log(name, res.toUpperCase())
    return res.toUpperCase()
  }

  //==================初始化========================
  initPapers(): void {
    this.tab1 = 'Context Diagram';
    this.tab2 = 'Problem Diagram';
    for (let i = 0; i < 2; i++) {
      this.graphs[i] = new joint.dia.Graph();
      let d = $('#content' + (i + 1));
      let wid = d.width();
      let hei = d.height();
      this.papers[i] = new joint.dia.Paper({
        el: $('#content' + (i + 1)),
        width: wid,
        height: hei,
        model: this.graphs[i],
        clickThreshold: 1,
        gridSize: 10,
        drawGrid: true,
        background: {
          color: 'rgb(240,255,255)'
        }
      });

      var that = this;
      this.papers[i].on('blank:mousewheel', (event, x, y, delta) => {
        console.log(that.papers[0])
        console.log(this.papers[0])
        const scale = that.papers[i].scale();
        that.papers[i].scale(scale.sx + (delta * 0.01), scale.sy + (delta * 0.01));
      });

      // 空白处单击事件
      this.papers[i].on('blank:pointerclick', function (evt, x, y) {
        //var currentElement = elementView.model;
        //that.tab1 = x + '  ' + y;
        console.log('blank:pointerclick');
        console.log(that.graphs[i])
        console.log(that.papers[0])
        that.drawElement(that.graphs[i], evt, x, y);
      });

      // 节点单击事件
      this.papers[i].on('element:pointerclick', function (elementView, evt, x, y) {
        if (that.component_choice_service.link == true) {
          // that.deleteListen = false;
          ////console.log('element:pointerclick');
          if (that.link_source == undefined) {
            that.link_source = elementView.model;
            console.log('that.link_source=', that.link_source.attr('root').title)
          } else if (that.link_target == undefined) {
            that.link_target = elementView.model;
            console.log('that.link_target=', that.link_target.attr('root').title)
            if (that.link_source == that.link_target) {
              console.log('link_source==link_target=', that.link_source.attr('root').title)
              alert("The starting point and the ending point are the same, please redraw!")
              that.link_source = undefined;
              that.link_target = undefined;
            } else {
              that.drawLink(that.link_source, that.link_target, that.graphs[i]);
              that.link_source = undefined;
              that.link_target = undefined;
              that.component_choice_service.set_choice_false();
            }
          }
        }
        if (that.component_choice_service.merge == true) {
          // that.deleteListen = false;
          ////console.log('element:pointerclick');
          if (that.link_source == undefined) {
            that.link_source = elementView.model;
          } else if (that.link_target == undefined) {
            that.link_target = elementView.model;
            that.Merge(that.link_source, that.link_target, that.graphs[i]);
            that.link_source = undefined;
            that.link_target = undefined;
            that.component_choice_service.merge = false;
          }
        }
        that.resetStrokeColor();
        that.clickedElement = elementView.model;
        that.changeStrokeColor();

      });

      this.papers[i].on('cell:pointerclick', function (cellView, evt, x, y) {
        console.log("initPapers cell:pointerclick")
        //prepare to delete cell
        if (that.component_choice_service.element == false && that.component_choice_service.link == false) {
          that.selectedElement = cellView.model;
          //console.log(that.selectedElement);
          that.selectedType = that.selectedElement.attr('root').name;
          that.deleteListen = true;
        }
        // highlight

        that.resetStrokeColor();
        that.clickedElement = cellView.model;
        that.changeStrokeColor();
      });

      // 双击事件
      this.papers[i].on('cell:pointerdblclick', function (elementView, evt, x, y) {
        that.deleteListen = false;
        console.log('element:pointerdblclick');
        console.log('elementView' + elementView);
        that.selectedElement = elementView.model;
        that.selectedType = that.selectedElement.attr('root').name;
        that.selectedId = that.selectedElement.id;
        console.log('type:' + that.selectedType);
        if (that.selectedElement.isLink()) {
          //console.log('当前选中元素Id�?' + that.selectedElement.id);
          let source = that.selectedElement.source();
          let target = that.selectedElement.target();
          //that.selectedLinkSource = that.getPointName(sourceId);
          //that.selectedLinkTarget = that.getPointName(targetId);
          ////console.log('that.selectedLinkSource:' + that.selectedLinkSource);
          ////console.log('that.selectedLinkTarget:' + that.selectedLinkTarget);
        }
        //console.log('type:' + that.selectedType);
        // var popBox = document.getElementById(that.selectedType + 'PopBox');
        // //console.log('selectedType:' + that.selectedType);
        // popBox.style.display = "block";
        // var popLayer = document.getElementById("popLayer");
        // popLayer.style.display = "block";
        // that.initPopBox();
        if(that.selectedType == 'interface'){
          if(this.step>=5){
            var popBox = document.getElementById(that.selectedType + 'PopBox');
        //console.log('selectedType:' + that.selectedType);
            popBox.style.display = "block";
            var popLayer = document.getElementById("popLayer");
            popLayer.style.display = "block";
            that.initPopBox();
          }
        }else{
          var popBox = document.getElementById(that.selectedType + 'PopBox');
        //console.log('selectedType:' + that.selectedType);
          popBox.style.display = "block";
          var popLayer = document.getElementById("popLayer");
          popLayer.style.display = "block";
          that.initPopBox();
        }
      });
      //initPopBox(element){}

      // 右击事件
      this.papers[i].on('cell:contextmenu', function (elementView, evt, x, y) {
        that.deleteListen = false;
        that.selectedElement = elementView.model;
        that.selectedType = that.selectedElement.attr('root').name;
        that.selectedId = that.selectedElement.id;
        //this.GetObj('delete').style.display = 'block';
        ////console.log('type:' + that.selectedType +',Id:'+ that.selectedId);
        //alert('element:contextmenu');
        //that.deleteElement(that.graphs[i]);
        //that.deletePopBox(that.graphs[i],x,y);
      });
      // change position
      this.graphs[i].on('change:position', function (element, position) {
        that.selectedElement = element;
        that.selectedType = that.selectedElement.attr('root').name;
        that.selectedId = that.selectedElement.id;
        that.changeElementPosition(position);
      });
    }
  }
  isMove = false;
  moveTimes = 0;
  draw_test(graph) {
    let machine = this.drawMachine(100, 400, graph);
    let pd1 = this.drawProblemDomain(400, 300, graph);
    let pd2 = this.drawProblemDomain(400, 500, graph);
    let req = this.drawRequirement(700, 400, graph);
    this.drawInterface(machine, pd1, graph);
    //console.log('draw_test');
    this.drawInterface(machine, pd2, graph);
    this.drawReference(req, pd1, graph);
    this.drawConstraint(pd2, req, graph);
  }
  initPopBox() {
    //console.log('initPopBox')
    if (this.selectedType == 'machine') {
      this.initMachinePopBox();
    } else if (this.selectedType == 'problemDomain') {
      this.initDomainPopBox();
    } else if (this.selectedType == 'requirement') {
      this.initRequirementPopBox();
    } else if (this.selectedType == 'interface') {
      this.initInterfacePopBox();
    } else if (this.selectedType == 'reference') {
      this.initReferencePopBox();
    } else if (this.selectedType == 'constraint') {
      this.initConstraintPopBox();
    }
  }
  initProject(title) {
    this.project.init(title, this.project)
    this.projectService.sendProject(this.project)
    this.link_name_no = 1
    this.phenomenon_no = 1
    this.problemdomain_no = 1
  }
  //===================选中变色
  changeStrokeColor() {
    console.log("changeStrokeColor")
    this.clickedElement.attr('body/stroke', 'orange');
    this.clickedElement.attr('r/stroke', 'orange');
    this.clickedElement.attr('r1/stroke', 'orange');
    this.clickedElement.attr('r2/stroke', 'orange');
    this.clickedElement.attr('line/stroke', 'orange');
  }
  resetStrokeColor() {
    if (this.clickedElement != null) {
      this.clickedElement.attr('body/stroke', 'black');
      this.clickedElement.attr('r/stroke', 'black');
      this.clickedElement.attr('r1/stroke', 'black');
      this.clickedElement.attr('r2/stroke', 'black');
      this.clickedElement.attr('line/stroke', 'black');
    }
  }
  //======================= 引入ontology后在第二步加入interfaceName
  isLabel = true;
  addinterfaceName() {
    if (!this.isLabel) {
      //console.log(this.link_name_no)
      for (let pro of this.project.contextDiagram.problemDomainList) {
        let int = new Interface();
        int.interface_from = this.project.contextDiagram.machine.machine_shortName;
        int.interface_to = pro.problemdomain_shortname;
        int.interface_no = this.interface_no;
        this.interface_no += 1;
        int.interface_name = this.getname();
        // this.link_name_no += 1;
        int.phenomenonList = new Array<Phenomenon>();
        int.interface_description = this.project.getDescription(int.interface_name, int.phenomenonList);
        this.project.contextDiagram.interfaceList.push(int);
        console.log(this.project);
      }
      this.isLabel = true;
    }

    this.drawDiagram(this.project);
  }

  ontologyEntities: OntologyEntity[];
  initProjectWithOntology(title) {
    //this.project.contextDiagram.problemDomainList
    this.initProject(title)
    this.isLabel = false
    let proNum = this.ontologyEntities.length;
    this.project.contextDiagram.machine = Machine.newMachine('machine', 'M1', 100, 50 * proNum, 100, 50);
    this.sendChangeShapeMessage("add", "mac", null, this.project.contextDiagram.machine);
    let x = 400;
    let y = 50;
    //console.log(this.ontologyEntities);
    for (let ont of this.ontologyEntities) {
      let pro = new ProblemDomain()
      pro.problemdomain_no = ont.id
      pro.problemdomain_name = ont.name
      pro.problemdomain_shortname = this.getShortName(ont.name)
      // pro.problemdomain_type = ont.type.slice(0, -6)
      // console.log(ont.type);
      // if(ont.type == "Actuator" || ont.type == "Sensor"){
      //   pro.problemdomain_type = ont.type+" Device";
      // }else{
      //   pro.problemdomain_type = ont.type;
      // }
      pro.problemdomain_type = ont.type;
      console.log(pro.problemdomain_type);
      // pro.problemdomain_property
      pro.phes = new Array<Phenomenon>();
      // for (let opt of ont.opts) {
      //   let phe = new Phenomenon();
      //   phe.phenomenon_no = this.phenomenon_no;
      //   phe.phenomenon_type = 'event';
      //   phe.phenomenon_name = opt;
      //   pro.phes.push(phe);
      // }
      for (let sig of ont.signals) {
        let phe = new Phenomenon();
        phe.phenomenon_type = 'signal';
        phe.phenomenon_name = sig;
        console.log(sig);
        pro.phes.push(phe);
      }
      for (let ins of ont.instructions) {
        let phe = new Phenomenon();
        // phe.phenomenon_no = this.phenomenon_no;
        phe.phenomenon_type = 'instruction';
        phe.phenomenon_name = ins;
        console.log(ins);
        pro.phes.push(phe);
      }
      // pro.values = new Array<Phenomenon>();
      for (let val of ont.values) {
        let phe = new Phenomenon();
        // phe.phenomenon_no = this.phenomenon_no;
        phe.phenomenon_type = 'value';
        phe.phenomenon_name = val;
        pro.phes.push(phe);
      }
      // pro.states = new Array<Phenomenon>();
      for (let opt of ont.states) {
        let phe = new Phenomenon();
        // phe.phenomenon_no = this.phenomenon_no;
        phe.phenomenon_type = 'state';
        phe.phenomenon_name = opt;
        pro.phes.push(phe);
      }
      pro.problemdomain_x = x;
      pro.problemdomain_y = y;
      y += 100;
      pro.problemdomain_h = 50;
      pro.problemdomain_w = 100;
      console.log(pro);
      console.log(pro.phes);
      this.project.contextDiagram.problemDomainList.push(pro);
      this.sendChangeShapeMessage("add", "pro", null, pro);

      let ino = this.interface_no;
      this.interface_no += 1;
      let iname = this.getname();
      let ifrom = this.project.contextDiagram.machine.machine_shortName;
      let ito = pro.problemdomain_shortname;
      let int = Interface.newInterface(ino,iname , iname + '?', ifrom, ito, [], 0, 0, 0, 0);
      // this.project.contextDiagram.interfaceList.push(int); 
      this.sendChangeShapeMessage("add", "int", null, int);
      // console.log(this.project);
    }
    // this.drawDiagram(this.project);
  }

  enterTable(index, project) {
    // console.log('enter tab!!!!!!!!!!!!!',index);
    // console.log(project)
    switch (index) {
      case 1:
        console.log('enter tab1!!!!!!!!!!!!!');
        // this.graphs[0].clear();
        // this.drawContextDiagram(this.project.contextDiagram, this.graphs[0])
        this.papers.shift();
        this.papers.unshift(this.drawContextDiagram1(this.project.contextDiagram));
        console.log(this.papers)
        break;
      case 2:
        console.log('enter tab2!!!!!!!!!!!!');
        // this.graphs[1].clear();
        // this.drawProblemDiagram(this.project.problemDiagram, this.graphs[1])
        this.papers.pop();
        this.papers.push(this.drawProblemDiagram1(this.project.problemDiagram));
        console.log(this.papers)
        break;
      case 3:
        console.log('enter tab3!!!!!!!!!!!!');
        this.drawFullSenarioGraph(project.fullScenarioGraph);
        console.log(this.papers)
    }
  }

  getProject(projectAddress: string, version): void {
    var that = this
    this.projectAddress = projectAddress
    console.log("projectAddress="+projectAddress);
    if (version == undefined)
      version = "undefined"
    this.version = version
    this.isProjectNull = true;
    this.fileService.getProject(projectAddress, version).subscribe(
      project => {
        // that.project = project;
        console.log(project)
        if (project == null) {
          alert("Network is busy, please try again later!");
          return;
        }
        that.projectService.sendProject(project);
        that.setProject(project);
        that.isProjectNull = false;
        // that.interval = setInterval(function () {
        //   clearInterval(that.interval)
        //   that.register(projectAddress, version)
        // }, 1000)
        //若当前项目不为空项目，就可以进入下一步，否则的话提示用户上传本体
        if (project.contextDiagram.machine != undefined) {
          that.uploadOWLFlag = true;
          that.projectService.uploadOWL(that.uploadOWLFlag);
        }
      });
  }
  setProject(project) {
    this.project.initProject(project)
    // this.project = project;
    // console.log(this.project)
    this.link_name_no = this.searchMaxLinkNameNo(this.project) + 1
    this.phenomenon_no = this.searchMaxPheNo(this.project) + 1
    this.dealConstraint(this.project)
    this.drawDiagram(project)
    // console.log(project)
    this.projectService.sendProject(project)
  }

  dealConstraint(project) {
    for (let temp of project.problemDiagram.referenceList) {
      for (let phe of temp.phenomenonList) {
        if (phe.phenomenon_constraint == null) {
          //console.log('null-------')
          phe.phenomenon_constraint = false
        }
      }
    }
    for (let temp of project.problemDiagram.constraintList) {
      for (let phe of temp.phenomenonList) {
        if (phe.phenomenon_constraint == null) {
          //console.log('null-------')
          phe.phenomenon_constraint = false
        }
      }
    }
  }
  //-----------------画图----------------------------
  //绘制图形
  // drawDiagram(project: Project) {
  //   this.project = project;
  //   this.initPapers();
  //   this.papers = [];
  //   this.drawContextDiagram(project.contextDiagram, this.graphs[0]);
  //   this.drawProblemDiagram(project.problemDiagram, this.graphs[1]);
  //   if (project.scenarioGraphList != null) {
  //     for (var i = 0; i < project.scenarioGraphList.length; i++) {
  //       this.papers.push(this.drawSenarioGraph(project, project.scenarioGraphList[i]));
  //     }
  //   }
  //   if (project.subProblemDiagramList != null) {
  //     for (var i = 0; i < project.subProblemDiagramList.length; i++) {
  //       this.papers.push(this.drawSubProblemDiagram(project.subProblemDiagramList[i]));
  //     }
  //   }
  // }

  drawDiagram(project: Project) {
    // this.project = project;
    this.papers = [];
    this.papers.push(this.drawContextDiagram1(project.contextDiagram));
    this.papers.push(this.drawProblemDiagram1(project.problemDiagram));
    if (project.scenarioGraphList != null) {
      for (var i = 0; i < project.scenarioGraphList.length; i++) {
        this.papers.push(this.drawSenarioGraph(project, project.scenarioGraphList[i]));
      }
    }
    if (project.subProblemDiagramList != null) {
      for (var i = 0; i < project.subProblemDiagramList.length; i++) {
        this.papers.push(this.drawSubProblemDiagram(project.subProblemDiagramList[i]));
      }
    }
  }

  drawSenarioGraph(project: Project, scenarioGraph: ScenarioGraph) {
    this.project = project;
    var that = this;
    var elementList = [];
    const id = scenarioGraph.title + 'M';
    var sgName = scenarioGraph.title;
    // console.log(id)
    var graph = new joint.dia.Graph;
    var paper = new joint.dia.Paper({
      id: id,
      el: document.getElementById(id),
      width: this.winWidth,
      height: this.winHeigh,
      model: graph,
      gridSize: 10,
      drawGrid: true,
      background: {
        color: 'rgb(240,255,255)'
      },
      clickThreshold: 1,
    });
    this.drawIntNodeList(scenarioGraph.intNodeList, elementList, graph, paper.id);
    this.drawCtrlNodeList(scenarioGraph.ctrlNodeList, elementList, graph, paper.id);
    this.drawLineList(scenarioGraph.lineList, elementList, graph, paper);
    paper.on('blank:mousewheel', (event, x, y, delta) => {
      const scale = paper.scale();
      paper.scale(scale.sx + (delta * 0.01), scale.sy + (delta * 0.01));
    });

    // 空白处单击事件
    paper.on('blank:pointerclick', function (evt, x, y) {
      if (that.clickedSceElement != null) {
        that.clickedSceElement.attr('body/stroke', 'black');
        that.clickedSceElement = null;
      }
      that.clickedLink = null;
      if (that.clickedToolView != null) {
        that.clickedToolView.hideTools();
        that.clickedToolView = null;
      }
      that.drawNewElement(paper.id, graph, x, y);
    });

    paper.on('element:pointerclick', function (elementView, evt, x, y) {
      if (elementView.model.attr('root').title.indexOf('text') != -1) {
        return;
      }
      if (that.clickedSceElement != null) {
        that.clickedSceElement.attr('body/stroke', 'black');
      }
      if (that.clickedToolView != null) {
        that.clickedToolView.hideTools();
        that.clickedToolView = null;
      }
      that.clickedSceElement = elementView.model;
      that.clickedLink = null;
      that.clickedPaper = paper;

      that.clickedSceElement.attr('body/stroke', 'orange');
      if (that.source == undefined) {
        that.source = elementView.model;
        // console.log('from:' + that.source.attr('root').title);
      } else if (that.target == undefined) {
        that.target = elementView.model;
        // console.log('to:' + that.target.attr('root').title);
        // if(this.source !== undefined && this.target !== undefined){
        that.drawNewLine(paper, graph);
        // }
      }
    });

    paper.on('element:pointerdblclick', function (elementView, evt, x, y) {
      that.elementList = elementList;
      var element = elementView.model;
      var name = element.attr('root').title;
      if (name.search("Decision") != -1) {
        for (var i = 0; i < scenarioGraph.ctrlNodeList.length; i++) {
          var node = scenarioGraph.ctrlNodeList[i];
          if (node.node_type + node.node_no === name) {
            that.sendDecision(node);
            this.clickedPaper = this.paper;
          }
        }
      } else if (name.search("Delay") != -1) {
        for (var i = 0; i < scenarioGraph.ctrlNodeList.length; i++) {
          var node = scenarioGraph.ctrlNodeList[i];
          if (node.node_type + node.node_no === name) {
            that.sendDelay(node);
            this.clickedPaper = this.paper;
          }
        }
      }
      // else if(name.search("BehInt") != -1 || name.search("ConnInt") != -1){
      //   for (var i = 0; i < scenarioGraph.intNodeList.length; i++) {
      //     var intnode = scenarioGraph.intNodeList[i];
      //     if (intnode.node_type + intnode.node_no === name) {
      //       console.log("PreconditionPopBox")
      //       that.projectService.getIntList(that.project, sgName).subscribe(
      //         IntList => {
      //           console.log(IntList)
      //           that.editConditionInt(IntList);
      //         }
      //       );
      //       that.sendConditionNode(intnode);
      //       this.clickedPaper = this.paper;
      //     }
      //   }
      // }
      else if (name.search("ExpInt") != -1) {
        for (var i = 0; i < scenarioGraph.intNodeList.length; i++) {
          var intnode = scenarioGraph.intNodeList[i];
          if (intnode.node_type + intnode.node_no === name) {
            console.log("PreconditionPopBox")
            that.projectService.getFullExpIntList(that.project, sgName).subscribe(
              IntList => {
                console.log(IntList)
                that.editConditionInt(IntList);
              }
            );
            that.sendConditionNode(intnode);
            this.clickedPaper = this.paper;
          }
        }
      }

    });

    // paper.on('element:pointerdblclick', function(elementView, evt, x, y) {
    //     that.clicked = elementView.model;
    // });

    paper.on('link:pointerclick', function (linkView, evt, x, y) {
      // console.log(linkView.model.attr('root').title);
      that.clickedSceElement = null;
      that.clickedLink = linkView.model;
      that.clickedPaper = paper;
      var link = linkView.model;
      var name = link.attr('root').title;
      console.log(name);
    });

    paper.on('link:pointerdblclick', function (linkView, evt, x, y) {
      that.clickedPaper = paper;
      var link = linkView.model;
      var name = link.attr('root').title;
      for (let line of scenarioGraph.lineList) {
        if (name == line.line_type + line.line_no) {
          if (line.fromNode.node_type == "Decision") {
            console.log("updateCondition")
            that.getLine(line);
          }
        }
      }
      // if(name.split(':')[0] === 'Interface'){
      //     for(let inte of that.project.contextDiagram.interfaceList){
      //         if(name.split(':')[1] === inte.interface_name){
      //             that.sendInterface(inte);
      //         }
      //     }
      // }
    })

    // paper.on('cell:contextmenu', function(elementView, evt, x, y) {
    //     let selectedElement = elementView.model;
    //     console.log(selectedElement.attr('root').title);
    // });

    // paper.on('link:pointerdblclick', function(elementView, evt, x, y) {
    //     let selectedElement = elementView.model;
    //     console.log(selectedElement.attr('root').title);
    // });
    return paper;
  }

  getLine(line: Line) {
    this.lineEmit.next(line);
  }

  getNode(sgName: string, element) {
    var node;
    var nodeName = element.attr('root').title;
    var sgList = this.project.scenarioGraphList;
    console.log(sgName)
    console.log(sgList)
    console.log(this.project)
    console.log(this.projectService.project)
    var sg: ScenarioGraph;
    for (var i = 0; i < sgList.length; i++) {
      if (sgList[i].title === sgName) {
        sg = sgList[i];
      }
    }
    var intNodeList = sg.intNodeList;
    var ctrlNodeList = sg.ctrlNodeList;
    console.log(intNodeList)
    if (intNodeList) {
      for (var i = 0; i < intNodeList.length; i++) {
        var intNode = intNodeList[i];
        if (intNode.node_type + intNode.node_no === nodeName) {
          node = intNode;
          return node;
        }
      }
    }
    if (ctrlNodeList) {
      for (var i = 0; i < ctrlNodeList.length; i++) {
        var ctrlNode = ctrlNodeList[i];
        if (ctrlNode.node_type + ctrlNode.node_no === nodeName) {
          node = ctrlNode;
          break;
        }
      }
    }
    return node;
  }

  getctrlMax(nodeList: CtrlNode[], type: string) {
    var max = 0;
    if (nodeList == null) {
      return 0;
    }
    for (var i = 0; i < nodeList.length; i++) {
      if (nodeList[i].node_type === type) {
        if (nodeList[i].node_no > max) {
          max = nodeList[i].node_no;
        }
      }
    }
    return max;
  }

  saveInt(sgName: string, intNode: Node) {
    var sgList = this.project.scenarioGraphList;
    // console.log(intNode)
    for (var i = 0; i < sgList.length; i++) {
      if (sgList[i].title === sgName) {
        var intNodeList = sgList[i].intNodeList;
        var exit = false;
        for (var j = 0; j < intNodeList.length; j++) {
          if ((intNodeList[j].node_type + intNodeList[j].node_no) === (intNode.node_type + intNode.node_no)) {
            intNodeList[j] = intNode;
            exit = true;
            break;
          }
        }
        if (!exit) {
          intNodeList.push(intNode);
        }
        sgList[i].intNodeList = intNodeList;
        // console.log(intNodeList)
        // this.projectService.sendProject(this.project);
        break;
      }
    }
  }

  saveCtrlNode_clone(sgName: string, ctrlNode: CtrlNode, ctrlNode_clone: CtrlNode) {
    var sgList = this.project.scenarioGraphList;
    var exit = false;
    for (var i = 0; i < sgList.length; i++) {
      if (sgList[i].title === sgName) {
        var ctrlNodeList = sgList[i].ctrlNodeList;
        if (ctrlNodeList === null) {
          ctrlNodeList = new Array<CtrlNode>();
          ctrlNodeList.push(ctrlNode);
          ctrlNodeList.push(ctrlNode_clone);
        } else {
          for (var j = 0; j < ctrlNodeList.length; j++) {
            if ((ctrlNodeList[j].node_type + ctrlNodeList[j].node_no) === (ctrlNode.node_type + ctrlNode.node_no)) {
              ctrlNodeList[j] = ctrlNode;
              exit = true;
              break;
            }
            if ((ctrlNodeList[j].node_type + ctrlNodeList[j].node_no) === (ctrlNode_clone.node_type + ctrlNode_clone.node_no)) {
              ctrlNodeList[j] = ctrlNode_clone;
              exit = true;
              break;
            }
          }
          if (!exit) {
            ctrlNodeList.push(ctrlNode);
            ctrlNodeList.push(ctrlNode_clone);
          }
        }
        sgList[i].ctrlNodeList = ctrlNodeList;
        break;
      }
    }
  }

  drawNewElement(id: string, graph, x, y) {
    console.log(this.project)
    // console.log('draw');
    var intNode: Node;
    var nodeId;
    var sgName = id.substring(0, id.length - 1);
    var sgList = this.project.scenarioGraphList;
    // console.log(this.project)
    for (var i = 0; i < sgList.length; i++) {
      if (sgList[i].title === sgName) {
        var ctrlNodeList = sgList[i].ctrlNodeList;
        nodeId = this.getctrlMax(ctrlNodeList, this.type) + 1;
      }
    }
    console.log(this.type);
    switch (this.type) {
      case 'BehInt':
        if (this.subscription) {
          this.subscription.unsubscribe();
        }
        intNode = new Node();
        var BehInts: Phenomenon[];
        var BehInt: string;
        intNode.node_type = 'BehInt';
        intNode.node_x = x;
        intNode.node_y = y;
        this.projectService.getBehIntList(this.project, sgName).subscribe(
          BehIntList => {
            console.log("BehIntList:" + BehIntList)
            BehInts = BehIntList;
            this.editInt(BehInts);
            console.log(BehInts);
          }
        );
        this.subscription = this.intEmmited$.subscribe(
          behInt => {
            BehInt = behInt;
            intNode.node_no = parseInt(BehInt.split('int')[1]);
            this.drawIntNode(sgName, intNode, graph);
            this.saveInt(sgName, intNode);
            this.subscription.unsubscribe();
          }
        )
        break;
      case 'ConnInt':
        if (this.subscription) {
          this.subscription.unsubscribe();
        }
        intNode = new Node();
        var ConnInts: Phenomenon[];
        var ConnInt: string;
        intNode.node_type = 'ConnInt';
        intNode.node_x = x;
        intNode.node_y = y;
        this.projectService.getConnIntList(this.project, sgName).subscribe(
          ConnIntList => {
            console.log("ConnIntList:" + ConnIntList)
            ConnInts = ConnIntList;
            this.editInt(ConnInts);
            console.log(ConnInts);
          }
        );
        this.subscription = this.intEmmited$.subscribe(
          connInt => {
            ConnInt = connInt;
            intNode.node_no = parseInt(ConnInt.split('int')[1]);
            this.drawIntNode(sgName, intNode, graph);
            this.saveInt(sgName, intNode);
            this.subscription.unsubscribe();
          }
        )
        break;
      case 'ExpInt':
        if (this.subscription) {
          this.subscription.unsubscribe();
        }
        intNode = new Node();
        var ExpInts: Phenomenon[];
        var ExpInt: string;
        intNode.node_type = 'ExpInt';
        intNode.node_x = x;
        intNode.node_y = y;
        this.projectService.getExpIntList(this.project, id.substring(0, id.length - 1)).subscribe(
          ExpIntList => {
            console.log("ExpIntList:" + ExpIntList)
            ExpInts = ExpIntList;
            this.editInt(ExpInts);
          }
        );
        this.subscription = this.intEmmited$.subscribe(
          expInt => {
            ExpInt = expInt;
            intNode.node_no = parseInt(ExpInt.split('int')[1]);
            this.drawIntNode(id.substring(0, id.length - 1), intNode, graph);
            this.saveInt(id.substring(0, id.length - 1), intNode);
            this.subscription.unsubscribe();
          }
        )
        break;
      case 'Start':
        if (this.subscription) {
          this.subscription.unsubscribe();
        }
        var ctrlNode = new CtrlNode();
        ctrlNode.node_type = 'Start';
        ctrlNode.node_x = x;
        ctrlNode.node_y = y;
        ctrlNode.node_no = this.startNodeList.length + 1;
        var ctrlNode_clone = new CtrlNode();
        ctrlNode_clone.node_type = 'Start';
        ctrlNode_clone.node_x = x - 250;
        ctrlNode_clone.node_y = y
        ctrlNode_clone.node_no = ctrlNode.node_no + 1;
        ctrlNode.node_clone = ctrlNode_clone.node_type + ctrlNode_clone.node_no;
        this.drawCtrlNode_clone(id.substring(0, id.length - 1), ctrlNode, ctrlNode_clone, graph);
        this.saveCtrlNode_clone(id.substring(0, id.length - 1), ctrlNode_clone, ctrlNode);
        break;
      case 'End':
        if (this.subscription) {
          this.subscription.unsubscribe();
        }
        var ctrlNode = new CtrlNode();
        ctrlNode.node_type = 'End';
        ctrlNode.node_x = x;
        ctrlNode.node_y = y;
        ctrlNode.node_no = this.endNodeList.length + 1;
        var ctrlNode_clone = new CtrlNode();
        ctrlNode_clone.node_type = 'End';
        ctrlNode_clone.node_x = x - 250;
        ctrlNode_clone.node_y = y;
        ctrlNode_clone.node_no = ctrlNode.node_no + 1;
        ctrlNode.node_clone = ctrlNode_clone.node_type + ctrlNode_clone.node_no;
        this.drawCtrlNode_clone(id.substring(0, id.length - 1), ctrlNode, ctrlNode_clone, graph);
        this.saveCtrlNode_clone(id.substring(0, id.length - 1), ctrlNode_clone, ctrlNode);
        break;
      case 'Decision':
        if (this.subscription) {
          this.subscription.unsubscribe();
        }
        var ctrlNode = new CtrlNode();
        ctrlNode.node_no = nodeId;
        ctrlNode.node_type = 'Decision';
        ctrlNode.node_x = x;
        ctrlNode.node_y = y;
        ctrlNode.node_no = this.decisionNodeList.length + 1;
        ctrlNode.node_text = '';
        // ctrlNode.node_consition1 = '';
        // ctrlNode.node_consition2 = '';
        var ctrlNode_clone = new CtrlNode();
        ctrlNode_clone.node_type = 'Decision';
        ctrlNode_clone.node_x = x - 250;
        ctrlNode_clone.node_y = y;
        ctrlNode_clone.node_no = ctrlNode.node_no + 1;
        ctrlNode.node_clone = ctrlNode_clone.node_type + ctrlNode_clone.node_no;
        this.drawCtrlNode_clone(id.substring(0, id.length - 1), ctrlNode, ctrlNode_clone, graph);
        this.saveCtrlNode_clone(id.substring(0, id.length - 1), ctrlNode_clone, ctrlNode);
        break;
      case 'Merge':
        if (this.subscription) {
          this.subscription.unsubscribe();
        }
        var ctrlNode = new CtrlNode();
        ctrlNode.node_no = nodeId;
        ctrlNode.node_type = 'Merge';
        ctrlNode.node_x = x;
        ctrlNode.node_y = y;
        ctrlNode.node_no = this.mergeNodeList.length + 1;
        var ctrlNode_clone = new CtrlNode();
        ctrlNode_clone.node_type = 'Merge';
        ctrlNode_clone.node_x = x - 250;
        ctrlNode_clone.node_y = y;
        ctrlNode_clone.node_no = ctrlNode.node_no + 1;
        ctrlNode.node_clone = ctrlNode_clone.node_type + ctrlNode_clone.node_no;
        this.drawCtrlNode_clone(id.substring(0, id.length - 1), ctrlNode, ctrlNode_clone, graph);
        this.saveCtrlNode_clone(id.substring(0, id.length - 1), ctrlNode_clone, ctrlNode);
        break;
      case 'Branch':
        if (this.subscription) {
          this.subscription.unsubscribe();
        }
        var ctrlNode = new CtrlNode();
        ctrlNode.node_no = nodeId;
        ctrlNode.node_type = 'Branch';
        ctrlNode.node_x = x;
        ctrlNode.node_y = y;
        ctrlNode.node_no = this.branchNodeList.length + 1;
        var ctrlNode_clone = new CtrlNode();
        ctrlNode_clone.node_type = 'Branch';
        ctrlNode_clone.node_x = x - 250;
        ctrlNode_clone.node_y = y;
        ctrlNode_clone.node_no = ctrlNode.node_no + 1;
        ctrlNode.node_clone = ctrlNode_clone.node_type + ctrlNode_clone.node_no;
        this.drawCtrlNode_clone(id.substring(0, id.length - 1), ctrlNode, ctrlNode_clone, graph);
        this.saveCtrlNode_clone(id.substring(0, id.length - 1), ctrlNode_clone, ctrlNode);
        break;
      case 'Delay':
        if (this.subscription) {
          this.subscription.unsubscribe();
        }
        var ctrlNode = new CtrlNode();
        ctrlNode.node_no = nodeId;
        ctrlNode.node_type = 'Delay';
        ctrlNode.node_x = x;
        ctrlNode.node_y = y;
        ctrlNode.node_no = this.delayNodeList.length + 1;
        var ctrlNode_clone = new CtrlNode();
        ctrlNode_clone.node_type = 'Delay';
        ctrlNode_clone.node_x = x - 250;
        ctrlNode_clone.node_y = y;
        ctrlNode_clone.node_no = ctrlNode.node_no + 1;
        ctrlNode.node_clone = ctrlNode_clone.node_type + ctrlNode_clone.node_no;
        this.drawCtrlNode_clone(id.substring(0, id.length - 1), ctrlNode, ctrlNode_clone, graph);
        this.saveCtrlNode_clone(id.substring(0, id.length - 1), ctrlNode_clone, ctrlNode);
        break;
    }
    this.type = undefined;
  }

  drawNewLine(paper, graph) {
    var lineId: number;
    var sgName = paper.id.substring(0, paper.id.length - 1);
    var fromNode = this.getNode(sgName, this.source);
    var toNode = this.getNode(sgName, this.target);
    var sgList = this.project.scenarioGraphList;
    for (var i = 0; i < sgList.length; i++) {
      if (sgList[i].title === sgName) {
        var lineList = sgList[i].lineList;
        lineId = this.getlineMax(lineList) + 1;
      }
    }

    console.log("from:" + fromNode.node_type + fromNode.node_no)
    console.log("to:" + toNode.node_type + toNode.node_no)
    var line = new Line();
    line.line_no = lineId;
    line.turnings = '';
    line.line_type = this.type;
    line.fromNode = fromNode;
    line.toNode = toNode;
    var res = this.drawLine(line, this.source, this.target, graph, paper);
    if (res) {
      this.saveLine(paper.id.substring(0, paper.id.length - 1), line);
    }
    // 如果新画的线是ExpOrder类型的，就在左边同步的画一条线
    if (line.line_type == "ExpOrder") {
      // console.log(fromNode.node_type);
      // console.log(toNode.node_type);
      // fromNode或者toNode是控制节点
      if (this.ctrlType.indexOf(fromNode.node_type) != -1 || this.ctrlType.indexOf(toNode.node_type) != -1) {
        // console.log('getBehLine_ctrl')
        line = this.getBehLine_ctrl(sgName, fromNode, toNode);
      } else {
        // fromNode或者toNode都不是控制节点，即fromNode和toNode都是interaction
        line = this.getBehLine(sgName, fromNode, toNode);
      }
      if (line != null) {
        let fromElement = null;
        let toElement = null;
        // console.log(line.fromNode.node_type + line.fromNode.node_no)
        for (let nodeElement of paper.model.getElements()) {
          if (nodeElement.attr('root').title == line.fromNode.node_type + line.fromNode.node_no) {
            fromElement = nodeElement;
          } else if (nodeElement.attr('root').title == line.toNode.node_type + line.toNode.node_no) {
            toElement = nodeElement;
          }
          if (fromElement != null && toElement != null) {
            break;
          }
        }
        var res = this.drawLine(line, fromElement, toElement, graph, paper);
        if (res) {
          this.saveLine(paper.id.substring(0, paper.id.length - 1), line);
        }
      }
    }

    this.source = undefined;
    this.target = undefined;
    this.type = undefined;
  }

  saveLine(sgName: string, line: Line) {
    var sgList = this.project.scenarioGraphList;
    for (var i = 0; i < sgList.length; i++) {
      if (sgList[i].title === sgName) {
        var lineList = sgList[i].lineList;
        if (lineList === null) {
          lineList = new Array<Line>();
          lineList.push(line);
        } else {
          lineList.push(line);
        }
        sgList[i].lineList = lineList;
        // this.projectService.sendProject(this.project);
        console.log(lineList)
        break;
      }
    }
  }

  getBehLine(sgName: string, fromNode: Node, toNode: Node): Line {
    let line = null;
    var sgList = this.project.scenarioGraphList;
    var sg: ScenarioGraph;
    let from = null;
    let to = null;
    for (var i = 0; i < sgList.length; i++) {
      if (sgList[i].title === sgName) {
        sg = sgList[i];
        break;
      }
    }
    var lineList = sg.lineList;
    for (let l of lineList) {
      if (l.line_type == "BehOrder" || l.line_type == "ExpOrder") {
        continue;
      }
      if ((l.fromNode.node_type == fromNode.node_type && l.fromNode.node_no == fromNode.node_no)
        || (l.toNode.node_type == fromNode.node_type && l.toNode.node_no == fromNode.node_no)) {
        if (l.fromNode.node_type == fromNode.node_type
          && l.fromNode.node_no == fromNode.node_no) {
          from = l.toNode;
        } else if (l.toNode.node_type == fromNode.node_type
          && l.toNode.node_no == fromNode.node_no) {
          from = l.fromNode;
        }
      } else if ((l.fromNode.node_type == toNode.node_type && l.fromNode.node_no == toNode.node_no)
        || (l.toNode.node_type == toNode.node_type && l.toNode.node_no == toNode.node_no)) {
        if (l.fromNode.node_type == toNode.node_type
          && l.fromNode.node_no == toNode.node_no) {
          to = l.toNode;
        } else if (l.toNode.node_type == toNode.node_type
          && l.toNode.node_no == toNode.node_no) {
          to = l.fromNode;
        }
      }
    }
    if (from != null && to != null) {
      for (let l of lineList) {
        if ((l.fromNode.node_type == from.node_type && l.fromNode.node_no == from.node_no)
          && (l.toNode.node_type == to.node_type && l.toNode.node_no == to.node_no)) {
          return null;
        }
      }
      line = new Line();
      line.fromNode = from;
      line.toNode = to;
      line.line_type = "BehOrder";
      line.turnings = "";
      line.line_no = this.getlineMax(lineList) + 1;
    }
    return line;
  }

  getBehLine_ctrl(sgName: string, fromNode: Node, toNode: Node): Line {
    let line = null;
    var sgList = this.project.scenarioGraphList;
    var sg: ScenarioGraph;
    let from = null;
    let to = null;
    for (var i = 0; i < sgList.length; i++) {
      if (sgList[i].title === sgName) {
        sg = sgList[i];
        break;
      }
    }
    var lineList = sg.lineList;
    // 如果fromNode和toNode都是控制节点
    if (this.ctrlType.indexOf(fromNode.node_type) != -1 && this.ctrlType.indexOf(toNode.node_type) != -1) {
      from = new Node();
      to = new Node();
      // Object.assign方法用于对象的合并，将源对象的所有可枚举属性，复制到目标对象。
      // Object.assign方法的第一个参数是目标对象，后面的参数都是源对象。
      Object.assign(from, fromNode);
      Object.assign(to, toNode);
      from.node_no = fromNode.node_no + 1
      to.node_no = toNode.node_no + 1
      // 如果fromNode是控制节点
    } else if (this.ctrlType.indexOf(fromNode.node_type) != -1) {
      from = new Node();
      Object.assign(from, fromNode);
      from.node_no = fromNode.node_no + 1
    } else if (this.ctrlType.indexOf(toNode.node_type) != -1) {
      to = new Node();
      Object.assign(to, toNode);
      to.node_no = toNode.node_no + 1
    }
    for (let l of lineList) {
      if (l.line_type == "BehOrder" || l.line_type == "ExpOrder") {
        continue;
      }
      if ((l.fromNode.node_type == fromNode.node_type && l.fromNode.node_no == fromNode.node_no)
        || (l.toNode.node_type == fromNode.node_type && l.toNode.node_no == fromNode.node_no)) {
        if (l.fromNode.node_type == fromNode.node_type
          && l.fromNode.node_no == fromNode.node_no) {
          from = l.toNode;
        } else if (l.toNode.node_type == fromNode.node_type
          && l.toNode.node_no == fromNode.node_no) {
          from = l.fromNode;
        }
      } else if ((l.fromNode.node_type == toNode.node_type && l.fromNode.node_no == toNode.node_no)
        || (l.toNode.node_type == toNode.node_type && l.toNode.node_no == toNode.node_no)) {
        if (l.fromNode.node_type == toNode.node_type
          && l.fromNode.node_no == toNode.node_no) {
          to = l.toNode;
        } else if (l.toNode.node_type == toNode.node_type
          && l.toNode.node_no == toNode.node_no) {
          to = l.fromNode;
        }
      }
    }
    if (from != null && to != null) {
      for (let l of lineList) {
        if ((l.fromNode.node_type == from.node_type && l.fromNode.node_no == from.node_no)
          && (l.toNode.node_type == to.node_type && l.toNode.node_no == to.node_no)) {
          return null;
        }
      }
      line = new Line();
      line.fromNode = from;
      line.toNode = to;
      line.line_type = "BehOrder";
      line.turnings = "";
      line.line_no = this.getlineMax(lineList) + 1;
    }
    return line;
  }

  getlineMax(lineList: Line[]) {
    var max = 0;
    if (lineList == null) {
      return 0;
    }
    for (var i = 0; i < lineList.length; i++) {
      if (lineList[i].line_no > max) {
        max = lineList[i].line_no;
      }
    }
    return max;
  }

  drawIntNodeList(intNodeList: Node[], elementList, graph, id: string) {
    for (var i = 0; i < intNodeList.length; i++) {
      var intNode = intNodeList[i];
      // console.log(intNode.node_type)
      let intElement;
      if (intNode.node_type === 'BehInt' || intNode.node_type === 'ConnInt' || intNode.node_type === 'ExpInt') {
        intElement = this.drawIntNode(id, intNode, graph);
      } else {
        intElement = this.drawConditionNode(id, intNode, graph);
      }
      elementList.push(intElement);
    }
  }

  drawIntNode(id: string, intNode, graph) {
    // console.log("drawIntNode")
    var that = this;
    var phes;
    var text;
    let textElement = new joint.shapes.standard.Rectangle();
    textElement.attr({
      body: {
        ref: 'label',
        refX: -5,	//����ԭ��
        refY: 0,
        x: 0,	//ͼ��λ��
        y: 0,
        refWidth: 10,	//ͼ�δ�С
        refHeight: '120%',
        fill: 'none',
        stroke: 'none',
        strokeWidth: 1,
      },
      root: {
        title: intNode.node_type + intNode.node_no + 'text',
        id: id,
      }
    });
    textElement.position(intNode.node_x + 80, intNode.node_y - 30);
    textElement.addTo(graph);
    phes = this.projectService.getPhenomenon(this.project);
    for (var i = 0; i < phes.length; i++) {
      if (phes[i].phenomenon_no === intNode.node_no) {
        text = phes[i].phenomenon_name;
        textElement.attr({
          label: {
            text: text,
            fontSize: 20,
            textAnchor: 'middle',	//�ı�����
            textVerticalAnchor: 'middle',
          }
        });
      }
    }

    let intElement = new joint.shapes.standard.Rectangle();
    intElement.attr({
      body: {
        ref: 'label',
        refX: 0,
        refY: 0,
        x: -10,
        y: -5,
        rx: 20,
        ry: 20,
        refWidth: 20,
        refHeight: 10,
        fill: 'rgb(135,206,250)',
        strokeWidth: 1,

      },
      label: {
        text: 'int' + intNode.node_no,
        fontSize: 25,
        textAnchor: 'middle',
        textVerticalAnchor: 'middle',
      }
    });

    // intElement.resize(200,100);
    // intElement.resize(200, 100);

    if (intNode.pre_condition != null) {
      intElement.attr({
        label: {
          text: '* int' + intNode.node_no,
        }
      })
    }
    if (intNode.post_condition != null) {
      intElement.attr({
        label: {
          text: 'int' + intNode.node_no + '*',
        }
      })
    }

    if (intNode.node_type === 'BehInt') {
      intElement.attr({
        body: {
          fill: 'rgb(189,215,238)',
        }
      });
    } else if (intNode.node_type === 'ConnInt') {
      intElement.attr({
        body: {
          fill: 'rgb(197,224,180)',
        }
      });
    } else if (intNode.node_type === 'ExpInt') {
      intElement.attr({
        body: {
          fill: 'rgb(255,230,153)',
          strokeDasharray: '8,2',
        }
      });
    }

    intElement.attr({
      root: {
        title: intNode.node_type + intNode.node_no,
      },
    });
    intElement.position(intNode.node_x, intNode.node_y);
    intElement.addTo(graph);

    intElement.on('change:position', function (element1, position) {
      intNode.node_x = position.x;
      intNode.node_y = position.y;
      textElement.position(intNode.node_x + 80, intNode.node_y - 30);
      that.saveInt(id.substring(0, id.length - 1), intNode);
    });
    // console.log(intElement)
    return intElement;
  }

  updateIntCondition(intNode: Node, condition: string) {
    console.log("updateIntCondition")
    var id = this.clickedPaper.id;
    this.saveInt(id.substring(0, id.length - 1), intNode);
    for (let nodeElement of this.clickedPaper.model.getElements()) {
      if (nodeElement.attr('root').title === intNode.node_type + intNode.node_no) {
        if (condition === "Pre") {
          nodeElement.attr({
            label: {
              text: '* int' + intNode.node_no,
            }
          });
        } else if (condition === "Post") {
          nodeElement.attr({
            label: {
              text: 'int' + intNode.node_no + ' *',
            }
          });
        }
        break;
      }
    }
  }

  IntCondition_clone(intNode: Node, node: Phenomenon, condition: string) {
    var sgList = this.project.scenarioGraphList;
    let phe = this.getRelatedPhe(node);
    // console.log(phe);
    for (var i = 0; i < sgList.length; i++) {
      var lineList = sgList[i].lineList;
      for (let line of lineList) {
        if (line.line_type == "Synchrony" || line.line_type == "BehEnable" || line.line_type == "ExpEnable") {
          if (line.fromNode.node_no == intNode.node_no && line.fromNode.node_type == intNode.node_type) {
            if (condition === "Pre") {
              line.toNode.pre_condition = phe;
            } else if (condition === "Post") {
              line.toNode.post_condition = phe;
            }
            this.updateIntCondition(line.toNode, condition);
          } else if (line.toNode.node_no == intNode.node_no && line.toNode.node_type == intNode.node_type) {
            if (condition === "Pre") {
              line.fromNode.pre_condition = phe;
            } else if (condition === "Post") {
              line.fromNode.post_condition = phe;
            }
            this.updateIntCondition(line.fromNode, condition);
          }
        }
      }
    }
    // console.log(this.project)
  }

  getRelatedPhe(phe: Phenomenon) {
    var sgList = this.project.scenarioGraphList;
    let node: Node;
    let relatedNode: Node;
    for (var i = 0; i < sgList.length; i++) {
      var intNodeList = sgList[i].intNodeList;
      for (let intNode of intNodeList) {
        if (phe.phenomenon_no == intNode.node_no) {
          node = intNode;
        }
      }
    }
    for (var i = 0; i < sgList.length; i++) {
      var lineList = sgList[i].lineList;
      for (let line of lineList) {
        if (line.line_type == "Synchrony" || line.line_type == "BehEnable" || line.line_type == "ExpEnable") {
          if (line.fromNode.node_no == node.node_no && line.fromNode.node_type == node.node_type) {
            relatedNode = line.toNode;
          } else if (line.toNode.node_no == node.node_no && line.toNode.node_type == node.node_type) {
            relatedNode = line.fromNode;
          }
        }
      }
    }
    var pheList = this.projectService.getPhenomenon(this.project);
    var relatedPhe: Phenomenon;
    for (var i = 0; i < pheList.length; i++) {
      let phe = pheList[i];
      if (phe.phenomenon_no == relatedNode.node_no) {
        relatedPhe = phe;
        break;
      }
    }
    return relatedPhe;
  }

  drawConditionNode(id: string, intNode, graph) {
    // console.log("drawIntNode")
    var that = this;
    var phes;
    var text;
    let textElement = new joint.shapes.standard.Rectangle();
    textElement.attr({
      body: {
        ref: 'label',
        refX: -5,	//����ԭ��
        refY: 0,
        x: 0,	//ͼ��λ��
        y: 0,
        refWidth: 10,	//ͼ�δ�С
        refHeight: '120%',
        fill: 'none',
        stroke: 'none',
        strokeWidth: 1,
      },
      root: {
        title: intNode.node_type + intNode.node_no + 'text',
        id: id,
      }
    });
    textElement.position(intNode.node_x + 80, intNode.node_y - 30);
    textElement.addTo(graph);
    phes = this.projectService.getPhenomenon(this.project);
    for (var i = 0; i < phes.length; i++) {
      if (phes[i].phenomenon_no === intNode.node_no) {
        text = phes[i].phenomenon_name;
        textElement.attr({
          label: {
            text: text,
            fontSize: 20,
            textAnchor: 'middle',	//�ı�����
            textVerticalAnchor: 'middle',
          }
        });
      }
    }

    let intElement = new joint.shapes.standard.Rectangle();
    intElement.attr({
      body: {
        ref: 'label',
        refX: 0,
        refY: 0,
        x: -10,
        y: -5,
        // rx: 20,
        // ry: 20,
        refWidth: 20,
        refHeight: 10,
        fill: 'rgb(135,206,250)',
        strokeWidth: 1,

      },
      label: {
        text: 'int' + intNode.node_no,
        fontSize: 25,
        textAnchor: 'middle',
        textVerticalAnchor: 'middle',
      }
    });

    /* if (intNode.node_type === 'PreInt') {
      intElement.attr({
        body: {
          fill: 'rgb(251,229,214)',
        }
      });
    } else if (intNode.node_type === 'PostInt') {
      intElement.attr({
        body: {
          fill: 'rgb(187,117,246)',
        }
      });
    } */
    intElement.attr({
      root: {
        title: intNode.node_type + intNode.node_no,
      },
    });
    intElement.position(intNode.node_x, intNode.node_y);
    intElement.addTo(graph);

    intElement.on('change:position', function (element1, position) {
      intNode.node_x = position.x;
      intNode.node_y = position.y;
      textElement.position(intNode.node_x + 80, intNode.node_y - 30);
      that.saveInt(id.substring(0, id.length - 1), intNode);
    });
    // console.log(intElement)
    return intElement;
  }

  drawCtrlNodeList(ctrlNodeList: CtrlNode[], elementList, graph, id: string) {
    if (ctrlNodeList == null) {
      return;
    }
    for (var i = 0; i < ctrlNodeList.length; i++) {
      let ctrlNode = ctrlNodeList[i];
      let ctrlElement = this.drawCtrlNode(id, ctrlNode, graph);
      elementList.push(ctrlElement);
    }
  }

  drawCtrlNode(id: string, ctrlNode, graph) {
    // console.log("drawCtrlNode")
    var that = this;
    var EndElement = joint.dia.Element.define('EndElement', {
      attrs: {
        body: {
          strokeWidth: 1,
          stroke: '#000000',
          fill: 'rgb(240,255,255)'
        },
        c1: {
          strokeWidth: 4,
          stroke: '#000000',
          fill: 'black',
        },
      }
    }, {
      markup: [{
        tagName: 'circle',
        selector: 'body'
      }, {
        tagName: 'circle',
        selector: 'c1'
      }]
    });

    var ctrlElement;
    var r = 10;
    switch (ctrlNode.node_type) {
      case 'Start':
        ctrlElement = new joint.shapes.standard.Circle();
        ctrlElement.resize(2 * r, 2 * r);
        ctrlElement.attr({
          body: {
            fill: 'black',
          }
        });
        this.startNodeList.push(ctrlElement)
        break;
      case 'End':
        ctrlElement = new EndElement();
        ctrlElement.attr({
          body: {
            ref: 'c1',
            refRCircumscribed: '70%',
          },
          c1: {
            r: r * 0.7,
          }
        });
        this.endNodeList.push(ctrlElement);
        break;
      case 'Decision':
        ctrlElement = new joint.shapes.standard.Polygon();
        ctrlElement.attr({
          body: {
            refPoints: '0,10 10,0 20,10 10,20',
            strokeWidth: 1,	//����
            fill: 'rgb(240,255,255)',
          },
          label: {
            text: ctrlNode.node_text,
            fontSize: 20,
          }
        });
        ctrlElement.resize(40, 40);
        this.decisionNodeList.push(ctrlElement);
        break;
      case 'Merge':
        ctrlElement = new joint.shapes.standard.Polygon();
        ctrlElement.attr({
          body: {
            refPoints: '0,10 10,0 20,10 10,20',
            fill: 'rgb(240,255,255)',
          },
        });
        ctrlElement.resize(40, 40);
        this.mergeNodeList.push(ctrlElement);
        break;
      case 'Branch':
        ctrlElement = new joint.shapes.standard.Rectangle();
        ctrlElement.attr({
          body: {
            fill: 'black',
          }
        });
        ctrlElement.resize(150, 5);
        this.branchNodeList.push(ctrlElement);
        break;
      case 'Delay':
        ctrlElement = new joint.shapes.standard.Polygon();
        // console.log(ctrlNode)
        if (ctrlNode.delay_type == "at") {
          ctrlElement.attr({
            label: {
              text: 'at ' + ctrlNode.node_text,
            },
            body: {
              refPoints: '0,0 10,0 0,20 10,20',
              fill: 'rgb(240,255,255)'
            }
          });
        } else if (ctrlNode.delay_type == "after") {
          ctrlElement.attr({
            label: {
              text: 'after ' + ctrlNode.node_text,
            },
            body: {
              refPoints: '0,0 10,0 0,20 10,20',
              fill: 'rgb(240,255,255)'
            }
          });
        } else {
          ctrlElement.attr({
            body: {
              refPoints: '0,0 10,0 0,20 10,20',
              fill: 'rgb(240,255,255)'
            }
          });
        }
        ctrlElement.resize(40, 40);
        this.delayNodeList.push(ctrlElement);
        break;
    }
    ctrlElement.attr({
      root: {
        title: ctrlNode.node_type + ctrlNode.node_no,
      },
    });
    ctrlElement.position(ctrlNode.node_x, ctrlNode.node_y);
    ctrlElement.addTo(graph);

    ctrlElement.on('change:position', function (element1, position) {
      ctrlNode.node_x = position.x;
      ctrlNode.node_y = position.y;
      // leftElement.position(ctrlNode.node_x - 50, ctrlNode.node_y + 40);
      // rightElement.position(ctrlNode.node_x + 100, ctrlNode.node_y + 40);
      that.saveCtrlNode(id.substring(0, id.length - 1), ctrlNode);
    });
    return ctrlElement;
  }

  saveCtrlNode(sgName: string, ctrlNode: CtrlNode) {
    // console.log(ctrlNode)
    var sgList = this.project.scenarioGraphList;
    var exit = false;
    for (var i = 0; i < sgList.length; i++) {
      if (sgList[i].title === sgName) {
        var ctrlNodeList = sgList[i].ctrlNodeList;
        if (ctrlNodeList === null) {
          ctrlNodeList = new Array<CtrlNode>();
          ctrlNodeList.push(ctrlNode);
        } else {
          for (var j = 0; j < ctrlNodeList.length; j++) {
            if ((ctrlNodeList[j].node_type + ctrlNodeList[j].node_no) === (ctrlNode.node_type + ctrlNode.node_no)) {
              ctrlNodeList[j] = ctrlNode;
              exit = true;
              break;
            }
          }
          if (!exit) {
            ctrlNodeList.push(ctrlNode);
          }
        }
        sgList[i].ctrlNodeList = ctrlNodeList;
        break;
      }
    }
  }

  drawCtrlNode_clone(id: string, ctrlNode, ctrlNode_clone, graph) {
    // console.log("drawCtrlNode_clone")
    var that = this;
    var EndElement = joint.dia.Element.define('EndElement', {
      attrs: {
        body: {
          strokeWidth: 1,	//����
          stroke: '#000000',	//��ɫ
          fill: 'rgb(240,255,255)'	//����?
        },
        c1: {
          strokeWidth: 4,
          stroke: '#000000',
          fill: 'black',
        },
      }
    }, {
      markup: [{
        tagName: 'circle',
        selector: 'body'
      }, {
        tagName: 'circle',
        selector: 'c1'
      }]
    });

    var ctrlElement;
    var ctrlElement_clone;
    var r = 10;
    switch (ctrlNode.node_type) {
      case 'Start':
        ctrlElement = new joint.shapes.standard.Circle();
        ctrlElement.resize(2 * r, 2 * r);
        ctrlElement.attr({
          body: {
            fill: 'black',
          }
        });
        ctrlElement_clone = ctrlElement.clone();
        this.startNodeList.push(ctrlElement)
        this.startNodeList.push(ctrlElement_clone)
        break;
      case 'End':
        ctrlElement = new EndElement();
        ctrlElement.attr({
          body: {
            ref: 'c1',
            refRCircumscribed: '70%',
          },
          c1: {
            r: r * 0.7,
          }
        });
        ctrlElement_clone = ctrlElement.clone();
        this.endNodeList.push(ctrlElement);
        this.endNodeList.push(ctrlElement_clone);
        break;
      case 'Decision':
        ctrlElement = new joint.shapes.standard.Polygon();
        ctrlElement.attr({
          body: {
            refPoints: '0,10 10,0 20,10 10,20',
            strokeWidth: 1,	//����
            fill: 'rgb(240,255,255)',
          },
          label: {
            text: ctrlNode.node_text,
            fontSize: 20,
          }
        });
        ctrlElement.resize(40, 40);
        ctrlElement_clone = ctrlElement.clone();
        this.decisionNodeList.push(ctrlElement);
        this.decisionNodeList.push(ctrlElement_clone);
        break;
      case 'Merge':
        ctrlElement = new joint.shapes.standard.Polygon();
        ctrlElement.attr({
          body: {
            refPoints: '0,10 10,0 20,10 10,20',
            fill: 'rgb(240,255,255)',
          },
        });
        ctrlElement.resize(40, 40);
        ctrlElement_clone = ctrlElement.clone();
        this.mergeNodeList.push(ctrlElement);
        this.mergeNodeList.push(ctrlElement_clone);
        break;
      case 'Branch':
        ctrlElement = new joint.shapes.standard.Rectangle();
        ctrlElement.attr({
          body: {
            fill: 'black',
          }
        });
        ctrlElement.resize(150, 5);
        ctrlElement_clone = ctrlElement.clone();
        this.branchNodeList.push(ctrlElement);
        this.branchNodeList.push(ctrlElement_clone);
        break;
      case 'Delay':
        ctrlElement = new joint.shapes.standard.Polygon();
        if (ctrlNode.delay_type == "at") {
          ctrlElement.attr({
            label: {
              text: 'at ' + ctrlNode.node_text,
            },
            body: {
              refPoints: '0,0 10,0 0,20 10,20',
              fill: 'rgb(240,255,255)'
            }
          });
        } else if (ctrlNode.delay_type == "after") {
          ctrlElement.attr({
            label: {
              text: 'after ' + ctrlNode.node_text,
            },
            body: {
              refPoints: '0,0 10,0 0,20 10,20',
              fill: 'rgb(240,255,255)'
            }
          });
        } else {
          ctrlElement.attr({
            body: {
              refPoints: '0,0 10,0 0,20 10,20',
              fill: 'rgb(240,255,255)'
            }
          });
        }
        ctrlElement.resize(40, 40);
        ctrlElement_clone = ctrlElement.clone();
        this.delayNodeList.push(ctrlElement);
        this.delayNodeList.push(ctrlElement_clone);
        break;
    }
    ctrlElement.attr({
      root: {
        title: ctrlNode.node_type + ctrlNode.node_no,
        title_clone: ctrlNode_clone.node_type + ctrlNode_clone.node_no,
      },
    });
    ctrlElement_clone.attr({
      root: {
        title: ctrlNode_clone.node_type + ctrlNode_clone.node_no,
        title_clone: ctrlNode.node_type + ctrlNode.node_no,
      },
    });
    ctrlElement.position(ctrlNode.node_x, ctrlNode.node_y);
    ctrlElement.addTo(graph);
    ctrlElement_clone.position(ctrlNode_clone.node_x, ctrlNode_clone.node_y);
    ctrlElement_clone.addTo(graph);

    ctrlElement.on('change:position', function (element1, position) {
      ctrlNode.node_x = position.x;
      ctrlNode.node_y = position.y;
      // leftElement.position(ctrlNode.node_x - 50, ctrlNode.node_y + 40);
      // rightElement.position(ctrlNode.node_x + 100, ctrlNode.node_y + 40);
      that.saveCtrlNode_clone(id.substring(0, id.length - 1), ctrlNode, ctrlNode_clone);
    });
    ctrlElement_clone.on('change:position', function (element1, position) {
      ctrlNode_clone.node_x = position.x;
      ctrlNode_clone.node_y = position.y;
      that.saveCtrlNode_clone(id.substring(0, id.length - 1), ctrlNode, ctrlNode_clone);
    });
    return ctrlElement;
  }

  drawLineList(lineList: Line[], elementList, graph, paper) {
    if (lineList == null) {
      return;
    }
    // console.log(elementList)
    for (var i = 0; i < lineList.length; i++) {
      var line = lineList[i];

      var from = line.fromNode;
      var to = line.toNode;
      var fromElement;
      var toElement;
      for (var j = 0; j < elementList.length; j++) {
        if (from.node_type + from.node_no === elementList[j].attr('root').title) {
          fromElement = elementList[j];
        } else if (to.node_type + to.node_no === elementList[j].attr('root').title) {
          toElement = elementList[j];
        } else {
        }
      }
      this.drawLine(line, fromElement, toElement, graph, paper);
    }
  }

  drawLine(line: Line, fromElement, toElement, graph, paper) {
    // console.log("drawLine")
    var link;
    // console.log('同步：' + fromElement.node_type + fromElement.node_no + ' ' + toElement.node_type + toElement.node_no)
    switch (line.line_type) {
      case 'BehOrder':
        link = new joint.shapes.standard.Link();
        link.attr({
          line: {
            stroke: 'blue',
            strokeWidth: 1,	//����
          },
          root: {
            title: line.line_type + line.line_no,
          },
        });
        link.source(fromElement);
        link.target(toElement);
        break;
      case 'BehEnable':
        link = new joint.shapes.standard.Link();
        link.attr({
          line: {
            stroke: 'red',
            strokeWidth: 1,	//����
          },
          root: {
            title: line.line_type + line.line_no,
          },
        });
        link.source(fromElement);
        link.target(toElement);
        break;
      case 'Synchrony':
        link = new joint.shapes.standard.Link();
        link.attr({
          line: {
            stroke: 'green',
            strokeWidth: 1,	//����
            targetMarker: {
              'fill': 'none',
              'stroke': 'none',
            },
          },
          root: {
            title: line.line_type + line.line_no,
          },
        });
        link.source(fromElement);
        link.target(toElement);
        break;
      case 'ExpOrder':
        link = new joint.shapes.standard.Link();
        link.attr({
          line: {
            stroke: 'orange',
            strokeWidth: 1,	//����
            strokeDasharray: '8,4'
          },
          root: {
            title: line.line_type + line.line_no,
          },
        });
        link.source(fromElement);
        link.target(toElement);
        break;
      case 'ExpEnable':
        link = new joint.shapes.standard.Link();
        link.attr({
          line: {
            stroke: 'purple',
            strokeWidth: 1,	//����
          },
          root: {
            title: line.line_type + line.line_no,
          },
        });
        link.source(fromElement);
        link.target(toElement);
        break;
    }
    // console.log(link)
    if (link != undefined) {
      if (line.fromNode.node_type == "Decision") {
        link.labels([{
          attrs: {
            text: {
              text: line.condition
            }
          }
        }]);
      }
      link.addTo(graph);
      // 在连线视图上添加连线工具
      // 1) creating link tools
      var verticesTool = new joint.linkTools.Vertices();  //在链接顶点上添加句柄
      var segmentsTool = new joint.linkTools.Segments();  //在链接段上添加句柄
      var boundaryTool = new joint.linkTools.Boundary();  //显示链接bbox

      // 2) creating a tools view
      var toolsView = new joint.dia.ToolsView({
        tools: [verticesTool, segmentsTool, boundaryTool]
      });

      // 3) attaching to a link view
      var linkView = link.findView(paper);
      // 添加工具视图到连线视图上
      linkView.addTools(toolsView);
      linkView.hideTools();
      var that = this;
      // 添加监听
      paper.on('link:pointerclick', function (linkView) {
        if (that.clickedToolView != null) {
          that.clickedToolView.hideTools();
        }
        if (that.clickedSceElement != null) {
          that.clickedSceElement.attr('body/stroke', 'black');
          that.clickedSceElement = null;
        }
        that.clickedToolView = linkView;
        linkView.showTools();
      });

      linkView.addTools(toolsView);
      return true;
    }
    return false;
  }

  drawFullSenarioGraph(fullScenarioGraph: ScenarioGraph) {
    this.project.fullScenarioGraph = fullScenarioGraph;
    var that = this;
    var elementList = [];
    var wid = $('#content3').width();
    var hei = $('#content3').height();
    this.winWidth = wid;
    this.winHeigh = hei;
    var graph = new joint.dia.Graph;
    this.graphs[2] = graph;
    console.log(this.graphs)
    var paper = new joint.dia.Paper({
      id: "content3",
      el: document.getElementById("content3"),
      width: wid,
      height: hei,
      model: graph,
      gridSize: 10,
      drawGrid: true,
      background: {
        color: 'rgb(240,255,255)'
      },
      clickThreshold: 3 //设置clickThreshold
    });
    console.log("drawFullSenarioGraph");
    this.drawIntNodeList(fullScenarioGraph.intNodeList, elementList, graph, paper.id);
    this.drawCtrlNodeList(fullScenarioGraph.ctrlNodeList, elementList, graph, paper.id);
    this.drawLineList(fullScenarioGraph.lineList, elementList, graph, paper);
    paper.on('blank:mousewheel', (event, x, y, delta) => {
      const scale = paper.scale();
      paper.scale(scale.sx + (delta * 0.01), scale.sy + (delta * 0.01));
    });
  }

  drawNewSenarioGraph(project: Project, newScenarioGraph: ScenarioGraph) {
    this.project.newScenarioGraphList = project.newScenarioGraphList;
    var that = this;
    var elementList = [];
    const id = newScenarioGraph.title + 'M';
    var sgName = newScenarioGraph.title;
    // console.log(id)
    var graph = new joint.dia.Graph;
    var paper = new joint.dia.Paper({
      id: id,
      el: document.getElementById(id),
      width: this.winWidth,
      height: this.winHeigh,
      model: graph,
      gridSize: 10,
      drawGrid: true,
      background: {
        color: 'rgb(240,255,255)'
      },
      clickThreshold: 1,
    });
    // console.log("drawNewSenarioGraph");
    this.drawIntNodeList(newScenarioGraph.intNodeList, elementList, graph, paper.id);
    this.drawCtrlNodeList(newScenarioGraph.ctrlNodeList, elementList, graph, paper.id);
    this.drawLineList(newScenarioGraph.lineList, elementList, graph, paper);
    paper.on('blank:mousewheel', (event, x, y, delta) => {
      const scale = paper.scale();
      paper.scale(scale.sx + (delta * 0.01), scale.sy + (delta * 0.01));
    });
  }

  drawNewSpd(project: Project) {
    // this.project = project;
    let subProblemDiagramList = project.subProblemDiagramList;
    for (var i = 0; i < subProblemDiagramList.length; i++) {
      this.drawSubProblemDiagram(subProblemDiagramList[i]);
      this.project.subProblemDiagramList[i] = subProblemDiagramList[i];
    }
    // for(var i = 0; i < spdList.length; i ++ ){
    //     this.drawSubProblemDiagram(spdList[i]);
    // }
  }

  drawSubProblemDiagram(subProblemDiagram: SubProblemDiagram) {
    var that = this;
    var elementList = [];
    var reqEleList = [];
    var requirement = subProblemDiagram.requirement;
    const id = subProblemDiagram.title + 'M';
    // console.log(id);
    var graph = new joint.dia.Graph;
    var paper = new joint.dia.Paper({
      id: id,
      el: document.getElementById(id),
      width: this.winWidth,
      height: this.winHeigh,
      model: graph,
      gridSize: 10,
      drawGrid: true,
      background: {
        color: 'rgb(240,255,255)'
      }
    });

    // console.log(subProblemDiagram.problemDomainList.length);
    if (subProblemDiagram.machine != null)
      this.drawMachine2(subProblemDiagram.machine, elementList, graph);
    this.drawProblemDomains(subProblemDiagram.problemDomainList, elementList, graph);
    // this.drawInterfaces(subProblemDiagram.interfaceList, elementList, graph);
    this.drawInterface2(subProblemDiagram.interfaceList, elementList, graph);
    reqEleList.push(this.drawRequirement1(requirement, graph));
    this.drawConstraints(subProblemDiagram.constraintList, elementList, reqEleList, graph);
    this.drawReferences(subProblemDiagram.referenceList, elementList, reqEleList, graph);

    paper.on('blank:mousewheel', (event, x, y, delta) => {
      const scale = paper.scale();
      paper.scale(scale.sx + (delta * 0.01), scale.sy + (delta * 0.01));
    });
    paper.on('element:pointerdblclick', function (elementView, evt, x, y) {
      that.clickedPaper = paper;
      var element = elementView.model;
      var name = element.attr('root').name;
      var title = element.attr('root').title;
      console.log(element)
      console.log(name);
      console.log(title);
      if (name === 'machine') {
        that.clickMachine = JSON.parse(JSON.stringify(subProblemDiagram.machine));
        that.sendEditMachine(subProblemDiagram.machine);
      } else {
        var domainList = subProblemDiagram.problemDomainList;
        for (var i = 0; i < domainList.length; i++) {
          console.log(domainList[i].problemdomain_name)
          if (domainList[i].problemdomain_name === title) {
            that.sendDomain(domainList[i]);
          }
        }
      }
    });
    paper.on('link:pointerdblclick', function (linkView, evt, x, y) {
      var link = linkView.model;
      var name = link.attr('root').name;
      var title = link.attr('root').title;
      var intName = link.attr('root').title;
      console.log(link)
      console.log(name);
      if (intName.split(':')[0] === 'Interface') {
        for (let inte of subProblemDiagram.interfaceList) {
          if (intName.split(':')[1] === inte.interface_name) {
            that.sendInterface(inte);
          }
        }
      }
      if (name === 'constraint') {
        for (let constraint of subProblemDiagram.constraintList) {
          if (title === constraint.constraint_name) {
            that.sendReference(constraint);
          }
        }
      } else {
        for (let reference of subProblemDiagram.referenceList) {
          if (title === reference.reference_name) {
            that.sendReference(reference);
          }
        }
      }
    })
    // change position
    graph.on('change:position', function (element, position) {
      // console.log("graph change:position")
      that.selectedElement = element;
      that.selectedType = that.selectedElement.attr('root').name;
      that.selectedId = that.selectedElement.id;
      that.changeElementPosition(position);
    });
    return paper;
  }

  // ContextDiagram
  drawContextDiagram(contextDiagram: ContextDiagram, graph) {
    console.log("====drawContextDiagram=====");
    var that = this;
    var elementList = [];
    if (contextDiagram.machine != null)
      this.drawMachine2(contextDiagram.machine, elementList, graph);
    this.drawProblemDomains(contextDiagram.problemDomainList, elementList, graph);
    this.drawInterfaces(contextDiagram.interfaceList, elementList, graph);
    /* paper.on('blank:mousewheel', (event, x, y, delta) => {
      const scale = paper.scale();
      paper.scale(scale.sx + (delta * 0.01), scale.sy + (delta * 0.01));
    }); */
  }

  //ProblemDiagram
  drawProblemDiagram(problemDiagram: ProblemDiagram, graph) {
    console.log("====drawProblemDiagram=====");
    var that = this;
    var elementList = [];
    var reqEleList = [];
    if (problemDiagram.contextDiagram.machine != null)
      this.drawMachine2(problemDiagram.contextDiagram.machine, elementList, graph);
    this.drawProblemDomains(problemDiagram.contextDiagram.problemDomainList, elementList, graph);
    this.drawInterfaces(problemDiagram.contextDiagram.interfaceList, elementList, graph);
    this.drawRequirements(problemDiagram.requirementList, reqEleList, graph);
    this.drawConstraints(problemDiagram.constraintList, elementList, reqEleList, graph);
    this.drawReferences(problemDiagram.referenceList, elementList, reqEleList, graph);
    /* paper.on('blank:mousewheel', (event, x, y, delta) => {
      const scale = paper.scale();
      paper.scale(scale.sx + (delta * 0.01), scale.sy + (delta * 0.01));
    }); */
  }

  drawContextDiagram1(contextDiagram: ContextDiagram) {
    console.log("====drawContextDiagram1=====");
    var that = this;
    var elementList = [];
    // const id = contextDiagram.title + 'M';
    var wid = $('#content1').width();
    var hei = $('#content1').height();
    this.winWidth = wid;
    this.winHeigh = hei;
    var graph = new joint.dia.Graph;
    this.graphs[0] = graph;
    var paper = new joint.dia.Paper({
      el: document.getElementById("content1"),
      width: wid,
      height: hei,
      model: graph,
      gridSize: 10,
      drawGrid: true,
      background: {
        color: 'rgb(240,255,255)'
      },
      clickThreshold: 3 //设置clickThreshold
    });
    // this.drawMachine(contextDiagram.machine, elementList, graph);
    // this.drawProblemDomain(contextDiagram.problemDomainList, elementList, graph);
    // this.drawInterface(contextDiagram.interfaceList, elementList, graph);
    if (contextDiagram.machine != null)
      this.drawMachine2(contextDiagram.machine, elementList, graph);
    this.drawProblemDomains(contextDiagram.problemDomainList, elementList, graph);
    this.drawInterfaces(contextDiagram.interfaceList, elementList, graph);

    paper.on('blank:mousewheel', (event, x, y, delta) => {
      const scale = paper.scale();
      paper.scale(scale.sx + (delta * 0.01), scale.sy + (delta * 0.01));
    });

    // paper.on('element:pointerdblclick', function (elementView, evt, x, y) {
    //   var element = elementView.model;
    //   var name = element.attr('root').title;
    //   if (name.split(':')[0] === 'machine') {
    //     that.sendMachine(that.project.contextDiagram.machine);
    //   } else {
    //     var domainList = that.project.contextDiagram.problemDomainList;
    //     for (var i = 0; i < domainList.length; i++) {
    //       if (domainList[i].problemdomain_shortname === name.split(':')[1]) {
    //         that.sendDomain(domainList[i]);
    //       }
    //     }
    //   }

    // });

    // paper.on('link:pointerdblclick', function (linkView, evt, x, y) {
    //   var link = linkView.model;
    //   var name = link.attr('root').title;
    //   if (name.split(':')[0] === 'Interface') {
    //     for (let inte of that.project.contextDiagram.interfaceList) {
    //       if (name.split(':')[1] === inte.interface_name) {
    //         that.sendInterface(inte);
    //       }
    //     }
    //   }
    // })

    // 空白处单击事件
    paper.on('blank:pointerclick', function (evt, x, y) {
      //var currentElement = elementView.model;
      //that.tab1 = x + '  ' + y;
      console.log('blank:pointerclick');
      that.drawElement(graph, evt, x, y);
    });

    // 节点单击事件
    paper.on('element:pointerclick', function (elementView, evt, x, y) {
      console.log("element:pointerclick")
      if (that.component_choice_service.link == true) {
        // that.deleteListen = false;
        ////console.log('element:pointerclick');
        if (that.link_source == undefined) {
          that.link_source = elementView.model;
          console.log('that.link_source=', that.link_source.attr('root').title)
        } else if (that.link_target == undefined) {
          that.link_target = elementView.model;
          console.log('that.link_target=', that.link_target.attr('root').title)
          if (that.link_source == that.link_target) {
            console.log('link_source==link_target=', that.link_source.attr('root').title)
            alert('The starting point and the ending point are the same, please redraw!')
            that.link_source = undefined;
            that.link_target = undefined;
          } else {
            that.drawLink(that.link_source, that.link_target, graph);
            that.link_source = undefined;
            that.link_target = undefined;
            that.component_choice_service.set_choice_false();
          }
        }
      }
      if (that.component_choice_service.merge == true) {
        // that.deleteListen = false;
        ////console.log('element:pointerclick');
        if (that.link_source == undefined) {
          that.link_source = elementView.model;
        } else if (that.link_target == undefined) {
          that.link_target = elementView.model;
          that.Merge(that.link_source, that.link_target, graph);
          that.link_source = undefined;
          that.link_target = undefined;
          that.component_choice_service.merge = false;
        }
      }
    });

    paper.on('cell:pointerclick', function (cellView, evt, x, y) {
      console.log("context cell:pointerclick")
      //prepare to delete cell
      if (that.component_choice_service.element == false && that.component_choice_service.link == false) {
        that.selectedElement = cellView.model;
        //console.log(that.selectedElement);
        that.selectedType = that.selectedElement.attr('root').name;
        that.deleteListen = true;
      }
      // highlight
      that.resetStrokeColor();
      that.clickedElement = cellView.model;
      that.changeStrokeColor();
    });

    // 双击事件
    paper.on('cell:pointerdblclick', function (elementView, evt, x, y) {
      that.deleteListen = false;
      console.log('cell:pointerdblclick');
      console.log('elementView' + elementView);
      that.selectedElement = elementView.model;
      that.selectedType = that.selectedElement.attr('root').name;
      that.selectedId = that.selectedElement.id;
      console.log('type:' + that.selectedType);
      if (that.selectedElement.isLink()) {
        //console.log('当前选中元素Id�?' + that.selectedElement.id);
        let source = that.selectedElement.source();
        let target = that.selectedElement.target();
        //that.selectedLinkSource = that.getPointName(sourceId);
        //that.selectedLinkTarget = that.getPointName(targetId);
        ////console.log('that.selectedLinkSource:' + that.selectedLinkSource);
        ////console.log('that.selectedLinkTarget:' + that.selectedLinkTarget);
      }
      //console.log('type:' + that.selectedType);
      // var popBox = document.getElementById(that.selectedType + 'PopBox');
      // //console.log('selectedType:' + that.selectedType);
      // popBox.style.display = "block";
      // var popLayer = document.getElementById("popLayer");
      // popLayer.style.display = "block";
      // that.initPopBox();
      if(that.selectedType == 'interface'){
        if(that.step >= 7){
          var popBox = document.getElementById(that.selectedType + 'PopBox');
      //console.log('selectedType:' + that.selectedType);
          popBox.style.display = "block";
          var popLayer = document.getElementById("popLayer");
          popLayer.style.display = "block";
          that.initPopBox();
        }
      }else{
        var popBox = document.getElementById(that.selectedType + 'PopBox');
      //console.log('selectedType:' + that.selectedType);
        popBox.style.display = "block";
        var popLayer = document.getElementById("popLayer");
        popLayer.style.display = "block";
        that.initPopBox();
      }
    });
    //initPopBox(element){}

    // 右击事件
    paper.on('cell:contextmenu', function (elementView, evt, x, y) {
      that.deleteListen = false;
      that.selectedElement = elementView.model;
      that.selectedType = that.selectedElement.attr('root').name;
      that.selectedId = that.selectedElement.id;
      //this.GetObj('delete').style.display = 'block';
      ////console.log('type:' + that.selectedType +',Id:'+ that.selectedId);
      //alert('element:contextmenu');
      //that.deleteElement(that.graphs[i]);
      //that.deletePopBox(that.graphs[i],x,y);
    });
    // change position
    graph.on('change:position', function (element, position) {
      // console.log("graph change:position")
      that.selectedElement = element;
      that.selectedType = that.selectedElement.attr('root').name;
      that.selectedId = that.selectedElement.id;
      that.changeElementPosition(position);
    });
    return paper;
  }

  drawProblemDiagram1(problemDiagram: ProblemDiagram) {
    console.log("=====drawProblemDiagram1=====")
    var that = this;
    var elementList = [];
    var reqEleList = [];
    // const id = problemDiagram.title + 'M';
    var graph = new joint.dia.Graph;
    this.graphs[1] = graph;
    var paper = new joint.dia.Paper({
      el: document.getElementById("content2"),
      width: this.winWidth,
      height: this.winHeigh,
      model: graph,
      gridSize: 10,
      drawGrid: true,
      background: {
        color: 'rgb(240,255,255)'
      }
    });
    // this.drawMachine(problemDiagram.contextDiagram.machine, elementList, graph);
    // this.drawProblemDomain(problemDiagram.contextDiagram.problemDomainList, elementList, graph);
    // this.drawInterface(problemDiagram.contextDiagram.interfaceList, elementList, graph);
    // this.drawRequirements(problemDiagram.requirementList, reqEleList, graph);
    // this.drawConstraints(problemDiagram.constraintList, elementList, reqEleList, graph);
    // this.drawReferences(problemDiagram.referenceList, elementList, reqEleList, graph);
    if (problemDiagram.contextDiagram.machine != null)
      this.drawMachine2(problemDiagram.contextDiagram.machine, elementList, graph);
    this.drawProblemDomains(problemDiagram.contextDiagram.problemDomainList, elementList, graph);
    this.drawInterfaces(problemDiagram.contextDiagram.interfaceList, elementList, graph);
    this.drawRequirements(problemDiagram.requirementList, reqEleList, graph);
    this.drawConstraints(problemDiagram.constraintList, elementList, reqEleList, graph);
    this.drawReferences(problemDiagram.referenceList, elementList, reqEleList, graph);
    paper.on('blank:mousewheel', (event, x, y, delta) => {
      const scale = paper.scale();
      paper.scale(scale.sx + (delta * 0.01), scale.sy + (delta * 0.01));
    });

    // paper.on('element:pointerdblclick', function (elementView, evt, x, y) {
    //   var element = elementView.model;
    //   var name = element.attr('root').title;
    //   if (name.split(':')[0] === 'machine') {
    //     that.sendMachine(that.project.contextDiagram.machine);
    //   } else {
    //     var domainList = that.project.contextDiagram.problemDomainList;
    //     for (var i = 0; i < domainList.length; i++) {
    //       if (domainList[i].problemdomain_shortname === name.split(':')[1]) {
    //         that.sendDomain(domainList[i]);
    //       }
    //     }
    //   }

    // });

    // paper.on('link:pointerdblclick', function (linkView, evt, x, y) {
    //   var link = linkView.model;
    //   var name = link.attr('root').title;
    //   if (name.split(':')[0] === 'Interface') {
    //     for (let inte of that.project.contextDiagram.interfaceList) {
    //       if (name.split(':')[1] === inte.interface_name) {
    //         that.sendInterface(inte);
    //       }
    //     }
    //   } else if (name.split(':')[0] === 'Constraint') {
    //     for (let constraint of that.project.problemDiagram.constraintList) {
    //       if (name.split(':')[1] === constraint.constraint_name) {
    //         that.sendReference(constraint);
    //       }
    //     }
    //   } else {
    //     for (let reference of that.project.problemDiagram.referenceList) {
    //       if (name.split(':')[1] === reference.reference_name) {
    //         that.sendReference(reference);
    //       }
    //     }
    //   }
    // })

    // 空白处单击事件
    paper.on('blank:pointerclick', function (evt, x, y) {
      //var currentElement = elementView.model;
      //that.tab1 = x + '  ' + y;
      console.log('blank:pointerclick');
      that.drawElement(graph, evt, x, y);
    });

    // 节点单击事件
    paper.on('element:pointerclick', function (elementView, evt, x, y) {
      if (that.component_choice_service.link == true) {
        // that.deleteListen = false;
        ////console.log('element:pointerclick');
        if (that.link_source == undefined) {
          that.link_source = elementView.model;
          console.log('that.link_source=', that.link_source.attr('root').title)
        } else if (that.link_target == undefined) {
          that.link_target = elementView.model;
          console.log('that.link_target=', that.link_target.attr('root').title)
          if (that.link_source == that.link_target) {
            console.log('link_source==link_target=', that.link_source.attr('root').title)
            alert('The starting point and the ending point are the same, please redraw!')
            that.link_source = undefined;
            that.link_target = undefined;
          } else {
            that.drawLink(that.link_source, that.link_target, graph);
            that.link_source = undefined;
            that.link_target = undefined;
            that.component_choice_service.set_choice_false();
          }
        }
      }
      if (that.component_choice_service.merge == true) {
        // that.deleteListen = false;
        ////console.log('element:pointerclick');
        if (that.link_source == undefined) {
          that.link_source = elementView.model;
        } else if (that.link_target == undefined) {
          that.link_target = elementView.model;
          that.Merge(that.link_source, that.link_target, graph);
          that.link_source = undefined;
          that.link_target = undefined;
          that.component_choice_service.merge = false;
        }
      }
    });

    paper.on('cell:pointerclick', function (cellView, evt, x, y) {
      console.log("problem cell:pointerclick")
      //prepare to delete cell
      if (that.component_choice_service.element == false && that.component_choice_service.link == false) {
        that.selectedElement = cellView.model;
        //console.log(that.selectedElement);
        that.selectedType = that.selectedElement.attr('root').name;
        that.deleteListen = true;
      }
      // highlight
      that.resetStrokeColor();
      that.clickedElement = cellView.model;
      that.changeStrokeColor();
    });

    // 双击事件
    paper.on('cell:pointerdblclick', function (elementView, evt, x, y) {
      that.deleteListen = false;
      console.log('element:pointerdblclick');
      console.log('elementView' + elementView);
      that.selectedElement = elementView.model;
      that.selectedType = that.selectedElement.attr('root').name;
      that.selectedId = that.selectedElement.id;
      console.log('type:' + that.selectedType);
      console.log('id:' + that.selectedId);
      if (that.selectedElement.isLink()) {
        //console.log('当前选中元素Id�?' + that.selectedElement.id);
        let source = that.selectedElement.source();
        let target = that.selectedElement.target();
        //that.selectedLinkSource = that.getPointName(sourceId);
        //that.selectedLinkTarget = that.getPointName(targetId);
        console.log('that.selectedLinkSource:' + that.selectedLinkSource);
        console.log('that.selectedLinkTarget:' + that.selectedLinkTarget);
      }
      //console.log('type:' + that.selectedType);
      // var popBox = document.getElementById(that.selectedType + 'PopBox');
      // //console.log('selectedType:' + that.selectedType);
      // popBox.style.display = "block";
      // var popLayer = document.getElementById("popLayer");
      // popLayer.style.display = "block";
      // that.initPopBox();  
      if(that.selectedType == 'interface'){
        if(that.step >= 7){
          var popBox = document.getElementById(that.selectedType + 'PopBox');
      //console.log('selectedType:' + that.selectedType);
          popBox.style.display = "block";
          var popLayer = document.getElementById("popLayer");
          popLayer.style.display = "block";
          that.initPopBox();
        }
      }else{
        var popBox = document.getElementById(that.selectedType + 'PopBox');
      //console.log('selectedType:' + that.selectedType);
        popBox.style.display = "block";
        var popLayer = document.getElementById("popLayer");
        popLayer.style.display = "block";
        that.initPopBox();
      }
    });
    //initPopBox(element){}

    // 右击事件
    paper.on('cell:contextmenu', function (elementView, evt, x, y) {
      that.deleteListen = false;
      that.selectedElement = elementView.model;
      that.selectedType = that.selectedElement.attr('root').name;
      that.selectedId = that.selectedElement.id;
      //this.GetObj('delete').style.display = 'block';
      ////console.log('type:' + that.selectedType +',Id:'+ that.selectedId);
      //alert('element:contextmenu');
      //that.deleteElement(that.graphs[i]);
      //that.deletePopBox(that.graphs[i],x,y);
    });
    // change position
    graph.on('change:position', function (element, position) {
      that.selectedElement = element;
      that.selectedType = that.selectedElement.attr('root').name;
      that.selectedId = that.selectedElement.id;
      that.changeElementPosition(position);
    });
    return paper;
  }

  //Cell
  drawElement(graph, event, x, y) {
    if (this.component_choice_service.element == true) {
      if (this.component_choice_service.domain == true) {
        this.drawProblemDomain(x, y, graph);
        this.component_choice_service.domain = false;
      } else if (this.component_choice_service.machine == true) {
        this.drawMachine(x, y, graph);
        this.component_choice_service.machine = false;
      } else if (this.component_choice_service.req == true) {
        this.drawRequirement(x, y, graph);
        this.component_choice_service.req = false;
      }
      this.component_choice_service.element = false;
    }
  }
  deleteElement(graph) {
    //console.log('deleteElement!!!');
    //console.log('selectedType' + this.selectedType);
    if (this.selectedType == 'machine') {
      this.deleteMachine(graph);
    } else if (this.selectedType == 'problemDomain') {
      this.deleteProblemDomain(graph);
    } else if (this.selectedType == 'requirement') {
      this.deleteRequirement(graph);
    } else if (this.selectedType == 'interface') {
      //console.log('deleteElement');
      this.deleteInterface(graph);
    } else if (this.selectedType == 'constraint') {
      this.deleteConstraint(graph);
    } else if (this.selectedType == 'reference') {
      this.deleteReference(graph);
    } else {
      //console.log('this.selectedType:' + this.selectedType);
    }
    //console.log(this.project);
  }
  getElementById(id) {
    for (const ele of this.graphs[this.selectedGraphIndex].getElements()) {
      if (ele.id == id)
        return ele
      //console.log('-------------',id,'!=',ele.id,'-----------')
    }
    return null
  }
  changeElementPosition(position) {
    // console.log("changeElementPosition")
    // let name = this.selectedElement.attr('label').title
    let name = this.selectedElement.attr('root').title;
    let type = this.selectedElement.attr('root').name;
    // console.log(this.selectedElement)
    // console.log(name)
    // console.log(type)
    // var that = this;
    if (type == "machine") {
      // if (this.project.changeMachinePosition(name, position)){
      //   console.log(this.project)
      //   return
      // }
      // this.project.changeMachinePositionNew(name, position);
      this.project.changeMachinePositionNew(name, position);
      // console.log(this.project.changeMachinePosition(name, position))
      // console.log(this.project)
      return
    } else if (type == "problemDomain") {
      var tmpProject = new Project();
      tmpProject.initProject(this.project);
      tmpProject.changeProblemDomainPosition(name, position);
      this.project = tmpProject;
      //this.project.changeProblemDomainPosition(name, position);
      return;
    } else {
      this.project.changeRequirementPosition(name, position);
      return;
    }
  }

  deleteSceElement() {
    var id = this.clickedPaper.id;
    var sgName = id.substring(0, id.length - 1);
    var clickNode = this.getNode(sgName, this.clickedSceElement);
    this.clickedPaper.model.removeCells(this.clickedSceElement);
    // for(var i = 0; i < this.textElementList.length; i++){
    //     if(this.textElementList[i].attr('root').id === id){
    //         if(this.textElementList[i].attr('root').title === (this.clickedSceElement.attr('root').title + 'text')
    //             || this.textElementList[i].attr('root').title === (this.clickedSceElement.attr('root').title + 'condition1')
    //             || this.textElementList[i].attr('root').title === (this.clickedSceElement.attr('root').title + 'condition2')){
    //                 console.log(this.textElementList[i].attr('root').id);
    //         this.clickedPaper.model.removeCells(this.textElementList[i]);
    //         this.textElementList = this.textElementList.filter(element => element !== this.textElementList[i]);
    //         }
    //     }
    // }
    var deleteCells = [];
    for (let nodeElement of this.clickedPaper.model.getCells()) {
      if (nodeElement.attr('root').title === (this.clickedSceElement.attr('root').title + 'text')
        || nodeElement.attr('root').title === (this.clickedSceElement.attr('root').title + 'condition1')
        || nodeElement.attr('root').title === (this.clickedSceElement.attr('root').title + 'condition2')) {
        deleteCells.push(nodeElement);
      }
    }
    this.clickedPaper.model.removeCells(deleteCells);
    var sgList = this.project.scenarioGraphList;
    var sg: ScenarioGraph;
    for (var i = 0; i < sgList.length; i++) {
      if (sgList[i].title === sgName) {
        sg = sgList[i];
      }
    }
    this.projectService.deleteNode(sg, clickNode);
    this.clickedSceElement = undefined;
    this.source = undefined;
    this.target = undefined;
  }

  deleteLink() {
    var id = this.clickedPaper.id;
    var sgName = id.substring(0, id.length - 1);
    this.clickedPaper.model.removeCells(this.clickedLink);
    var sgList = this.project.scenarioGraphList;
    var sg: ScenarioGraph;
    for (var i = 0; i < sgList.length; i++) {
      if (sgList[i].title === sgName) {
        sg = sgList[i];
      }
    }
    this.projectService.deleteLine(sg, this.clickedLink.attr('root').title);
    this.clickedLink = undefined;
  }

  //=================================Machine=============================
  drawMachine2(machine: Machine, elementList, graph) {
    let machineElement = this.drawMachineOnGraph(machine, graph)
    elementList.push(machineElement)
  }
  //画图并修改project
  drawMachinews(machine: Machine) {
    this.project.problemDiagram.contextDiagram.machine = machine
    this.project.contextDiagram.machine = machine
    for (let graph of this.graphs) {
      this.drawMachineOnGraph(machine, graph)
    }
  }
  //鼠标点击画图，画图并添加machine
  drawMachine(x, y, graph) {
    if (this.project.contextDiagram.machine == undefined) {
      // let machine = this.project.addMachine('machine', 'M', x, y,100,50)
      // let element = this.drawMachineOnGraph(machine, graph);
      // this.projectService.sendProject(this.project);
      let machine = Machine.newMachine('machine', 'M', x, y, 100, 50)
      // this.change("add", "mac", null, machine)
      this.sendChangeShapeMessage("add", "mac", null, machine);
      
      // return element;
    } else {
      alert('machine already exist!');
    }

  }
  //在特定画板画图
  drawMachineOnGraph(machine: Machine, graph) {
    console.log("drawMachineOnGraph")
    var MachineElement = joint.dia.Element.define('examples.CustomTextElement', {
      attrs: {
        label: {
          textAnchor: 'middle',	//???????
          textVerticalAnchor: 'middle',
          fontSize: 25,
        },
        r: {
          strokeWidth: 1,	//????
          stroke: '#000000',	//???
          fill: 'rgb(240,255,255)',
        },
        r1: {
          strokeWidth: 1,
          stroke: '#000000',
          fill: 'rgb(240,255,255)',

        },
        r2: {
          strokeWidth: 1,
          stroke: '#000000',
          fill: 'rgb(240,255,255)',
        },
      }
    }, {
      markup: [{
        tagName: 'rect',
        selector: 'r'
      }, {
        tagName: 'rect',
        selector: 'r1'
      }, {
        tagName: 'rect',
        selector: 'r2'
      }, {
        tagName: 'text',
        selector: 'label'
      }]
    });

    var machineElement = new MachineElement();
    machineElement.attr(
      {
        label: {
          text: machine.machine_name + '\n(' + machine.machine_shortName + ')',
          // x: machine.machine_x,
          // y: machine.machine_y,
        },
        r: {
          ref: 'label',
          text: 'rrrrrrrrrrrrrrrrrrrrr',
          refX: -35,	//???????
          refY: 0,
          x: 0,	//???��??
          y: 0,

          refWidth: 45,	//??��?��
          refHeight: '120%',
        },
        r1: {
          ref: 'label',
          text: '111111111111',
          refX: -20,
          refY: 0,
          x: 0,
          y: 0,
          refWidth: 30,
          refHeight: '120%',
        },
        r2: {
          text: '2222222222',
          ref: 'label',
          refX: -5,
          refY: 0,
          x: 0,
          y: 0,
          refWidth: 15,
          refHeight: '120%',
        },
        root: {
          name: 'machine',
          title: machine.machine_name,
          shortName: machine.machine_shortName,
        }
      });
    machineElement.position(machine.machine_x, machine.machine_y);
    machineElement.addTo(graph);
    return machineElement;
  }
  initMachinePopBox() {
    this.machine = this.project.contextDiagram.machine;
    let selectedDiv = document.getElementById('machinePopBox');
    (selectedDiv.getElementsByClassName("description")[0] as any).value = this.machine.machine_name;
    (selectedDiv.getElementsByClassName("shortName")[0] as any).value = this.machine.machine_shortName;
  }
  //修改Machine信息，仅向服务器发送消息
  changeMachineDetail() {
    let selectedDiv = document.getElementById('machinePopBox');
    let description = (selectedDiv.getElementsByClassName("description")[0] as any).value;
    let shortName = (selectedDiv.getElementsByClassName("shortName")[0] as any).value;
    //this.changeRelatedLink(this.project.contextDiagram.machine.machine_shortName,shortName);
    //this.changeMachineOnGraph(this.selectedElement, description, shortName);
    for (let existedProblemDomain of this.project.contextDiagram.problemDomainList) {
      if (existedProblemDomain.problemdomain_name == description) {
        alert(description + 'already exist!');
        return false;
      }
      if (existedProblemDomain.problemdomain_shortname == shortName) {
        alert(shortName + 'already exist!');
        return false;
      }
    }
    let old = this.project.contextDiagram.machine
    console.log(old)
    //let machine = this.project.changeMachine(description, shortName)
    let machine = Machine.newMachineWithOld(old, description, shortName)
    // this.projectService.sendProject(this.project)
    this.sendChangeShapeMessage("change", "mac", old, machine);
    // this.change("change", "mac", old, machine)
    return true;
  }
  changeMachinews(old: Machine, new1: Machine) {
    this.changeRelatedLink(old.machine_shortName, new1.machine_shortName);
    this.changeMachineOnGraph(new1.machine_name, new1.machine_shortName);
    var tmpProject = new Project();
    tmpProject.initProject(this.project);
    tmpProject.changeMachine(new1.machine_name, new1.machine_shortName);
    //this.project.changeMachine(new1.machine_name, new1.machine_shortName);
    this.project = tmpProject;
    console.log(this.project.changeMachine(new1.machine_name, new1.machine_shortName));
    console.log(this.project);
    this.projectService.sendProject(this.project);
    return true;
  }
  changeMachineOnGraph(name, shortName) {
    for (let graph of this.graphs) {
      for (let element of graph.getCells()) {
        if (element.attr("root").name == "machine") {
          element.attr({
            root: {
              title: name,
              name: "machine",
              shortName: shortName
            },
            label: { text: name + '\n(' + shortName + ')' }
          });
          break;
        }
      }
    }
  }
  deleteMachinews(old: Machine) {
    this.project.deleteRelatedLink(this.project.contextDiagram.machine.machine_shortName,this.delete_link,this.delete_phe)
    this.project.contextDiagram.machine = undefined;
    this.project.problemDiagram.contextDiagram.machine = undefined;
    this.projectService.sendProject(this.project)

    for (let graph of this.graphs) {
      for (let element of graph.getCells()) {
        if (old.machine_shortName == element.attr('root').shortName)
          graph.removeCells([element])
      }
    }
  }
  deleteMachine(graph) {
    console.log("==========deleteRelatedLink========")
    console.log(this.project)
    // this.project.deleteRelatedLink(this.project.contextDiagram.machine.machine_shortName)
    let old = this.project.contextDiagram.machine
    // this.project.contextDiagram.machine = undefined;
    // this.project.problemDiagram.contextDiagram.machine = undefined;
    // graph.removeCells([this.selectedElement])
    // this.projectService.sendProject(this.project)
    this.sendChangeShapeMessage("delete", "mac", old, null);
    // this.change("delete", "mac", old, null)
  }

  //============================================Domain===============================================
  drawProblemDomains(problemDomainList: ProblemDomain[], elementList, graph): void {
    console.log("---drawProblemDomains------")
    for (let i = 0; i < problemDomainList.length; i++) {
      var element;
      let problemDomain = problemDomainList[i];
      console.log(problemDomain)
      if (problemDomain.problemdomain_type === 'Data Storage') {
        element = this.drawDesignDomain(problemDomain, graph);
      } else {
        element = this.drawGivenDomain(problemDomain, graph);
      }
      elementList.push(element);
    }
  }
  drawProblemDomainws(problemDomain: ProblemDomain) {
    console.log("---drawProblemDomainws------",problemDomain)
    // this.project.contextDiagram.problemDomainList.push(problemDomain);
    let fg = false;
    if(this.project.contextDiagram.problemDomainList != null){
      for(let pros of this.project.contextDiagram.problemDomainList){
        if(pros.problemdomain_name == problemDomain.problemdomain_name || pros.problemdomain_shortname == problemDomain.problemdomain_shortname){
          fg = true;
        }
      }
    }
    if(!fg){
      this.project.contextDiagram.problemDomainList.push(problemDomain);
    }
    for (let graph of this.graphs) {
      if (problemDomain.problemdomain_type === 'Data Storage') {
        this.drawDesignDomain(problemDomain, graph);
      } else {
        this.drawGivenDomain(problemDomain, graph);
      }
    }
  }
  drawProblemDomain(x, y, graph) {
    let no, name, shortName
    while (true) {
      no = this.problemdomain_no;
      this.problemdomain_no += 1;
      name = 'problemDomain' + no;
      shortName = 'PD' + no;
      let conflicting_name = false;
      for (let pdi of this.project.contextDiagram.problemDomainList) {
        if (pdi.problemdomain_name == name || pdi.problemdomain_shortname == shortName) {
          conflicting_name = true
        }
      }
      if (!conflicting_name) {
        break;
      }
    }

    // let pd = this.project.addProblemDomain(no, name, shortName, 'Causal', 'GivenDomain', x, y,100,50);
    //let element = this.drawGivenDomain(pd, graph);
    // this.projectService.sendProject(this.project);
    // let pd = ProblemDomain.newProblemDomain(no, name, shortName, 'Causal', 'Clock', x, y, 100, 50)
    let pd = ProblemDomain.newProblemDomain(no, name, shortName,'Clock', x, y, 100, 50)
    this.sendChangeShapeMessage("add", "pro", null, pd);
    // this.change("add", "pro", null, pd)
    // return element;
  }
  drawDesignDomain(designDomain: ProblemDomain, graph) {
    console.log("---drawDesignDomain------")
    let element = this.drawGivenDomain(designDomain, graph);
    element.attr('r/refX', '-15');
    element.attr('r/refWidth', '20');
    return element;

  }
  drawGivenDomain(givenDomain: ProblemDomain, graph) {
    // console.log("drawGivenDomain")
    console.log("---drawGivenDomain------")
    var GivenElement = joint.dia.Element.define('DesignDomain', {
      attrs: {
        label: {
          textAnchor: 'middle',	//???????
          textVerticalAnchor: 'middle',
          fontSize: 25,
        },
        r: {
          strokeWidth: 1,	//????
          stroke: '#000000',	//???
          fill: 'rgb(240,255,255)',
        },
        r1: {
          strokeWidth: 1,
          stroke: '#000000',
          fill: 'rgb(240,255,255)',
        },
      }
    }, {
      markup: [{
        tagName: 'rect',
        selector: 'r'
      }, {
        tagName: 'rect',
        selector: 'r1'
      }, {
        tagName: 'text',
        selector: 'label'
      }]
    });

    var givenElement = new GivenElement();
    givenElement.attr({
      label: {
        text: givenDomain.problemdomain_name + '\n(' + givenDomain.problemdomain_shortname + ')',
      },
      r: {
        ref: 'label',
        refX: -5,	//???????
        refY: -5,
        x: 0,	//???��??
        y: 0,
        refWidth: 10,	//??��?��
        refHeight: 10,
      },
      r1: {
        ref: 'label',
        refX: -5,
        refY: -5,
        x: 0,
        y: 0,
        refWidth: 10,
        refHeight: 10,
      },
      root: {
        name: 'problemDomain',
        title: givenDomain.problemdomain_name,
        shortName: givenDomain.problemdomain_shortname,
      }
    });
    givenElement.position(givenDomain.problemdomain_x, givenDomain.problemdomain_y);
    givenElement.addTo(graph);
    return givenElement;
  }

  initDomainPopBox() {
    // console.log('initDomainPopBox:');
    for (let item of this.project.contextDiagram.problemDomainList) {
      let name = this.selectedElement.attr('root').title;
      if (item.problemdomain_name == name) {
        this.problemDomain = item;
        break;
      }
    }
    console.log(this.problemDomain);
    let selectedDiv = document.getElementById('problemDomainPopBox');
    (selectedDiv.getElementsByClassName("description")[0] as any).value = this.problemDomain.problemdomain_name;
    (selectedDiv.getElementsByClassName("shortName")[0] as any).value = this.problemDomain.problemdomain_shortname;
    // for (let i = 0; i < 2; i++) {
    //   let property = this.PhysicalPropertys[i];
    //   if (property == this.problemDomain.problemdomain_property) {
    //     (selectedDiv.getElementsByClassName("physicalProperty")[0] as any).selectedIndex = i;
    //   }
    // }
    for (let i = 0; i < 6; i++) {
      let domainType = this.SampleDomainTypes[i];
      if (domainType == this.problemDomain.problemdomain_type) {
        (selectedDiv.getElementsByClassName("domainType")[0] as any).selectedIndex = i;
      }
    }
  }
  changeProblemDomainDetail(graph) {
    //console.log('changeProblemDomainDetail:');
    let selectedDiv = document.getElementById('problemDomainPopBox');
    //description
    let description = (selectedDiv.getElementsByClassName("description")[0] as any).value;
    if(description == this.project.contextDiagram.machine.machine_name){
      alert(description + ' already exist!');
        return false;
    }
    for (let existedProblemDomain of this.project.contextDiagram.problemDomainList) {
      if (existedProblemDomain.problemdomain_name == description &&
        existedProblemDomain.problemdomain_name != this.problemDomain.problemdomain_name) {
        alert(description + ' already exist!');
        return false;
      }
    }

    //shortName
    let shortName = (selectedDiv.getElementsByClassName("shortName")[0] as any).value;
    if(shortName == this.project.contextDiagram.machine.machine_shortName){
      alert(shortName + ' already exist!');
        return false;
    }
    for (let existedProblemDomain of this.project.contextDiagram.problemDomainList) {
      if (existedProblemDomain.problemdomain_shortname == shortName &&
        existedProblemDomain.problemdomain_shortname != this.problemDomain.problemdomain_shortname) {
        alert(shortName + ' already exist!');
        return false;
      }
    }
    //domainType
    let selectElement = selectedDiv.getElementsByClassName("domainType")[0];
    let selectedIndex = (selectElement as any).selectedIndex;
    let domainType = this.DomainTypes[selectedIndex];

    // //physical Property
    // selectElement = selectedDiv.getElementsByClassName("physicalProperty")[0];
    // selectedIndex = (selectElement as any).selectedIndex;
    // let physicalProperty = this.PhysicalPropertys[selectedIndex];

    //console.log(description, shortName, physicalProperty);
    // this.changeRelatedLink(this.problemDomain.problemdomain_shortname,shortName)
    let old = this.problemDomain
    // let pd = this.changeProblemDomainEntity(description, shortName, domainType, physicalProperty)
    // let pd = ProblemDomain.newProblemDomainWithOld(old, description, shortName, domainType, physicalProperty)
    let pd = ProblemDomain.newProblemDomainWithOld(old, description, shortName, domainType,)
    // this.changeProblemDomainOnGraph(this.problemDomain, this.selectedElement)

    // this.projectService.sendProject(this.project)
    this.sendChangeShapeMessage("change", "pro", old, pd);
    // this.change("change", "pro", old, pd)
    return true;
  }
  changeProblemDomainws(old: ProblemDomain, new1: ProblemDomain) {
    old = ProblemDomain.copyProblemDomain(old);
    new1 = ProblemDomain.copyProblemDomain(new1);
    this.changeRelatedLink(old.problemdomain_shortname, new1.problemdomain_shortname);
    var tmpProject = new Project();
    tmpProject.initProject(this.project);
    tmpProject.changeProblemDomain1(old, new1);
    //this.project.changeProblemDomain1(old, new1);
    this.project = tmpProject;
    this.projectService.sendProject(this.project);
    this.changeProblemDomainOnGraph1(old, new1);
    return true
  }
  changeProblemDomainOnGraph1(old: ProblemDomain, new1: ProblemDomain) {
    for (let graph of this.graphs) {
      for (let element of graph.getElements()) {
        if (element.attr('root').title == old.problemdomain_name) {
          this.changeProblemDomainOnGraph(new1, element)
          break
        }
      }
    }
  }
  changeProblemDomainOnGraph(domainEntity: ProblemDomain, domainElement) {
    console.log("=======changeProblemDomainOnGraph=========")
    console.log(domainEntity, domainEntity.problemdomain_shortname)
    domainElement.attr({
      label: {
        text: domainEntity.problemdomain_name + '\n(' + domainEntity.problemdomain_shortname + ')',
      },
      root: {
        name: 'problemDomain',
        title: domainEntity.problemdomain_name,
        shortName: domainEntity.problemdomain_shortname,
      }
    });
    if (domainEntity.problemdomain_type === 'Data Storage') {
      this.change2DesignDomain(domainElement);
    } else {
      this.change2GivenDomain(domainElement);
    }
  }
  change2DesignDomain(element) {
    element.attr('r/refX', '-15');
    element.attr('r/refWidth', '20');
  }
  change2GivenDomain(element) {
    element.attr('r/refX', '-5');
    element.attr('r/refWidth', '10');
  }

  // changeProblemDomainEntity(name, shortName, type, property) {
  //   this.problemDomain.problemdomain_name = name;
  //   this.problemDomain.problemdomain_shortname = shortName;
  //   this.problemDomain.problemdomain_type = type;
  //   this.problemDomain.problemdomain_property = property;
  //   return this.problemDomain
  //   //console.log(this.project.contextDiagram.problemDomainList);
  // }
  changeProblemDomainEntity(name, shortName, type) {
    this.problemDomain.problemdomain_name = name;
    this.problemDomain.problemdomain_shortname = shortName;
    this.problemDomain.problemdomain_type = type;
    return this.problemDomain
    //console.log(this.project.contextDiagram.problemDomainList);
  }
  deleteProblemDomain(graph) {
    let name = this.selectedElement.attr('root').title;
    let shortName = this.selectedElement.attr('root').shortName;
    let list = this.project.contextDiagram.problemDomainList
    // this.project.deleteRelatedLink(shortName)
    //find old Entity
    let i = 0;
    let old
    for (let item of list) {
      if (item.problemdomain_name == name) {
        old = item
        // list.splice(i, 1);
        break;
      }
      i++;
    }
    //console.log('name=' + name);
    // graph.removeCells([this.selectedElement])
    // this.projectService.sendProject(this.project);
    this.sendChangeShapeMessage("delete", "pro", old, null);
    // this.change("delete", "pro", old, null)
  }
  deleteProblemDomainws(pd1: ProblemDomain) {
    let pd = ProblemDomain.copyProblemDomain(pd1)
    let name = pd.problemdomain_name
    let shortName = pd.problemdomain_shortname
    let list = this.project.contextDiagram.problemDomainList
    //delete Entity
    let i = 0;
    for (let item of list) {
      if (item.problemdomain_name == name) {
        list.splice(i, 1);
        break;
      }
      i++;
    }
    console.log('deleteProblemDomainws的this指向：', this);
    console.log('deleteProblemDomainws中的this.project:', this.project);
    //console.log('name=' + name);
    for (let graph of this.graphs) {
      var tmpProject = new Project();
      tmpProject.initProject(this.project);
      tmpProject.deleteRelatedLink(shortName,this.delete_link,this.delete_phe);
      this.project = tmpProject;
      //this.project.deleteRelatedLink(shortName)
      for (let element of graph.getCells()) {
        if (shortName == element.attr('root').shortName)
          graph.removeCells([element])
      }
    }
    this.projectService.sendProject(this.project);
  }

  //=====================================Requirement==========================
  drawRequirements(requirementList: Requirement[], reqEleList, graph: joint.dia.Graph) {
    //console.log('problemDiagram.requirementList:');
    for (var i = 0; i < requirementList.length; i++) {
      var requirement = requirementList[i];
      var requirementElement = this.drawRequirement1(requirement, graph);
      reqEleList.push(requirementElement);
    }
  }
  drawRequirementws(req1) {
    let req = Requirement.copyRequirement(req1)
    this.project.problemDiagram.requirementList.push(req)
    this.project.addScenarioGraph(req);
    this.drawRequirement1(req, this.graphs[1]);

  }
  //手动画，只发送消息
  drawRequirement(x, y, graph) {
    let no
    let name
    // while (true) {
    //   no = this.requirement_no;
    //   this.requirement_no += 1;
    //   name = 'requirement' + no;
    //   let conflicting_name = false;
    //   for (let reqi of this.project.problemDiagram.requirementList) {
    //     if (reqi.requirement_context == name) {
    //       conflicting_name = true
    //     }
    //   }
    //   if (!conflicting_name) {
    //     break;
    //   }
    // }
    console.log("drawRequirement:");
    no = this.getreqno();
    name = 'requirement' + no;
    // let req = this.project.addRequirement(no, name, x, y,100,50)
    let req = Requirement.newRequirement(no, name, x, y, 100, 50)
    // let element = this.drawRequirement1(req, graph);
    // this.projectService.sendProject(this.project);
    this.sendChangeShapeMessage("add", "req", null, req);
    // this.change("add", "req", null, req)
    // return element;
  }
  drawRequirement1(requirement: Requirement, graph) {
    // console.log("drawRequirement1")
    //console.log(requirement.requirement_x, requirement.requirement_y);
    let requirementElement = new joint.shapes.standard.Ellipse();
    requirementElement.attr({
      root: {
        name: 'requirement',
        title: requirement.requirement_context,
        shortName: requirement.requirement_context,
      },
      label: {
        text: requirement.requirement_context,
        fontSize: 25,
        textAnchor: 'middle',	//???????
        textVerticalAnchor: 'middle',
      },
      body: {
        ref: 'label',
        refX: 0,
        refY: 0,
        refRx: '60%',
        refRy: '70%',
        refCx: '50%',
        refCy: '50%',
        fill: 'rgb(240,255,255)',
        strokeWidth: 1,
        strokeDasharray: '8,4'
      }
    });
    requirementElement.position(requirement.requirement_x, requirement.requirement_y);
    requirementElement.addTo(graph);
    return requirementElement;
  }

  initRequirementPopBox() {
    for (let item of this.project.problemDiagram.requirementList) {
      if (item.requirement_context == this.selectedElement.attr('label').text) {
        this.requirement = item;
      }
    }
    let selectedDiv = document.getElementById('requirementPopBox');
    (selectedDiv.getElementsByClassName("description")[0] as any).value = this.requirement.requirement_context;
    (selectedDiv.getElementsByClassName("shortName")[0] as any).value = this.requirement.requirement_shortname;
  }
  //手动修改，只发送消息
  changeRequirementDetail(graph) {
    let selectedDiv = document.getElementById('requirementPopBox');
    let description = (selectedDiv.getElementsByClassName("description")[0] as any).value;
    let shortname = (selectedDiv.getElementsByClassName("shortName")[0] as any).value;
    for (let existedRq of this.project.problemDiagram.requirementList) {
      if ((existedRq as any).requirement_context == description &&
        existedRq.requirement_context != this.requirement.requirement_context) {
        alert(description + 'already exist!');
        return false;
      }
      if ((existedRq as any).requirement_shortname == shortname &&
        existedRq.requirement_shortname != this.requirement.requirement_shortname) {
        alert(shortname + 'already exist!');
        return false;
      }
    }
    
    //console.log(description);
    // this.changeRelatedLink(this.requirement.requirement_context, description);
    // this.changeRequirementOnGraph(this.selectedElement, description);
    let old = this.requirement
    // let newR = this.project.changeRequirement(old,description)
    // this.projectService.sendProject(this.project)
    let newR = Requirement.newRequirementWithOld(old, description,shortname)
    this.sendChangeShapeMessage("change", "req", old, newR);
    // this.change("change", "req", old, newR)
    return true;
  }
  changeRequirementws(old1: Requirement, new2: Requirement) {
    console.log('this:', this);
    let old = Requirement.copyRequirement(old1);
    let new1 = Requirement.copyRequirement(new2);
    this.changeRelatedLink(old.requirement_context, new1.requirement_context);
    console.log('this.project:', this.project);

    console.log('this.project.title:', this.project.title);
    //this.project.changeConstraint(old, new1);
    var tmpProject = new Project();
    tmpProject.initProject(this.project);
    tmpProject.changeRequirement1(old, new1);
    tmpProject.changeScenarioGraph(old,new1);
    this.project = tmpProject;
    //this.project.changeRequirement1(old, new1);
    this.projectService.sendProject(this.project);
    this.changeRequirementOnGraph1(old, new1);
    return true;
  }
  changeRequirementOnGraph1(old: Requirement, new1: Requirement) {
    for (let graph of this.graphs) {
      for (let element of graph.getElements()) {
        if (element.attr('root').title == old.getName()) {
          this.changeRequirementOnGraph(element, new1.getName())
          break
        }
      }
    }
  }
  changeRequirementOnGraph(element, name) {
    element.attr({
      root: {
        title: name,
        shortName: name
      },
      label: { text: name }
    });
  }
  //向服务器发生删除信息
  deleteRequirement(graph) {
    let name = this.selectedElement.attr('root').title;
    //let shortName = this.selectedElement.attr('label').text;
    let list = this.project.problemDiagram.requirementList;
    // this.project.deleteRelatedLink(name);
    //delete requirement
    let i = list.length - 1;
    let old
    for (; i >= 0; i--) {
      let item = list[i];
      if (item.requirement_context == name) {
        old = item
        // list.splice(i, 1);
        break;
      }
      //console.log(item.requirement_context + '!=' + name);
    }
    // graph.removeCells([this.selectedElement]);
    // this.projectService.sendProject(this.project)
    this.sendChangeShapeMessage("delete", "req", old, null);
    // this.change("delete", "req", old, null)
  }
  deleteRequirementws(requirement: Requirement) {
    console.log("deleteRequirementws:");
    let req = Requirement.copyRequirement(requirement);
    this.project.deleteRequirement(req);
    this.delete_req.push(req.requirement_no);
    this.delete_req.sort((a,b) => a - b);
    console.log("delete_req");
    this.project.deleteScenarioGraph(req);
    this.project.deleteRelatedLink(req.getName(),this.delete_link,this.delete_phe);
    this.projectService.sendProject(this.project);
    this.deleteRequirementOnGraph(req.getName());
  }
  deleteRequirementOnGraph(reqName: String) {
    for (let graph of this.graphs) {
      for (let element of graph.getCells()) {
        if (reqName == element.attr('root').title) {
          graph.removeCells([element])
          console.log("delete req ", reqName, " ", element)
        }
      }
    }
  }
  getDescription(name, pheList) {
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
  //==================================Link=============================================
  changeRelatedLink(oldName, newName) {
    // let i = this.project.problemDiagram.referenceList.length - 1;
    console.log("``````changeRelatedLink");
    for (let reference of this.project.problemDiagram.referenceList) {
      if (reference.reference_from == oldName) {
        reference.reference_from = newName;
        
      } else if (reference.reference_to == oldName) {
        reference.reference_to = newName;
        
      }
      if(reference.phenomenonList!=undefined &&  reference.phenomenonList!=null){
        let ifchange=false;
        for(let refphe of reference.phenomenonList){
          if(refphe.phenomenon_from == oldName){
            refphe.phenomenon_from = newName;
            ifchange=true;
          }else if(refphe.phenomenon_to == oldName){
            refphe.phenomenon_to = newName;
            ifchange=true;
          }
        }
        if(ifchange){
          reference.reference_description=this.getDescription(reference.reference_name,reference.phenomenonList);
        }
      }
    }
    for (let constraint of this.project.problemDiagram.constraintList) {
      if (constraint.constraint_from == oldName) {
        constraint.constraint_from = newName;
        
      } else if (constraint.constraint_to == oldName) {
        constraint.constraint_to = newName;
        
      }
      if(constraint.phenomenonList!=undefined &&  constraint.phenomenonList!=null){
        let ifchange=false;
        for(let conphe of constraint.phenomenonList){
          if(conphe.phenomenon_from == oldName){
            conphe.phenomenon_from = newName;
            ifchange=true;
          }else if(conphe.phenomenon_to == oldName){
            conphe.phenomenon_to = newName;
            ifchange=true;
          }
        }
        if(ifchange){
          constraint.constraint_description=this.getDescription(constraint.constraint_name,constraint.phenomenonList);
        }
      }
    }
    for (let my_interface of this.project.contextDiagram.interfaceList) {
      if (my_interface.interface_from == oldName) {
        my_interface.interface_from = newName;
        //console.log('interface_from:oldName:'+oldName+',newName='+newName);
        
      } else if (my_interface.interface_to == oldName) {
        my_interface.interface_to = newName;
        //console.log('interface_to:oldName:'+oldName+',newName='+newName);
        
      }
      if(my_interface.phenomenonList!=undefined &&  my_interface.phenomenonList!=null){
        let ifchange=false;
        for(let intphe of my_interface.phenomenonList){
          if(intphe.phenomenon_from == oldName){
            intphe.phenomenon_from = newName;
            ifchange=true;
          }else if(intphe.phenomenon_to == oldName){
            intphe.phenomenon_to = newName;
            ifchange=true;
          }
        }
        if(ifchange){
          my_interface.interface_description=this.getDescription(my_interface.interface_name,my_interface.phenomenonList);
        }
      }
    }
  }
  Merge(source, target, graph) {
    console.log("======Merge+++++++");
    console.log("target",target.attr('root').shortName);
    console.log("source",source.attr('root').shortName);

    // let list0 = this.project.contextDiagram.interfaceList;
    // console.log("interfaceList",list0);
    // let i0 = list0.length - 1;
    // for (; i0 >= 0; i0--) {
    //   let item = list0[i0];
    //   if (item.interface_from == target.attr('root').shortName) {
    //     // list0.splice(i0, 1);
    //     this.sendChangeShapeMessage("delete", "int", item, null);
    //   }
    //   else if (item.interface_to == target.attr('root').shortName) {
    //     // list0.splice(i0, 1);
    //     this.sendChangeShapeMessage("delete", "int", item, null);
    //   }
    //   //console.log(item.requirement_context + '!=' + name);
    // }
    // console.log("interfaceList",list0);

    // let list1 = this.project.problemDiagram.constraintList;
    // console.log("constraintList",list1);
    // let i1 = list1.length - 1;
    // for (; i1 >= 0; i1--) {
    //   let item = list1[i1];
    //   if (item.constraint_from == target.attr('root').shortName) {
    //     // list1.splice(i1, 1);
    //     this.sendChangeShapeMessage("delete", "con", item, null);
    //   }
    //   else if (item.constraint_to == target.attr('root').shortName) {
    //     // list1.splice(i1, 1);
    //     this.sendChangeShapeMessage("delete", "con", item, null);
    //   }
    //   //console.log(item.requirement_context + '!=' + name);
    // }
    // console.log("constraintList",list1);

    // let list2 = this.project.problemDiagram.referenceList;
    // console.log("referenceList",list2);
    // let i2 = list2.length - 1;
    // for (; i2 >= 0; i2--) {
    //   let item = list2[i2];
    //   if (item.reference_from == target.attr('root').shortName) {
    //     // list2.splice(i2, 1);
    //     this.sendChangeShapeMessage("delete", "ref", item, null);
    //   }
    //   else if (item.reference_to == target.attr('root').shortName) {
    //     // list2.splice(i2, 1);
    //     this.sendChangeShapeMessage("delete", "ref", item, null);
    //   }
    //   //console.log(item.requirement_context + '!=' + name);
    // }
    // console.log("referenceList",list2);

    //source.attr('root').shortName
    let list = this.project.contextDiagram.problemDomainList;
    for (let item of this.project.contextDiagram.problemDomainList) {
      let old_s;
      if (item.problemdomain_name == source.attr('root').title) {
        old_s = item;
        let j = 0;
        for (let item2 of this.project.contextDiagram.problemDomainList) {
          let old_t;
          if (item2.problemdomain_name == target.attr('root').title) {
            old_t = item2;
            let nn = item.problemdomain_name + "&" + item2.problemdomain_name;
            let nsh = item.problemdomain_shortname + item2.problemdomain_shortname;
            let pd = ProblemDomain.newProblemDomainWithOld(old_s,nn,nsh,item.problemdomain_type);
            // item.problemdomain_name = item.problemdomain_name + "&" + item2.problemdomain_name;
            // item.problemdomain_shortname = item.problemdomain_shortname + item2.problemdomain_shortname;
            for (var i = 0; i < item2.phes.length; i++) {
              pd.phes.push(item2.phes[i]);
            }
            this.sendChangeShapeMessage("change","pro",old_s,pd);
            this.sendChangeShapeMessage("delete","pro",old_t,null);
            // graph.removeCells(target);
            // source.attr('root').title = item.problemdomain_name;
            // source.attr('label').text = item.problemdomain_name + '\n(' + item.problemdomain_shortname + ')';
            // list.splice(j, 1);
            // this.drawDiagram(this.project);
          }
          j++;
        }

      }
      //console.log(item.interface_name + '!=' + this.selectedElement.label('root').title);
    }

    // for (let item of this.project.contextDiagram.interfaceList) {
    //   if (item.interface_from == source.attr('root').shortName) {
    //     // item.interface_from = source.attr('root').shortName + target.attr('root').shortName
    //     let newf=source.attr('root').shortName + target.attr('root').shortName;
    //     let int = Interface.copyInterface(item);
    //     int.setFrom(source.attr('root').shortName + target.attr('root').shortName);
    //     if(int.getPhenomenonList()!=undefined|| int.getPhenomenonList()!=null){
    //       for(let phesf of int.getPhenomenonList()){
    //         if(phesf.phenomenon_from == source.attr('root').shortName){
    //           phesf.phenomenon_from = newf;
    //         }
    //       }
    //     }
    //     this.sendChangeShapeMessage("change", "int", item, int)
    //   }
    //   else if (item.interface_to == source.attr('root').shortName) {
    //     // item.interface_to = source.attr('root').shortName + target.attr('root').shortName
    //     let int = Interface.copyInterface(item);
    //     int.setTo(source.attr('root').shortName + target.attr('root').shortName);
    //     this.sendChangeShapeMessage("change", "int", item, int)
    //   }
    // }
    // for (let item of this.project.problemDiagram.constraintList) {
    //   if (item.constraint_from == source.attr('root').shortName) {
    //     // item.constraint_from = source.attr('root').shortName + target.attr('root').shortName
    //     let con = Constraint.copyConstraint(item);
    //     con.setFrom(source.attr('root').shortName + target.attr('root').shortName);
    //     this.sendChangeShapeMessage("change", "int", item, con)
    //   }
    //   else if (item.constraint_to == source.attr('root').shortName) {
    //     // item.constraint_to = source.attr('root').shortName + target.attr('root').shortName
    //     let con = Constraint.copyConstraint(item);
    //     con.setTo(source.attr('root').shortName + target.attr('root').shortName);
    //     this.sendChangeShapeMessage("change", "int", item, con)
    //   }
    // }
    // for (let item of this.project.problemDiagram.referenceList) {
    //   if (item.reference_from == source.attr('root').shortName) {
    //     item.reference_from = source.attr('root').shortName + target.attr('root').shortName
    //   }
    //   else if (item.reference_to == source.attr('root').shortName) {
    //     item.reference_to = source.attr('root').shortName + target.attr('root').shortName
    //   }
    // }
  }
  drawLink(source, target, graph) {
    console.log('drawLink')
    let sourceType = source.attr('root').name
    let targetType = target.attr('root').name
    if (this.component_choice_service.interface == true) {
      if (sourceType === "requirement" || targetType === "requirement")
        alert("interface connects machine(problemdomain) and problemdomain!")
      else {
        this.drawInterface(source, target, graph);
        this.component_choice_service.interface = false;
      }
    } else if (this.component_choice_service.reference == true) {
      if (sourceType === "problemDomain" && targetType === "requirement" ||
        sourceType === "requirement" && targetType === "problemDomain") {
        this.drawReference(source, target, graph);
        this.component_choice_service.reference = false;
      }
      else alert("reference connects  problemdomain and requirement!")

    } else if (this.component_choice_service.constraint == true) {
      if (sourceType === "problemDomain" && targetType === "requirement" ||
        sourceType === "requirement" && targetType === "problemDomain") {
        this.drawConstraint(source, target, graph);
        this.component_choice_service.constraint = false;
      } else alert("constraint connects problemdomain and requirement!")
    }
    this.projectService.sendProject(this.project);

  }
  changeLinkPosition(project) {
    for (let reference of project.problemDiagram.referenceList) {
      let pos = this.changeLinkPosition1(reference.reference_from, reference.reference_to, project);
      reference.reference_x1 = pos[0];
      reference.reference_x2 = pos[1];
      reference.reference_y1 = pos[2];
      reference.reference_y2 = pos[3];
    }
    for (let constraint of project.problemDiagram.constraintList) {
      let pos = this.changeLinkPosition1(constraint.constraint_from, constraint.constraint_to, project);
      constraint.constraint_x1 = pos[0];
      constraint.constraint_x2 = pos[1];
      constraint.constraint_y1 = pos[2];
      constraint.constraint_y2 = pos[3];
    }
    for (let my_interface of project.contextDiagram.interfaceList) {
      let pos = this.changeLinkPosition1(my_interface.interface_from, my_interface.interface_to, project);
      my_interface.interface_x1 = pos[0];
      my_interface.interface_x2 = pos[1];
      my_interface.interface_y1 = pos[2];
      my_interface.interface_y2 = pos[3];
    }
  }
  changeLinkPosition1(from, to, project) {
    let x1, x2, y1, y2;
    if (from == project.contextDiagram.machine.machine_shortName) {
      x1 = this.project.contextDiagram.machine.machine_x;
      y1 = this.project.contextDiagram.machine.machine_y;
    } else if (to == this.project.contextDiagram.machine.machine_shortName) {
      x2 = this.project.contextDiagram.machine.machine_x;
      y2 = this.project.contextDiagram.machine.machine_y;
    }

    for (let ele of project.contextDiagram.problemDomainList) {
      if (ele.problemdomain_shortname == from) {
        x1 = ele.problemdomain_x;
        y1 = ele.problemdomain_y;
      } else if (ele.problemdomain_shortname == to) {
        x2 = ele.problemdomain_x;
        y2 = ele.problemdomain_y;
      }
    }

    for (let ele of project.problemDiagram.requirementList) {
      if (ele.requirement_context == from) {
        x1 = ele.requirement_x;
        y1 = ele.requirement_y;
      } else if (ele.requirement_context == to) {
        x2 = ele.requirement_x;
        y2 = ele.requirement_y;
      }
    }
    return [x1, x2, y1, y2];

  }
  deleteRelatedLinkOnGraph(name, graph) {
    //console.log('deleteRelatedLinkOnGraph');
    let links = graph.getLinks();
    for (let link of links) {
      if (link.attr('root').title == name) {
        graph.removeCells([link]);
      }
    }
  }
  //====================================Interface=======================================
  //根据interface列表画图
  drawInterfaces(interfaceList: Interface[], elementList, graph: joint.dia.Graph) {
    console.log("----------drawInterfaces--------");
    for (var i = 0; i < interfaceList.length; i++) {
      var elefrom: joint.dia.Element;
      var eleto: joint.dia.Element;
      const int = interfaceList[i];
      const from = int.interface_from;
      const to = int.interface_to;
      for (var j = 0; j < elementList.length; j++) {
        if (from == elementList[j].attr('root').shortName) {
          elefrom = elementList[j];
          console.log('elefrom');
          console.log(elefrom);
          console.log(from);
        }
        else if (to === elementList[j].attr('root').shortName) {
          eleto = elementList[j];
          console.log('eleto');
          console.log(eleto);
          console.log(to);
        }
      }
      this.drawInterface1(int, elefrom, eleto, graph);
    }
  }
  //在两个节点之间,生成add int 消息发送给服务器
  drawInterface(source, target, graph) {
    let no
    while (true) {
      no = this.interface_no;
      this.interface_no += 1;
      let conflicting_no = false;
      for (let inti of this.project.contextDiagram.interfaceList) {
        if (inti.interface_no == no) {
          conflicting_no = true
        }
      }
      if (!conflicting_no) {
        break;
      }
    }
    let name = this.getname();
    let from = source.attr('root').shortName;
    let to = target.attr('root').shortName;
    let myinterface = Interface.newInterface(no, name, name + '?', from, to, [], 0, 0, 0, 0);
    this.sendChangeShapeMessage("add", "int", null, myinterface);
    // this.change("add", "int", null, myinterface)
    return myinterface
  }
  //根据服务器发来的消息，修改project并画图
  drawInterfacews(int1: Interface) {
    let int = Interface.copyInterface(int1)
    console.log(int)
    this.project.addInterface(int)
    this.drawInterfaceOnGraph(int)
  }
  //在图上画interface
  drawInterfaceOnGraph(int) {
    console.log("drawInterfaceOnGraph")
    let from = int.interface_from
    let to = int.interface_to
    for (let graph of this.graphs) {
      var elefrom: joint.dia.Element
      var eleto: joint.dia.Element
      let elementList = graph.getElements()
      console.log(elementList)
      for (var j = 0; j < elementList.length; j++) {
        if (from == elementList[j].attr('root').shortName) {
          elefrom = elementList[j];
          console.log('elefrom');
          console.log(elefrom);
          console.log(from);
        } else if (to == elementList[j].attr('root').shortName) {
          eleto = elementList[j];
          console.log('eleto');
          console.log(eleto);
          console.log(to);
        }
      }
      this.drawInterface1(int, elefrom, eleto, graph)
    }
  }
  addInterfaceEntity(no, name, description, from, to, phe, x1, y1, x2, y2) {
    let myinterface = new Interface();
    myinterface.interface_no = no;
    myinterface.interface_name = name;
    myinterface.interface_from = from;
    myinterface.interface_to = to;
    myinterface.interface_x1 = x1;
    myinterface.interface_y1 = y1;
    myinterface.interface_x2 = x2;
    myinterface.interface_y2 = y2;
    myinterface.phenomenonList = phe;
    myinterface.interface_description = description;
    this.project.contextDiagram.interfaceList.push(myinterface);
    //console.log('addInterfaceEntity:');
    //console.log(this.project.contextDiagram.interfaceList);
    return myinterface;
  }
  //在图上画接口
  drawInterface1(int, source, target, graph) {
    // console.log("drawInterface1")
    var link = new joint.shapes.standard.Link({
      source: { id: source.id },
      target: { id: target.id }
    });
    link.attr({
      root: {
        name: 'interface',
        title: int.interface_name,
        no: int.interface_no
      },
      line: {
        strokeWidth: 1,
        targetMarker: {
          'fill': 'none',
          'stroke': 'none',
        }
      },
    });
    if(this.step >= 3){
      link.appendLabel({
        attrs: {
          text: {
            text: int.interface_name,
            fontSize: 25,
            textAnchor: 'middle',	//???????
            textVerticalAnchor: 'middle',
            background: 'none'
          }
        }
      });
    }
    link.addTo(graph);

    //console.log('drawInterface');
    return link;
  }

  displayInterface_name(){
    for (let graph of this.graphs) {
      for (let link of graph.getLinks()) {
        let lname:string;
        lname=link.attr('root').title;
        if (link.attr('root').name == 'interface' || link.attr('root').name == 'constraint' || link.attr('root').name == 'reference') {
          // graph.removeCells([link])
          // break
          link.labels([
            {
              attrs: {
                text: {
                  text: lname,
                  fontSize: 25,
                  textAnchor: 'middle',	
                  textVerticalAnchor: 'middle',
                  background: 'none'
                }
              }
            }
          ]);
        }
      }
    }
  }
  drawInterface2(interfaceList: Interface[], elementList, graph: joint.dia.Graph) {
    var link;
    var elefrom: joint.dia.Element;
    var eleto: joint.dia.Element;
    for (var i = 0; i < interfaceList.length; i++) {
      const int = interfaceList[i];
      const from = int.interface_from;
      const to = int.interface_to;
      for (var j = 0; j < elementList.length; j++) {
        if (from == elementList[j].attr('label').text.split('(')[1].split(')')[0]) {
          elefrom = elementList[j];
        }
        else if (to === elementList[j].attr('label').text.split('(')[1].split(')')[0]) {
          eleto = elementList[j];
        }
      }
      // console.log(int.interface_name);
      link = new joint.shapes.standard.Link();
      link.attr({
        line: {
          strokeWidth: 1,
          targetMarker: {
            'fill': 'none',
            'stroke': 'none',
          }
        },
        root: {
          title: 'Interface:' + int.interface_name,
        }
      });
      if(this.step >= 3){
        link.appendLabel({
          attrs: {
            text: {
              text: int.interface_name,
              fontSize: 25,
              textAnchor: 'middle',	//�ı�����
              textVerticalAnchor: 'middle',
              background: 'none'
            }
          }
        });
      }
      link.source(elefrom);
      link.target(eleto);
      link.addTo(graph);
    }
  }
  initInterfacePopBox() {
    //console.log(this.selectedElement);
    for (let item of this.project.contextDiagram.interfaceList) {
      if (item.interface_no == this.selectedElement.attr('root').no) {
        console.log(item);
        this.interface = Interface.copyInterface(item);
        this.phenomenonList = item.phenomenonList;
        this.selectedLinkSource = item.interface_from;
        this.selectedLinkTarget = item.interface_to;
        //console.log(item.interface_no + '=' + this.selectedElement.attr('root').no);
        console.log("this.phenomenonList = ", this.phenomenonList);
        break;
      }
      //console.log(item.interface_name + '!=' + this.selectedElement.label('root').title);
    }
    let selectedDiv = document.getElementById('interfacePopBox');
    (selectedDiv.getElementsByClassName("name")[0] as any).value = '';
    let source = this.getProblemEntityByShortName(this.selectedLinkSource)
    let target = this.getProblemEntityByShortName(this.selectedLinkTarget)
    this.selectPhes = []
    if (source != null && source.phes != undefined) {
      for (let phe of source.phes)
        this.selectPhes.push(phe)
    }
    if (target != null && target.phes != undefined) {
      for (let phe of target.phes)
        this.selectPhes.push(phe)
    }
    
    //console.log('initInterfacePopBox');
    //console.log(pro);
    //console.log(this.selectPhes);
  }
  getProblemEntityByShortName(shortName) {
    for (let pro of this.project.contextDiagram.problemDomainList) {
      if (pro.problemdomain_shortname == shortName)
        return pro;
    }
    console.log(shortName, this.project.contextDiagram.problemDomainList)
    return null;
  }
  
  changeInterfaceDetail() {
    // this.interface.phenomenonList = this.phenomenonList;
    // this.interface.interface_description = this.project.getDescription(this.interface.interface_name, this.phenomenonList)
    // this.projectService.sendProject(this.project)
    let int = Interface.newInterfaceWithOld(this.interface, this.phenomenonList, this.project.getDescription(this.interface.interface_name, this.phenomenonList))
    // this.change("change", "int", this.interface, int)
    this.sendChangeShapeMessage("change", "int", this.interface, int)
    
    //console.log('changeInterfaceDetail');
    //console.log(this.project.contextDiagram.interfaceList);
  }
  changeInterfacews(old: Interface, new1: Interface) {
    old = Interface.copyInterface(old)
    new1 = Interface.copyInterface(new1)
    this.project.changeInterface(old, new1)
    this.projectService.sendProject(this.project)
    return true;
  }
  //向服务器发送删除接口的信息
  deleteInterface(graph) {
    //console.log('deleteInterface');
    let no = this.selectedElement.attr('root').no;
    let list = this.project.contextDiagram.interfaceList;
    let i = 0
    let inter
    for (let item of list) {
      if (item.interface_no == no) {
        inter = item
        // list.splice(i, 1);
        break;
      }
      i++;
    }

    // graph.removeCells([this.selectedElement])
    this.sendChangeShapeMessage("delete", "int", inter, null);
    // this.change("delete", "int", inter, null)
    // this.projectService.sendProject(this.project);
  }
  deleteInterfacews(int: Interface) {
    int = Interface.copyInterface(int);

    // this.delete_interface.push(int.interface_no);
    // this.delete_interface.sort((a,b) => a - b);
    // console.log("int--delete_interface");
    // console.log(this.delete_interface);

    // 替代 this.project.deleteInterface(int);
    var tmpProject = new Project();
    tmpProject.initProject(this.project);
    tmpProject.deleteInterface(int);
    this.project = tmpProject;
    //this.project.deleteInterface(int);
    this.projectService.sendProject(this.project);
    this.deleteInterfaceOnGraph(int.getName());
  }
  deleteInterfaceOnGraph(name:string) {
    this.delete_link.push(this.getLinkNameNo(name));
    this.delete_link.sort((a,b) => a - b);
    console.log("interface--delete_link");
    console.log(this.delete_link);
    for (let graph of this.graphs) {
      for (let link of graph.getLinks()) {
        if (link.attr('root').title == name) {
          graph.removeCells([link])
          break
        }
      }
    }
  }
  //=====================================Reference=================================
  drawReferences(referenceList: Reference[], elementList, reqEleList, graph: joint.dia.Graph) {
    var link;
    var elefrom: joint.dia.Element;
    var eleto: joint.dia.Element;
    for (var i = 0; i < referenceList.length; i++) {
      const reference = referenceList[i];
      const from = reference.reference_from;
      const to = reference.reference_to;
      for (var j = 0; j < elementList.length; j++) {
        if (from === elementList[j].attr('root').shortName) {
          elefrom = elementList[j];
        }
        else if (to === elementList[j].attr('root').shortName) {
          eleto = elementList[j];
        }
      }
      for (var j = 0; j < reqEleList.length; j++) {
        if (from === reqEleList[j].attr('label').text) {
          elefrom = reqEleList[j];
        }
        else if (to === reqEleList[j].attr('label').text) {
          eleto = reqEleList[j];
        }
      }
      this.drawReference1(reference, elefrom, eleto, graph);
    }
  }
  drawReferencews(ref) {
    ref = Reference.copyReference(ref)
    this.project.addReference(ref)
    this.projectService.sendProject(this.project)
    this.drawReferenceOnGraph(ref)
  }
  drawReferenceOnGraph(ref) {
    console.log("drawReferenceOnGraph")
    const from = ref.reference_from
    const to = ref.reference_to
    let graph = this.graphs[1]
    var elefrom: joint.dia.Element
    var eleto: joint.dia.Element
    let elementList = graph.getElements()
    for (var j = 0; j < elementList.length; j++) {
      if (from == elementList[j].attr('root').shortName) {
        elefrom = elementList[j];
        // console.log('elefrom');
        // console.log(elefrom);
        // console.log(from);
      }
      else if (to === elementList[j].attr('root').shortName) {
        eleto = elementList[j];
        // console.log('eleto');
        // console.log(eleto);
        // console.log(to);
      }
    }
    this.drawReference1(ref, elefrom, eleto, graph)

  }
  drawReference(source, target, graph) {
    let no
    while (true) {
      no = this.reference_no;
      this.reference_no += 1;
      let conflicting_no = false;
      for (let refi of this.project.problemDiagram.referenceList) {
        if (refi.reference_name == no) {
          conflicting_no = true
        }
      }
      if (!conflicting_no) {
        break;
      }
    }
    let name = this.getname();
    let from = source.attr('root').shortName;
    let to = target.attr('root').shortName;
    // let ref = this.addReferenceEntity(this.reference_no, name, '', from, to, [], 0, 0, 0, 0);
    // let element = this.drawReference1(ref, source, target, graph);
    let ref = Reference.newReference(this.reference_no, name, '', from, to, [], 0, 0, 0, 0)
    this.sendChangeShapeMessage("add", "ref", null, ref);
    // this.change("add", "ref", null, ref)
    // return element;

  }
  getReqNo(req_context) {
    for (const req of this.project.problemDiagram.requirementList) {
      if (req.requirement_context == req_context) {
        return req.requirement_no;
      }
    }
    return -1;
  }
  addReferenceEntity(no, name, description, from, to, phe, x1, y1, x2, y2) {
    //console.log('addReferenceEntity');
    let reference = new Reference();
    reference.reference_no = no;
    reference.reference_name = name;
    reference.reference_description = description;
    reference.reference_from = from;
    reference.reference_to = to;
    reference.phenomenonList = phe;
    reference.reference_x1 = x1;
    reference.reference_y1 = y1;
    reference.reference_x2 = x2;
    reference.reference_y2 = y2;
    this.project.problemDiagram.referenceList.push(reference);
    return reference;
  }
  drawReference1(reference, source, target, graph) {
    // console.log("drawReference1")
    var link = new joint.shapes.standard.Link({
      source: { id: source.id },
      target: { id: target.id }
    });

    link.attr({
      root: {
        name: 'reference',
        title: reference.reference_name,
        no: reference.reference_no
      },
      line: {
        strokeWidth: 1,
        targetMarker: {
          'fill': 'none',
          'stroke': 'none',
        },
        strokeDasharray: '8,4'
      },

    });
    if(this.step >= 3){
      link.appendLabel({
        attrs: {
          text: {
            text: reference.reference_name,
            fontSize: 25,
            textAnchor: 'middle',	//???????
            textVerticalAnchor: 'middle',
            background: 'none'
          }
        }
      });
    }
    link.addTo(graph);
    //console.log('drawReference');
    return link;
  }
  initReferencePopBox() {
    for (let item of this.project.problemDiagram.referenceList) {
      if (item.reference_name == this.selectedElement.attr('root').title) {
        this.reference = Reference.copyReference(item);
        this.phenomenonList = item.phenomenonList;
        break;
      }
    }


    //initiator and receiverList
    this.receiverList = []  //link to initiator
    this.initiator_receiverList = [] //phe initiator list
    this.initiator_or_receiverList = [] //receiverList change according to initiator

    //get initiator
    for (let temp of this.project.contextDiagram.problemDomainList) {
      if (temp.problemdomain_shortname == this.reference.reference_from
        || temp.problemdomain_shortname == this.reference.reference_to) {
        //get initiator
        this.initiator = temp.problemdomain_shortname
        this.initiator_receiverList.push(temp.problemdomain_shortname)
      }
    }

    //get receiver list
    for (let temp_int of this.project.contextDiagram.interfaceList) {
      if (temp_int.interface_from == this.initiator) {
        this.receiverList.push(temp_int.interface_to)
        this.initiator_receiverList.push(temp_int.interface_to)
        this.initiator_or_receiverList.push(temp_int.interface_to)
        //console.log('--------------')
        //console.log('this.receiverList')
        //console.log(this.receiverList)
        //console.log('this.initiator_receiverList')
        //console.log(this.initiator_receiverList)
        //console.log('this.initiator_or_receiverList')
        //console.log(this.initiator_or_receiverList)
      }
      else if (temp_int.interface_to == this.initiator) {
        this.receiverList.push(temp_int.interface_from)
        this.initiator_receiverList.push(temp_int.interface_from)
        this.initiator_or_receiverList.push(temp_int.interface_from)
        //console.log('--------------')
        //console.log('this.receiverList')
        //console.log(this.receiverList)
        //console.log('this.initiator_receiverList')
        //console.log(this.initiator_receiverList)
        //console.log('this.initiator_or_receiverList')
        //console.log(this.initiator_or_receiverList)
      }
    }

    //from interface and ontology,if a phe exist in both interface and ontology,it will appear only once
    this.interface_ontologyPhes = []
    //form interface
    this.interfacePhes = []
    //from ontology
    this.ontologyPhes = []

    //get reference phenomenon list according problemdomain short name
    this.interfacePhes = this.getRefPheList(this.initiator)

    //get reference phenomenon list according to ontology
    let pro = this.getProblemEntityByShortName(this.initiator)
    this.ontologyPhes = pro.phes;
    if (this.ontologyPhes == undefined || this.ontologyPhes == null )
      this.ontologyPhes = []
    //console.log(this.ontologyPhes)

    //get reference phenomenon list from both interface & ontology
    //if a phe exist in both interface and ontology,it will appear only once
    this.interface_ontologyPhes = this.getRefPheList(this.initiator)
    for (let temp_envphe of this.ontologyPhes) {
      console.log("initReferencePopBox: ");
      console.log(temp_envphe);
      if (!this.exist(temp_envphe, this.interface_ontologyPhes)) {
        this.interface_ontologyPhes.push(temp_envphe);
        console.log("push!!")
      }
    }
    //phe name and initiator
    let selectedDiv = document.getElementById('referencePopBox') as any
    (selectedDiv.getElementsByClassName("name")[0] as any).value = '';
    console.log(selectedDiv.getElementsByClassName("initiator")[0]);
    // let selectElement = (selectedDiv.getElementsByClassName("initiator")[0] as any)
    // console.log(selectElement)
    // let options= selectElement.getElementsByTagName('option')
    // console.log(options)
    // options[0].selected = true
    // $("#sel option[value='xx']").prop("selected",true);

    setTimeout(
      function () {
        // console.log('设置initiator选中项为0');
        ($("#referencePopBox .initiator").get(0) as any).selectedIndex = 0
        // console.log('获取initiator选中项')
        // console.log($("#referencePopBox .initiator").val())
      },
      15)

    // $("#referencePopBox .initiator").find("option:contains('xx')").prop("selected",true);

  }
  exist(phe, pheList) {
    for (let temp of pheList) {
      console.log(temp);
      if (phe.phenomenon_name == temp.phenomenon_name) {
        return true
      }
    }
    return false
  }
  getRelatedPhes(proName, phes, unRelatedPhes) {
    for (let item of this.project.contextDiagram.interfaceList) {
      this.getRelatedPhes1(proName, item.phenomenonList, phes, unRelatedPhes)
    }
    for (let item of this.project.problemDiagram.constraintList) {
      this.getRelatedPhes1(proName, item.phenomenonList, phes, unRelatedPhes)
    }
    for (let item of this.project.problemDiagram.referenceList) {
      this.getRelatedPhes1(proName, item.phenomenonList, phes, unRelatedPhes)
    }
  }
  getRelatedPhes1(name, pheList, phes, unRelatedPhes) {
    for (let item of pheList) {
      if (name == item.phenomenon_from || name == item.phenomenon_to) {
        phes.push(item)
      } else {
        unRelatedPhes.push(item)
      }
    }
  }
  changereceiver() {
    let selectedDiv = document.getElementById(this.selectedType + 'PopBox');
    let selectElement = selectedDiv.getElementsByClassName("initiator")[0];
    let selectedIndex = (selectElement as any).selectedIndex;
    let initiator = this.initiator_receiverList[selectedIndex]
    //console.log(initiator)
    this.initiator_or_receiverList = []
    if (this.initiator == initiator) {
      for (let rec of this.receiverList) {
        this.initiator_or_receiverList.push(rec)
      }
    } else {
      this.initiator_or_receiverList.push(this.initiator)
    }
    //console.log(this.initiator_or_receiverList)
  }
  changeReferenceDetail() {
    // this.reference.phenomenonList = this.phenomenonList;
    // this.reference.reference_description = this.project.getDescription(this.reference.reference_name, this.phenomenonList)
    // this.projectService.sendProject(this.project);
    //console.log('changeReferenceDetail');
    //console.log(this.referencePhenomenonList);
    let ref = Reference.newReferenceWithOld(this.reference, this.phenomenonList, this.project.getDescription(this.reference.reference_name, this.phenomenonList))
    this.sendChangeShapeMessage("change", "ref", this.reference, ref)
    // this.change("change", "ref", this.reference, ref)
    
  }
  changeReferencews(old: Reference, new1: Reference) {
    old = Reference.copyReference(old)
    new1 = Reference.copyReference(new1)
    this.project.changeReference(old, new1)
    this.projectService.sendProject(this.project)
    return true;
  }
  deleteReference(graph) {
    let name = this.selectedElement.attr('root').title;
    let list = this.project.problemDiagram.referenceList;
    let i = 0
    let ref
    for (let item of list) {
      if (item.reference_name == name) {
        ref = item
        // list.splice(i, 1);
        break;
      }
      i++;
    }
    // graph.removeCells([this.selectedElement])
    this.sendChangeShapeMessage("delete", "ref", ref, null);
    // this.change("delete", "ref", ref, null)
    // this.projectService.sendProject(this.project);
  }
  deleteReferencews(ref: Reference) {
    ref = Reference.copyReference(ref);

    // this.delete_reference.push(ref.reference_no);
    // this.delete_reference.sort((a,b) => a - b);
    // console.log("ref--delete_reference");
    // console.log(this.delete_reference);

    // 替代 this.project.deleteReference(ref);
    var tmpProject = new Project();
    tmpProject.initProject(this.project);
    tmpProject.deleteReference(ref);
    this.project = tmpProject;
    //this.project.deleteReference(ref);
    this.projectService.sendProject(this.project);
    this.deleteReferenceOnGraph(ref.getName());
  }
  deleteReferenceOnGraph(refName: string) {
    this.delete_link.push(this.getLinkNameNo(refName));
    this.delete_link.sort((a,b) => a - b);
    console.log("ref--delete_link");
    console.log(this.delete_link);
    for (let graph of this.graphs) {
      for (let link of graph.getLinks()) {
        if (link.attr('root').title == refName)
          graph.removeCells([link])
      }
    }
  }
  getpheno(): number {
    while (true) {
      let no:number;
      if(this.delete_phe.length > 0){
        this.delete_phe.sort((a,b) => a - b);
        for(let delno of this.delete_phe){
          no = delno;
          console.log("getpheno():"+no);
          console.log("delete_phe:");
          console.log(this.delete_phe);
          this.delete_phe.splice(0, 1);
          console.log("delete_phe:");
          console.log(this.delete_phe);
          break;
        }
      }else{
        no = this.phenomenon_no;
        this.phenomenon_no += 1;
      }
      let conflicting_name = false;
      for (let inti of this.project.contextDiagram.interfaceList) {
        for(let phei of inti.phenomenonList){
          if(phei.phenomenon_no == no){
            conflicting_name = true;
          }
        }
      }
      for (let refi of this.project.problemDiagram.referenceList) {
        for(let phei of refi.phenomenonList){
          if(phei.phenomenon_no == no){
            conflicting_name = true;
          }
        }
      }
      for (let coni of this.project.problemDiagram.constraintList) {
        for(let phei of coni.phenomenonList){
          if(phei.phenomenon_no == no){
            conflicting_name = true;
          }
        }
      }
      if (!conflicting_name) {
        return no
      }
    }
  }
  getreqno(): number {
    while (true) {
      let no:number;
      let name:string;
      if(this.delete_req.length > 0){
        this.delete_req.sort((a,b) => a - b);
        for(let delno of this.delete_req){
          no = delno;
          console.log("getreqno():"+no);
          console.log("delete_req:");
          console.log(this.delete_req);
          this.delete_req.splice(0, 1);
          console.log("delete_req:");
          console.log(this.delete_req);
          break;
        }
      }else{
        no = this.requirement_no;
        this.requirement_no += 1;
      }
      name = 'requirement' + no;
      let conflicting_name = false;
      for (let reqi of this.project.problemDiagram.requirementList) {
        if (reqi.requirement_no == no || reqi.requirement_context == name) {
          conflicting_name = true
        }
      }
      if (!conflicting_name) {
        return no
      }
    }
  }
  getname(): string {
    while (true) {
      let name:string;
      if(this.delete_link.length > 0){
        this.delete_link.sort((a,b) => a - b);
        for(let delno of this.delete_link){
          name = this.getlink_name(delno);
          console.log("getname():"+name);
          console.log("delete_link:");
          console.log(this.delete_link);
          this.delete_link.splice(0, 1);
          console.log("delete_link:");
          console.log(this.delete_link);
          break;
        }
      }else{
        name = this.getlink_name((this.link_name_no));
        this.link_name_no += 1;
      }
      let conflicting_name = false;
      for (let inti of this.project.contextDiagram.interfaceList) {
        if (inti.interface_name == name) {
          conflicting_name = true
        }
      }
      for (let refi of this.project.problemDiagram.referenceList) {
        if (refi.reference_name == name) {
          conflicting_name = true
        }
      }
      for (let coni of this.project.problemDiagram.constraintList) {
        if (coni.constraint_name == name) {
          conflicting_name = true
        }
      }
      if (!conflicting_name) {
        return name
      }
    }
  }
  //===========================================Constraint==========================================
  drawConstraints(constraintList: Constraint[], elementList, reqEleList, graph: joint.dia.Graph) {
    var link;
    var elefrom: joint.dia.Element;
    var eleto: joint.dia.Element;
    for (var i = 0; i < constraintList.length; i++) {
      const constraint = constraintList[i];
      const from = constraint.constraint_from;
      const to = constraint.constraint_to;
      // console.log("from:" + from)
      // console.log("to:" + to)
      // console.log("elementList:" + elementList)
      for (var j = 0; j < elementList.length; j++) {
        if (from === elementList[j].attr('root').shortName) {
          elefrom = elementList[j];
        }
        else if (to === elementList[j].attr('root').shortName) {
          eleto = elementList[j];
        }
      }
      for (var j = 0; j < reqEleList.length; j++) {
        if (from === reqEleList[j].attr('label').text) {
          elefrom = reqEleList[j];
        }
        else if (to === reqEleList[j].attr('label').text) {
          eleto = reqEleList[j];
        }
      }
      // console.log("elefrom:" + elefrom);
      // console.log("eleto:" + eleto);
      if (elefrom != undefined) {
        if (elefrom.attr('root').name != 'requirement') {
          let temp = elefrom;
          elefrom = eleto;
          eleto = temp;
        }
        this.drawConstraint1(constraint, elefrom, eleto, graph);
      }
    }
  }
  drawConstraint(source, target, graph) {
    let name = this.getname();
    let no
    while (true) {
      no = this.constraint_no;
      this.constraint_no += 1;
      let conflicting_no = false;
      for (let coni of this.project.problemDiagram.constraintList) {
        if (coni.constraint_no == no) {
          conflicting_no = true
        }
      }
      if (!conflicting_no) {
        break;
      }
    }
    let req: string;
    //确保箭头（target）放在domain这一侧
    if (source.attr('root').name != 'requirement') {
      let temp = source;
      source = target;
      target = temp;
    }
    let to = target.attr('root').shortName;
    let from = source.attr('root').shortName
    let con = Constraint.newConstraint(no, name, '', from, to, [], 0, 0, 0, 0)
    this.sendChangeShapeMessage("add", "con", null, con);
    // this.change("add", "con", null, con)

  }

  drawConstraintws(con) {
    con = Constraint.copyConstraint(con)
    this.project.addConstraint(con)
    this.projectService.sendProject(this.project)
    this.drawConstraintOnGraph(con)
  }
  drawConstraintOnGraph(constraint) {
    console.log("drawConstraintOnGraph")
    const from = constraint.constraint_from;
    const to = constraint.constraint_to;
    let graph = this.graphs[1]
    var elefrom: joint.dia.Element
    var eleto: joint.dia.Element
    let elementList = graph.getElements()
    for (var j = 0; j < elementList.length; j++) {
      if (from == elementList[j].attr('root').shortName) {
        elefrom = elementList[j];
        // console.log('elefrom');
        // console.log(elefrom);
        // console.log(from);
      }
      else if (to === elementList[j].attr('root').shortName) {
        eleto = elementList[j];
        // console.log('eleto');
        // console.log(eleto);
        // console.log(to);
      }
    }
    this.drawConstraint1(constraint, elefrom, eleto, graph)

  }
  drawConstraint1(con, source, target, graph) {
    // console.log("drawConstraint1")
    // var link = new joint.shapes.standard.Link({
    //   source: { id: source.id },
    //   target: { id: target.id }
    // });
    var link = new joint.shapes.standard.Link();
    link.attr({
      root: {
        name: 'constraint',
        title: con.constraint_name,
        no: con.constraint_no

      },
      line: { strokeWidth: 1, strokeDasharray: '8,4' }
    });
    if(this.step >= 3){
      link.appendLabel({
        attrs: {
          text: {
            text: con.constraint_name,
            fontSize: 25,
            textAnchor: 'middle',	//???????
            textVerticalAnchor: 'middle',
            background: 'none'
          }
        }
      });
    }
    link.source(source);
    link.target(target);
    link.addTo(graph);
    //console.log('drawConstraint');
    return link;
  }
  initConstraintPopBox() {
    for (let item of this.project.problemDiagram.constraintList) {
      if (item.constraint_name == this.selectedElement.attr('root').title) {
        this.constraint = Constraint.copyConstraint(item);
        this.phenomenonList = item.phenomenonList;
        break;
      }
    }

    //phe name
    let selectedDiv = document.getElementById('constraintPopBox');
    (selectedDiv.getElementsByClassName("name")[0] as any).value = '';

    //initiator and receiverList
    this.receiverList = []  //link to initiator
    this.initiator_receiverList = [] //phe initiator list
    this.initiator_or_receiverList = [] //receiverList change according to initiator

    //get initiator
    for (let temp of this.project.contextDiagram.problemDomainList) {
      if (temp.problemdomain_shortname == this.constraint.constraint_from
        || temp.problemdomain_shortname == this.constraint.constraint_to) {
        //get initiator
        this.initiator = temp.problemdomain_shortname
        this.initiator_receiverList.push(temp.problemdomain_shortname)
      }
    }

    //get receiver list
    for (let temp_int of this.project.contextDiagram.interfaceList) {
      if (temp_int.interface_from == this.initiator) {
        this.receiverList.push(temp_int.interface_to)
        this.initiator_receiverList.push(temp_int.interface_to)
        this.initiator_or_receiverList.push(temp_int.interface_to)
        //console.log('--------------')
        //console.log('this.receiverList')
        //console.log(this.receiverList)
        //console.log('this.initiator_receiverList')
        //console.log(this.initiator_receiverList)
        //console.log('this.initiator_or_receiverList')
        //console.log(this.initiator_or_receiverList)
      }
      else if (temp_int.interface_to == this.initiator) {
        this.receiverList.push(temp_int.interface_from)
        this.initiator_receiverList.push(temp_int.interface_from)
        this.initiator_or_receiverList.push(temp_int.interface_from)
        //console.log('--------------')
        //console.log('this.receiverList')
        //console.log(this.receiverList)
        //console.log('this.initiator_receiverList')
        //console.log(this.initiator_receiverList)
        //console.log('this.initiator_or_receiverList')
        //console.log(this.initiator_or_receiverList)
      }
    }

    //from interface and ontology,if a phe exist in both interface and ontology,it will appear only once
    this.interface_ontologyPhes = []
    //form interface
    this.interfacePhes = []
    //from ontology
    this.ontologyPhes = []

    //get reference phenomenon list according problemdomain short name
    this.interfacePhes = this.getRefPheList(this.initiator)

    //get reference phenomenon list according to ontology
    let pro = this.getProblemEntityByShortName(this.initiator)
    this.ontologyPhes = pro.phes;

    //get reference phenomenon list from both interface & ontology
    //if a phe exist in both interface and ontology,it will appear only once
    this.interface_ontologyPhes = this.getRefPheList(this.initiator)
    if (this.ontologyPhes != null) {
      for (let temp_envphe of this.ontologyPhes) {
        console.log("initConstraintPopBox: ");
        console.log(temp_envphe);
        if (!this.exist(temp_envphe, this.interface_ontologyPhes)) {
          this.interface_ontologyPhes.push(temp_envphe);
          console.log("push!!")
        }
      }
    }

    //initiator
    setTimeout(
      function () {
        // console.log('设置initiator选中项为0');
        ($("#constraintPopBox .initiator").get(0) as any).selectedIndex = 0
        // console.log('获取initiator选中项')
        // console.log($("#referencePopBox .initiator").val())
      },
      15)

  }
  changeConstraintDetail() {
    // this.constraint.phenomenonList = this.phenomenonList;
    // this.constraint.constraint_description = this.project.getDescription(this.constraint.constraint_name, this.phenomenonList);
    // this.projectService.sendProject(this.project);
    //console.log('changeReferenceDetail');
    //console.log(this.constraintPhenomenonList);
    let con = Constraint.newConstraintWithOld(this.constraint, this.phenomenonList, this.project.getDescription(this.constraint.constraint_name, this.phenomenonList))
    this.sendChangeShapeMessage("change", "con", this.constraint, con)
    // this.change("change", "con", this.constraint, con)
  }
  changeConstraintws(old: Constraint, new1: Constraint) {
    old = Constraint.copyConstraint(old);
    new1 = Constraint.copyConstraint(new1);
    this.project.changeConstraint(old, new1)
    this.projectService.sendProject(this.project)
    return true;
  }

  deleteConstraint(graph) {
    let name = this.selectedElement.attr('root').title;
    let list = this.project.problemDiagram.constraintList;
    let i = 0;
    let con
    for (let item of list) {
      if (item.constraint_name == name) {
        con = item
        // list.splice(i, 1);
        break;
      }
      i++;
    }
    // graph.removeCells([this.selectedElement])
    this.sendChangeShapeMessage("delete", "con", con, null);
    // this.change("delete", "con", con, null)
    // this.projectService.sendProject(this.project)
  }
  deleteConstraintws(con: Constraint) {
    con = Constraint.copyConstraint(con);

    // this.delete_constraint.push(con.constraint_no);
    // this.delete_constraint.sort();
    // console.log("con--delete_constraint");
    // console.log(this.delete_constraint);

    // 替代 this.project.deleteConstraint(con);
    var tmpProject = new Project();
    tmpProject.initProject(this.project);
    tmpProject.deleteConstraint(con);
    this.project = tmpProject;

    //this.project.deleteConstraint(con);
    this.projectService.sendProject(this.project);
    this.deleteConstraintOnGraph(con.getName());
  }
  deleteConstraintOnGraph(conName: string) {
    this.delete_link.push(this.getLinkNameNo(conName));
    this.delete_link.sort((a,b) => a - b);
    console.log("constraint--delete_link");
    console.log(this.delete_link);
    for (let graph of this.graphs) {
      for (let link of graph.getLinks()) {
        if (link.attr('root').title == conName)
          graph.removeCells([link])
      }
    }
  }

  //====================================phenomenon=====================================
  //get phenomenon list of interface
  getPhenomenonList(shortName) {
    for (let int of this.project.contextDiagram.interfaceList) {
      if (int.interface_from == shortName || int.interface_to == shortName) {
        return int.phenomenonList;
      }
    }
    return null;
  }
  //get phenomenon list of link according to problem shortName
  getRefPheList(shortName) {
    let res = [];
    for (let int of this.project.contextDiagram.interfaceList) {
      if (int.interface_from == shortName || int.interface_to == shortName) {
        for (var i = 0; i < int.phenomenonList.length; i++) {
          res.push(int.phenomenonList[i]);
        }
      }
    }
    for (let item of this.project.problemDiagram.referenceList) {
      if (item.reference_from == shortName || item.reference_to == shortName) {
        for (var i = 0; i < item.phenomenonList.length; i++) {
          res.push(item.phenomenonList[i]);
        }
      }
    }
    for (let item of this.project.problemDiagram.constraintList) {
      if (item.constraint_from == shortName || item.constraint_to == shortName) {
        for (var i = 0; i < item.phenomenonList.length; i++) {
          res.push(item.phenomenonList[i]);
        }
      }
    }
    for (let i = 0; i < res.length; i++) {
      for (let j = res.length - 1; j > i; j--) {
        if (res[i].phenomenon_no == res[j].phenomenon_no) {
          res.splice(j, 1);
        }
      }
    }
    //console.log(res);
    return res;
  }

  //addPhenomenon
  addPhenomenon() {
    if (this.selectedType == 'interface') {
      this.addInterfacePhenomenon();
    } else if (this.selectedType == 'reference') {
      /*      //phenomenon
            let selectedDiv = document.getElementById(this.selectedType + 'PopBox');
            let selectElement = selectedDiv.getElementsByClassName("phes")[0];
            let selectedIndex = (selectElement as any).selectedIndex;
            let phenomenon = this.refPheList[selectedIndex];
            this.addReferencePhenomenon(phenomenon);*/
      this.addReferencePhenomenon();
    } else if (this.selectedType == 'constraint') {
      //phenomenon
      this.addConstraintPhenomenon();
    }
    this.projectService.sendProject(this.project);
    //console.log(this.project)
  }
  addInterfacePhenomenon() {
    let phenomenon = new Phenomenon();
    this.changePhenomenon(phenomenon, this.phenomenonList);
    var tmpProject = new Project();
    tmpProject.initProject(this.project);
    tmpProject.setDescription(this.interface);
    this.project = tmpProject;
    //this.project.setDescription(this.interface);
  }
  addReferencePhenomenon() {
    let phenomenon = new RequirementPhenomenon();
    this.changePhenomenon1(phenomenon, this.phenomenonList,false);
    //phenomenon_requirement
    let source = this.getElementById(this.selectedElement.source().id);
    let target = this.getElementById(this.selectedElement.target().id);

    let reqno;
    if (source.attr('root').name == 'requirement') {
      reqno = this.getReqNo(source.attr('root').title);
    } else {
      reqno = this.getReqNo(target.attr('root').title);
    }
    phenomenon.phenomenon_requirement = reqno;
  }
  addConstraintPhenomenon() {
    let phenomenon = new RequirementPhenomenon();
    this.changePhenomenon1(phenomenon, this.phenomenonList,true);
    //phenomenon_requirement
    let source = this.getElementById(this.selectedElement.source().id);
    let target = this.getElementById(this.selectedElement.target().id);
    let reqno;
    if (source.attr('root').name == 'requirement') {
      reqno = this.getReqNo(source.attr('root').title);
    } else {
      reqno = this.getReqNo(target.attr('root').title);
    }
    phenomenon.phenomenon_requirement = reqno;
    var tmpProject = new Project();
    tmpProject.initProject(this.project);
    this.description = tmpProject.getDescription(this.selectedElement.attr('root').title, this.constraintPhenomenonList);
    this.project = tmpProject;
  }
  changePhenomenon(phenomenon, phenomenonList) {
    let selectedDiv = document.getElementById(this.selectedType + 'PopBox');
    //name
    let phenomenonName = (selectedDiv.getElementsByClassName("name")[0] as any).value;
    if (phenomenonList != null && phenomenonList != undefined)
      for (let existPhenomenon of phenomenonList) {
        if (existPhenomenon.phenomenon_name == phenomenonName) {
          alert(phenomenonName + 'already exist');
          return;
        }
      }
    phenomenon.phenomenon_name = phenomenonName;
    let flag = false;
    if (this.ontologyPhes != undefined) {
      for (let phe of this.ontologyPhes) {
        if (phe.phenomenon_name == phenomenonName) {
          //type
          phenomenon.phenomenon_type = phe.phenomenon_type
          flag = true;
          break;
        }
      }
    }

    if (!flag) {
      //type
      let selectElement = selectedDiv.getElementsByClassName("phenomenonType")[0];
      let selectedIndex = (selectElement as any).selectedIndex;
      let phenomenonType = (selectElement as any).options[selectedIndex].text;
      phenomenon.phenomenon_type = phenomenonType;
    }
    //no
    console.log("changePhenomenon:");
    phenomenon.phenomenon_no = this.getpheno();
    
    //console.log('changePhenomenon')
    //console.log(phenomenon.phenomenon_no)

    //from & to
    let selectElement = selectedDiv.getElementsByClassName("initiator")[0];
    //console.log(selectElement);
    let selectedIndex = (selectElement as any).selectedIndex;
    let initiator = (selectElement as any).options[selectedIndex].text;
    let receiver = (selectElement as any).options[1 - selectedIndex].text;
    phenomenon.phenomenon_to = receiver;
    phenomenon.phenomenon_from = initiator;

    //console.log('index:' + selectedIndex + ", initiator:" + initiator + ', receiver: ' + receiver);
    //console.log('index:' + selectedIndex + ", type:" + phenomenonType);
    if (phenomenonList != null && phenomenonList != undefined)
      phenomenonList.push(phenomenon);
    else {
      phenomenonList = new Array<Phenomenon>();
      phenomenonList.push(phenomenon);
    }

    //console.log("add phenomenon:");
    //console.log(phenomenonList);
  }
  
  changePhenomenon1(phenomenon, phenomenonList,ifconstraint) {
    //get message from popBox
    let selectedDiv = document.getElementById(this.selectedType + 'PopBox');
    //name
    let phenomenonName = (selectedDiv.getElementsByClassName("name")[0] as any).value;
    //type
    let selectElement = selectedDiv.getElementsByClassName("phenomenonType")[0];
    let selectedIndex = (selectElement as any).selectedIndex;
    let phenomenonType = (selectElement as any).options[selectedIndex].text;
    //from
    selectElement = selectedDiv.getElementsByClassName("initiator")[0];
    selectedIndex = (selectElement as any).selectedIndex;
    let initiator = (selectElement as any).options[selectedIndex].text;
    //to
    selectElement = selectedDiv.getElementsByClassName("receiver")[0];
    selectedIndex = (selectElement as any).selectedIndex;
    let receiver = (selectElement as any).options[selectedIndex].text;
    //constraint
    // let checkbox = selectedDiv.getElementsByClassName("checkbox")[0] as any
    // let constraint = checkbox.checked
    let constraint = ifconstraint


    let relatedPhes = []
    let unRelatedPhes = []
    this.getRelatedPhes(this.initiator, relatedPhes, unRelatedPhes)
    // let relatedOntologyPhes =[]
    // let unRelatedOntologyPhes = []
    // this.getRelatedOntologyPhes(this.initiator,relatedOntologyPhes,unRelatedOntologyPhes)
    for (let existPhenomenon of phenomenonList) {
      if (existPhenomenon.phenomenon_name == phenomenonName) {
        alert(phenomenonName + 'already exist');
        return;
      }
    }
    // for (let existPhenomenon of unRelatedPhes) {
    //   if (existPhenomenon.phenomenon_name == phenomenonName) {
    //     alert(phenomenonName + 'already exists');
    //     return;
    //   }
    // }

    //phe exist in related link
    let flag = false;
    for (let phe of relatedPhes) {
      if (phe.phenomenon_name == phenomenonName) {
        phenomenon.phenomenon_no = phe.phenomenon_no
        phenomenon.phenomenon_name = phe.phenomenon_name
        phenomenon.phenomenon_from = phe.phenomenon_from
        phenomenon.phenomenon_to = phe.phenomenon_to
        phenomenon.phenomenon_type = phe.phenomenon_type
        phenomenon.phenomenon_constraint = phe.phenomenon_constraint
        flag = true
      }
    }

    //phe doesn't exist in related link
    if (!flag) {
      // phenomenon.phenomenon_no = this.phenomenon_no
      // this.phenomenon_no += 1
      console.log("changePhenomenon1:");
      phenomenon.phenomenon_no = this.getpheno();
      phenomenon.phenomenon_name = phenomenonName
      phenomenon.phenomenon_from = initiator
      phenomenon.phenomenon_to = receiver

      //type
      flag = false;
      if (this.ontologyPhes != undefined) {
        for (let phe of this.ontologyPhes) {
          if (phe.phenomenon_name == phenomenonName) {
            phenomenon.phenomenon_type = phe.phenomenon_type
            flag = true;
            break;
          }
        }
      }
      if (!flag) {
        phenomenon.phenomenon_type = phenomenonType;
      }
    }
    console.log('addphe: constraint=', constraint)
    phenomenon.phenomenon_constraint = constraint
    phenomenonList.push(phenomenon)
    console.log(phenomenonList)
  }

  //select phenomenon from phenomenon list
  pre = null;
  selectPhenomenon(sObject, phenomenon_no) {
    $(sObject).attr("style", "BACKGROUND-COLOR: #e6f0fc");
    this.selectedPhenomenonNo = phenomenon_no
  }

  //从interface,reference,和constraint的现象列表中找
  getPheByName(pheName) {
    for (let int of this.project.contextDiagram.interfaceList) {
      for (let phe of int.phenomenonList) {
        if (pheName == phe.phenomenon_name)
          return phe
      }
    }
    for (let ref of this.project.problemDiagram.referenceList) {
      for (let phe of ref.phenomenonList) {
        if (pheName == phe.phenomenon_name)
          return phe
      }
    }
    for (let ref of this.project.problemDiagram.constraintList) {
      for (let phe of ref.phenomenonList) {
        if (pheName == phe.phenomenon_name)
          return phe
      }
    }
    return null
  }

  //从备选列表选择
  selectPhe() {
    let index
    if (this.selectedType == 'reference')
      index = ($("#referencePopBox .phes").get(0) as any).selectedIndex
    else if (this.selectedType == "constraint")
      index = ($("#constraintPopBox .phes").get(0) as any).selectedIndex
    else if (this.selectedType == "interface")
      index = ($("#interfacePopBox .phes").get(0) as any).selectedIndex
    if (index == 0)
      return
    let phe : Phenomenon;
    if (this.selectedType == "interface"){
      console.log(this.selectPhes);
      phe = this.selectPhes[index - 1];
    }else{
      console.log(this.interface_ontologyPhes);
      phe = this.interface_ontologyPhes[index - 1];
    }
    
    console.log(index)
    console.log(phe)
    let phenomenon_name = phe.phenomenon_name as any

    //name
    // (document.getElementById('nameref') as any).value = phenomenon_name
    if (this.selectedType == 'reference'){
      (document.getElementById('nameref') as any).value = phenomenon_name
    }
    else if (this.selectedType == "constraint"){
      (document.getElementById('namecon') as any).value = phenomenon_name
    }else if (this.selectedType == "interface"){
      (document.getElementById('nameint') as any).value = phenomenon_name
    }
    // let phe = this.getPheByName(phenomenon_name)
    // if(phe==null) {
    //   console.log('phe==null')
    //   return
    // }
    if (this.selectedType == 'reference' || this.selectedType == "constraint"){
      //initiator
      let initiatorIndex = 0
      for (let ini of this.initiator_receiverList) {
        if (phe.phenomenon_from == ini) {
          console.log("initiator i=", initiatorIndex)
          break
        }
        initiatorIndex++
      }
      if (this.selectedType == 'reference') {
        ($("#referencePopBox .initiator").get(0) as any).selectedIndex = initiatorIndex;
      } else if (this.selectedType == 'constraint') {
        ($("#constraintPopBox .initiator").get(0) as any).selectedIndex = initiatorIndex;
      }

      //receiver
      this.changereceiver()
      let receiverIndex = 0
      for (let rev of this.initiator_or_receiverList) {
        if (phe.phenomenon_to == rev) {
          console.log("receiver i=", receiverIndex)
          break
        }
        receiverIndex++
      }
      if (this.selectedType == 'reference') {
        ($("#referencePopBox .receiver").get(0) as any).selectedIndex = receiverIndex;
      } else if (this.selectedType == 'constraint') {
        ($("#constraintPopBox .receiver").get(0) as any).selectedIndex = receiverIndex;
      }

    }
    
    //type
    let typeIndex = 0
    for (let type of this.phenomenonTypes) {
      if (type == phe.phenomenon_type) {
        console.log('type i=', typeIndex)
        break
      }
      typeIndex++
    }

    if (this.selectedType == 'reference') {
      // setTimeout(
      //   function(){
      //     setTimeout(
      //       function(){
      //       },
      //       50);
      //   },
      //   15);

      $("#referencePopBox .name").val(phe.phenomenon_name);
      ($("#referencePopBox .phenomenonType").get(0) as any).selectedIndex = typeIndex
    } else if (this.selectedType == 'constraint') {

      $("#constraintPopBox .name").val(phe.phenomenon_name);
      ($("#constraintPopBox .phenomenonType").get(0) as any).selectedIndex = typeIndex
    } else if (this.selectedType == 'interface') {

      $("#interfacePopBox .name").val(phe.phenomenon_name);
      ($("#interfacePopBox .phenomenonType").get(0) as any).selectedIndex = typeIndex
    }

    //constraint
    // let constraint = phe.phenomenon_constraint
    // let selectedDiv = document.getElementById(this.selectedType + 'PopBox');
    // let checkbox = selectedDiv.getElementsByClassName("checkbox")[0] as any
    // console.log(constraint)
    // checkbox.checked = constraint
  }

  //deletePhenomenon
  deletePhenomenon() {
    this.deletePhenomenonByNo(this.selectedPhenomenonNo, this.phenomenonList)
    this.projectService.sendProject(this.project);
  }
  deletePhenomenonByNo(phenomenonNo, phenomenonList) {
    let i = 0;
    for (let phenomenon of phenomenonList) {
      if (phenomenon.phenomenon_no == phenomenonNo) {

        this.delete_phe.push(phenomenonNo)
        this.delete_phe.sort((a,b) => a - b);
        console.log("delete_phe:");
        console.log(this.delete_phe);

        phenomenonList.splice(i, 1);
      }
      i += 1;
    }
  }

  updateDecision(ctrlNode: CtrlNode) {
    var id = this.clickedPaper.id;
    this.saveCtrlNode(id.substring(0, id.length - 1), ctrlNode);
    // this.clickedPaper.model.getElements() 获取所有节点
    for (let nodeElement of this.clickedPaper.model.getElements()) {
      if (nodeElement.attr('root').title === ctrlNode.node_type + ctrlNode.node_no) {
        nodeElement.attr({
          label: {
            text: ctrlNode.node_text,
          },
        });
        break;
      }
    }
  }

  updateDelay(ctrlNode: CtrlNode) {
    // console.log(ctrlNode)
    var id = this.clickedPaper.id;
    let selectElement = document.getElementById("delayType") as HTMLSelectElement;
    let selectedIndex = selectElement.selectedIndex;
    let delayType = selectElement.options[selectedIndex].text;
    console.log("delayType:" + delayType)

    var that = this;
    for (let nodeElement of this.clickedPaper.model.getElements()) {
      if (nodeElement.attr('root').title === ctrlNode.node_type + ctrlNode.node_no) {
        if (delayType == "at") {
          // console.log("at")
          ctrlNode.delay_type = "at";
          this.saveCtrlNode(id.substring(0, id.length - 1), ctrlNode);
          nodeElement.attr({
            label: {
              text: 'at ' + ctrlNode.node_text,
            },
          });
        } else {
          // console.log("after")
          ctrlNode.delay_type = "after";
          this.saveCtrlNode(id.substring(0, id.length - 1), ctrlNode);
          nodeElement.attr({
            label: {
              text: 'after ' + ctrlNode.node_text,
            },
          });
        }
        break;
      }
    }
  }

  updateLine(line: Line) {
    var id = this.clickedPaper.id;
    // this.saveLine(id.substring(0, id.length - 1), line);
    // this.clickedPaper.model.getLinks() 获取所有连线
    for (let link of this.clickedPaper.model.getLinks()) {
      var linkName = link.attr('root').title;
      if (linkName == line.line_type + line.line_no) {
        link.labels([{
          attrs: {
            text: {
              text: line.condition
            }
          }
        }]);
      }
    }
  }

  updateMachine(machine: Machine) {
    console.log(machine)
    var id = this.clickedPaper.id;
    this.saveMachine(id.substring(0, id.length - 1), machine);
    for (let nodeElement of this.clickedPaper.model.getElements()) {
      console.log('machine:' + this.clickMachine.machine_shortName)
      console.log('machine:' + this.clickMachine.machine_name)
      console.log(nodeElement.attr('root').title)

      if (nodeElement.attr('root').title === this.clickMachine.machine_name) {
        console.log('yes');
        nodeElement.attr({
          label: {
            text: machine.machine_name + '\n(' + machine.machine_shortName + ')',
          },
          root: {
            title: 'machine:' + machine.machine_shortName,
          }
        });
      }
    }
  }

  saveMachine(spdName: string, machine: Machine) {
    console.log(spdName)
    var spdList = this.project.subProblemDiagramList;
    for (let spd of spdList) {
      if (spd.title === spdName) {
        var interfaceList = spd.interfaceList;
        for (let inte of interfaceList) {
          if (inte.interface_from === this.clickMachine.machine_shortName) {
            inte.interface_from = machine.machine_shortName;
            let pheList = inte.phenomenonList;
            for (let phe of pheList) {
              if (phe.phenomenon_from === this.clickMachine.machine_shortName) {
                phe.phenomenon_from = machine.machine_shortName;
              } else if (phe.phenomenon_to === this.clickMachine.machine_shortName) {
                phe.phenomenon_to = machine.machine_shortName;
              }
            }
            inte.interface_description = inte.interface_description.replace(this.clickMachine.machine_shortName, machine.machine_shortName);
          } else if (inte.interface_to === this.clickMachine.machine_shortName) {
            inte.interface_to = machine.machine_shortName;
            let pheList = inte.phenomenonList;
            for (let phe of pheList) {
              if (phe.phenomenon_from === this.clickMachine.machine_shortName) {
                phe.phenomenon_from = machine.machine_shortName;
              } else if (phe.phenomenon_to === this.clickMachine.machine_shortName) {
                phe.phenomenon_to = machine.machine_shortName;
              }
            }
            inte.interface_description = inte.interface_description.replace(this.clickMachine.machine_shortName, machine.machine_shortName);
          }
        }
        for (let constraint of spd.constraintList) {
          if (constraint.constraint_from === this.clickMachine.machine_shortName) {
            constraint.constraint_from = machine.machine_shortName
          } else if (constraint.constraint_to === this.clickMachine.machine_shortName) {
            constraint.constraint_to = machine.machine_shortName
          }
          for (let phe of constraint.phenomenonList) {
            if (phe.phenomenon_from === this.clickMachine.machine_shortName) {
              phe.phenomenon_from = machine.machine_shortName;
            } else if (phe.phenomenon_to === this.clickMachine.machine_shortName) {
              phe.phenomenon_to = machine.machine_shortName;
            }
          }
          constraint.constraint_description = constraint.constraint_description.replace(this.clickMachine.machine_shortName, machine.machine_shortName);
        }
        for (let reference of spd.referenceList) {
          if (reference.reference_from === this.clickMachine.machine_shortName) {
            reference.reference_from === machine.machine_shortName
          } else if (reference.reference_to === this.clickMachine.machine_shortName) {
            reference.reference_to === machine.machine_shortName
          }
          for (let phe of reference.phenomenonList) {
            if (phe.phenomenon_from === this.clickMachine.machine_shortName) {
              phe.phenomenon_from = machine.machine_shortName;
            } else if (phe.phenomenon_to === this.clickMachine.machine_shortName) {
              phe.phenomenon_to = machine.machine_shortName;
            }
          }
          reference.reference_description = reference.reference_description.replace(this.clickMachine.machine_shortName, machine.machine_shortName);
        }
      }
    }
  }
}
