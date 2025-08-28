export interface ApiResponse<T> {
  results: T[];
  count: number;
  next?: string;
  previous?: string;
}

export interface SearchFilters {
  query: string;
  subsector: string;
  sortBy: string;
}

export interface NavigationTab {
  id: string;
  label: string;
  active: boolean;
}

export interface Abbreviation {
  id: number;
  abbr: string;
  slug: string;
  description: string;
  created: string;
  updated: string;
}

export interface County {
  id: number;
  name: string;
  code: string;
}

export interface Flag {
  id: number;
  name: string;
  code: string;
  description: string;
}

export interface Item {
  id: number;
  name: string;
  code: string;
  description: string;
  element: string;
  itemcategory: string;
  periodicity: string;
}

export interface ItemCategory {
  id: number;
  name: string;
  code: string;
  description: string;
}

export interface Element {
  id: number;
  name: string;
  code: string;
  description: string;
  subdomain: string;
}

export interface Unit {
  id: number;
  name: string;
  abbreviation: string;
  description: string;
}