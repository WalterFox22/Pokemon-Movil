import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, IonicModule, HttpClientModule, RouterModule, FormsModule],
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  pokemons: any[] = [];
  filteredPokemons: any[] = [];
  offset = 0;
  limit = 151;
  loading = false;
  searchTerm = '';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadPokemons();
  }

  loadPokemons(event?: any) {
    if (this.loading) return;
    this.loading = true;

    this.http
      .get<any>(`https://pokeapi.co/api/v2/pokemon?offset=${this.offset}&limit=${this.limit}`)
      .subscribe(async (res) => {
        const detailRequests = res.results.map((pokemon: any) =>
          this.http.get(pokemon.url).toPromise()
        );
        const detailedPokemons = await Promise.all(detailRequests);
        this.pokemons = [...this.pokemons, ...detailedPokemons];
        this.filteredPokemons = [...this.pokemons]; // actualizar también el filtrado
        this.offset += this.limit;
        this.loading = false;

        if (event) {
          event.target.complete();
        }

        if (res.next === null && event) {
          event.target.disabled = true;
        }
      });
  }

  getTipos(pokemon: any): string {
    return pokemon.types.map((t: any) => t.type.name).join(', ');
  }

  searchPokemon() {
    const term = this.searchTerm.toLowerCase().trim();

    if (!term) {
      this.filteredPokemons = [...this.pokemons];
      return;
    }

    this.filteredPokemons = this.pokemons.filter(p =>
      p.name.toLowerCase().includes(term)
    );
  }
}
