import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class BorrowingTabService {

  constructor(private http: HttpClient) { }
  getHeaderName() {
    return this.http.get(
      `${environment.api.url}BondIssuer`
    )
  }

  getColumnData() {
    return this.http.get(
      `${environment.api.url}BondIssuerItem`
    )
  }
}
