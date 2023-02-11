import { Component, OnInit } from "@angular/core";
import { NgxEditorModel } from "ngx-monaco-editor";
import { TextService } from "../service/text.service";
import { UiService } from "../ui.service";
@Component({
  selector: "app-ngx-editor",
  templateUrl: "./ngx-editor.component.html",
  styleUrls: ["./ngx-editor.component.css"]
})
export class NgxEditorComponent implements OnInit {
  languageId = "problemframe";
  editorOptions = { theme: "vs", language: "problemframe" };
  // value =`problem: #Flexible Modeling#
  code = ``;
  // code = monaco.editor.createModel(this.value, "problemframe",
  //   monaco.Uri.parse("file://E:/test-data/bar.pf"))
  editor;
  interval;
  newValue;
  editorType;
  constructor(private textService: TextService, private uiService: UiService) {
    this.editorType = "diagram";
  }

  ngOnInit() {}
  monacoOnInit(editor) {
    this.textService.editor = editor;
    // this.textService.createEditor("title","version",this.code)
  }
}
