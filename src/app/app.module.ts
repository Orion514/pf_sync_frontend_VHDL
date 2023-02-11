import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { FileUploadModule } from 'ng2-file-upload';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DrawingboardComponent } from './drawingboard/drawingboard.component';
import { LeftbarComponent } from './leftbar/leftbar.component';
import { RightbarComponent } from './rightbar/rightbar.component';
import { TopbarComponent } from './topbar/topbar.component';
import {Project} from './entity/Project';
import { MonacoEditorModule } from "ngx-monaco-editor";
import { NgxEditorComponent } from "./ngx-editor/ngx-editor.component";
import { MonacoConfig } from "./ngx-editor/monaco-config";
import { ServiceWorkerModule } from "@angular/service-worker";
import { environment } from "../environments/environment";
@NgModule({
  declarations: [
    AppComponent,
    TopbarComponent,
    LeftbarComponent,
    RightbarComponent,
    DrawingboardComponent,
    NgxEditorComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    CommonModule,
    FileUploadModule,
    AppRoutingModule,
    MonacoEditorModule.forRoot(MonacoConfig),
    ServiceWorkerModule.register("ngsw-worker.js", {
      enabled: environment.production
    }) // use forRoot() in main app module only.
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
