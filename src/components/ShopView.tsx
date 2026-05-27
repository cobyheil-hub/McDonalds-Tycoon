import React from 'react';
import { useGame } from '../lib/GameContext';
import { ShopItem } from '../types';

export default function ShopView() {
  const { state, purchaseItem, equipItem } = useGame();

  const shopItems: ShopItem[] = [
    {
      id: 'hoodie',
      name: 'Golden Arches Hoodie',
      tag: 'Common Gear',
      description: 'Warm scarlet pullover stitched with the dual arches. Styles your 8-bit avatar.',
      cost: 50,
      icon: 'apparel',
      imageUrl: 'https://res.cloudinary.com/dnablzr1p/image/upload/v1779768553/Screenshot_2026-05-25_101842_iby4we.png'
    },
    {
      id: 'visor',
      name: 'Crew Chief Visor',
      tag: 'Rare Buff',
      description: 'Sun blocker visor. Equipping this awards +5% extra coins on every habit logged!',
      cost: 150,
      icon: 'stars',
      imageUrl: 'https://res.cloudinary.com/dnablzr1p/image/upload/v1779768552/Screenshot_2026-05-25_101851_j94xkh.png'
    },
    {
      id: 'shield',
      name: 'Rush Hour Shield',
      tag: 'Epic Utility',
      description: 'Sturdy service blocker. Slashes Karen or Burger King theft losses by half (50% protection)!',
      cost: 300,
      icon: 'shield',
      imageUrl: 'https://res.cloudinary.com/dnablzr1p/image/upload/v1779768554/Screenshot_2026-05-25_101858_z2ggvj.png'
    }
  ];

  return (
    <div className="flex flex-col gap-5 py-2">
      {/* striped awning pattern header */}
      <div className="relative border-4 border-black shadow-[4px_4px_0_0_rgba(30,27,28,1)] overflow-hidden bg-white select-none">
        {/* Striped canopy awning */}
        <div className="h-6 flex">
          {Array.from({ length: 12 }).map((_, idx) => (
            <div 
              key={idx} 
              className={`flex-1 h-full ${idx % 2 === 0 ? 'bg-primary' : 'bg-white'}`}
            />
          ))}
        </div>
        
        <div className="p-4 pt-3 flex flex-col items-center justify-center bg-[#FEF9E1]">
          <h2 className="font-headline font-bold text-center text-base tracking-widest text-[#1e1b1c] uppercase leading-none mb-1">
            THE SHOP & COSMETICS
          </h2>
          <span className="font-pixel text-[9px] text-[#666000] font-bold uppercase leading-none">
            Purveyor of Fine Retro Garb
          </span>
        </div>
      </div>

      {/* Purse meter display */}
      <div className="bg-white border-4 border-black p-3 flex justify-between items-center shadow-[4px_4px_0_0_rgba(30,27,28,1)]">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#666000] font-bold text-xl animate-bounce">payments</span>
          <span className="font-headline font-bold text-xs uppercase text-[#1E1B1C]">YOUR TOTAL PURSE</span>
        </div>
        <div className="bg-surface-container px-3 py-1 border-2 border-black font-pixel font-bold text-sm text-primary flex items-center gap-1.5 shadow-[1px_1px_0_0_#1E1B1C]">
          <span>{state.coins} COINS</span>
        </div>
      </div>

      {/* Merch Grid */}
      <div className="flex flex-col gap-4">
        <h3 className="font-headline font-bold text-xs text-[#1e1b1c] uppercase tracking-wider border-b border-stone-200 pb-1 flex items-center gap-1">
          <span className="material-symbols-outlined text-sm text-primary">local_mall</span>
          EQUIPMENT CATALOG
        </h3>

        <div className="grid grid-cols-1 gap-4">
          {shopItems.map((item) => {
            const isOwned = state.ownedItems.includes(item.id);
            const isEquipped = 
              (item.id === 'hoodie' && state.equippedHoodie) ||
              (item.id === 'visor' && state.equippedVisor) ||
              (item.id === 'shield' && state.equippedShield);

            return (
              <div 
                key={item.id}
                className="bg-[#FFF] border-4 border-[#1E1B1C] p-4 shadow-[4px_4px_0_0_#1E1B1C] flex flex-col sm:flex-row justify-between gap-4 items-center"
              >
                {/* Item Icon Badge */}
                <div className="flex gap-3 w-full sm:w-auto items-center">
                  <div className={`w-16 h-16 border-2 border-black rounded shadow-[2px_2px_0_0_#1E1B1C] flex items-center justify-center overflow-hidden shrink-0 ${
                    item.id === 'shield' ? 'bg-red-50 text-red-600' : item.id === 'visor' ? 'bg-[#FFE7E2]' : 'bg-[#FEF9E1]'
                  }`}>
                    {item.imageUrl ? (
                      <img 
                        src={item.imageUrl} 
                        alt={item.name} 
                        className="w-full h-full object-cover" 
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <span className="material-symbols-outlined text-3xl font-bold leading-none select-none">
                        {item.id === 'shield' ? 'shield' : item.id === 'visor' ? 'stars' : 'apparel'}
                      </span>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                      <h4 className="font-headline font-bold text-sm text-[#1E1B1C] leading-none">{item.name}</h4>
                      <span className={`text-[8px] font-pixel px-1.5 py-0.5 border select-none rounded uppercase ${
                        item.id === 'shield' 
                          ? 'bg-[#cf240a]/10 text-primary border-primary/20' 
                          : item.id === 'visor' 
                            ? 'bg-amber-100 text-[#666000] border-amber-300' 
                            : 'bg-stone-150 text-stone-700 border-stone-300'
                      }`}>
                        {item.tag}
                      </span>
                    </div>
                    <p className="font-body text-[10px] text-gray-500 font-medium leading-normal mt-1.5">
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* Purchase buttons */}
                <div className="w-full sm:w-auto shrink-0 flex flex-col gap-1 items-stretch">
                  <div className="font-pixel text-[10px] text-gray-400 text-center uppercase tracking-wider mb-0.5">
                    COST: <span className="font-bold text-[#1E1B1C]">{item.cost} COINS</span>
                  </div>
                  
                  {isOwned ? (
                    <button
                      id={`shop-equip-${item.id}`}
                      onClick={() => equipItem(item.id, !isEquipped)}
                      className={`w-full sm:w-28 py-1.5 border-2 border-black font-headline font-bold text-[10px] uppercase tracking-wide cursor-pointer active:scale-95 transition-all text-center ${
                        isEquipped 
                          ? 'bg-[#ffe7e2] text-primary border-red-500 shadow-[1px_1px_0_0_rgba(165,19,0,0.5)]' 
                          : 'bg-stone-50 text-stone-700 hover:bg-stone-100 shadow-[2px_2px_0_0_#1E1B1C]'
                      }`}
                    >
                      {isEquipped ? '✓ Equipped' : 'Equip Gear'}
                    </button>
                  ) : (
                    <button
                      id={`shop-buy-${item.id}`}
                      onClick={() => purchaseItem(item.id, item.cost)}
                      disabled={state.coins < item.cost}
                      className={`w-full sm:w-28 py-1.5 border-2 border-black font-headline font-bold text-[10px] uppercase tracking-wide flex items-center justify-center gap-1 cursor-pointer transition-all ${
                        state.coins >= item.cost 
                          ? 'bg-[#F4E700] text-[#1E1B1C] shadow-[2px_2px_0_0_#1E1B1C] hover:bg-[#FFE7E2] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0_0_#1E1B1C]' 
                          : 'bg-stone-100 text-stone-400 border-dashed border-stone-300 cursor-not-allowed'
                      }`}
                    >
                      <span className="material-symbols-outlined text-xs">shopping_cart</span>
                      Buy Merch
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Wardrobe Check Inventory */}
      <div className="bg-surface border-4 border-black p-4 shadow-[4px_4px_0_0_rgba(30,27,28,1)] flex flex-col gap-3">
        <h3 className="font-headline font-bold text-xs text-[#1e1b1c] uppercase tracking-wider flex items-center gap-1 pb-1 border-b border-black/10 select-none">
          <span className="material-symbols-outlined text-sm">history</span>
          CREW WARDROBE DECOR
        </h3>

        <div className="flex gap-2 flex-wrap">
          {state.ownedItems.length === 0 ? (
            <p className="font-body text-xs text-gray-500 italic lowercase font-medium">
              no wardrobe items acquired yet. purchase fine clothing above!
            </p>
          ) : (
            state.ownedItems.map(item => {
              const isEquipped = 
                (item === 'hoodie' && state.equippedHoodie) ||
                (item === 'visor' && state.equippedVisor) ||
                (item === 'shield' && state.equippedShield);

              return (
                <div 
                  key={item}
                  onClick={() => equipItem(item, !isEquipped)}
                  className={`px-3 py-1.5 border-2 border-black font-pixel text-[10px] font-bold uppercase cursor-pointer select-none rounded flex items-center gap-1.5 active:scale-95 transition-all ${
                    isEquipped 
                      ? 'bg-[#ffe7e2] text-primary border-primary' 
                      : 'bg-white text-stone-700'
                  }`}
                >
                  <span className="material-symbols-outlined text-xs">
                    {item === 'shield' ? 'shield' : item === 'visor' ? 'stars' : 'apparel'}
                  </span>
                  <span>{item}</span>
                  {isEquipped && <span className="text-[8px] bg-primary text-white px-1 py-0.5 rounded ml-0.5 leading-none font-sans font-normal">ON</span>}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
