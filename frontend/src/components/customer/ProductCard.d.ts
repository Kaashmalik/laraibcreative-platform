import React from 'react';
import type { Product } from '@/types/product';

export interface ProductCardProps {
  product: Product;
  viewMode?: 'grid' | 'list';
}

declare const ProductCard: React.FC<ProductCardProps>;

export default ProductCard;

