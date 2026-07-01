import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'defaultImage',
})
export class ImagePipe implements PipeTransform {
  transform(value: string): string {
    if (value) {
      return value;
    }
    return "sin-imagen.jpg";
  }
}
