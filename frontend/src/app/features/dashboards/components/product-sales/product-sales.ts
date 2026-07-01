import { Component, inject, signal } from '@angular/core';
import { ProductSalesAnalytics } from '../../services/product-sales-analytics';
import { NgxChartsModule } from '@swimlane/ngx-charts';

@Component({
  selector: 'app-product-sales',
  imports: [NgxChartsModule],
  templateUrl: './product-sales.html',
  styleUrls: ['./product-sales.css'],
})
export class ProductSales {
  productSalesAnalytics = inject(ProductSalesAnalytics);
  saleData = signal<{name: string, value: number}[]>([]);

  colorScheme: any = {
    domain: ['#1565C0', '#03A9F4', '#FFA726', '#FFCC80', '#FFA07A']
  }

  ngOnInit(): void {
    this.saleData.set(this.productSalesAnalytics.getSales());
  }
}
