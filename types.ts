
export type FoodCategory = 'base' | 'protein' | 'green' | 'extra';

export interface FoodItem {
  id: string;
  name: string;
  category: FoodCategory;
  emoji: string;
  color: string;
  description: string;
  price: number; // Approximate price in DKK
}

export interface LunchboxSelection {
  base?: FoodItem;
  protein?: FoodItem;
  green?: FoodItem;
  extra?: FoodItem;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export type DayOfWeek = 'Mandag' | 'Tirsdag' | 'Onsdag' | 'Torsdag' | 'Fredag';

export interface SavedLunchbox {
  selection: LunchboxSelection;
  imageUrl: string | null;
}

export interface WeeklyPlan {
  [key: string]: SavedLunchbox | null;
}
