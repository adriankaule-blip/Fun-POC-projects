
import { FoodItem } from './types';

export const FOOD_ITEMS: FoodItem[] = [
  // Bases (Brød og bund)
  { id: 'rugbrod', name: 'Rugbrødsklapper', category: 'base', emoji: '🍞', color: 'bg-amber-100', description: 'Klassisk mørkt rugbrød der mætter længe', price: 3.00 },
  { id: 'grovbolle', name: 'Grovbolle', category: 'base', emoji: '🥯', color: 'bg-orange-50', description: 'Blød bolle med masser af kerner', price: 4.50 },
  { id: 'fuldkornspita', name: 'Pitabrød', category: 'base', emoji: '🥙', color: 'bg-stone-100', description: 'Fuldkornspita klar til fyld', price: 4.00 },
  { id: 'pastasalat', name: 'Pastasalat', category: 'base', emoji: '🍝', color: 'bg-yellow-100', description: 'Kold pasta med lidt olie', price: 5.50 },

  // Proteins (Pålæg og hovedting)
  { id: 'leverpostej', name: 'Leverpostej', category: 'protein', emoji: '🥣', color: 'bg-orange-100', description: 'Klassisk dansk pålæg', price: 3.50 },
  { id: 'frikadeller', name: 'Små Frikadeller', category: 'protein', emoji: '🍖', color: 'bg-red-100', description: 'Hjemmelavede deller af svin/kalv', price: 8.50 },
  { id: 'kyllingepalaeg', name: 'Kyllingepålæg', category: 'protein', emoji: '🍗', color: 'bg-blue-50', description: 'Mager kylling i skiver', price: 6.00 },
  { id: 'aeg', name: 'Hårdkogt æg', category: 'protein', emoji: '🥚', color: 'bg-white', description: 'Nærende og nemt at spise', price: 2.50 },

  // Greens (Grønt og gnavegrønt)
  { id: 'gulerod', name: 'Gulerodsstænger', category: 'green', emoji: '🥕', color: 'bg-orange-200', description: 'Sprøde gulerødder i stave', price: 1.50 },
  { id: 'agurk', name: 'Agurke-hjul', category: 'green', emoji: '🥒', color: 'bg-green-100', description: 'Frisk agurk i tykke skiver', price: 2.00 },
  { id: 'peberfrugt', name: 'Snack-peber', category: 'green', emoji: '🫑', color: 'bg-red-200', description: 'Sød og sprød rød peber', price: 3.50 },
  { id: 'tomater', name: 'Cherrytomater', category: 'green', emoji: '🍅', color: 'bg-red-100', description: 'Små søde tomater', price: 4.50 },

  // Extras (Hapser og frugt)
  { id: 'ostehapser', name: 'Ostehaps', category: 'extra', emoji: '🧀', color: 'bg-yellow-200', description: 'En lille cremet ostesnack', price: 3.00 },
  { id: 'figenstang', name: 'Figenstang', category: 'extra', emoji: '🍫', color: 'bg-amber-200', description: 'Sød snack med masser af fiber', price: 3.50 },
  { id: 'aeblebaade', name: 'Æblebåde', category: 'extra', emoji: '🍎', color: 'bg-green-50', description: 'Friske danske æbler', price: 2.00 },
  { id: 'rosiner', name: 'Rosiner', category: 'extra', emoji: '🍇', color: 'bg-purple-100', description: 'En lille æske med søde rosiner', price: 2.50 },
];
