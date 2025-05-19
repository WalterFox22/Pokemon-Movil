import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pokemon-detail',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './pokemon-detail.page.html',
  styleUrls: ['./pokemon-detail.page.scss'],
})
export class PokemonDetailPage implements OnInit {
  pokemon: any;

  constructor(private route: ActivatedRoute, private http: HttpClient) {}

  ngOnInit() {
    const name = this.route.snapshot.paramMap.get('name');
    this.http.get(`https://pokeapi.co/api/v2/pokemon/${name}`).subscribe(res => {
      this.pokemon = res;
    });
  }

  getTipos(): string {
    return this.pokemon?.types.map((t: any) => t.type.name).join(', ') || '';
  }

  getHabilidades(): string {
    return this.pokemon?.abilities.map((a: any) => a.ability.name).join(', ') || '';
  }

  getEstadisticas(): any[] {
    return this.pokemon?.stats || [];
  }

  getMovimientosPrincipales(): any[] {
    return this.pokemon?.moves.slice(0, 5) || [];
  }
}