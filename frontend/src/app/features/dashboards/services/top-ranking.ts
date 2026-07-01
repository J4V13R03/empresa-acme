import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TopRanking {
  private http = inject(HttpClient);
  URI: string = 'http://localhost:3000/productos/top-ranking';

  getTopRanking(): Observable<any> {
    return this.http.get(this.URI);
  }
}
