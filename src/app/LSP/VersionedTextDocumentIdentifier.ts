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
}
