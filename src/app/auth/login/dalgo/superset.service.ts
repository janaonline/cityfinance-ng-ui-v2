// superset.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, switchMap } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { environment } from "../../../../environments/environment";

@Injectable({
    providedIn: 'root'
})
export class SupersetService {

    constructor(private http: HttpClient) { }

    private handleError(error: any) {
        console.error('API request error:', error);
        return throwError(() => new Error("Couldn't connect to Superset"));
    }

    getGuestToken(body: any) {
        return this.http.post(
            `${environment.api.url}dalgo/auth`, body
        ).pipe(
            map((response: any) => response.token),
            catchError(this.handleError)
        );
    }


}