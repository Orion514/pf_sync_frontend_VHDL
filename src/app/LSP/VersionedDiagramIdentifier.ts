import { logging } from "protractor";

export interface VersionedDiagramIdentifier {
  uri: String;
  version: string | null;
  lastVersion: string | null;
  changeTime: number;
  T0: number;
  T1: number;
  T2: number;
  T3: number;
  T4: number;
  Flag1: number;
  Flag2: number;
  Flag3: number;
  nodes:number;
  edges:number;
  ASTNodes:number;
}
