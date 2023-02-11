import { Line } from "../entity/Line";
import { DiagramContentChangeEvent } from "./DiagramContentChangeEvent";

export class DiagramContentChangeEventFactory {
  public getShapeChangeEvent(
    shapeType,
    changeType,
    oldShape,
    newShape
  ): DiagramContentChangeEvent {
    let diagramContentChangeEvent: DiagramContentChangeEvent = {
      shapeType: shapeType,
      changeType: changeType,
      oldShape: oldShape,
      newShape: newShape,
      lineInfo: null,
      oldPhenomenon: null,
      newPhenomenon: null,
      newProject: null
    };
    return diagramContentChangeEvent;
  }

  public getPhenomenonChangeEvent(
    changeType,
    line,
    oldPhenomenon,
    newPhenomenon
  ): DiagramContentChangeEvent {
    let diagramContentChangeEvent: DiagramContentChangeEvent = {
      shapeType: "phe",
      changeType: changeType,
      lineInfo: line,
      oldPhenomenon: oldPhenomenon,
      newPhenomenon: newPhenomenon,
      oldShape: null,
      newShape: null,
      newProject: null
    };
    return diagramContentChangeEvent;
  }
}
