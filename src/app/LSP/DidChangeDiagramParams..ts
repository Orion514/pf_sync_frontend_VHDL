import { VersionedDiagramIdentifier } from "./VersionedDiagramIdentifier";
import { DiagramContentChangeEvent } from "./DiagramContentChangeEvent";
export interface DidChangeDiagramParams {
  diagram: VersionedDiagramIdentifier;
  contentChanges: DiagramContentChangeEvent[];
}
