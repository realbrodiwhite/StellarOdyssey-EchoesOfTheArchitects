import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Item, ItemType } from '../types';
import { v4 as uuidv4 } from 'uuid';

// Create a template of items that can be added to inventory
export const itemTemplates: Record<string, Omit<Item, 'id'>> = {
  // ------ WEAPONS ------
  'laser_pistol': {
    name: 'Laser Pistol',
    type: ItemType.Weapon,
    description: 'A standard-issue energy weapon. Reliable and easy to maintain.',
    effect: 'Deals 10-15 damage.',
    value: 100,
    usable: true,
    quantity: 1
  },
  'ion_disruptor': {
    name: 'Ion Disruptor',
    type: ItemType.Weapon,
    description: 'Specialized weapon that disrupts electronic systems.',
    effect: 'Deals 8-12 damage. 50% bonus damage to robotic enemies.',
    value: 250,
    usable: true,
    quantity: 1
  },
  
  // ------ TOOLS ------
  'multi_tool': {
    name: 'Multi-Tool',
    type: ItemType.Tool,
    description: 'A versatile device with various attachments for technical tasks.',
    effect: '+15% success chance on Technical skill checks.',
    value: 150,
    usable: true,
    quantity: 1
  },
  'scanner_mk2': {
    name: 'Scanner Mk II',
    type: ItemType.Tool,
    description: 'Advanced scanning device capable of analyzing various materials and energy patterns.',
    effect: '+20% success chance on Scientific skill checks.',
    value: 200,
    usable: true,
    quantity: 1
  },
  
  // ------ CONSUMABLES ------
  'med_pack': {
    name: 'Med Pack',
    type: ItemType.Consumable,
    description: 'Standard medical kit with basic supplies for treating injuries.',
    effect: 'Restores 30 Health.',
    value: 50,
    usable: true,
    quantity: 1
  },
  'energy_cell': {
    name: 'Energy Cell',
    type: ItemType.Consumable,
    description: 'Compact power source compatible with most devices.',
    effect: 'Restores 25 Energy.',
    value: 30,
    usable: true,
    quantity: 1
  },
  'shield_booster': {
    name: 'Shield Booster',
    type: ItemType.Consumable,
    description: 'Temporary enhancement for personal shield generators.',
    effect: 'Temporarily increases maximum shield by 20 for 5 minutes.',
    value: 75,
    usable: true,
    quantity: 1
  },
  
  // ------ KEY ITEMS ------
  'security_keycard': {
    name: 'Security Keycard',
    type: ItemType.Key,
    description: 'Access card with high-level security clearance.',
    effect: 'Grants access to restricted areas.',
    value: 0,
    usable: false,
    quantity: 1
  },
  'encrypted_data_chip': {
    name: 'Encrypted Data Chip',
    type: ItemType.Key,
    description: 'Small data storage device containing protected information.',
    effect: 'Contains information that may be valuable to certain parties.',
    value: 0,
    usable: false,
    quantity: 1
  },
  
  // ------ UPGRADES ------
  'processor_upgrade': {
    name: 'Neural Processor Upgrade',
    type: ItemType.Upgrade,
    description: 'Experimental technology that enhances cognitive functions.',
    effect: 'Permanently increases all skill levels by 1.',
    value: 500,
    usable: true,
    quantity: 1
  },
  'shield_amplifier': {
    name: 'Shield Amplifier',
    type: ItemType.Upgrade,
    description: 'Module that enhances personal shield efficiency.',
    effect: 'Permanently increases maximum shield by 15.',
    value: 350,
    usable: true,
    quantity: 1
  }
};

interface InventoryState {
  items: Item[];
  addItem: (item: Omit<Item, 'id'>) => void;
  removeItem: (itemId: string) => boolean;
  useItem: (itemId: string) => boolean;
  getItem: (itemId: string) => Item | undefined;
  clearInventory: () => void;
}

export const useInventory = create<InventoryState>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (itemTemplate) => {
        // Check if item is stackable and already exists
        const existingItem = get().items.find(item => 
          item.name === itemTemplate.name && 
          item.type === itemTemplate.type &&
          item.quantity > 0
        );
        
        if (existingItem) {
          // Update existing item quantity
          set(state => ({
            items: state.items.map(item => 
              item.id === existingItem.id 
                ? { ...item, quantity: item.quantity + (itemTemplate.quantity || 1) }
                : item
            )
          }));
          console.log(`Added ${itemTemplate.quantity || 1} ${itemTemplate.name} to stack (Total: ${existingItem.quantity + (itemTemplate.quantity || 1)})`);
        } else {
          // Add new item
          const newItem: Item = {
            ...itemTemplate,
            id: `item_${uuidv4()}`
          };
          
          set(state => ({
            items: [...state.items, newItem]
          }));
          console.log(`Added new item to inventory: ${newItem.name}`);
        }
      },
      
      removeItem: (itemId) => {
        const item = get().items.find(item => item.id === itemId);
        
        if (!item) {
          console.log(`Item not found: ${itemId}`);
          return false;
        }
        
        // If quantity > 1, decrement quantity
        if (item.quantity > 1) {
          set(state => ({
            items: state.items.map(i => 
              i.id === itemId 
                ? { ...i, quantity: i.quantity - 1 }
                : i
            )
          }));
          console.log(`Removed 1 ${item.name} from stack (Remaining: ${item.quantity - 1})`);
        } else {
          // Remove item completely
          set(state => ({
            items: state.items.filter(i => i.id !== itemId)
          }));
          console.log(`Removed item from inventory: ${item.name}`);
        }
        
        return true;
      },
      
      useItem: (itemId) => {
        const item = get().items.find(item => item.id === itemId);
        
        if (!item) {
          console.log(`Item not found: ${itemId}`);
          return false;
        }
        
        if (!item.usable) {
          console.log(`Item cannot be used: ${item.name}`);
          return false;
        }
        
        // Apply item effects (in a real game, this would call external functions)
        console.log(`Using item: ${item.name}`);
        console.log(`Effect: ${item.effect}`);
        
        // Remove one quantity of the item
        get().removeItem(itemId);
        return true;
      },
      
      getItem: (itemId) => {
        return get().items.find(item => item.id === itemId);
      },
      
      clearInventory: () => {
        set({ items: [] });
        console.log('Inventory cleared');
      }
    }),
    {
      name: 'inventory-storage',
      partialize: (state) => ({ items: state.items })
    }
  )
);

export default useInventory;