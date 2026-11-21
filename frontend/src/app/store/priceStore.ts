// Almacén de precios compartido entre vistas
// En producción esto sería una base de datos / API

export interface StoreProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  unit: string;
  emoji: string;
}

export interface PriceStore {
  lunchPrice: number;
  visitorPrice: number;
  products: StoreProduct[];
}

const store: PriceStore = {
  lunchPrice: 5000,
  visitorPrice: 8000,
  products: [
    { id: "p1", name: "Café especial SENA", category: "Café", price: 15000, unit: "kg", emoji: "☕" },
    { id: "p2", name: "Lechuga Batavia", category: "Hortalizas", price: 2500, unit: "unidad", emoji: "🥬" },
    { id: "p3", name: "Tomate chonto", category: "Hortalizas", price: 3000, unit: "kg", emoji: "🍅" },
    { id: "p4", name: "Mango Tommy", category: "Frutas", price: 4000, unit: "kg", emoji: "🥭" },
    { id: "p5", name: "Queso campesino", category: "Lácteos", price: 9000, unit: "250g", emoji: "🧀" },
  ],
};

export const priceStore = {
  getLunchPrice: () => store.lunchPrice,
  setLunchPrice: (price: number) => { store.lunchPrice = price; },
  getVisitorPrice: () => store.visitorPrice,
  setVisitorPrice: (price: number) => { store.visitorPrice = price; },
  getProducts: () => [...store.products],
  setProductPrice: (id: string, price: number) => {
    const idx = store.products.findIndex((p) => p.id === id);
    if (idx !== -1) store.products[idx].price = price;
  },
  getAll: () => ({ ...store }),
};
