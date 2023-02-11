import {
  HttpClient, HttpEvent, HttpEventType,
  HttpRequest
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class UploadService {

  projectAddress = 'aaa'
  constructor(
    private http: HttpClient
  ) { }
  upload(file: File) {
    if (!file) { return; }
    const req = new HttpRequest('POST', `http://localhost:8089/file/upload/${this.projectAddress}`, file, {
      reportProgress: true
    });
    return this.http.request(req).pipe(
      map(event => this.getEventMessage(event, file))
    );
  }
  private getEventMessage(event: HttpEvent<any>, file: File) {
    switch (event.type) {
      case HttpEventType.Sent:
        return `Uploading file "${file.name}" of size ${file.size}.`;

      case HttpEventType.UploadProgress:
        // Compute and show the % done:
        const percentDone = Math.round(100 * event.loaded / event.total);
        return `File "${file.name}" is ${percentDone}% uploaded.`;

      case HttpEventType.Response:
        return `File "${file.name}" was completely uploaded!`;

      default:
        return `File "${file.name}" surprising upload event: ${event.type}.`;
    }
  }

}
