import { Component, signal, computed, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProductList } from "./components/product-list/product-list";
import { ModalAdd } from './components/modal-add/modal-add';
import { IProduct } from './interfaces/product';
import { Product as ProductService } from './services/product';

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [ProductList, FormsModule, ModalAdd],
  templateUrl: './product.html'
})
export class ProductComponent implements OnInit {
  
  datoRecibido = signal<any>('');
  showChildren = signal(true);
  listFilter = signal<string>('');
  products = signal<IProduct[]>([]);
  isModalOpen = signal(false);

  constructor(private productService: ProductService){ }

  ngOnInit(): void {
    this.cargarProductos();
  }

  abrirModal() { this.isModalOpen.set(true); }
  cerrarModal() { 
    this.isModalOpen.set(false);
    this.cargarProductos();
  }
  toggleChildren() { this.showChildren.update(value=> !value); }

  cargarProductos(): void {
    this.productService.getProducts().subscribe({
      next: (data: any) => {
        if (data && data.productos) this.products.set(data.productos);
      },
      error: (err: any) => console.error("Error", err)
    });
  }

  borrarProducto(id: number): void {
    this.productService.deleteProduct(id).subscribe({
      next: () => this.cargarProductos(),
      error: (err: any) => console.error('Error al borrar', err)
    });
  }

  actualizarProducto(producto: IProduct): void {
    this.productService.updateProduct(producto.productId, producto).subscribe({
      next: (res: any) => {
        if (res && (res.ok || res.status === 'success')) this.cargarProductos(); 
      },
      error: (err: any) => console.error('Error al actualizar', err)
    });
  }

  filteredProducts = computed(() => {
    const filter = this.listFilter().toLowerCase();
    return this.products().filter(product => 
      product.productName.toLowerCase().includes(filter)
    );
  });
}
