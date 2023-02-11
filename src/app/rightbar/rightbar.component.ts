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
        console.log('6:问题解耦');
        this.projectService.ckeckStrategy(this.project).subscribe(
          advice => {
            console.log('advice:', advice);
            var htmlLabel = '';
            if(advice.length == 0) {
              const content = '没有解耦建议';
              htmlLabel = '<div style="text-align: center; font-size: 20px; margin-bottom: 10px">' + content + '</div>';
              Swal.fire({
                title: '策略检查',
                icon: 'info',
                showConfirmButton: true,
                confirmButtonText: '确定',
                html: htmlLabel,
                width: 1000,
              });
            }
            else {
              if(this.strategyAdviceIdx < advice.length) {
                const strategyDict = {
                  '策略1：独立设备操作分离模式': ['该策略主要针对设备操作之间不存在约束关系的情况，旨在将没有约束关系的需求解耦开。' +
                  '例如，下图中，“加电(Power-on)” 需求要求分别对两个设备Device1和Device2进行加电操作。在其情景图中' +
                  '这两个加电操作是并发关系，没有约束，因此可以将该需求拆分为两个子需求，即 “设备1加电” 和 “设备2加电”', 'assets/strategyExamples/strategy1.png'],

                  '策略2：设备操作融合和抽象模式': ['该策略主要针对多个需求要求软件控制器向同一设备发起多种不同操作的情况，旨在通过抽象，将与设备交互的需求单独独立出来。' +
                  '例如，下图中，"设备3加电(Device3 Power-on)”需求对Device3进行加电操作，“设备3断电(Device3 Power-off)”需求对Device3进行断电操作。' +
                  '针对这种情形，引入“设备3控制输出(D3 Control Output)”需求，以及“设备3指令(D3 Instruction)”数据存储领域，其中“设备3控制输出”要求将指令转换为信号，' +
                  '“设备3指令"领域用于存储当前要转换的指令。', 'assets/strategyExamples/strategy2.png'],

                  '策略3：数据生产消费分离模式': ['该策略依据生产者消费者模型，在数据的获取与使用之间增加 “数据存储” 这一设计领域，使得生产者产生的数据可以存储其中，在消费时可以从其中直接读取。' +
                  '例如，下图中，“设备4数据生产(Device4 Data Production)” 需求从设备4(Device4)采集数据，“设备4数据消费(Device4 Data Consumption)” 需求使用设备4数据，' +
                  '并根据设备4数据的内容来判断设备5(Device5)是否需要加电。对这种情况，可以增加 “设备4数据(D4 Data)” 数据存储领域，存储采集的数据。', 'assets/strategyExamples/strategy3.png'],

                  '策略4：复杂计算级联分解模式': ['该策略将可分步计算的数据处理需求按计算步骤进行分解，增加数据存储领域存放中间结果，将复杂计算需求分解为简单计算需求。' +
                  '例如，下图中，计算(Computing)需求要求从D6 Data和D7 Data取得数据，完成计算后将结果保存至计算结果(Computing Result)领域中。' +
                  '根据领域专家提供的信息，计算需求包括两个子功能:Subcomputing 1、Subcomputing 2，并且二者满足顺序关系。' +
                  '因此，将 Computing 需求分解为子需求Subcomputing 1与Subcomputing 2，并新增数据存储领域Subcomputing 1 Result用于存储Subcomputing 1的计算结果',
                    'assets/strategyExamples/strategy4.png'],

                  '策略5：控制-计算分离模式': ['该策略通过增加计算需求，将控制和计算分离。' +
                  '例如，下图中，设备9控制(Device9 Control)需求将从设备8(Device8)采集数据，根据采到的数据生成设备9(Device9)的控制信号用以控制设备9。' +
                  '若根据采到的数据生成设备控制信号的计算很复杂，则增加新的需求D9 Control Computing，专门负责计算，而将控制的需求留给Device9 Control 2，' +
                  '二者联合起来 完成原来的需求Device9 Control', 'assets/strategyExamples/strategy5.png']
                };
                htmlLabel = '<div style="text-align: left; font-size: 20px; margin-bottom: 10px">' + advice[this.strategyAdviceIdx].title + '</div>';
                for(var j=0;j<advice[this.strategyAdviceIdx].content.length;j++) {
                  htmlLabel += '<div style="text-align: left; font-size: 15px; margin-bottom: 10px">' + advice[this.strategyAdviceIdx].content[j] + '</div>';
                }
                const title = advice[this.strategyAdviceIdx].title, constStr = '策略简介';
                htmlLabel += '<div style="text-align: left; font-size: 20px; margin-bottom: 10px">' + constStr + '</div>';
                htmlLabel += '<div style="text-align: left; font-size: 15px; margin-bottom: 10px">' + strategyDict[title][0] + '</div>';
                htmlLabel += '<img style="width: 740px; height: 400px" src=' + '"' + strategyDict[title][1] + '"' + '/>';
                Swal.fire({
                  title: '策略检查',
                  icon: 'info',
                  showCancelButton: true,
                  showConfirmButton: true,
                  showDenyButton: true,
                  confirmButtonText: '返回修改',
                  denyButtonText: `忽略建议`,
                  cancelButtonText: '取消',
                  html: htmlLabel,
                  width: 1000,

                }).then((result) => {
                  if (result.isConfirmed) {
                    this.step = 1;
                    this.projectService.stepChange(this.step);
                    // this.fileService.saveProject(this.project.title, this.project).subscribe();
                    // location.href = 'http://localhost/PF2-web1/?projectname=' + this.project.title;
                  } else if (result.isDenied) {
                    // 向后端发送请求保存忽略了advice[this.strategyAdviceIdx]建议的信息
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
        // 4.1:良构性检查
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
        // 4.2:投影
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
        // 用于显示页面右边的Reference信息
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
