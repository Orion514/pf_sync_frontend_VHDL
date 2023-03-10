import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Phenomenon } from '../entity/Phenomenon';
import { Project } from '../entity/Project';
import { Util } from '../entity/Util';
import { RequirementPhenomenon } from '../entity/RequirementPhenomenon';
import { DrawGraphService } from '../service/draw-graph.service';
import { FileService } from '../service/file.service';
import { ProjectService } from '../service/project.service';
import { FileUploader } from 'ng2-file-upload';
import { VerficationService } from '../service/verfication.service';
import Swal from 'sweetalert2/dist/sweetalert2.js';

@Component({
  selector: 'app-rightbar',
  templateUrl: './rightbar.component.html',
  styleUrls: ['./rightbar.component.css']
})
export class RightbarComponent implements OnInit {
  projectAddress: string;
  project: Project;
  pheList: Phenomenon[];

  reqPheList: RequirementPhenomenon[];
  step = 1;
  strategyAdviceIdx = 0;

  util = new Util();

  open1 = false;
  open2 = false;
  open3 = false;
  open4 = false;
  open5 = false;

  problemIcon;
  scenarioIcon;
  tabList: any;
  type: string;
  owlAdd: string;
  eowlName: string;
  sameNameFlag: boolean;
  owlName: string;
  uploadOWL: boolean;

  setOpen1(): void {
    this.open1 = !this.open1;
  }
  setOpen2(): void {
    this.open2 = !this.open2;
  }
  setOpen3(): void {
    this.open3 = !this.open3;
  }
  setOpen4(): void {
    this.open4 = !this.open4;
  }
  setOpen5(): void {
    this.open5 = !this.open5;
  }
  @Output() errorsEvent = new EventEmitter<Error[]>();
  sendErrors(errors: Error[]) {
    this.errorsEvent.emit(errors);
  }

  back() {
    if (this.step == 0) {
      this.step = 13;
    }
    if (this.step != 1) {
      this.step = this.step - 1;
    }
    this.projectService.stepChange(this.step);
  }
  check() {
    //console.log(this.step);
    var userName = this.util.getQueryVariable('username');
    console.log('userName:', userName, '  this.step:', this.step);
    switch (this.step) {
      // case 1:
      //   this.projectService.uploadOWLEmitted$.subscribe(
      //     uploadOWL => {
      //       this.uploadOWL = uploadOWL;
      //       // console.log(this.uploadOWL)
      //     })
      //   console.log(this.uploadOWL)
      //   console.log(this.dg_service.uploadOWLFlag)
      //   // if (this.uploadOWL || this.dg_service.uploadOWLFlag) {
      //     this.step = 2;
      //     this.projectService.stepChange(this.step);
      //   // } else {
      //   //   alert('Please upload the ontology.')
      //   // }
      //   break;

      case 1:
        // var next = confirm('Have you finished drawing Machine?');
        // if (next) {
        //   this.step = 3;
        // }
        // this.showContectDiagram();
        this.step = 2;
        this.projectService.stepChange(this.step);
        break;

      case 2:
        // var next = confirm('Have you finished drawing Problem Domain?');
        // if (next) {
        //   this.step = 4;
        // }
        // this.showContectDiagram();
        
        this.dg_service.displayInterface_name();
        this.step = 3;
        this.projectService.stepChange(this.step);
        break;

      case 3:
        // var next = confirm('Have you finished drawing Interface?');
        // if (next) {
        //   this.step = 5;
        // }
        // this.showContectDiagram();
        this.step = 4;
        this.projectService.stepChange(this.step);
        break;

      case 4:
        // this.showContectDiagram();
        var errorList;
        var project_to = this.dg_service.project;
        this.projectService.checkCorrectContext(project_to).subscribe(
          errors => {
            errorList = errors;
            this.sendErrors(errorList);
            if (this.projectService.getRes(errorList)) {
              alert('The diagram is correct.')
              this.step = 5;
            } else {
              this.step = 1;
            }
            this.projectService.stepChange(this.step);
          }
        );
        // this.step = 5;
        // this.projectService.stepChange(this.step);
        break;

      case 5:
        // var next = confirm('Have you finished drawing Requirement?');
        // if (next) {
        //   this.step = 7;
        // }
        // this.showProblemDiagram();
        this.step = 6;
        this.projectService.stepChange(this.step);
        break;

      case 6:
        // var next = confirm('Have you finished drawing Reference?');
        // if (next) {
        //   this.step = 8;
        // }
        // this.showProblemDiagram();
        this.step = 7;
        this.projectService.stepChange(this.step);
        break;

      case 7:
        this.step = 8;
        this.projectService.stepChange(this.step);
        break;
  
      case 8:
        var errorList;
        var project_to = this.dg_service.project;
        // const button = document.getElementById('next');
        this.projectService.checkCorrectProblem(project_to).subscribe(
          errors => {
            errorList = errors;
            this.sendErrors(errorList);
            if (this.projectService.getRes(errorList)) {
              alert('The diagram is correct.');
              // this.step = 1;
              // button.innerHTML = 'finish';
              // this.projectService.stepChange(this.step);
              this.projectService.getScenarioGraph(this.project, this.project.title).subscribe(
                project => {
                  this.project = project;
                  console.log('case 8 this.project:', this.project);
                  this.projectService.scenarioChange(project.scenarioGraphList);
                  this.step = 9;
                  this.showScenarioIcon();
                }
              );
            } else {
              this.step = 5;
              // this.projectService.stepChange(this.step);
            }
          }
        );
        this.projectService.stepChange(this.step);
        break;
        
      case 9:
        console.log("5.1:Draw scenario graph.")
        console.log(this.project)
        var next = confirm('Have you finished drawing scenario graphs?');
        if (next) {
          this.step = 10;
        }
        this.projectService.stepChange(this.step);
        break;

      case 10:
        var errorList;
        console.log("5.2:Check scenario graph.")
        this.projectService.checkCorrectness(this.project).subscribe(
          errors => {
            errorList = errors;
            this.sendErrors(errorList);
            if (this.projectService.getRes(errorList)) {
              this.step = 11;
            } else {
              this.step = 9;
            }
            this.projectService.stepChange(this.step);
          }
        );
        this.strategyAdviceIdx = 0;
        break;

      case 11:
        console.log('6:????????????');
        this.projectService.ckeckStrategy(this.project).subscribe(
          advice => {
            console.log('advice:', advice);
            var htmlLabel = '';
            if(advice.length == 0) {
              const content = '??????????????????';
              htmlLabel = '<div style="text-align: center; font-size: 20px; margin-bottom: 10px">' + content + '</div>';
              Swal.fire({
                title: '????????????',
                icon: 'info',
                showConfirmButton: true,
                confirmButtonText: '??????',
                html: htmlLabel,
                width: 1000,
              });
            }
            else {
              if(this.strategyAdviceIdx < advice.length) {
                const strategyDict = {
                  '??????1?????????????????????????????????': ['????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????' +
                  '??????????????????????????????(Power-on)??? ?????????????????????????????????Device1???Device2???????????????????????????????????????' +
                  '???????????????????????????????????????????????????????????????????????????????????????????????????????????? ?????????1????????? ??? ?????????2?????????', 'assets/strategyExamples/strategy1.png'],

                  '??????2????????????????????????????????????': ['??????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????' +
                  '?????????????????????"??????3??????(Device3 Power-on)????????????Device3??????????????????????????????3??????(Device3 Power-off)????????????Device3?????????????????????' +
                  '????????????????????????????????????3????????????(D3 Control Output)???????????????????????????3??????(D3 Instruction)???????????????????????????????????????3????????????????????????????????????????????????' +
                  '?????????3??????"?????????????????????????????????????????????', 'assets/strategyExamples/strategy2.png'],

                  '??????3?????????????????????????????????': ['????????????????????????????????????????????????????????????????????????????????? ?????????????????? ??????????????????????????????????????????????????????????????????????????????????????????????????????????????????' +
                  '??????????????????????????????4????????????(Device4 Data Production)??? ???????????????4(Device4)????????????????????????4????????????(Device4 Data Consumption)??? ??????????????????4?????????' +
                  '???????????????4??????????????????????????????5(Device5)??????????????????????????????????????????????????? ?????????4??????(D4 Data)??? ?????????????????????????????????????????????', 'assets/strategyExamples/strategy3.png'],

                  '??????4?????????????????????????????????': ['??????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????' +
                  '???????????????????????????(Computing)???????????????D6 Data???D7 Data????????????????????????????????????????????????????????????(Computing Result)????????????' +
                  '?????????????????????????????????????????????????????????????????????:Subcomputing 1???Subcomputing 2????????????????????????????????????' +
                  '???????????? Computing ????????????????????????Subcomputing 1???Subcomputing 2??????????????????????????????Subcomputing 1 Result????????????Subcomputing 1???????????????',
                    'assets/strategyExamples/strategy4.png'],

                  '??????5?????????-??????????????????': ['???????????????????????????????????????????????????????????????' +
                  '???????????????????????????9??????(Device9 Control)??????????????????8(Device8)????????????????????????????????????????????????9(Device9)?????????????????????????????????9???' +
                  '??????????????????????????????????????????????????????????????????????????????????????????D9 Control Computing???????????????????????????????????????????????????Device9 Control 2???' +
                  '?????????????????? ?????????????????????Device9 Control', 'assets/strategyExamples/strategy5.png']
                };
                htmlLabel = '<div style="text-align: left; font-size: 20px; margin-bottom: 10px">' + advice[this.strategyAdviceIdx].title + '</div>';
                for(var j=0;j<advice[this.strategyAdviceIdx].content.length;j++) {
                  htmlLabel += '<div style="text-align: left; font-size: 15px; margin-bottom: 10px">' + advice[this.strategyAdviceIdx].content[j] + '</div>';
                }
                const title = advice[this.strategyAdviceIdx].title, constStr = '????????????';
                htmlLabel += '<div style="text-align: left; font-size: 20px; margin-bottom: 10px">' + constStr + '</div>';
                htmlLabel += '<div style="text-align: left; font-size: 15px; margin-bottom: 10px">' + strategyDict[title][0] + '</div>';
                htmlLabel += '<img style="width: 740px; height: 400px" src=' + '"' + strategyDict[title][1] + '"' + '/>';
                Swal.fire({
                  title: '????????????',
                  icon: 'info',
                  showCancelButton: true,
                  showConfirmButton: true,
                  showDenyButton: true,
                  confirmButtonText: '????????????',
                  denyButtonText: `????????????`,
                  cancelButtonText: '??????',
                  html: htmlLabel,
                  width: 1000,

                }).then((result) => {
                  if (result.isConfirmed) {
                    this.step = 1;
                    this.projectService.stepChange(this.step);
                    // this.fileService.saveProject(this.project.title, this.project).subscribe();
                    // location.href = 'http://localhost/PF2-web1/?projectname=' + this.project.title;
                  } else if (result.isDenied) {
                    // ????????????????????????????????????advice[this.strategyAdviceIdx]???????????????
                    // this.projectService.ignoreStrategyAdvice(advice[this.strategyAdviceIdx]).subscribe();
                    this.strategyAdviceIdx += 1;
                  } else {
                    ;
                  }
                });
              }
            }

            if(this.strategyAdviceIdx >= advice.length) {
              this.step = 12;
              this.projectService.stepChange(this.step);
            }
          }
        );
        break;

      case 12:
        // 4.1:???????????????
        var errorList;
        this.projectService.checkWellFormed(this.project).subscribe(
          errors => {
            errorList = errors;
            this.sendErrors(errorList);
            if (this.projectService.getRes(errorList)) {
              this.step = 13;
            } else {
              this.step = 9;
            }
            this.projectService.stepChange(this.step);
          }
        );
        break;

      case 13:
        // 4.2:??????
        this.projectService.getSubProblemDiagram(this.project).subscribe(
          project => {
            this.project = project;
            console.log(project);
            // this.projectService.sendProject(project);
            this.projectService.spdChange(project.subProblemDiagramList);
            this.step = 14;
            this.projectService.stepChange(this.step);
          }
        );
        this.fileService.saveProject(this.project.title, this.project).subscribe();
        break;

      case 14:
        this.projectService.saveSpecification(this.project).subscribe(res => {
          if(res) {
            alert("Generat succeed!");
            this.step = 15;
            this.projectService.stepChange(this.step);
          }
          else {
            alert("Generat failed!");
          }
        });
        break;

      case 15:
        const button = document.getElementById('next');
        button.innerHTML = 'Finish';
        this.step = 1;
        this.projectService.stepChange(this.step);
        this.showProblemIcon();
        console.log("finish!")
        break;
    }
  }

  showScenarioIcon() {
    let problemIcon = document.getElementById("problem-icon");
    let scenarioIcon = document.getElementById("scenario-icon");
    problemIcon.style.display = "none";
    scenarioIcon.style.display = "block";
  }

  showProblemIcon() {
    let problemIcon = document.getElementById("problem-icon");
    let scenarioIcon = document.getElementById("scenario-icon");
    problemIcon.style.display = "block";
    scenarioIcon.style.display = "none";
  }

  initBoard() {
    // console.log("new Project");
    this.tabList = [];
    if (this.project.scenarioGraphList) {
      for (let sg of this.project.scenarioGraphList) {
        this.tabList.push(sg.title);
      }
    }
    if (this.project.subProblemDiagramList) {
      for (let spd of this.project.subProblemDiagramList) {
        this.tabList.push(spd.title)
      }
    }
  }

  showContectDiagram() {
    document.getElementById("content1").style.display = 'block';
    document.getElementById("content2").style.display = 'none';
    this.initBoard();
    if (this.tabList) {
      for (var i = 0; i < this.tabList.length; i++) {
        const id = this.tabList[i] + 'M';
        document.getElementById(id).style.display = 'none';
      }
    }
  }

  showProblemDiagram() {
    document.getElementById("content1").style.display = 'none';
    document.getElementById("content2").style.display = 'block';
    this.initBoard();
    if (this.tabList) {
      for (var i = 0; i < this.tabList.length; i++) {
        const id = this.tabList[i] + 'M';
        document.getElementById(id).style.display = 'none';
      }
    }
  }

  showScenarioDiagram() {
    document.getElementById("content1").style.display = 'none';
    document.getElementById("content2").style.display = 'none';
    this.initBoard();
    if (this.tabList) {
      for (var i = 0; i < this.tabList.length; i++) {
        const id = this.tabList[i] + 'M';
        document.getElementById(id).style.display = 'block';
      }
    }
  }

  constructor(
    private projectService: ProjectService,
    private fileService: FileService,
    private dg_service: DrawGraphService,
    private verficationService: VerficationService,
  ) {
    projectService.stepEmmited$.subscribe(
      step => {
        this.step = step;
      }
    )
    projectService.changeEmitted$.subscribe(
      project => {
        this.project = project;
        this.pheList = this.projectService.getPhenomenon(project);
        // this.reqPheList = this.projectService.getReference(project);
        // ???????????????????????????Reference??????
        this.projectService.getReference(project).subscribe(
          reqPheList => {
            this.reqPheList = reqPheList
          }
        )
      });

    fileService.newProEmmited$.subscribe(
      res => {
        //console.log(res);
        if (res == true) {
          this.step = 1;
          this.projectService.stepChange(this.step);

        }
      }
    )
  }

  ngOnInit() {
  }
}
