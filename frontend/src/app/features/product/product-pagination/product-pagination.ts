import { Component } from '@angular/core';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { faker } from '@faker-js/faker';

@Component({
  selector: 'app-product-pagination',
  standalone: true,
  imports: [NgxPaginationModule, DatePipe, CurrencyPipe],
  templateUrl: './product-pagination.html',
  styleUrl: './product-pagination.css'
})
export class ProductPaginationComponent {
  data: any[] = [];
  p: number = 1;
  total: number = 0;

  constructor() {
    this.data = Array(50).fill(1).map(() => ({
      productId: faker.number.int({ min: 1000, max: 9999 }),
      productName: faker.commerce.productName(),
      productCode: faker.string.alpha({ length: 3, casing: 'upper' }) + '-' + faker.number.int({ min: 100, max: 999 }),
      releaseDate: faker.date.past().toISOString(),
      price: faker.number.float({ min: 10, max: 500, fractionDigits: 2 }),
      description: faker.commerce.productDescription(),
      starRating: faker.number.int({ min: 1, max: 5 }),
      image: faker.image.urlPicsumPhotos()
    }));

    this.total = this.data.length;
  }
}
