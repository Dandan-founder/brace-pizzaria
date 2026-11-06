/**
 * Cardápio. Preços são EXEMPLOS (marca fictícia) — ajuste antes de publicar.
 * `image` aponta para uma chave de src/data/images.json.
 */
export type CategoryId = "rosse" | "bianche" | "dolci" | "bebidas";

export type Product = {
  id: string;
  name: string;
  category: CategoryId;
  description: string;
  /** Ingredientes que o cliente pode pedir para retirar. */
  removable?: string[];
  price: number;
  image?: string;
  /** Posição entre os mais pedidos (1 = mais pedido). */
  bestSeller?: 1 | 2 | 3;
  vegetarian?: boolean;
  customizable: boolean;
};

export type Extra = { id: string; name: string; price: number };

export type Combo = {
  id: string;
  name: string;
  pitch: string;
  items: { productId: string; qty: number }[];
  price: number;
  /** Dias da semana em que a oferta vale (0 = domingo). Vazio = todos. */
  days?: number[];
  image: string;
};

export const categories: { id: CategoryId; name: string; note: string }[] = [
  { id: "rosse", name: "Rosse", note: "Com molho de tomate San Marzano" },
  { id: "bianche", name: "Bianche", note: "Sem molho, com base de fior di latte" },
  { id: "dolci", name: "Dolci", note: "Para fechar a noite" },
  { id: "bebidas", name: "Bebidas", note: "Gelados, sem pressa" },
];

export const products: Product[] = [
  {
    id: "margherita",
    name: "Margherita",
    category: "rosse",
    description: "San Marzano, fior di latte, manjericão fresco e azeite extravirgem.",
    removable: ["manjericão"],
    price: 59,
    image: "margherita",
    bestSeller: 1,
    vegetarian: true,
    customizable: true,
  },
  {
    id: "bufala",
    name: "Margherita di Bufala",
    category: "rosse",
    description: "San Marzano, mozzarella de búfala colocada depois do forno, manjericão e azeite.",
    removable: ["manjericão"],
    price: 72,
    image: "bianca",
    bestSeller: 2,
    vegetarian: true,
    customizable: true,
  },
  {
    id: "diavola",
    name: "Diavola",
    category: "rosse",
    description: "San Marzano, fior di latte, salame picante e um fio de mel de pimenta.",
    removable: ["mel de pimenta"],
    price: 68,
    image: "diavola",
    bestSeller: 3,
    customizable: true,
  },
  {
    id: "rustica",
    name: "Rustica",
    category: "rosse",
    description: "San Marzano, salame italiano, tomate assado, azeitonas pretas e manjericão.",
    removable: ["azeitonas pretas", "manjericão"],
    price: 69,
    image: "rustica",
    customizable: true,
  },
  {
    id: "spinaci",
    name: "Spinaci e Ricotta",
    category: "rosse",
    description: "San Marzano, espinafre salteado no alho, ricota fresca e raspas de limão-siciliano.",
    removable: ["alho", "raspas de limão"],
    price: 66,
    image: "spinaci",
    vegetarian: true,
    customizable: true,
  },
  {
    id: "ortolana",
    name: "Ortolana",
    category: "rosse",
    description: "San Marzano, fior di latte, abobrinha, pimentões assados, azeitonas e milho tostado.",
    removable: ["azeitonas", "milho"],
    price: 64,
    image: "funghi",
    vegetarian: true,
    customizable: true,
  },
  {
    id: "marinara",
    name: "Marinara",
    category: "rosse",
    description: "A mais antiga: San Marzano, alho, orégano siciliano e azeite. Sem queijo.",
    removable: ["alho"],
    price: 49,
    vegetarian: true,
    customizable: true,
  },
  {
    id: "quattro",
    name: "Quattro Formaggi",
    category: "bianche",
    description: "Fior di latte, gorgonzola, provolone defumado e parmigiano 24 meses, com alecrim.",
    removable: ["alecrim"],
    price: 74,
    image: "capricciosa",
    vegetarian: true,
    customizable: true,
  },
  {
    id: "cipolla",
    name: "Cipolla Rossa",
    category: "bianche",
    description: "Fior di latte, cebola roxa caramelizada no balsâmico, provola defumada e salsinha.",
    removable: ["salsinha"],
    price: 62,
    image: "tagliere",
    vegetarian: true,
    customizable: true,
  },
  {
    id: "mortadella",
    name: "Mortadella e Pistacchio",
    category: "bianche",
    description: "Fior di latte, mortadela de Bologna fatiada na hora, creme de pistache e burrata.",
    removable: ["burrata"],
    price: 79,
    customizable: true,
  },
  {
    id: "tiramisu",
    name: "Tiramisù",
    category: "dolci",
    description: "Mascarpone, café passado e cacau. Montado todo dia.",
    price: 32,
    vegetarian: true,
    customizable: false,
  },
  {
    id: "cannoli",
    name: "Cannoli (2 unidades)",
    category: "dolci",
    description: "Casquinha crocante recheada na hora com ricota, laranja e pistache.",
    price: 28,
    vegetarian: true,
    customizable: false,
  },
  {
    id: "nutella",
    name: "Pizza de Nutella e avelã",
    category: "dolci",
    description: "Massa da casa, Nutella, avelãs tostadas e açúcar de confeiteiro.",
    price: 46,
    vegetarian: true,
    customizable: false,
  },
  {
    id: "limonada",
    name: "Limonada siciliana da casa",
    category: "bebidas",
    description: "500 ml, feita na hora.",
    price: 16,
    customizable: false,
  },
  {
    id: "agua",
    name: "Água mineral com ou sem gás",
    category: "bebidas",
    description: "500 ml.",
    price: 9,
    customizable: false,
  },
  {
    id: "birra",
    name: "Cerveja italiana",
    category: "bebidas",
    description: "Lager, long neck 330 ml.",
    price: 22,
    customizable: false,
  },
  {
    id: "vinho",
    name: "Vinho tinto italiano",
    category: "bebidas",
    description: "Garrafa 750 ml, Montepulciano d'Abruzzo.",
    price: 139,
    customizable: false,
  },
];

export const extras: Extra[] = [
  { id: "burrata", name: "Burrata inteira", price: 18 },
  { id: "bufala", name: "Mozzarella de búfala", price: 14 },
  { id: "prosciutto", name: "Prosciutto di Parma", price: 16 },
  { id: "nduja", name: "'Nduja calabresa", price: 12 },
  { id: "parmigiano", name: "Parmigiano 24 meses", price: 9 },
  { id: "funghi", name: "Cogumelos salteados", price: 8 },
  { id: "olive", name: "Azeitonas pretas", price: 6 },
  { id: "rucola", name: "Rúcula fresca", price: 5 },
  { id: "miele", name: "Mel de pimenta", price: 6 },
];

export const combos: Combo[] = [
  {
    id: "notte-a-due",
    name: "Notte a due",
    pitch: "Margherita, Diavola e uma garrafa de Montepulciano.",
    items: [
      { productId: "margherita", qty: 1 },
      { productId: "diavola", qty: 1 },
      { productId: "vinho", qty: 1 },
    ],
    price: 229,
    image: "wine",
  },
  {
    id: "martedi",
    name: "Terça da Margherita",
    pitch: "Duas Margheritas pelo preço de uma e meia. Só às terças.",
    items: [{ productId: "margherita", qty: 2 }],
    price: 89,
    days: [2],
    image: "margherita",
  },
  {
    id: "tavolata",
    name: "Tavolata",
    pitch: "Para a mesa toda: duas Margheritas, uma Quattro Formaggi, Tiramisù e duas limonadas.",
    items: [
      { productId: "margherita", qty: 2 },
      { productId: "quattro", qty: 1 },
      { productId: "tiramisu", qty: 1 },
      { productId: "limonada", qty: 2 },
    ],
    price: 249,
    image: "share",
  },
];

export const productById = Object.fromEntries(products.map((p) => [p.id, p])) as Record<string, Product>;
export const extraById = Object.fromEntries(extras.map((e) => [e.id, e])) as Record<string, Extra>;
export const comboById = Object.fromEntries(combos.map((c) => [c.id, c])) as Record<string, Combo>;

export const comboFullPrice = (c: Combo) =>
  c.items.reduce((s, i) => s + productById[i.productId].price * i.qty, 0);
