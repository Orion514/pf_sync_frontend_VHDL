import { Injectable } from "@angular/core";
import {
  CloseAction,
  createConnection,
  ErrorAction,
  MonacoLanguageClient,
  MonacoServices
} from "monaco-languageclient";
import { listen, MessageConnection } from "vscode-ws-jsonrpc";
import { Project } from "../entity/Project";
import { LSPMessageFactory } from "../LSP/LSPMessageFactory";
import { RecordTimeService } from "../record-time.service";
import { FileService } from "./file.service";
import { ProjectService } from "./project.service";
const ReconnectingWebSocket = require("reconnecting-websocket");

@Injectable({
  providedIn: "root",
})
export class TextService {
  messageId;
  projectAddress;
  version;
  ws: WebSocket;
  editor: monaco.editor.IStandaloneCodeEditor;
  interval;
  newValue;
  noError;
  connection: MessageConnection;
  languageClient: MonacoLanguageClient;
  filename: string;
  isPfNull = true;
  pf = "";
  project: Project;
  hasSpace = false;
  lastVersion: string;
  isOpen = false;
  saveTimes: number;
  timeFlag = 0;
  frame: string = "";
  receiveFrame: boolean;
  uri: string;
  constructor(
    private projectService: ProjectService,
    private fileService: FileService,
    private recordTimeService: RecordTimeService
  ) {
    this.messageId = 0;
    this.openWebSocket();
    projectService.stepEmmited$.subscribe((project) => {
      this.project = project;
    });
  }

  languageId = "problemframe";
  hasCreatedEditor = false;
  createEditor(title, version, code) {
    var that = this;
    if (!this.hasCreatedEditor) {
      this.hasCreatedEditor = true;
      //create model
      this.filename = this.username + title + version + ".pf";
      // let model = monaco.editor.createModel(code, "problemframe",
      //   monaco.Uri.parse("file://C:/pf-language-server/"+this.filename))
      let model = monaco.editor.createModel(
        code,
        "problemframe",
        monaco.Uri.parse(
          "file://root/pf-language-server/test-data/" + this.filename
        )
      );
      this.editor.setModel(model);

      // monaco.languages.setMonarchTokensProvider('problemframe', {
      //   tokenizer: {
      //     root: [
      //       [/ [M] /, { token: "keyword" }],
      //       [/[a-z]+/, { token: "string" }]
      //     ],
      //   }
      // });
      var rootUri = "file://root/pf-language-server/test.pf";
      //console.log(this.editor)
      // install Monaco language client services
      MonacoServices.install(this.editor, { rootUri: rootUri });
      // create the web socket
      const url = "ws://localhost:8030/sampleServer";
      const webSocket = this.createWebSocket(url);

      // listen when the web socket is opened
      listen({
        webSocket,
        onConnection: (connection: MessageConnection) => {
          // create and start the language client
          const languageClient = this.createLanguageClient(connection);
          const disposable = languageClient.start();
          connection.onClose(() => disposable.dispose());
          that.connection = connection;
          that.languageClient = languageClient;
        },
      });
    }
    this.editor.setValue(code);
    //listen when the editor's value changed
    this.interval = setInterval(function () {
      that.didSave();
    }, 2000);
  }

  public createLanguageClient(
    connection: MessageConnection
  ): MonacoLanguageClient {
    return new MonacoLanguageClient({
      name: `ProblemFrame Client`,
      clientOptions: {
        // use a language id as a document selector
        documentSelector: ["problemframe"],
        // disable the default error handler
        errorHandler: {
          error: () => ErrorAction.Continue,
          closed: () => CloseAction.DoNotRestart,
        },
      },
      // create a language client connection from the JSON RPC connection on demand
      connectionProvider: {
        get: (errorHandler, closeHandler) => {
          return Promise.resolve(
            createConnection(<any>connection, errorHandler, closeHandler)
          );
        },
      },
    });
  }
  public createWebSocket(url) {
    var socketOptions = {
      maxReconnectionDelay: 10000,
      minReconnectionDelay: 1000,
      reconnectionDelayGrowFactor: 1.3,
      connectionTimeout: 10000,
      maxRetries: Infinity,
      debug: false,
    };
    return new ReconnectingWebSocket(url, undefined, socketOptions);
  }
  getText() {
    return this.editor.getValue();
  }

  //打开项目时调用
  getNotNullPf(projectAddress, version: string) {
    console.log("---------text----------getNotNullPf-----:", projectAddress, version);
    var that = this;
    this.projectAddress = projectAddress;
    if (version == undefined) version = "undefined";
    this.version = version.replace(":", "_").replace(":", "_");
    this.isPfNull = true;
    this.fileService.getNotNullPf(projectAddress, version).subscribe((pf) => {
      that.isPfNull = false;
      const r = /problem: (.*)\n/g;
      let line = pf.match(r)[0].trim();
      let title = line.replace("problem: ", "").trim();
      if (title.indexOf(" ") != -1) {
        if (title[0] != "#") title = "#" + title;
        if (title[title.length - 1] != "#") title += "#";
      }
      pf = pf.replace(/problem: .*\n/g, "problem: " + title + "\n");
      pf = pf.replace("\nM M ", "\nM1 M ");
      this.pf = pf;
      // console.log(that.isPfNull,pf)
    });
  }
  ignoreSynTimes = 0;
  //============================== websocket new ==============================
  openWebSocket() {
    this.ws = new WebSocket('ws://localhost:8089/TextLSP');
    // this.ws = new WebSocket('ws://localhost:8089/webSocket');
    var that = this;
    this.ws.onopen = function () {
      console.log('client:text ws connection is open');
      // that.ws.send('hello');
    };
    this.ws.onmessage = function (e) {
      var message = JSON.parse(e.data);
      let params = message.params;
      that.lastVersion = params.textDocument.lastVersion;
      if (message.method == "TextDocument/didChange") {
        //let currentValue = that.editor.getValue();
        //if (that.newValue != currentValue && that.ignoreSynTimes < 5) {
        //that.didSave()
        //that.ignoreSynTimes++;
        //return
        //} else { that.update(message); that.ignoreSynTimes = 0; }
        // console.log("###TextDocument/didChange###", message)
        let T0 =
          params.textDocument.T0 == undefined ? 0 : params.textDocument.T0;
        let T1 =
          params.textDocument.T1 == undefined ? 0 : params.textDocument.T1;
        let T2 =
          params.textDocument.T2 == undefined ? 0 : params.textDocument.T2;
        let T3 =
          params.textDocument.T3 == undefined ? 0 : params.textDocument.T3;
        let T4 = new Date().getTime();
        let Flag1 =
          params.textDocument.Flag1 == undefined
            ? 0
            : params.textDocument.Flag1;
        let Flag2 =
          params.textDocument.Flag2 == undefined
            ? 0
            : params.textDocument.Flag2;
        let Flag3 =
          params.textDocument.Flag3 == undefined
            ? 0
            : params.textDocument.Flag3;
        let nodes =
            params.textDocument.nodes == undefined ? 0 : params.textDocument.nodes;
        let edges =
            params.textDocument.edges == undefined ? 0 : params.textDocument.edges;
        let ASTNodes =
            params.textDocument.ASTNodes == undefined ? 0 : params.textDocument.ASTNodes;

        that.sendTimeRecoder(
          that.lastVersion,
          T0,
          T1,
          T2,
          T3,
          T4,
          Flag1,
          Flag2,
          Flag3,
          nodes,
          edges,
          ASTNodes
        );
        that.update(message);
      } else if (message.method == "TextDocument/registered") {
        // console.log(
        //   " ============================== text receive registered message==============================\n"
        // );
        // console.log(message);
        that.registed_new(message);
      } else if (message.method == "TextDocument/changeLastVersion") {
        if (params.textDocument.lastVersion === params.textDocument.version)
          return;
        console.log("###sendTimeRecoder###", message)
        let T0 =
          params.textDocument.T0 == undefined ? 0 : params.textDocument.T0;
        let T1 =
          params.textDocument.T1 == undefined ? 0 : params.textDocument.T1;
        let T2 =
          params.textDocument.T2 == undefined ? 0 : params.textDocument.T2;
        let T3 =
          params.textDocument.T3 == undefined ? 0 : params.textDocument.T3;
        let T4 = new Date().getTime();
        let Flag1 =
          params.textDocument.Flag1 == undefined
            ? 0
            : params.textDocument.Flag1;
        let Flag2 =
          params.textDocument.Flag2 == undefined
            ? 0
            : params.textDocument.Flag2;
        let Flag3 =
          params.textDocument.Flag3 == undefined
            ? 0
            : params.textDocument.Flag3;
        let nodes =
          params.diagram.nodes == undefined ? 0 : params.diagram.nodes;
        let edges =
          params.diagram.edges == undefined ? 0 : params.diagram.edges;
        let ASTNodes =
          params.diagram.ASTNodes == undefined ? 0 : params.diagram.ASTNodes;
        that.sendTimeRecoder(
          that.lastVersion,
          T0,
          T1,
          T2,
          T3,
          T4,
          Flag1,
          Flag2,
          Flag3,
          nodes,
          edges,
          ASTNodes
        );
        // console.log(
        //   " ============================== text receive changeLastVersion message==============================\n"
        // );
        // console.log(message);
      } else if (message.method == "TextDocument/needDidOpen") {
        // that.isOpen = true;
        clearInterval(that.closeinterval);
        that.register(that.projectAddress, that.version, that.editor.getValue())
      }
    };

    this.ws.onerror = function (e) {
      console.log('==============================error===============text===============', e);
    };
    this.ws.onclose = function (e) {
      console.log("====================close=========text==============", e);
      that.isOpen = false;
      that.openWebSocket();
      that.closeinterval = setInterval(function () {
        if (that.projectAddress == null || that.projectAddress == undefined) {
          clearInterval(that.closeinterval);
          return;
        }
        that.register_new(that.projectAddress, that.version);
        if (that.isOpen) clearInterval(that.closeinterval);
      }, 1000);
    };
  }
  closeinterval
  //==============================发送消息 new ==============================
  sendTimeRecoder(lastVersion, T0, T1, T2, T3, T4, Flag1, Flag2, Flag3,nodes, edges, ASTNodes) {
    let timeRecoder = {
      uri: this.uri,
      lastVersion: lastVersion,
      T0: T0,
      T1: T1,
      T2: T2,
      T3: T3,
      T4: T4,
      Flag1: Flag1,
      Flag2: Flag2,
      Flag3: Flag3,
      nodes: nodes,
      edges: edges,
      ASTNodes: ASTNodes
    };
    // let frame = LSPFrameFactory.getFrame("TextDocument/TimeRecoder", timeRecoder)
    // // // console.log("============================== TextDocument TimeRecoder ==============================")
    // // console.log(timeRecoder)
    // this.sendMessage(frame)
    let message = LSPMessageFactory.getMessageNoFraming(
      this.messageId++,
      "TextDocument/TimeRecoder",
      timeRecoder
    );
    console.log("###text.sendTimeRecoder###")
    console.log(message)
    this.sendMessage2(this.ws, message);
  }
  username
  register(title, version: string, text) {
    if (version == undefined)
      version = "undefined"
    version = version.replace(":", "_").replace(":", "_");
    console.log("---------text----------register-----:", title, version);
    this.username = this.fileService.getUserName()
    this.uri = this.username + "_" + title + "_" + version;
    let textDocument = {
      uri: this.uri,
      version: 0,
      text: text,
    };
    let params = {
      textDocument: textDocument,
    };
    // let frame = LSPFrameFactory.getFrame("TextDocument/didOpen", params)
    // // // console.log("============================== TextDocument TimeRecoder ==============================")
    // this.sendMessage(frame)
    let message = LSPMessageFactory.getMessageNoFraming(
      this.messageId++,
      "TextDocument/didOpen",
      params
    );
    this.sendMessage2(this.ws, message);
    this.projectAddress = title;
    this.version = version;
    this.newValue = text;
    //createEditor
    this.createEditor(this.projectAddress, this.version, text);
    let that = this;
    this.editor.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S,
      function () {
        that.didSave();
      },
      ""
    );
  }

  register_new(title: string, version: string) {
    console.log("---------text----------register_new-----:", title, version);
    if (version == undefined) version = "undefined";
    version = version.replace(":", "_").replace(":", "_");
    this.username = this.fileService.getUserName()
    this.uri = this.username + "_" + title + "_" + version;
    let textDocument = {
      uri: this.uri,
      projectAddress: title,
      projectVersion: version,
      version: 0,
    };
    let params = {
      textDocument: textDocument,
    };
    let message = LSPMessageFactory.getMessageNoFraming(
      this.messageId++,
      "TextDocument/register",
      params
    );
    this.sendMessage2(this.ws, message);
    this.projectAddress = title;
    this.version = version;
  }
  registed_new(message) {
    // console.log("TextService -> registed_new -> message", message);
    this.isOpen = true;
    this.isPfNull = false;
    let params = message.params;
    this.newValue = params.text;
    //createEditor
    this.createEditor(this.projectAddress, this.version, this.newValue);
  }

  //没有分包，直接发送message
  sendMessage2(ws, message) {
    let i = 0;
    let that = this;
    let interval1 = setInterval(function () {
      if (ws.readyState == WebSocket.OPEN) {
        clearInterval(interval1);
        //console.log(message);
        ws.send(JSON.stringify(message));
      } else if (ws.readyState == WebSocket.CLOSED) {
        // // console.log("diagram.ws.readyState=CLOSED ", ws.readyState);
      } else if (ws.readyState == WebSocket.CLOSING) {
        // // console.log("diagram.ws.readyState=CLOSING ", ws.readyState);
      } else if (ws.readyState == WebSocket.CONNECTING) {
        // // console.log("diagram.ws.readyState=CONNECTING ", ws.readyState);
      }
    }, 1000);
  }
  unregister() {
    let textDocument = {
      uri: this.uri,
      languageId: "pf",
      version: 0,
      text: null,
    };
    let params = {
      textDocument: textDocument,
    };
    let message = LSPMessageFactory.getMessageNoFraming(
      this.messageId++,
      "TextDocument/didClose",
      params
    );
    this.sendMessage2(this.ws, message);
  }
  //new
  public didSave(): void {
    let markers = monaco.editor.getModelMarkers({});
    let error = false;
    if (markers.length > 0) error = true;
    let value = this.editor.getValue();
    if (
      !error && this.isOpen && value != this.newValue
    ) {
      let params = {
        textDocument: {
          uri: this.uri,
          version: null,
          lastVersion: this.lastVersion,
          changeTime: new Date().getTime(),
        },
        text: value,
      };
      //向服务器发送最新版
      // let frame = LSPFrameFactory.getFrame("TextDocument/didSave", params)
      // this.sendMessage(frame)
      let message = LSPMessageFactory.getMessageNoFraming(
        this.messageId++,
        "TextDocument/didSave",
        params
      );
      this.sendMessage2(this.ws, message);
      this.newValue = value;
    }
    this.saveTimes = (this.saveTimes + 1) % 5;
  }

  //==============================接收消息 new==============================
  update(jsonMessage) {

    let params = jsonMessage.params;
    this.newValue = params.text;
    var position = this.editor.getPosition();
    this.editor.setValue(this.newValue);
    this.editor.setPosition(position);
  }
}
