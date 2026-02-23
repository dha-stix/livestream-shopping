interface FirebaseProduct {
    id: string;
    name: string;
    price: number;
    stock: number;
    number_sold: number;
}
interface CartItem extends FirebaseProduct {
    quantity: number;
}

interface Ad {
    id: number;
    type: "ad";
    color: string;
    brandName: string;
    ctaLabel: string;
    description: string;
    shopUrl: string;
}

type FeedItem = Call | Ad;

declare module "*.mp4" {
  const src: string;
  export default src;
}
