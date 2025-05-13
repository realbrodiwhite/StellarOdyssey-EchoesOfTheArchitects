import { useState } from "react";
import { motion } from "framer-motion";
import { X, PackageOpen } from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { useInventory } from "@/lib/stores/useInventory";
import { useCharacter } from "@/lib/stores/useCharacter";
import { Item, ItemType } from "@/lib/types";

interface InventoryProps {
  onClose: () => void;
}

const Inventory = ({ onClose }: InventoryProps) => {
  const { items } = useInventory();
  const { selectedCharacter } = useCharacter();
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  
  if (!selectedCharacter) return null;
  
  // Group items by type
  const weaponItems = items.filter(item => item.type === ItemType.Weapon);
  const consumableItems = items.filter(item => item.type === ItemType.Consumable);
  const keyItems = items.filter(item => item.type === ItemType.Key);
  const toolItems = items.filter(item => item.type === ItemType.Tool);
  const upgradeItems = items.filter(item => item.type === ItemType.Upgrade);
  
  // Handler for using an item
  const handleUseItem = (item: Item) => {
    if (!item.usable) return;
    
    // Get effect from the item and apply it
    // This would connect to character state to apply buffs, healing, etc.
    console.log(`Used item: ${item.name}`);
    
    // Close the item details
    setSelectedItem(null);
  };
  
  // Render an item card
  const renderItemCard = (item: Item) => (
    <Card 
      key={item.id}
      className="p-3 bg-gray-800 cursor-pointer hover:bg-gray-700 transition-colors"
      onClick={() => setSelectedItem(item)}
    >
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-white font-medium">{item.name}</h3>
          <p className="text-gray-400 text-xs">{item.type}</p>
        </div>
        {item.quantity > 1 && (
          <span className="bg-gray-700 px-2 py-1 rounded text-xs">x{item.quantity}</span>
        )}
      </div>
    </Card>
  );
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="w-full max-w-2xl bg-gray-900 rounded-lg shadow-xl overflow-hidden"
      >
        <div className="p-4 flex justify-between items-center border-b border-gray-700">
          <div className="flex items-center gap-2">
            <PackageOpen className="text-blue-400" size={20} />
            <h2 className="text-xl font-bold text-white">Inventory</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X size={20} />
          </Button>
        </div>
        
        <div className="flex h-96">
          {/* Left side - Categories & Items */}
          <div className="w-2/3 border-r border-gray-700">
            <Tabs defaultValue="all" className="h-full flex flex-col">
              <div className="p-2 border-b border-gray-700">
                <TabsList className="w-full grid grid-cols-3 bg-gray-800">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="weapons">Weapons</TabsTrigger>
                  <TabsTrigger value="consumables">Consumables</TabsTrigger>
                </TabsList>
              </div>
              
              <div className="flex-1 overflow-y-auto p-3">
                <TabsContent value="all" className="mt-0 h-full">
                  {items.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-gray-500">
                      No items in inventory
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-2">
                      {items.map(renderItemCard)}
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="weapons" className="mt-0 h-full">
                  {weaponItems.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-gray-500">
                      No weapons in inventory
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-2">
                      {weaponItems.map(renderItemCard)}
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="consumables" className="mt-0 h-full">
                  {consumableItems.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-gray-500">
                      No consumables in inventory
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-2">
                      {consumableItems.map(renderItemCard)}
                    </div>
                  )}
                </TabsContent>
              </div>
            </Tabs>
          </div>
          
          {/* Right side - Item Details */}
          <div className="w-1/3 p-4">
            {selectedItem ? (
              <div className="h-full flex flex-col">
                <h3 className="text-lg font-bold text-white mb-2">{selectedItem.name}</h3>
                <p className="text-sm text-gray-300 mb-4">{selectedItem.description}</p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Type:</span>
                    <span className="text-white">{selectedItem.type}</span>
                  </div>
                  {selectedItem.effect && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Effect:</span>
                      <span className="text-blue-300">{selectedItem.effect}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Value:</span>
                    <span className="text-white">{selectedItem.value}</span>
                  </div>
                </div>
                
                <div className="mt-auto">
                  {selectedItem.usable && (
                    <Button 
                      variant="default" 
                      className="w-full"
                      onClick={() => handleUseItem(selectedItem)}
                    >
                      Use
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500 text-center">
                Select an item to view details
              </div>
            )}
          </div>
        </div>
        
        <div className="p-3 border-t border-gray-700 bg-gray-800 flex justify-between items-center">
          <span className="text-sm text-gray-400">
            {items.length} / 20 slots used
          </span>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Inventory;
