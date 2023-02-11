import { Component, OnInit } from '@angular/core';
import { ComponentChoiceService } from '../service/component-choice.service';
import { DrawGraphService } from '../service/draw-graph.service';
import { ProjectService } from '../service/project.service';
declare var $: JQueryStatic;

@Component({
  selector: 'app-leftbar',
  templateUrl: './leftbar.component.html',
  styleUrls: ['./leftbar.component.css']
})
export class LeftbarComponent implements OnInit {
  step = 1;
  constructor(
    public dg_service: DrawGraphService,
    private projectService: ProjectService,
    public component_choice_service: ComponentChoiceService) {
    projectService.stepEmmited$.subscribe(
      step => {
        this.step = step;
      }
    )
  }
  ngOnInit() { }
  set_choice_false(): void {
    this.component_choice_service.element = false;
    this.component_choice_service.domain = false;
    this.component_choice_service.machine = false;
    this.component_choice_service.req = false;

    this.component_choice_service.link = false;
    this.component_choice_service.interface = false;
    this.component_choice_service.reference = false;
    this.component_choice_service.constraint = false;

    this.component_choice_service.merge = false;
  }
  //Element
  clickDomain(): void {
    if (this.step != 2) return;
    this.set_choice_false();
    this.component_choice_service.element = true;
    this.component_choice_service.domain = true;
  }
  clickMachine(): void {
    if (this.step != 1) return;
    this.set_choice_false();
    this.component_choice_service.element = true;
    this.component_choice_service.machine = true;
  }
  clickReq(): void {
    if (this.step != 5) return;
    this.set_choice_false();
    console.log('click clickReq', this.step)
    this.component_choice_service.element = true;
    this.component_choice_service.req = true;
  }
  //Link
  clickInterface(): void {
    if (this.step != 3) return;
    this.set_choice_false();
    this.component_choice_service.link = true;
    this.component_choice_service.interface = true;
    console.log(this.component_choice_service)
  }
  clickReference(): void {
    if (this.step != 6) return;
    this.set_choice_false();
    this.component_choice_service.link = true;
    this.component_choice_service.reference = true;

    console.log('click reference', this.step)
    console.log(this.component_choice_service)
  }
  clickConstraint(): void {
    if (this.step != 6) return;
    this.set_choice_false();
    this.component_choice_service.link = true;
    this.component_choice_service.constraint = true;

    console.log('click constraint', this.step)
    console.log(this.component_choice_service)
  }
  chooseElement(type: string){
    this.dg_service.type = type;
    this.dg_service.source = undefined;
    this.dg_service.target = undefined;
	  console.log(this.dg_service.type)
  }

}
