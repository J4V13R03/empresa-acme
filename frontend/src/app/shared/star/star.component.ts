import { Component, input, computed } from '@angular/core';

@Component({
  selector: 'app-star',
  standalone: true,
  imports: [],
  templateUrl: './star.component.html',
  styleUrl: './star.component.css'
})
export class StarComponent {
  rating = input<number>(0);

  stars = computed(() => Array(Math.ceil(this.rating())).fill(0));
  cropWidth = computed(() => this.rating() * 75 / 5);
}