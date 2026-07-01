import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Product {
  private http = inject(HttpClient);
  URI: string = 'http://localhost:3000/productos';

  getProducts(): Observable<any> {
    return this.http.get(this.URI);
  }

  deleteProduct(id: number): Observable<any> {
    return this.http.delete(`${this.URI}/${id}`);
  }

  updateProduct(id: number, producto: any): Observable<any> {
    return this.http.put(`${this.URI}/${id}`, producto);
  }

  saveProduct(producto: any): Observable<any> {
    return this.http.post(this.URI, producto);
  }

  validateCode(code: string): Observable<any> {
    return this.http.get(`${this.URI}/validate-code/${code}`);
  }
}
