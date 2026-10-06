export type ProductCondition = "Sealed" | "Brand new" | "One time use";

export type Product = {
  id: string;
  name: string;
  price: number;
  image_url: string;
  buy_url: string;
  condition: ProductCondition;
  stock: number;
  specifications: string;
  created_at?: string;
};