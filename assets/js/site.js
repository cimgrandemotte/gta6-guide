// Point d'entrée des interactions S5. Chaque module s'active seulement si ses éléments existent.
import { initSearch } from './search.js';
import { initFilters } from './filters.js';
import { initAtlas } from './atlas.js';
import { initChecklists } from './checklist.js';

initSearch();
initFilters();
initAtlas();
initChecklists();
