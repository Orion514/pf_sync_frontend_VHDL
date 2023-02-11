export class LineInfo {
  name: string;
  from: string;
  to: string;
  type: string;
  static newLineInfo(name, from, to, type) {
    let lineInfo = new LineInfo();
    lineInfo.name = name;
    lineInfo.from = from;
    lineInfo.to = to;
    lineInfo.type = type;
    return lineInfo;
  }
}
