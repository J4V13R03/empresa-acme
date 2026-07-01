import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { IProduct } from '../../interfaces/product';
import { StarComponent } from '../../../../shared/star/star.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [StarComponent],
  templateUrl: './product-list.html',
  styleUrl: './product-list.css',
})
export class ProductList {

  @Input('datos') products: IProduct[] = [];

  @Output() datoEmitido = new EventEmitter<string>();
  @Output() productDeleted = new EventEmitter<number>();
  @Output() productUpdated = new EventEmitter<IProduct>();

  showImage = signal<boolean>(true);

  constructor() { console.log('Hijo: constructor'); }
  ngOnInit(): void { console.log('Hijo: ngOnInit'); }

  toggleImage(): void {
    this.showImage.update(value => !value);
    this.datoEmitido.emit(this.showImage() ? 'Imágenes visibles' : 'Imágenes ocultas');
  }

  onDelete(id: number): void {
    console.log('Hijo: Enviando ID al padre para borrar:', id);
    this.productDeleted.emit(id);
  }

  onUpdate(producto: IProduct): void {
    console.log('Hijo: Enviando producto al padre para actualizar');
    const productoEditado = { ...producto, productName: producto.productName + ' (Editado)' };
    this.productUpdated.emit(productoEditado);
  }
}