import { Routes } from '@angular/router';
import { HomePage } from './home/home.page';

export const routes: Routes = [
  {
    path: '',
    component: HomePage,
  },
  {
    path: 'pokemon/:name',
    loadComponent: () => import('./pokemon-detail/pokemon-detail.page').then(m => m.PokemonDetailPage)
  },
];