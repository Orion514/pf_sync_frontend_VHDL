import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { CCSLSet } from '../entity/CCSLSet';
import { Project } from '../entity/Project';

@Injectable({
    providedIn: 'root'
})
export class VerficationService {
    constructor(
        private http: HttpClient,
    ) { }
    httpOptions = {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };

    ccsls: CCSLSet[];

    toCCSL(project: Project): Observable<CCSLSet[]> {
        let username = this.getUserName()
        const url = `http://localhost:8089/verfication/toCCSL?username=${username}`;
        var ccsls = this.http.post<CCSLSet[]>(url, project, this.httpOptions);
        return ccsls;
    }

    private ccslEmit = new Subject<any>();
    ccslEmmited$ = this.ccslEmit.asObservable();
    getCCSL(ccsls: CCSLSet[]) {
        this.ccslEmit.next(ccsls);
    }

    getUserName() {
        let username = ""
        if (document.cookie != null && document.cookie != "") {
            username = jQuery.parseJSON(document.cookie)['username'];
        }
        // console.log(document.cookie)
        // console.log("username=", username)
        return username ? username : "test"
        // return 'test'
    }
}
