import { Component, inject, signal, OnInit } from '@angular/core';
import { TopRanking } from '../../services/top-ranking';
import { NgxChartsModule } from '@swimlane/ngx-charts';

@Component({
  selector: 'app-top-ranking',
  imports: [NgxChartsModule],
  templateUrl: './top-ranking.html',
  styleUrls: ['./top-ranking.css'],
})
export class TopRankingComponent implements OnInit {
  topRankingService = inject(TopRanking);
  saleData = signal<{name: string, value: number}[]>([]);

  colorScheme: any = {
    domain: ['#222222']
  }

  ngOnInit(): void {
    this.topRankingService.getTopRanking().subscribe({
      next: (data) => {
        if (data.ok) {
          this.saleData.set(data.productos);
        }
      },
      error: (err) => console.error('Error fetching top ranking:', err)
    });
  }
}
