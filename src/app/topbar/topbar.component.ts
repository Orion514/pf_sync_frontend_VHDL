import { Location } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router,ActivatedRoute,Params } from '@angular/router';
import { FileUploader } from 'ng2-file-upload';
import { Subscription } from 'rxjs';
import { Project } from '../entity/Project';
import { Util} from '../entity/Util';
import { ComponentChoiceService } from '../service/component-choice.service';
import { DrawGraphService } from '../service/draw-graph.service';
import { FileService } from '../service/file.service';
import { ProjectService } from '../service/project.service';
import * as util from 'util';
import { TextService } from "../service/text.service";
declare var $: JQueryStatic;

// import { UploadService } from '../service/upload.service';

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.css']
})
export class TopbarComponent implements OnInit {

  @Output() openEvent = new EventEmitter<string[]>();
  @Output() openOwlEvent = new EventEmitter<string[]>();
  @Output() openPOwlEvent = new EventEmitter<string[]>();
  subscription: Subscription;
  project: Project;
  projects: string[];
  owls: string[];
  pOwls: string[];
  sameNameFlag: boolean;
  owlName: string;
  userName: string;
  version: string;
  editorType;
  constructor(
    private route: ActivatedRoute,
    private fileService: FileService,
    private projectService: ProjectService,
    private dg_service: DrawGraphService,
    private textService: TextService,
    private location: Location,
    public component_choice_service: ComponentChoiceService) {
    projectService.changeEmitted$.subscribe(
      project => {
        this.project = project;
      });
    projectService.stepEmmited$.subscribe(
      step => {
        this.step = step;
      });
    this.projectService.owlAddEmitted$.subscribe(
      owlAdd => {
        this.owlAdd = owlAdd;
      });
    this.projectService.ontNameAddEmitted$.subscribe(
      ontName => {
        this.powlName = ontName;
      });
    this.projectService.eOntNameAddEmitted$.subscribe(
      eOntName => {
        this.eowlName = eOntName;
      });
    this.projectService.pOntNameAddEmitted$.subscribe(
      pOntName => {
        this.powlName = pOntName;
      });
    /*
    this.usernameInterval = setInterval(() => {
      let util = new Util();
      console.log('clock');
      if (!(document.cookie.indexOf('username=') >= 0 && util.getQueryVariable('username').length > 0)) {
        document.cookie = 'username=' + util.getQueryVariable('username');
        this.userName = util.getQueryVariable('username');
      }
    }, 1000);*/
  }
  ngOnInit() {
    document.getElementById("drawingboard").style.zIndex = "-1";
    document.getElementById("rightbar").style.zIndex = "-1";
    document.getElementById("leftbar").style.zIndex = "-1";
    document.getElementById("monaco-editor-id").style.zIndex = "-1";
    this.displayDiagram();
    this.route.queryParams.subscribe((params: Params) => {
      var projectname = params['projectname'];
      if(projectname != undefined){
        this.displayDiagram();
      }
    });
    // window.onbeforeunload = () => {
    //   console.log("close/refesh")
    //   this.saveProjectAndPfWithoutAlert();
    // };
  }

  login() {
    let util = new Util();
    document.cookie = 'username=' + util.getQueryVariable('username');
    this.userName = util.getQueryVariable('username');
  }

  projectAddress: string;
  /*  version: string;*/
  uploadFile(): void {
    this.login();
    this.displayDiagram();
    document.getElementById("xmlFile").click();
  }
  uploader: FileUploader = new FileUploader({
    method: "POST",
    itemAlias: "xmlFile",
    autoUpload: false,
  });
  // project;
  interval;
  interval1;
  selectedFileOnChanged(event: any) {
    //console.log(event.target.files);
    var path = event.target.files[0].webkitRelativePath;
    this.projectAddress = path.split('/')[0];
    console.log(this.projectAddress)
    console.log('即将调用upload!');
    this.upload();
    // this.addNewItem(this.projectAddress);
  }

  // openProject() {
  //   //console.log("open");
  //   this.login();
  //   console.log('document.cookie:', document.cookie);
  //   this.fileService.searchProject().subscribe(
  //     projects => {
  //       this.projects = projects;
  //       console.log(this.projects);
  //       this.openEvent.emit(projects)
  //     }
  //   )
  // }
  openProject(type) {
    //console.log("open");
    // let username = this.fileService.getUserName();
    // if (username == null || username == "") {
    //   alert("Please Login")
    //   return;
    // }
    if (type == "diagram") this.displayDiagram();
    else this.displayText();
    this.fileService.searchProject().subscribe((projects) => {
      this.projects = projects;
      // console.log(this.projects)
      this.openEvent.emit(projects);
    });
  }
  displayDiagram() {
    document.getElementById("drawingboard").style.zIndex = "3";
    document.getElementById("rightbar").style.zIndex = "3";
    document.getElementById("leftbar").style.zIndex = "3";
    document.getElementById("monaco-editor-id").style.zIndex = "-1";
    this.editorType = "diagram";
  }

  displayText() {
    document.getElementById("drawingboard").style.zIndex = "-1";
    document.getElementById("rightbar").style.zIndex = "-1";
    document.getElementById("leftbar").style.zIndex = "-1";
    document.getElementById("monaco-editor-id").style.zIndex = "3";
    this.editorType = "text";
  }

  switchInterface() {
    if (this.editorType == "text") {
      this.displayDiagram();
      this.editorType = "diagram";
    } else if (this.editorType == "diagram") {
      this.displayText();
      this.editorType = "text";
    }
  }
  // newFile(): void {
  //   this.login();
  //   this.fileService.newProject(true);
  //   //this.dg_service.initPapers();
  // }
  newFile(type): void {
    this.login();
    if (type == "diagram") this.displayDiagram();
    else this.displayText();
    this.fileService.newProject(true);
    //this.dg_service.initPapers();
  }
  step = 1;
  merge() {
    this.login();
    //console.log(this.dg_service.project)
    if (this.step < 2) {
      this.component_choice_service.set_choice_false();
      this.component_choice_service.merge = true;
    }
  }
  upload() {
    this.login();
    /*this.version = new Date().getTime().toString();*/
    console.log('this.fileService.setProject(this.projectAddress)')
    this.fileService.setProject(this.projectAddress).subscribe(
      res => {
        console.log(res);
        if (res === true) {
          alert('The project was imported successfully!');
          this.fileService.uploadFile(this.uploader);
          console.log(this.uploader)
          var that = this;
          that.interval = setInterval(function () {
            clearInterval(that.interval);
            console.log(that.projectAddress);
            that.dg_service.getProject(that.projectAddress, undefined);
            let interval_t_d = setInterval(function () {
              if (!that.dg_service.isProjectNull) clearInterval(interval_t_d);
              let projectAddress = that.dg_service.projectAddress;
              that.dg_service.register2(
                projectAddress,
                undefined,
                that.dg_service.project
              );
            }, 500);

            let iinterval = setInterval(function () {
              if (that.textService.isPfNull)
                that.textService.getNotNullPf(that.projectAddress, undefined);
              if (!that.textService.isPfNull) {
                clearInterval(iinterval);
                let projectAddress = that.textService.projectAddress;
                let pf =
                  that.textService.pf == ""
                    ? "#" + that.textService.projectAddress + "#\n"
                    : that.textService.pf;
                that.textService.register(projectAddress, undefined, pf);
              }
            }, 1000);
          }, 1000);
        } else {
          alert('The project already exists!');
        }
      }
    );
  }


  saveProject() {
    // this.login();
    var project = this.dg_service.project;
    var result: boolean;
    this.projectAddress = this.dg_service.projectAddress;
    this.dg_service.changeLinkPosition(project);
    if (project.contextDiagram.machine == null && project.contextDiagram.problemDomainList.length == 0
      && project.problemDiagram.requirementList.length == 0) {
      alert("Empty project!")
      return
    }
    console.log(project)
    this.fileService.saveProject(this.projectAddress, project).subscribe(
      res => {
        result = res;
        if(result){
					alert("save succeed!");
				}else{
					alert("save failed!");
				}
      }
    );
  }
  saveProjectAndPf() {
    var project = this.dg_service.project;
    var pf = this.textService.getText();
    var result: boolean;
    this.projectAddress = this.dg_service.projectAddress;
    this.dg_service.changeLinkPosition(project);
    if (
      project.contextDiagram == undefined ||
      project.contextDiagram == null ||
      (project.contextDiagram.machine == null &&
        project.contextDiagram.problemDomainList.length == 0 &&
        project.problemDiagram.requirementList.length == 0)
    ) {
      alert("Empty project!");
      return;
    }
    this.fileService
      .saveProject(this.projectAddress, project)
      .subscribe((res) => {
        result = res;
        if (res) {
          this.fileService.savePf(this.projectAddress, pf).subscribe((res) => {
            this.dg_service.isSaved = true;
            alert("save succeed!");
          });
        }else{
					alert("save failed!");
				}
      });
  }
  saveProjectAndPfWithoutAlert() {
    var project = this.dg_service.project;
    var pf = this.textService.getText();
    var result: boolean;
    this.projectAddress = this.dg_service.projectAddress;
    this.dg_service.changeLinkPosition(project);
    if (
      project.contextDiagram == undefined ||
      project.contextDiagram == null ||
      (project.contextDiagram.machine == null &&
        project.contextDiagram.problemDomainList.length == 0 &&
        project.problemDiagram.requirementList.length == 0)
    ) {
      // alert("Empty project!");
      return;
    }
    this.fileService
      .saveProject(this.projectAddress, project)
      .subscribe((res) => {
        result = res;
        if (res) {
          this.fileService.savePf(this.projectAddress, pf).subscribe((res) => {
            this.dg_service.isSaved = true;
            // alert("save succeed!");
          });
        }else{
					// alert("save failed!");
				}
      });
  }
  //导出模板下载
  download() {
    //后台方法、文件类型、文件名
    //this.projectAddress = window.location.pathname.split('/')[1];
    // if (this.version === undefined){
    // this.version = window.location.pathname.split('/')[2];
    // }
    // this.login();
    var project = this.dg_service.project;
    this.fileService.downloadProject(project.title)
    var username = this.fileService.getUserName()
    // var url = `http://re4cps.org:8089/file/download/${project.title}?username=${username}`;
    var url = `http://localhost:8089/file/download/${project.title}/${username}`;
    //console.log(url);
    var form = document.createElement('form');
    document.body.appendChild(form);
    form.style.display = "none";
    form.action = url;
    form.id = 'excel';
    form.method = 'post';
    var newElement = document.createElement("input");
    newElement.setAttribute("type", "hidden");
    form.appendChild(newElement);
    form.submit();
    return

  }
  owlAdd: string;
  powlName: string;
  eowlName: string;
  type: string;
  uploadOWLFlag: Boolean;

  format() {
    // this.login();
    var project = this.dg_service.project;
    var result: boolean;
    this.projectAddress = project.title;
    this.dg_service.changeLinkPosition(project);
    this.fileService.format(this.projectAddress, project).subscribe(
      res => {
        result = res;
        if (res) {
          alert('Save succeed!')
          this.format_download();
        }
      }
    );
  }

  format_download() {
    //后台方法、文件类型、文件名
    //this.projectAddress = window.location.pathname.split('/')[1];
    // if (this.version === undefined){
    // this.version = window.location.pathname.split('/')[2];
    // }
    var project = this.dg_service.project;
    var username = this.fileService.getUserName()
    var url = `http://localhost:8089/file/formatdownload/${project.title}/${username}`;
    var form = document.createElement('form');
    document.body.appendChild(form);
    form.style.display = "none";
    form.action = url;
    form.id = 'excel';
    form.method = 'post';

    var newElement = document.createElement("input");
    newElement.setAttribute("type", "hidden");
    form.appendChild(newElement);

    form.submit();
  }

  //===============owl=================
  //upload owl
  uploadPOwl(): void {
    // this.login();
    this.uploader.clearQueue();
    this.type = 'powl';
    this.owlAdd = this.dg_service.project.title;
    this.projectService.sendOwlAdd(this.owlAdd);
    document.getElementById("ontologyFile").click();
  }
  uploadEOwl(): void {
    // this.login();
    this.uploader.clearQueue();
    this.type = 'eowl';
    // if (this.owlAdd == undefined) {
    this.owlAdd = this.dg_service.project.title;
    this.projectService.sendOwlAdd(this.owlAdd);
    // }
    //若未创建项目,或当前项目为空项目，允许用户上传，否则提示不能上传
    if (this.dg_service.projectAddress == undefined || (this.dg_service.project.contextDiagram.machine == undefined)) {
      console.log(this.dg_service.project)
      document.getElementById("ontologyFile").click();
    } else {
      console.log(this.dg_service.project)
      alert("This operation will overwrite the existing project, please create a new project before uploading the owl file!")
    }
  }
  // 上传eowl文件的隐藏事件
  // 通过点击Ontology-Eontology-Upload，在未创建项目,或当前项目为空项目的时候触发
  selectedOWLOnChanged(event: any) {
    console.log("this.type="+this.type);
    if (this.type === 'powl') {
      this.powlName = this.uploader.queue[0].file.name;
      this.projectService.sendOntName(this.powlName);
      this.owlName = this.powlName
      //console.log("this is pontology name: "+this.powlName);
    }
    else if (this.type === 'eowl') {
      this.eowlName = this.uploader.queue[0].file.name;
      this.projectService.sendEOntName(this.eowlName);
      this.owlName = this.eowlName
    }

    var that = this
    that.sameNameFlag = false;
    //若未新建项目,则创建项目
    if (that.dg_service.projectAddress == undefined) {
      let title = that.owlName.substring(0, that.owlName.length - 4)
      that.fileService.searchProject().subscribe(
        projects => {
          //判断是否有重名项目
          // console.log(projects)
          for (let pro of projects) {
            if (pro == title) {
              console.log("sameNameFlag = " + that.sameNameFlag)
              that.sameNameFlag = true
              alert(title + " already exist! please new a project with other name!")
              return
            }
          }
          if (!that.sameNameFlag) {
            that.dg_service.projectAddress = title
            that.dg_service.project.title = title
            that.dg_service.register_new(title, "undefined")
            that.owlAdd = title;
            that.projectService.sendOwlAdd(that.owlAdd);
            console.log("sameNameFlag = " + that.sameNameFlag)
            that.fileService.uploadOwlFile(that.uploader, that.type, that.owlAdd);
            if (that.type == "eowl") {
              setTimeout(
                function () {
                  that.fileService.getProblemDomains(that.owlAdd, that.owlName).subscribe(
                    nodes => {
                      that.dg_service.ontologyEntities = nodes;
                      that.dg_service.initProjectWithOntology(that.dg_service.project.title);
                      //创建项目后保存，防止忘记保存，后面打开项目时出错（machine为空，无法打开项目）
                      that.saveProjectAndPfWithoutAlert()
                      that.uploadOWLFlag = true;
                      that.projectService.uploadOWL(that.uploadOWLFlag);
                    })
                }
                , 1500)
            } else if (that.type == "powl") {//new a empty project
              console.log("上传 powl 文件时新建一个空项目");
              this.dg_service.register_new(that.dg_service.projectAddress, "undefined")
              this.textService.register_new(that.dg_service.projectAddress, "undefined");
              this.dg_service.initProject(that.dg_service.projectAddress);
              this.dg_service.initPapers();
            }
          }
        })
    } else {//若已创建项目,则直接上传
      console.log("selectedOWLOnChanged", that.dg_service.projectAddress)
      that.fileService.uploadOwlFile(that.uploader, that.type, that.owlAdd);
      if (that.type == "eowl") {//若是eowl,获取问题领域，初始化
        setTimeout(
          function () {
            that.fileService.getProblemDomains(that.owlAdd, that.eowlName).subscribe(
              nodes => {
                that.dg_service.ontologyEntities = nodes;
                that.dg_service.initProjectWithOntology(that.dg_service.project.title);
                //创建项目后保存，防止忘记保存，后面打开项目时出错（machine为空，无法打开项目）
                that.saveProjectAndPfWithoutAlert()
                that.uploadOWLFlag = true;
                that.dg_service.uploadOWLFlag = true;
                that.projectService.uploadOWL(that.uploadOWLFlag);
              })
          }
          , 1500)
      }
    }
  }
  //导入owl文件后自动保存，即使项目为空也不提示
  saveProjectWithoutAlert() {
    var project = this.dg_service.project;
    var result: boolean;
    this.projectAddress = this.dg_service.projectAddress;
    this.dg_service.changeLinkPosition(project);
    var username = this.fileService.getUserName()
    if (project.contextDiagram.machine == null && project.contextDiagram.problemDomainList.length == 0
      && project.problemDiagram.requirementList.length == 0) {
      return
    }
    this.fileService.saveProject(this.projectAddress, project).subscribe(
      res => {
        result = res;
        if (res) {
          this.dg_service.isSaved = true;
        }
      }
    );
  }

  //import existing owl
  openEOwl() {
    if (this.dg_service.projectAddress == null) {
      alert("please new a project!")
      return
    }
    this.fileService.searchOwl("eowl").subscribe(
      owls => {
        this.owls = owls
        this.openOwlEvent.emit(owls)
        this.owlAdd = this.dg_service.project.title;
        this.projectService.sendOwlAdd(this.owlAdd);
      }
    )
  }

  openPOwl() {
    //console.log("open");
    this.fileService.searchOwl("powl").subscribe(
      pOwls => {
        this.pOwls = pOwls
        // console.log(pOwls)
        this.openPOwlEvent.emit(pOwls)
        this.owlAdd = this.dg_service.project.title;
        this.projectService.sendOwlAdd(this.owlAdd);
      }
    )
  }
  //show owl
  nodes: string[];
  pOntShow(): void {
    if (this.dg_service.projectAddress == null) {
      alert("please new a project and import existing owl or upload a new owl!")
      return
    }
    this.fileService.getNodes(this.owlAdd, this.powlName, "Thing", "powl").subscribe(
      nodes => {
        this.nodes = nodes;
        this.projectService.sendPNodes(this.nodes);
      });


    this.projectService.pOntShow(true);
  }
  eOntShow(): void {
    if (this.dg_service.projectAddress == null) {
      alert("please new a project and import existing owl or upload a new owl!")
      return
    }
    this.fileService.getNodes(this.owlAdd, this.eowlName, "Thing", "eowl").subscribe(
      nodes => {
        this.nodes = nodes;
        this.projectService.sendENodes(this.nodes);
      });
    this.projectService.eOntShow(true);
  }
  //check diagram and not set step
  check() {
    switch (this.step) {
      case 1:
      case 2:
      case 3:
      case 4:
        var errorList;
        var project_to = this.dg_service.project;
        this.projectService.checkCorrectContext(project_to).subscribe(
          errors => {
            errorList = errors;
            this.sendErrors(errorList);
            if (this.projectService.getRes(errorList)) {
              alert('The context diagram is correct.')
            } else {
              console.log(this.project)
            }
          }
        );
        break;
      case 5:
        // var errorList;
        // var project_to = this.dg_service.project;
        // this.projectService.checkCorrectContext(project_to).subscribe(
        //   errors => {
        //     errorList = errors;
        //     this.sendErrors(errorList);
        //     if (this.projectService.getRes(errorList)) {
        //       alert('The context diagram is correct.')
        //     } else {
        //       console.log(this.project)
        //     }
        //   }
        // );
        // break;

      case 6:
      case 7:
      case 8:
        var errorList;
        var project_to = this.dg_service.project;
        this.projectService.checkCorrectProblem(project_to).subscribe(
          errors => {
            errorList = errors;
            this.sendErrors(errorList);
            if (this.projectService.getRes(errorList)) {
              alert('The problem diagram is correct.')
            }else {
              console.log(this.project)
            }
          }
        );
        break;

    }
  }

  @Output() errorsEvent = new EventEmitter<Error[]>();
  sendErrors(errors: Error[]) {	//发送错误信息
    this.errorsEvent.emit(errors);
  }
  //=====================pf==================
  uploadPF(): void {
    this.displayText();
    document.getElementById("pfFile").click();
  }
  selectedPFOnChanged(event: any) {
    var that = this;
    this.projectAddress = null;
    console.log('即将调用selectedPFOnChanged!');
    // this.fileService.uploadpfFile(this.uploader);
    var pfName = this.uploader.queue[0].file.name;
    console.log(pfName);
    this.projectAddress = pfName.substring(
      0,
      pfName.length - 3
    );

    this.fileService.uploadpfFile_new(this.uploader, this.projectAddress);
    var that = this;
    that.dg_service.isProjectNull = true;
    that.textService.isPfNull = true;
    this.interval = setInterval(function () {
      clearInterval(that.interval);
      that.dg_service.register_new(that.projectAddress, "undefined");
    }, 3000);
    that.interval1 = setInterval(function () {
      if (!that.dg_service.isProjectNull && that.textService.isPfNull) {
        clearInterval(that.interval1);
        that.textService.register_new(that.projectAddress, "undefined");
      }
    }, 3000);
    
  }
}
