import { Project } from "../entity/Project";
import { ContextDiagram } from "../entity/ContextDiagram";
import { ProblemDiagram } from "../entity/ProblemDiagram";
import { Requirement } from "../entity/Requirement";
import { Constraint } from "../entity/Constraint";
import { Reference } from "../entity/Reference";

export interface DiagramItem {
  uri: string;
  project: Project;
  // title:String
  // contextDiagram:ContextDiagram
  // problemDiagram:ProblemDiagram
  // requirementList: Requirement[]
  // constraintList: Constraint[]
  // referenceList: Reference[]
}
