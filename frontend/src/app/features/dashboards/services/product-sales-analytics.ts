import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ProductSalesAnalytics {

  getSales() {
    return [
      {"name": "Móviles", "value": 100000},
      {"name": "Notebooks", "value": 55000},
      {"name": "Estufas", "value": 15000},
      {"name": "Televisores", "value": 150000},
      {"name": "Refrigeradores", "value": 20000},
    ]
  }
}
