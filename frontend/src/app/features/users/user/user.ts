import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrollingModule } from '@angular/cdk/scrolling';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [CommonModule, ScrollingModule],
  templateUrl: './user.html',
  styleUrl: './user.css'
})
export class UserComponent {
  // Lista de nombres base para reciclar
  private nombresReales = [
    'Catalina Soto', 'Matías Salazar', 'Valentina Rojas', 'Benjamín Carrasco',
    'Camila Fuentes', 'Sebastián Herrera', 'Constanza Vega', 'Nicolás Muñoz',
    'Javiera Orellana', 'Felipe Castro', 'Andrea Sepúlveda', 'Diego Gutiérrez'
  ];

  // Generamos los 10.000 registros combinando los nombres con el índice
  usuarios = Array(10000).fill(1).map((_, i) => {
    // Escogemos un nombre de la lista de forma cíclica
    const nombreAsignado = this.nombresReales[i % this.nombresReales.length];

    // Formateamos el correo para que coincida con el nombre (ej: catalina.soto24@alumnos.ubiobio.cl)
    const emailBase = nombreAsignado.toLowerCase().replace(' ', '.');

    return {
      nombre: nombreAsignado,
      email: `${emailBase}${i}@alumnos.ubiobio.cl`,
      avatar: `https://i.pravatar.cc/150?u=${i}` // El id 'u=i' asegura que la foto siempre sea la misma para ese índice
    };
  });
}
