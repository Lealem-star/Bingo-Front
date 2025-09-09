import React from 'react';
import { BingoCards } from '../data/cartellas.data';

export default function CartellaMini({ id, called = [], selectedNumber = null }) {
    const grid = Array.isArray(BingoCards?.cards?.[id - 1]) ? BingoCards.cards[id - 1] : null;
    if (!grid) return <div className="text-xs opacity-60">N/A</div>;
    return (
        <div className="grid grid-cols-5 gap-0.5">
            {grid.flat().map((n, i) => {
                const isFree = n === 0;
                const isCalled = called.includes(n);
                const isSelected = selectedNumber && n === selectedNumber;
                return (
                    <div key={i} className={`h-5 w-5 grid place-items-center rounded ${isFree ? 'bg-emerald-700' :
                        isSelected ? 'bg-red-600' :
                            isCalled ? 'bg-violet-700' : 'bg-slate-700'
                        }`}>
                        <span className="text-[10px] leading-none">{isFree ? '★' : n}</span>
                    </div>
                );
            })}
        </div>
    );
}


