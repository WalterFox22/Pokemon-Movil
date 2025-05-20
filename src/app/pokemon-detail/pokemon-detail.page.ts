import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Firestore, collection, addDoc, updateDoc, doc, getDocs, query, where, getDoc } from '@angular/fire/firestore';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { inject } from '@angular/core';

interface PokemonApiResponse {
  name: string;
  height: number;
  weight: number;
  types: { slot: number; type: { name: string; url: string } }[];
  abilities: { ability: { name: string; url: string } }[];
  sprites: { front_default: string };
  stats: any[];
  moves: any[];
}

@Component({
  selector: 'app-pokemon-detail',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
  templateUrl: './pokemon-detail.page.html',
  styleUrls: ['./pokemon-detail.page.scss'],
})
export class PokemonDetailPage implements OnInit {
  pokemon: PokemonApiResponse | undefined;
  comentario: string = '';
  pokemonDocId: string | null = null;
  comentarios: { texto: string; fecha: string }[] = [];
  router = inject(Router);

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private firestore: Firestore
  ) {}

  volverAlInicio() {
    this.router.navigate(['']);
  }

  async ngOnInit() {
    const name = this.route.snapshot.paramMap.get('name');
    this.http.get<PokemonApiResponse>(`https://pokeapi.co/api/v2/pokemon/${name}`).subscribe(async res => {
      this.pokemon = res;

      // Buscar si ya existe el documento para este Pokémon
      const colRef = collection(this.firestore, 'pokemones');
      const q = query(colRef, where('nombre', '==', res.name));
      const querySnapshot = await getDocs(q);

      let docRef;
      if (!querySnapshot.empty) {
        // Ya existe, usar el primero encontrado
        docRef = doc(this.firestore, 'pokemones', querySnapshot.docs[0].id);
        this.pokemonDocId = querySnapshot.docs[0].id;
      } else {
        // No existe, crearlo
        docRef = await addDoc(colRef, {
          nombre: res.name,
          altura: res.height,
          peso: res.weight,
          tipos: res.types.map(t => t.type.name),
          habilidades: res.abilities.map(a => a.ability.name),
          imagen: res.sprites?.front_default,
          fecha: new Date().toISOString(),
          comentarios: []
        });
        this.pokemonDocId = docRef.id ?? docRef.id;
        // Si addDoc, docRef es DocumentReference, si doc(), es DocumentReference también
        docRef = doc(this.firestore, 'pokemones', this.pokemonDocId);
      }

      // Obtener los comentarios guardados (si existen)
      const pokemonDocSnap = await getDoc(docRef);
      const data = pokemonDocSnap.data();
      this.comentarios = data?.['comentarios'] || [];
    });
  }

  getTipos(): string {
    return this.pokemon?.types.map(t => t.type.name).join(', ') || '';
  }

  getHabilidades(): string {
    return this.pokemon?.abilities.map(a => a.ability.name).join(', ') || '';
  }

  getEstadisticas(): any[] {
    return this.pokemon?.stats || [];
  }

  getMovimientosPrincipales(): any[] {
    return this.pokemon?.moves.slice(0, 5) || [];
  }

 async enviarComentario() {
  if (!this.comentario.trim() || !this.pokemonDocId) return;

  try {
    const docRef = doc(this.firestore, 'pokemones', this.pokemonDocId);

    // Obtener comentarios actuales del documento
    const pokemonDocSnap = await getDoc(docRef);
    const data = pokemonDocSnap.data();
    const comentariosActuales = data?.['comentarios'] || [];

    // Agregar el nuevo comentario al array de comentarios
    const nuevoComentario = {
      texto: this.comentario.trim(),
      fecha: new Date().toISOString()
    };
    const nuevosComentarios = [...comentariosActuales, nuevoComentario];

    // Actualizar en Firestore
    await updateDoc(docRef, {
      comentarios: nuevosComentarios
    });

    // Actualizar en la vista
    this.comentarios = nuevosComentarios;
    this.comentario = '';
    alert('Comentario enviado con éxito!');
  } catch (error) {
    console.error('Error al enviar comentario:', error);
    alert('Error al enviar el comentario, intenta nuevamente.');
  }
}
}