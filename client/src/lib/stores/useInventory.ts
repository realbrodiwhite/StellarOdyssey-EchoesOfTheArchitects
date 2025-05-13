import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Item } from "../types";

interface InventoryState {
  items: Item[];
  maxInventorySlots: number;
  
  // Inventory management
  addItem: (item: Item) => boolean;
  removeItem: (itemId: string, quantity?: number) => boolean;
  useItem: (itemId: string) => Item | null;
  
  // Inventory status
  getItemCount: (itemId: string) => number;
  hasItem: (itemId: string) => boolean;
  isFull: () => boolean;
  getRemainingSlots: () => number;
}

export const useInventory = create<InventoryState>()(
  persist(
    (set, get) => ({
      items: [],
      maxInventorySlots: 20,
      
      addItem: (newItem) => {
        const inventory = get().items;
        
        // Check if inventory is full
        if (get().isFull() && !inventory.some(item => item.name === newItem.name)) {
          return false;
        }
        
        // Check if item already exists in inventory
        const existingItemIndex = inventory.findIndex(item => item.name === newItem.name);
        
        if (existingItemIndex !== -1) {
          // Update quantity if item exists
          const updatedInventory = [...inventory];
          updatedInventory[existingItemIndex] = {
            ...updatedInventory[existingItemIndex],
            quantity: updatedInventory[existingItemIndex].quantity + newItem.quantity
          };
          
          set({ items: updatedInventory });
        } else {
          // Add new item to inventory
          set({ items: [...inventory, newItem] });
        }
        
        return true;
      },
      
      removeItem: (itemId, quantity = 1) => {
        const inventory = get().items;
        const itemIndex = inventory.findIndex(item => item.id === itemId);
        
        if (itemIndex === -1) return false;
        
        const item = inventory[itemIndex];
        
        if (item.quantity <= quantity) {
          // Remove item completely if quantity is less than or equal to requested removal amount
          set({
            items: inventory.filter(item => item.id !== itemId)
          });
        } else {
          // Decrease quantity
          const updatedInventory = [...inventory];
          updatedInventory[itemIndex] = {
            ...item,
            quantity: item.quantity - quantity
          };
          
          set({ items: updatedInventory });
        }
        
        return true;
      },
      
      useItem: (itemId) => {
        const inventory = get().items;
        const item = inventory.find(item => item.id === itemId);
        
        if (!item || !item.usable) return null;
        
        // Use the item (decrease quantity)
        get().removeItem(itemId, 1);
        
        return item;
      },
      
      getItemCount: (itemId) => {
        const item = get().items.find(item => item.id === itemId);
        return item ? item.quantity : 0;
      },
      
      hasItem: (itemId) => {
        return get().items.some(item => item.id === itemId);
      },
      
      isFull: () => {
        // Count unique items (not quantities)
        return get().items.length >= get().maxInventorySlots;
      },
      
      getRemainingSlots: () => {
        return get().maxInventorySlots - get().items.length;
      }
    }),
    {
      name: "inventory-storage", // name of the item in localStorage
      partialize: (state) => ({ items: state.items }), // only store items
    }
  )
);
