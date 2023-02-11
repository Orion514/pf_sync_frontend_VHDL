import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ComponentChoiceService {
  element = false;
  machine = false;
  domain = false;
  req = false;
  link = false;
  interface = false;
  reference = false;
  constraint = false;
  merge = false;
  constructor() { }
  set_choice_false(): void {
    this.element = false;
    this.domain = false;
    this.machine = false;
    this.req = false;
    this.link = false;
    this.interface = false;
    this.reference = false;
    this.constraint = false;
    this.merge = false;
  }
}
