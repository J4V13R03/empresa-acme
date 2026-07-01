import { Component, signal, computed, inject, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GoogleMap, MapMarker } from '@angular/google-maps';
import { MapService } from '../../services/map.service';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule, FormsModule, GoogleMap, MapMarker],
  templateUrl: './map.html'
})
export class MapComponent {
  private mapService = inject(MapService);
  private zone = inject(NgZone);

  latitud = signal(0);
  longitud = signal(0);
  direccion = signal('');
  zoom = signal(4);
  isMapLoaded = signal(false);
  markers = signal<any[]>([]);
  markerOptions!: google.maps.MarkerOptions;

  center = computed(() => ({
    lat: this.latitud(),
    lng: this.longitud()
  }));

  ngOnInit() {
    this.mapService.loadApi().then(() => {
      this.markerOptions = {
        draggable: true,
        animation: google.maps.Animation.DROP,
        title: '¡Arrástreme!'
      };

      this.markers.set([{ id: 1, position: { lat: this.latitud(), lng: this.longitud() } }]);
      this.isMapLoaded.set(true);
    }).catch(error => console.error('Error crítico cargando Google Maps', error));
  }

  // ACCIÓN 1: EL USUARIO ARRASTRA EL PIN EN EL MAPA
  async onMarkerDragEnd(event: google.maps.MapMouseEvent) {
    if (!event.latLng) return;

    const coordenadas = event.latLng.toJSON();
    this.zone.run(() => {
      const latTruncada = +coordenadas.lat.toFixed(4);
      const lngTruncada = +coordenadas.lng.toFixed(4);

      this.latitud.set(latTruncada);
      this.longitud.set(lngTruncada);

      this.markers.update(lista =>
        lista.map(m => m.id === 1
          ? { ...m, position: { lat: latTruncada, lng: lngTruncada } }
          : m)
      );
    });

    // Reverse geocoding con Nominatim (OpenStreetMap) — gratis, sin key
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${coordenadas.lat}&lon=${coordenadas.lng}&format=json`,
        { headers: { 'User-Agent': 'mi-app-mod/1.0' } }
      );
      const data = await response.json();
      if (data && data.display_name) {
        this.zone.run(() => {
          this.direccion.set(data.display_name);
        });
      }
    } catch (error) {
      console.error('Error en reverse geocoding con Nominatim:', error);
    }
  }

  // ACCIÓN 2: EL USUARIO ESCRIBE MANUALMENTE Y PRESIONA ENTER
  async buscarDireccion(textoDireccion: string) {
    if (!textoDireccion.trim()) return;

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(textoDireccion)}&format=json&limit=1`,
        { headers: { 'User-Agent': 'mi-app-mod/1.0' } }
      );
      const results = await response.json();

      if (results && results[0]) {
        const coords = {
          lat: +parseFloat(results[0].lat).toFixed(4),
          lng: +parseFloat(results[0].lon).toFixed(4)
        };

        this.zone.run(() => {
          this.latitud.set(coords.lat);
          this.longitud.set(coords.lng);
          this.direccion.set(results[0].display_name);

          this.markers.update(lista =>
            lista.map(m => m.id === 1
              ? { ...m, position: { lat: coords.lat, lng: coords.lng } }
              : m)
          );

          this.zoom.set(16);
        });
      }
    } catch (error) {
      console.error('Error en forward geocoding con Nominatim:', error);
    }
  }
}
