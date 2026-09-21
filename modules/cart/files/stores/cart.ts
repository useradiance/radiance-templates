import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { mmkvZustandStorage } from '@/lib/mmkv';

export type CartProduct = {
  id: string;
  name: string;
  priceInMinorUnits: number;
  currency: string;
  imageUrl?: string | null;
  variantId?: string | null;
  variantLabel?: string | null;
};

export type CartLine = {
  lineKey: string;
  productId: string;
  variantId: string | null;
  variantLabel: string | null;
  name: string;
  priceInMinorUnits: number;
  currency: string;
  imageUrl: string | null;
  quantity: number;
};

type CartState = {
  lines: CartLine[];
  add: (product: CartProduct, quantity?: number) => void;
  setQuantity: (lineKey: string, quantity: number) => void;
  remove: (lineKey: string) => void;
  clear: () => void;
};

export function cartLineKey(productId: string, variantId?: string | null): string {
  return variantId ? `${productId}:${variantId}` : productId;
}

/** Device-local cart via MMKV — survives restarts, no network. */
export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      lines: [],

      add: (product, quantity = 1) =>
        set((state) => {
          const lineKey = cartLineKey(product.id, product.variantId);
          const existing = state.lines.find((line) => line.lineKey === lineKey);
          if (existing) {
            return {
              lines: state.lines.map((line) =>
                line.lineKey === lineKey ? { ...line, quantity: line.quantity + quantity } : line,
              ),
            };
          }

          return {
            lines: [
              ...state.lines,
              {
                lineKey,
                productId: product.id,
                variantId: product.variantId ?? null,
                variantLabel: product.variantLabel ?? null,
                name: product.name,
                priceInMinorUnits: product.priceInMinorUnits,
                currency: product.currency,
                imageUrl: product.imageUrl ?? null,
                quantity,
              },
            ],
          };
        }),

      setQuantity: (lineKey, quantity) =>
        set((state) => ({
          lines:
            quantity <= 0
              ? state.lines.filter((line) => line.lineKey !== lineKey)
              : state.lines.map((line) =>
                  line.lineKey === lineKey ? { ...line, quantity } : line,
                ),
        })),

      remove: (lineKey) =>
        set((state) => ({ lines: state.lines.filter((line) => line.lineKey !== lineKey) })),

      clear: () => set({ lines: [] }),
    }),
    {
      name: 'radiance.cart',
      storage: createJSONStorage(() => mmkvZustandStorage),
      merge: (persisted, current) => {
        const state = (persisted as CartState | undefined) ?? current;
        return {
          ...current,
          ...state,
          lines: (state.lines ?? []).map((line) => ({
            ...line,
            lineKey: line.lineKey ?? cartLineKey(line.productId, line.variantId),
            variantId: line.variantId ?? null,
            variantLabel: line.variantLabel ?? null,
          })),
        };
      },
    },
  ),
);

export function cartTotal(lines: CartLine[]): number {
  return lines.reduce((sum, line) => sum + line.priceInMinorUnits * line.quantity, 0);
}

export function cartCount(lines: CartLine[]): number {
  return lines.reduce((sum, line) => sum + line.quantity, 0);
}
