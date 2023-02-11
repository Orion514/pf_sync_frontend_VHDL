import { LSPMessage } from "./LSPMessage";
export class LSPMessageFactory {
  public static getMessageNoFraming(
    messageId: number,
    method: string,
    params: object
  ) {
    let message = new LSPMessage();
    message.jsonrpc = "2.0";
    message.id = messageId;
    message.method = method;
    message.params = params;
    return message;
  }
}
