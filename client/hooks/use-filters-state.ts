import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type FiltersState = {
  location: string;
  beds: string;
  baths: string;
  propertyType: string;
  amenities: string[];
  availableFrom: string;
  priceRange: [number, number] | [null, null];
  squareFeet: [number, number] | [null, null];
  coordinates: [number, number];
};

type Props = {
  isFiltersOpen: boolean;
  toggleFiltersOpen: () => void;
  filters: FiltersState;
  setFilters: (values: Partial<FiltersState>) => void;
  viewMode: "grid" | "list";
  setViewMode: (mode: "grid" | "list") => void;
};

export const initialFiltersState: FiltersState = {
  location: "Los Angeles",
  beds: "any",
  baths: "any",
  propertyType: "any",
  amenities: [],
  availableFrom: "any",
  priceRange: [null, null],
  squareFeet: [null, null],
  coordinates: [-118.25, 34.05],
};

const useFiltersState = create<Props>()(
  persist(
    (set) => ({
      isFiltersOpen: false,
      toggleFiltersOpen: () =>
        set((state) => ({ isFiltersOpen: !state.isFiltersOpen })),
      filters: initialFiltersState,
      setFilters: (values: Partial<FiltersState>) =>
        set((state) => ({
          filters: { ...state.filters, ...values },
        })),
      viewMode: "grid",
      setViewMode: (mode: "grid" | "list") => set({ viewMode: mode }),
    }),
    {
      name: "rentify-filters-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useFiltersState;
