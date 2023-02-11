import { IShape } from "../entity/IShape";
import { Phenomenon } from "../entity/Phenomenon";
import { LineInfo } from "../entity/LineInfo";
import { Project } from "../entity/Project";
export interface DiagramContentChangeEvent {
  shapeType: string; //"mac/pro/req/int/ref/con//phe//project"
  changeType: string; //"add/delete/change"

  //if shapeType in "mac/pro/req/int/ref/con"
  oldShape?: IShape;
  newShape?: IShape;

  //if shapeType == "phe"
  lineInfo?: LineInfo;
  oldPhenomenon?: Phenomenon;
  newPhenomenon?: Phenomenon;

  newProject: Project;
}
