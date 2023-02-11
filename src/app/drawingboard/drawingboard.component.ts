import { Reference } from '@angular/compiler/src/render3/r3_ast';
import { Component, OnInit } from '@angular/core';
import { EventManager } from '@angular/platform-browser';
import { ActivatedRoute, Params } from '@angular/router';
import * as joint from 'node_modules/jointjs/dist/joint.js';
import { CtrlNode } from '../entity/CtrlNode';
import { Interface } from '../entity/Interface';
import { Line } from '../entity/Line';
import { Node } from '../entity/Node';
import { Machine } from '../entity/Machine';
import { Phenomenon } from '../entity/Phenomenon';
import { ProblemDomain } from '../entity/ProblemDomain';
import { Project } from '../entity/Project';
import { ComponentChoiceService } from '../service/component-choice.service';
import { DrawGraphService } from '../service/draw-graph.service';
import { FileService } from '../service/file.service';
// import * as _ from 'lodash';
import { ProjectService } from '../service/project.service';
import { CCSLSet } from '../entity/CCSLSet';
import { VerficationService } from '../service/verfication.service';
import { TextService } from "../service/text.service";

declare var $: JQueryStatic;

@Component({
  selector: 'app-drawingboard',
  templateUrl: './drawingboard.component.html',
  styleUrls: ['./drawingboard.component.css']
})

export class DrawingboardComponent implements OnInit {

  num = $('#tablabel').children.length + 1;
  // new=false;

  papers = new Array<joint.dia.Paper>();
  // PhysicalPropertys = ['Clock', 'Data Storage','Sensor Device','Actuator Device','Active Device'];
  DomainTypes = ['Clock', 'Data Storage','Sensor','Actuator','Active Device','Passive Device'];
  // ['Causal', 'Biddable', 'Lexical'];
  phenomenonTypes = ['instruction','signal', 'state', 'value'];
  
  projectname: string;
  versionname: string;

  step = 0;
  constructor(
    public component_choice_service: ComponentChoiceService,
    private route: ActivatedRoute,
    public dg_service: DrawGraphService,
    private textService: TextService,
    private fileService: FileService,
    private projectService: ProjectService,
    private verficationService: VerficationService,
    private eventManager: EventManager) {
    var that = this;
    projectService.stepEmmited$.subscribe(
      step => {
        if (this.step < 5 && step >= 5) {
          console.log('change_Menu(2)：' + this.step + "," + step)
          this.change_Menu(2);
        } else if (this.step >= 5 && step < 5) {
          this.change_Menu(1);
          console.log('change_Menu(1)：' + this.step + "," + step)
        }
        this.step = step;
        // console.log(this.step)
      }
    )
    projectService.changeEmitted$.subscribe(
      project => {
        this.project = project;
        // console.log(this.project)
        // if(that.project.scenarioGraphList != undefined){
        //   that.initBoard();
        //   console.log(that.tabList)
        //   document.getElementById("content1").style.display = 'none';
        //   document.getElementById("content2").style.display = 'none';
        //   that.interval = setInterval(function () {
        //     clearInterval(that.interval);
        //     if (that.tabList) {
        //       for (var i = 0; i < that.tabList.length; i++) {
        //         const id = that.tabList[i] + 'M';
        //         document.getElementById(id).style.display = 'block';
        //         that.dg_service.drawSenarioGraph(that.project, that.project.scenarioGraphList[i]);
        //       }
        //     }
        //     // that.dg_service.drawDiagram(this.project);
        //   }, 1000);
        // }
      }
    )
    projectService.scenarioEmitted$.subscribe(
      scenarioList => {
        this.project.scenarioGraphList = scenarioList;
        console.log(this.project)
        this.projectService.sendProject(this.project);
        var that = this;
        that.initBoard();
        console.log(this.tabList)
        that.interval = setInterval(function () {
          clearInterval(that.interval);
          if (that.project.scenarioGraphList) {
            for (var i = 0; i < that.project.scenarioGraphList.length; i++) {
              const id = that.tabList[i] + 'M';
              document.getElementById(id).style.display = 'block';
              that.dg_service.drawSenarioGraph(that.project, that.project.scenarioGraphList[i]);
            }
          }
        }, 100);
      }
    )
    projectService.fullScenarioEmitted$.subscribe(
      fullScenarioGraph => {
        this.project.fullScenarioGraph = fullScenarioGraph;
        console.log(this.project)
        var that = this;
        that.interval = setInterval(function () {
          clearInterval(that.interval);
          // 不需要drawFullSenarioGraph功能，故将这部分代码注释掉
          // if (that.project.fullScenarioGraph) {
          //   document.getElementById("content3").style.display = 'block';
          //   that.dg_service.drawFullSenarioGraph(that.project.fullScenarioGraph);
          // }
        }, 100);
      }
    )
    projectService.newScenarioEmitted$.subscribe(
      scenarioList => {
        this.project.newScenarioGraphList = scenarioList;
        console.log('projectService.newScenarioEmitted:', this.project);
        var that = this;
        this.initBoard();
        console.log('projectService.newScenarioEmitted:', this.tabList)
        that.interval = setInterval(function () {
          clearInterval(that.interval);
          if (that.project.newScenarioGraphList) {
            for (var i = 2; i < that.project.newScenarioGraphList.length + 2; i++) {
              const id = that.tabList[i] + 'M';
              // console.log(id);
              document.getElementById(id).style.display = 'block';
              that.dg_service.drawNewSenarioGraph(that.project, that.project.newScenarioGraphList[i - 2]);
            }
          }
        }, 100);
      }
    )
    projectService.spdEmitted$.subscribe(
      spdList => {
        this.project.subProblemDiagramList = spdList;
        this.spdList = spdList;
        console.log(this.project)
        var that = this;
        this.initBoard();
        console.log(this.tabList)
        that.interval = setInterval(function () {
          clearInterval(that.interval);
          if (that.project.subProblemDiagramList) {
            for (var i = 0; i < that.project.subProblemDiagramList.length; i++) {
              const id = that.project.subProblemDiagramList[i].title + 'M';
              console.log(id)
              document.getElementById(id).style.display = 'block';
            }
            that.dg_service.drawNewSpd(that.project);
          }
        }, 100);
      }
    )
    dg_service.decisionEmmited$.subscribe(
      ctrlNode => {
        // console.log('Decision');
        this.ctrlNode = ctrlNode;
        this.showDecision();
      }
    )
    dg_service.delayEmmited$.subscribe(
      ctrlNode => {
        this.ctrlNode = ctrlNode;
        this.showDelay();
      }
    )
    dg_service.conditionNodeEmmited$.subscribe(
      node => {
        this.intNode = node;
        this.showCondition();
      }
    )
    dg_service.lineEmmited$.subscribe(
      line => {
        // console.log('Decision');
        this.line = line;
        this.showLine();
      }
    )
    dg_service.intListEmmited$.subscribe(
      pheList => {
        console.log(pheList)
        this.intList = pheList;
        this.editInt(pheList);
      }
    )
    dg_service.conditionIntListEmmited$.subscribe(
      pheList => {
        console.log(pheList)
        this.conditionIntList = pheList;
      }
    )
    dg_service.editMachineEmmited$.subscribe(
      machine => {
        console.log("showEditMachine")
        this.machine = machine;
        this.showEditMachine();
      }
    )
    dg_service.domainEmmited$.subscribe(
      domain => {
        console.log("showDomain")
        this.problemDomain = domain;
        this.showDomain();
      }
    )
    dg_service.interfaceEmmited$.subscribe(
      inte => {
        console.log(inte);
        this.inte = inte;
        this.showInterface();
      }
    )
    dg_service.referenceEmmited$.subscribe(
      reference => {
        // console.log('Reference');
        this.reference = reference;
        this.showReference();
      }
    )
    verficationService.ccslEmmited$.subscribe(
      ccslsetList => {
        this.ccslsetList = ccslsetList;
        console.log(ccslsetList.length)
        console.log(ccslsetList)
      });
  }


  ngOnInit() {
    this.eventManager.addGlobalEventListener('window', 'keyup.delete', () => {
      this.deleteCell();
      this.dg_service.deleteListen = false;
      if (this.dg_service.clickedSceElement != null) {
        this.dg_service.deleteSceElement();
      }
      if (this.dg_service.clickedLink != null) {
        this.dg_service.deleteLink();
      }
    });
    
    this.route.queryParams.subscribe((params: Params) => {
      this.projectname = params['projectname'];
      this.versionname = params['version'];
      this.versionname = undefined;
      console.log('get_url_projectname1:' + this.projectname);
      console.log('get_url_version1:' + this.versionname);
      if(this.projectname != undefined){
        this.judgePro(this.projectname,this.versionname);
      }
    });
    
    // this.test()
  }

  // onResize(event) {
  //   // console.log(event.target.innerWidth);
  //   // console.log(event.target.innerHeight);
  //   if (this.dg_service.papers[0] != undefined) {
  //     let width = event.target.innerWidth * 0.79;
  //     let height = event.target.innerHeight * 0.91 * 0.98;
  //     this.dg_service.papers[0].setDimensions(width, height);
  //     this.dg_service.papers[1].setDimensions(width, height);
  //   }
  // }
  // test(){
  //   this.dg_service.initProject('123');
  //     this.dg_service.initPapers();
  // }
  projectAddress;
  varsion: string;
  project = new Project();
  ScenarioProject: Project;
  spdList = this.project.subProblemDiagramList;
  interval;
  tab: string;
  tabList: string[];
  problemIcon;
  scenarioIcon;
  ctrlNode: CtrlNode;
  line: Line;
  intList: Phenomenon[];
  machine = new Machine();
  problemDomain: ProblemDomain;
  inte: Interface;
  reference: Reference;
  intNode: Node;
  conditionIntList: Phenomenon[];
  pheList: Phenomenon[];
  conditionSelected;
  intSelected;
  ccslsetList: CCSLSet[];

  judgePro(projectname,versionname){
    var pro_is_flag = false;
    var projectlist;
    this.fileService.searchProject().subscribe(
      projects => {
        projectlist = projects;
        console.log(projectlist);
        for(let pro of projectlist){
          if(pro == projectname){
            pro_is_flag = true;
            console.log(pro);
            break;
          }
        }
        console.log("pro_is_flag="+pro_is_flag);
        if(pro_is_flag){
          // this.openwithurl(projectname,versionname);
          if(versionname == undefined){
            this.openwithurl(projectname,versionname);
          }else{
            this.judgeVer(projectname,versionname);
          }
        }else{
          alert(projectname+"is not exist!")
        }
      }
    )
  }
  judgeVer(projectname,versionname){
    var ver_is_flag = false;
    var versionlist;
    this.fileService.searchVersion(projectname).subscribe(
      versions => {
        versionlist = versions;
        console.log(versionlist);
        for(let ver of versionlist){
          if(ver == versionname){
            ver_is_flag = true;
            break;
          }
        }
        console.log("ver_is_flag="+ver_is_flag);
        if(ver_is_flag){
          this.openwithurl(projectname,versionname);
        }
      }
    )
  }
  openwithurl(projectname,versionname) {
    if (projectname != undefined) {
      var that = this;
      that.interval = setInterval(function () {
        clearInterval(that.interval);
        that.dg_service.getProject(projectname, undefined);
        let interval_t_d = setInterval(function () {
          if (!that.dg_service.isProjectNull) clearInterval(interval_t_d);
          that.dg_service.register2(
            that.dg_service.projectAddress,
            undefined,
            that.dg_service.project
          );
        }, 500);

        let iinterval = setInterval(function () {
          if (that.textService.isPfNull)
            that.textService.getNotNullPf(projectname, undefined);
          if (!that.textService.isPfNull) {
            clearInterval(iinterval);
            let pf =
              that.textService.pf == ""
                ? "#" + that.textService.projectAddress + "#\n"
                : that.textService.pf;
            that.textService.register(that.textService.projectAddress, undefined, pf);
          }
        }, 1000);
      }, 1000);
      
    }
    
  }

  
  deleteCell() {
    //var popBox = document.getElementById('deletePopBox');
    //popBox.style.display = "none";
    if (this.dg_service.deleteListen == true) {
      console.log("delete")
      this.dg_service.deleteElement(this.dg_service.graphs[this.dg_service.selectedGraphIndex])
    }
  }

  showScenarioIcon() {
    let problemIcon = document.getElementById("problem-icon");
    let scenarioIcon = document.getElementById("scenario-icon");
    problemIcon.style.display = "none";
    scenarioIcon.style.display = "block";
  }

  initPopBox() {
    //console.log('initPopBox')
    if (this.dg_service.selectedType == 'machine') {
      this.dg_service.initMachinePopBox();
    } else if (this.dg_service.selectedType == 'problemDomain') {
      this.dg_service.initDomainPopBox();
    } else if (this.dg_service.selectedType == 'requirement') {
      this.dg_service.initRequirementPopBox();
    } else if (this.dg_service.selectedType == 'interface') {
      this.dg_service.initInterfacePopBox();
    } else if (this.dg_service.selectedType == 'reference') {
      this.dg_service.initReferencePopBox();
    } else if (this.dg_service.selectedType == 'constraint') {
      this.dg_service.initConstraintPopBox();
    }
  }

  GetObj(objName) {
    if (document.getElementById) {
      return eval('document.getElementById("' + objName + '")');
    }
  }

  change_Menu(index): void {
    var element1: any = document.getElementById("scenarioGraphTab");
    if (element1) {
      element1.open = false;
    }
    var element2: any = document.getElementById("newScenarioGraphTab");
    if (element2) {
      element2.open = false;
    }
    var element3: any = document.getElementById("subProblemTab");
    if (element3) {
      element3.open = false;
    }
    this.dg_service.selectedGraphIndex = index - 1;
    for (var i = 1; i <= this.num; i++) {
      if (this.GetObj('content' + i) && this.GetObj('lm' + i)) {
        this.GetObj("content" + i).style.display = 'none';
      }
    }
    if (this.project.scenarioGraphList != undefined) {
      for (var i = 0; i < this.project.scenarioGraphList.length; i++) {
        const id = this.project.scenarioGraphList[i].title + 'M';
        // console.log(id)
        this.GetObj(id).style.display = "none";
      }
    }
    if (this.project.newScenarioGraphList != undefined) {
      for (var i = 0; i < this.project.newScenarioGraphList.length; i++) {
        const id = this.project.newScenarioGraphList[i].title + 'M';
        // console.log(id)
        this.GetObj(id).style.display = "none";
      }
    }
    if (this.project.subProblemDiagramList != undefined) {
      for (var i = 0; i < this.project.subProblemDiagramList.length; i++) {
        const id = this.project.subProblemDiagramList[i].title + 'M';
        // console.log(id)
        this.GetObj(id).style.display = "none";
      }
    }

    if (this.GetObj('content' + index) && this.GetObj('lm' + index)) {
      this.GetObj('content' + index).style.display = 'block';
      if (index < 3) {
        this.showProblemIcon();
      } else {
        this.showScenarioIcon();
      }
      this.dg_service.enterTable(index, this.project);
    }
  }

  showProblemIcon() {
    let problemIcon = document.getElementById("problem-icon");
    let scenarioIcon = document.getElementById("scenario-icon");
    problemIcon.style.display = "block";
    scenarioIcon.style.display = "none";
  }

  // close PopBox
  closeBox(event) {
    this.closePopEdit();
    //console.log("close");
  }

  // confirm PopBox
  confirm() {
    let flag = true;
    if (this.dg_service.selectedType == 'machine') {
      //console.log('this.selectedType=="machine"');
      flag = this.dg_service.changeMachineDetail();
    } else if (this.dg_service.selectedType == 'problemDomain') {
      //console.log('this.selectedType=="problemDomain"');
      flag = this.dg_service.changeProblemDomainDetail(this.dg_service.graphs[this.dg_service.selectedGraphIndex]);
    } else if (this.dg_service.selectedType == 'requirement') {
      //console.log('this.selectedType=="requirement"');
      flag = this.dg_service.changeRequirementDetail(this.dg_service.graphs[this.dg_service.selectedGraphIndex]);
    } else if (this.dg_service.selectedType == 'interface') {
      //console.log('this.selectedType=="interface"');
      this.dg_service.changeInterfaceDetail();
    } else if (this.dg_service.selectedType == 'reference') {
      //console.log('this.selectedType=="reference"');
      this.dg_service.changeReferenceDetail();
    } else if (this.dg_service.selectedType == 'constraint') {
      //console.log('this.selectedType=="constraint"');
      this.dg_service.changeConstraintDetail();
    }
    if (flag) this.closePopEdit();
    this.projectService.sendProject(this.dg_service.project);	//组件传值
    //console.log("confirm");
  }

  closePopEdit() {
    //let selectedType = this.dg_service.getElementType(this.dg_service.selectedElement);
    console.log(this.dg_service.selectedType + "PopBox")
    document.getElementById(this.dg_service.selectedType + "PopBox").style.display = "none";
    document.getElementById("popLayer").style.display = "none";
    this.dg_service.phenomenonList = [];
  }

  closeSceBox(id: string) {
    this.closeScePopEdit(id);
    // console.log("close");
  }

  closeScePopEdit(id: string) {
    document.getElementById(id).style.display = "none";
    document.getElementById("popLayer").style.display = "none";
  }

  scenarioGraphTab() {
    var element: any = document.getElementById("scenarioGraphTab");
    // element.open = !element.open;
    // console.log(element.open)
  }

  newScenarioGraphTab() {
    var element: any = document.getElementById("newScenarioGraphTab");
    // element.open = !element.open;
    // console.log(element.open)
  }

  subProblemTab() {
    var element: any = document.getElementById("subProblemTab");
    // element.open = false;

  }

  initBoard() {
    // console.log("new Project");
    var that = this;
    this.tabList = [];
    if (that.project.scenarioGraphList) {
      for (let sg of that.project.scenarioGraphList) {
        that.tabList.push(sg.title);
      }
    }
    if (that.project.newScenarioGraphList) {
      for (let nsg of that.project.newScenarioGraphList) {
        that.tabList.push(nsg.title);
      }
    }
    if (that.project.subProblemDiagramList) {
      for (let spd of that.project.subProblemDiagramList) {
        that.tabList.push(spd.title)
      }
    }
  }
  initBoard1() {
		// console.log("new Project");
		var that = this;
		this.tabList = [];
		if (that.dg_service.project.scenarioGraphList) {
			for (let sg of that.dg_service.project.scenarioGraphList) {
				that.tabList.push(sg.title);
			}
		}
  }
  // 点击上下文图，则隐藏其他画图面板，显示上下文图的画图面板（其他同理）
  change(title: string) {
    console.log('drawingboard.component.ts中change的title', title);
    this.tab = title;
    // const tabList = document.getElementById('tablabel').children;
    this.initBoard();
    console.log(this.tabList)
    if (this.tabList) {
      for (var i = 0; i < this.tabList.length; i++) {
        const id = this.tabList[i] + 'M';
        this.showScenarioIcon();
        document.getElementById(id).style.display = 'none';
      }
    }
    title = title + 'M';
    var element1: any = document.getElementById("scenarioGraphTab");
    if (element1) {
      element1.open = false;
    }
    var element2: any = document.getElementById("newScenarioGraphTab");
    if (element2) {
      element2.open = false;
    }
    var element3: any = document.getElementById("subProblemTab");
    if (element3) {
      element3.open = false;
    }
    document.getElementById("content1").style.display = 'none';
    document.getElementById("content2").style.display = 'none';
    document.getElementById("content3").style.display = 'none';
    document.getElementById(title).style.display = 'block';
    console.log(title)
    // if (title.match("SG")) {
    if(title.substr(0,2) == "SG"){
      for (var i = 0; i < this.project.scenarioGraphList.length; i++) {
        // console.log(this.project.scenarioGraphList[i].title)
        if (title == this.project.scenarioGraphList[i].title + 'M') {
          this.dg_service.drawSenarioGraph(this.project, this.project.scenarioGraphList[i]);
          console.log("enter " + title)
        }
      }
    } else if (title.substr(0,3) == "NSG") {
      console.log("drawNewSenarioGraph")
      for (var i = 0; i < this.project.newScenarioGraphList.length; i++) {
        // console.log(this.project.newScenarioGraphList[i].title)
        if (title == this.project.newScenarioGraphList[i].title + 'M') {
          this.dg_service.drawNewSenarioGraph(this.project, this.project.newScenarioGraphList[i]);
          console.log("enter " + title)
        }
      }
    } else if (title.substr(0,3) == "SPD") {
      for (var i = 0; i < this.project.subProblemDiagramList.length; i++) {
        // console.log(this.project.subProblemDiagramList[i].title)
        if (title == this.project.subProblemDiagramList[i].title + 'M') {
          this.dg_service.drawSubProblemDiagram(this.project.subProblemDiagramList[i]);
          console.log("enter " + title)
        }
      }
    }
  }

  editInt(phelist: Phenomenon[]) {
    var popLayer = document.getElementById("popLayer");
    popLayer.style.display = "block";
    var popBox = document.getElementById('IntPopBox');
    popBox.style.display = "block";
  }

  editPreCondition(phelist: Phenomenon[]) {
    var popLayer = document.getElementById("popLayer");
    popLayer.style.display = "block";
    var popBox = document.getElementById('PreConditionPopBox');
    popBox.style.display = "block";
  }

  editPostCondition(phelist: Phenomenon[]) {
    var popLayer = document.getElementById("popLayer");
    popLayer.style.display = "block";
    var popBox = document.getElementById('PostConditionPopBox');
    popBox.style.display = "block";
  }

  submit(id: string, winId: string) {
    let selectElement = document.getElementById(id) as HTMLSelectElement;
    let selectedIndex = selectElement.selectedIndex;
    let int = selectElement.options[selectedIndex].text;
    console.log(int);
    this.dg_service.getInt(int);
    this.closeSceBox(winId);
  }

  submitCondition(id1: string, id2: string, winId: string) {
    let selectElement1 = document.getElementById(id1) as HTMLSelectElement;
    let selectedIndex1 = selectElement1.selectedIndex;
    let condition = selectElement1.options[selectedIndex1].text;
    this.conditionSelected = selectedIndex1;
    let selectElement2 = document.getElementById(id2) as HTMLSelectElement;
    let selectedIndex2 = selectElement2.selectedIndex;
    let int = selectElement2.options[selectedIndex2].text;
    this.intSelected = selectedIndex2;
    var intNo = parseInt(int.split('int')[1]);
    // console.log(condition);
    // console.log(int);
    // console.log(intNo);
    // console.log(this.intNode)
    this.pheList = this.projectService.getPhenomenon(this.project);
    // console.log(this.pheList)
    // for (var i = 0; i < sgList.length; i++) {
    //   var intNodeList = sgList[i].intNodeList;
    //   for (var j = 0; j < intNodeList.length; j++) {
    //     var node = intNodeList[j];
    //     if(node.node_type === "BehInt" || node.node_type === "ConnInt"){
    //       if (node.node_no === intNo) {
    //         if(condition === "Pre"){
    //           this.intNode.pre_condition = node;
    //         } else if(condition === "Post"){
    //           this.intNode.post_condition = node;
    //         }
    //         break;
    //       }
    //     }
    //   }
    // }
    for (var i = 0; i < this.pheList.length; i++) {
      var node = this.pheList[i];
      if (node.phenomenon_no === intNo) {
        if (condition === "Pre") {
          this.intNode.pre_condition = node;
        } else if (condition === "Post") {
          this.intNode.post_condition = node;
        }
        this.dg_service.updateIntCondition(this.intNode, condition);
        this.dg_service.IntCondition_clone(this.intNode, node, condition);
        break;
      }

    }

    this.closeSceBox(winId);
  }

  submitDecision() {
    console.log("submitDecision")
    var textEle: any = document.getElementById("text");
    var text = textEle.value;
    this.ctrlNode.node_text = text;
    this.dg_service.updateDecision(this.ctrlNode);
    this.closeSceBox('DecisionPopBox');
  }

  submitDelay() {
    var textEle: any = document.getElementById("delayTime");
    var text = textEle.value;
    this.ctrlNode.node_text = text;
    // console.log(text)
    this.dg_service.updateDelay(this.ctrlNode);
    this.closeSceBox('DelayPopBox');
  }

  submitLine() {
    var conditionEle: any = document.getElementById("condition");
    var condition = conditionEle.value;
    this.line.condition = condition;
    this.dg_service.updateLine(this.line);
    this.closeSceBox('LinePopBox');
  }

  submitMachine() {
    let selectedDiv = document.getElementById('EditMachinePopBox');
    let description = (selectedDiv.getElementsByClassName("description")[0] as any).value;
    let shortName = (selectedDiv.getElementsByClassName("shortName")[0] as any).value;
    this.machine.machine_name = description;
    this.machine.machine_shortName = shortName;
    console.log(this.machine)
    this.dg_service.updateMachine(this.machine);
    this.closeSceBox('EditMachinePopBox');
  }

  showDecision() {
    var popLayer = document.getElementById("popLayer");
    popLayer.style.display = "block";
    var popBox = document.getElementById('DecisionPopBox');
    popBox.style.display = "block";
  }

  showDelay() {
    var popLayer = document.getElementById("popLayer");
    popLayer.style.display = "block";
    var popBox = document.getElementById('DelayPopBox');
    popBox.style.display = "block";
  }

  showCondition() {
    var popLayer = document.getElementById("popLayer");
    popLayer.style.display = "block";
    var popBox = document.getElementById('ConditionPopBox');
    popBox.style.display = "block";
  }

  showLine() {
    var popLayer = document.getElementById("popLayer");
    popLayer.style.display = "block";
    var popBox = document.getElementById('LinePopBox');
    popBox.style.display = "block";
  }

  showEditMachine() {
    var popLayer = document.getElementById("popLayer");
    popLayer.style.display = "block";
    var popBox = document.getElementById('EditMachinePopBox');
    popBox.style.display = "block";
  }

  showDomain() {
    var popLayer = document.getElementById("popLayer");
    popLayer.style.display = "block";
    var popBox = document.getElementById('DomainPopBox');
    popBox.style.display = "block";
  }

  showInterface() {
    var popLayer = document.getElementById("popLayer");
    popLayer.style.display = "block";
    var popBox = document.getElementById('InterfacePopBox');
    popBox.style.display = "block";
  }

  showReference() {
    var popLayer = document.getElementById("popLayer");
    popLayer.style.display = "block";
    var popBox = document.getElementById('ReferencePopBox');
    popBox.style.display = "block";
  }

}
