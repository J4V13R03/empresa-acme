import { Component, output, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AsyncValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { Observable, of, timer } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators';
import { Product as ProductService } from '../../services/product';

@Component({
  selector: 'app-modal-add',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './modal-add.html',
  styleUrl: './modal-add.css',
})
export class ModalAdd implements OnInit {
  close = output<void>();
  save = output<any>();

  private fb = inject(FormBuilder);
  private productService = inject(ProductService);
  form!: FormGroup;

  ngOnInit() {
    this.form = this.fb.group({
      productName: ['', Validators.required],
      productCode: ['', [Validators.required, Validators.pattern(/^[A-Z]{3}-\d{4}$/)], [this.uniqueCodeValidator()]],
      releaseDate: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      starRating: [0, [Validators.required, Validators.min(1), Validators.max(5)]],
      description: ['', Validators.required]
    });
  }

  // Validador asíncrono: verifica que el código no exista en la BD
  private uniqueCodeValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (!control.value) return of(null);

      return timer(500).pipe(
        switchMap(() => this.productService.validateCode(control.value)),
        map((res: any) => {
          return res.data?.codeExists ? { codeExists: true } : null;
        }),
        catchError(() => of(null))
      );
    };
  }

  onSave() {
    if (this.form.invalid) return;

    this.productService.saveProduct(this.form.value).subscribe({
      next: (res: any) => {
        this.ocultarModal();
      },
      error: (err: any) => {
        alert('Error al conectar con el servidor para guardar el producto.');
      }
    });
  }

  ocultarModal() {
    this.close.emit();
  }
}
