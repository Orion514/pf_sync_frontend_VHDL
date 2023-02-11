export class LSPMessage {
  jsonrpc: string; //2.0
  id: number;
  method: string;
  params?: object;
}
