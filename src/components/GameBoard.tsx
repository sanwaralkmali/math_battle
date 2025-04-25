import React from 'react';
import { Player, CardContent } from './Game';
import { cn } from '../lib/utils';
import { Card, CardHeader, CardContent as CardBody, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';

interface GameBoardProps {
  cards: CardContent[];
  flippedCards: number[];
  onCardFlip: (index: number) => void;
  currentPlayer: Player;
  timerActive: boolean;
  actionMode: 'normal' | 'steal' | 'swap';
  players: Player[];
  onAction: (playerIndex: number) => void;
}

const GameBoard: React.FC<GameBoardProps> = ({ 
  cards, 
  flippedCards, 
  onCardFlip, 
  currentPlayer, 
  timerActive,
  actionMode,
  players,
  onAction
}) => {
  const getCardColor = (card: CardContent) => {
    switch (card.type) {
      case 'question': return 'bg-blue-100 border-blue-500';
      case 'challenge': return 'bg-purple-100 border-purple-500';
      case 'points': return parseInt(card.value) > 0 ? 'bg-green-100 border-green-500' : 'bg-red-100 border-red-500';
      case 'steal': return 'bg-yellow-100 border-yellow-500';
      case 'swap': return 'bg-indigo-100 border-indigo-500';
      case 'extra': return 'bg-orange-100 border-orange-500';
      default: return 'bg-gray-100 border-gray-500';
    }
  };

  const getCardIcon = (card: CardContent) => {
    switch (card.type) {
      case 'question': return '❓';
      case 'challenge': return '🏆';
      case 'points': return parseInt(card.value) > 0 ? '🎁' : '💔';
      case 'steal': return '🎯';
      case 'swap': return '🔄';
      case 'extra': return '🎲';
      default: return '📝';
    }
  };

  // Get other players (excluding current player)
  const otherPlayers = players.filter((_, index) => index !== players.findIndex(p => p.id === currentPlayer.id));

  return (
    <div className="w-full">
      <h2 className="text-xl font-semibold mb-4">
        <span className="mr-2">Current Turn:</span>
        <span style={{ color: currentPlayer.color }}>{currentPlayer.name}</span>
      </h2>
      {actionMode !== 'normal' && (
        <div className="bg-yellow-100 p-3 rounded-lg mb-4 text-center">
          <p className="font-medium">
            {actionMode === 'steal' 
              ? "You must choose a player to steal from before continuing!" 
              : "You must choose a player to swap scores with before continuing!"}
          </p>
        </div>
      )}
      <div className="grid grid-cols-4 sm:grid-cols-5 gap-4">
        {cards.map((card, index) => {
          const isFlipped = flippedCards.includes(index);
          const isActionCard = (card.type === 'steal' || card.type === 'swap') && isFlipped && actionMode !== 'normal';
          const canFlip = !isFlipped && !timerActive && actionMode === 'normal';
          
          return (
            <div 
              key={index} 
              className={cn(
                "perspective-500 aspect-[3/4]",
                canFlip ? "cursor-pointer" : "cursor-default"
              )}
              onClick={() => canFlip && onCardFlip(index)}
            >
              <div className={cn(
                "relative w-full h-full transition-transform duration-500 transform-gpu",
                isFlipped ? "flip-back" : ""
              )}>
                {/* Card front (face down) */}
                <div className={cn(
                  "absolute w-full h-full backface-hidden bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-lg flex items-center justify-center text-white",
                  isFlipped ? "hidden" : ""
                )}>
                  <span className="text-3xl font-bold">?</span>
                </div>

                {/* Card back (face up) */}
                <div className={cn(
                  "absolute w-full h-full backface-hidden transform flip-back rounded-lg shadow-lg overflow-hidden border-2",
                  getCardColor(card),
                  !isFlipped ? "hidden" : ""
                )}>
                  <div className="h-full flex flex-col justify-between p-2">
                    <div className="text-3xl text-center">{getCardIcon(card)}</div>
                    <div className="text-lg font-bold text-center">{card.value}</div>
                    <div className="text-xs text-center">{card.description}</div>
                    
                    {isActionCard && (
                      <div className="mt-2 space-y-2">
                        <p className="text-sm font-medium text-center">
                          {actionMode === 'steal' 
                            ? "Choose a player to steal from:" 
                            : "Choose a player to swap scores with:"}
                        </p>
                        <div className="flex flex-col gap-2">
                          {otherPlayers.map((player) => {
                            const playerIndex = players.findIndex(p => p.id === player.id);
                            return (
                              <Button
                                key={playerIndex}
                                variant="outline"
                                className="w-full py-1 text-sm"
                                onClick={() => onAction(playerIndex)}
                              >
                                <span style={{ color: player.color }}>{player.name}</span>
                              </Button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-4 text-right text-gray-500">
        Cards flipped: {flippedCards.length} / {cards.length}
      </div>
    </div>
  );
};

export default GameBoard;
