export interface Template {
  id: string;
  title: string;
  image: string;
  category: 'digital' | 'printed' | 'both';
}

export interface Package {
  name: string;
  price: string;
  features: string[];
  recommended?: boolean;
}
