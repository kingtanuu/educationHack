"use client";

import { Card } from "@/components/card/Card";
import type { CardDef } from "@/data/cards";

interface HandProps {
  cards: CardDef[];
  onCardClick: (id: string) => void;
  energy: number;
  /** Card *keys* (element symbols or condition ids) that should pulse with synergy glow. */
  synergyKeys?: Set<string>;
}

export function Hand({ cards, onCardClick, energy, synergyKeys }: HandProps) {
  return (
    <div className="flex justify-center gap-2 px-4 py-4">
      {cards.map((card, index) => {
        const tooExpensive = card.energyCost > energy;
        const isSynergy = synergyKeys?.has(card.key) === true;
        return (
          <div
            key={card.id}
            style={{
              transformOrigin: "50% 100%",
              transform: `rotate(${(index - (cards.length - 1) / 2) * 2}deg)`,
            }}
          >
            <Card
              card={card}
              size="hand"
              onClick={() => onCardClick(card.id)}
              disabled={tooExpensive}
              synergy={isSynergy}
            />
          </div>
        );
      })}
      {cards.length === 0 && (
        <div className="py-8 text-sm text-ink-muted">手札が空になった</div>
      )}
    </div>
  );
}
