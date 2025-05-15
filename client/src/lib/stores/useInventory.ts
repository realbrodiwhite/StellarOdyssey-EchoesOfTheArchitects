import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { Item, ItemType } from '../types';

// Item templates for quest items and rewards
export const itemTemplates: Record<string, Omit<Item, 'id'>> = {
  // Quest items
  'encrypted_data_core': {
    name: 'Encrypted Data Core',
    type: ItemType.Key,
    description: 'A heavily encrypted data core from an Alliance research vessel. Contains valuable and potentially dangerous information.',
    value: 1000,
    usable: false,
    quantity: 1
  },
  'mysterious_artifact': {
    name: 'Mysterious Artifact',
    type: ItemType.Key,
    description: 'An ancient object of unknown origin. It occasionally pulses with strange energy and seems to respond to your proximity.',
    value: 5000,
    usable: true,
    quantity: 1,
    effect: 'Unknown effects. Handle with caution.'
  },
  'alliance_insignia': {
    name: 'Alliance Security Insignia',
    type: ItemType.Key,
    description: 'An official Alliance security officer\'s insignia. Could provide access to restricted areas.',
    value: 500,
    usable: false,
    quantity: 1
  },
  'emergency_supplies': {
    name: 'Emergency Medical Kit',
    type: ItemType.Consumable,
    description: 'Standard issue Alliance emergency medical supplies.',
    value: 200,
    usable: true,
    quantity: 1,
    effect: 'Restores 30 health when used.'
  },
  'syndicate_payment': {
    name: 'Syndicate Credit Chip',
    type: ItemType.Key,
    description: 'An untraceable credit chip from the Syndicate. Can be exchanged for a significant sum.',
    value: 2000,
    usable: false,
    quantity: 1
  },
  'credits_payment': {
    name: 'Credit Payment',
    type: ItemType.Consumable,
    description: 'Payment for your delivery job.',
    value: 500,
    usable: true,
    quantity: 1,
    effect: 'Adds 500 credits to your account when used.'
  },
  'bonus_payment': {
    name: 'Bonus Payment',
    type: ItemType.Consumable,
    description: 'A hefty bonus for your discretion regarding certain cargo shipments.',
    value: 1000,
    usable: true,
    quantity: 1,
    effect: 'Adds 1000 credits to your account when used.'
  },
  'large_credit_payment': {
    name: 'Substantial Payment',
    type: ItemType.Consumable,
    description: 'A very large payment for an item of great value.',
    value: 3000,
    usable: true,
    quantity: 1,
    effect: 'Adds 3000 credits to your account when used.'
  },
  'advanced_scanner': {
    name: 'Advanced Scanner',
    type: ItemType.Tool,
    description: 'A sophisticated scanning device capable of detecting hidden items and energy signatures.',
    value: 800,
    usable: true,
    quantity: 1,
    effect: 'Reveals hidden objects and information in certain areas.'
  },
  
  // Weapons and equipment
  'pulse_pistol': {
    name: 'Pulse Pistol',
    type: ItemType.Weapon,
    description: 'Standard sidearm with moderate stopping power. Effective at short to medium range.',
    value: 400,
    usable: false,
    quantity: 1
  },
  'energy_rifle': {
    name: 'Energy Rifle',
    type: ItemType.Weapon,
    description: 'Military-grade energy weapon with adjustable output. Effective at medium to long range.',
    value: 800,
    usable: false,
    quantity: 1
  },
  'repair_kit': {
    name: 'Repair Kit',
    type: ItemType.Tool,
    description: 'Contains tools and components for emergency repairs to equipment and minor ship systems.',
    value: 300,
    usable: true,
    quantity: 1,
    effect: 'Repairs damaged equipment or minor ship system failures.'
  },
  'shield_booster': {
    name: 'Shield Booster',
    type: ItemType.Upgrade,
    description: 'A modification that enhances personal shield capacity and regeneration.',
    value: 600,
    usable: true,
    quantity: 1,
    effect: 'Permanently increases maximum shield capacity by 15%.'
  }
};

interface InventoryState {
  items: Item[];
  credits: number;
  maxItems: number;
  
  // Management functions
  addItem: (itemId: string, quantity?: number) => boolean;
  removeItem: (itemId: string, quantity?: number) => boolean;
  useItem: (itemId: string) => boolean;
  hasItem: (itemId: string) => boolean;
  getItemCount: (itemId: string) => number;
  addCredits: (amount: number) => void;
  removeCredits: (amount: number) => boolean;
  clearInventory: () => void;
}

export const useInventory = create<InventoryState>()(
  persist(
    (set, get) => ({
      items: [],
      credits: 200, // Starting credits
      maxItems: 20, // Maximum inventory slots
      
      addItem: (itemId: string, quantity: number = 1) => {
        const { items, maxItems } = get();
        
        // Find template
        const template = itemTemplates[itemId];
        if (!template) {
          console.error(`Item template not found: ${itemId}`);
          return false;
        }
        
        // Check for existing item
        const existingItemIndex = items.findIndex(item => 
          item.name === template.name && item.type === template.type
        );
        
        if (existingItemIndex >= 0) {
          // Update existing item quantity
          const updatedItems = [...items];
          updatedItems[existingItemIndex].quantity += quantity;
          
          set({ items: updatedItems });
          console.log(`Added ${quantity} ${template.name} to inventory`);
          return true;
        } else {
          // Check inventory space
          if (items.length >= maxItems) {
            console.log("Inventory is full");
            return false;
          }
          
          // Create new item
          const newItem: Item = {
            id: uuidv4(),
            ...template,
            quantity
          };
          
          set({ items: [...items, newItem] });
          console.log(`Added ${quantity} ${template.name} to inventory`);
          return true;
        }
      },
      
      removeItem: (itemId: string, quantity: number = 1) => {
        const { items } = get();
        
        // Find item by ID
        const itemIndex = items.findIndex(item => item.id === itemId);
        if (itemIndex === -1) return false;
        
        const item = items[itemIndex];
        
        // Check if removing partial quantity
        if (quantity < item.quantity) {
          const updatedItems = [...items];
          updatedItems[itemIndex].quantity -= quantity;
          
          set({ items: updatedItems });
          return true;
        } else {
          // Remove item entirely
          set({ items: items.filter(i => i.id !== itemId) });
          return true;
        }
      },
      
      useItem: (itemId: string) => {
        const { items, credits } = get();
        
        // Find item by ID
        const itemIndex = items.findIndex(item => item.id === itemId);
        if (itemIndex === -1) return false;
        
        const item = items[itemIndex];
        
        // Check if item is usable
        if (!item.usable) {
          console.log(`${item.name} cannot be used`);
          return false;
        }
        
        // Apply item effect
        console.log(`Using ${item.name}`);
        
        // Handle consumable effects
        if (item.type === ItemType.Consumable) {
          // For credit items
          if (item.name.includes('Credit') || item.name.includes('Payment')) {
            const valueMatch = item.effect?.match(/(\d+) credits/i);
            const creditValue = valueMatch ? parseInt(valueMatch[1]) : item.value;
            
            // Add credits
            set({ credits: credits + creditValue });
            console.log(`Added ${creditValue} credits`);
          }
          
          // For health items, handled in character store
          
          // Remove one from quantity
          if (item.quantity > 1) {
            const updatedItems = [...items];
            updatedItems[itemIndex].quantity -= 1;
            set({ items: updatedItems });
          } else {
            // Remove item if last one
            set({ items: items.filter(i => i.id !== itemId) });
          }
          
          return true;
        }
        
        // For tool/upgrade effects - handled by caller
        return true;
      },
      
      hasItem: (itemId: string) => {
        // Check if we have an item matching this template ID
        const template = itemTemplates[itemId];
        if (!template) return false;
        
        return get().items.some(item => 
          item.name === template.name && item.type === template.type
        );
      },
      
      getItemCount: (itemId: string) => {
        // Get quantity of an item matching this template ID
        const template = itemTemplates[itemId];
        if (!template) return 0;
        
        const item = get().items.find(item => 
          item.name === template.name && item.type === template.type
        );
        
        return item ? item.quantity : 0;
      },
      
      addCredits: (amount: number) => {
        if (amount <= 0) return;
        set({ credits: get().credits + amount });
        console.log(`Added ${amount} credits`);
      },
      
      removeCredits: (amount: number) => {
        const { credits } = get();
        if (amount <= 0) return true;
        
        if (credits < amount) {
          console.log("Not enough credits");
          return false;
        }
        
        set({ credits: credits - amount });
        console.log(`Removed ${amount} credits`);
        return true;
      },
      
      clearInventory: () => {
        set({ items: [], credits: 0 });
        console.log("Inventory cleared");
      }
    }),
    {
      name: 'inventory-storage',
      partialize: (state) => ({
        items: state.items,
        credits: state.credits
      })
    }
  )
);

export default useInventory;