import React from 'react';
import { Player } from './Game';
import { Button } from '../components/ui/button';
import { Plus, Minus } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';

interface ScoreBoardProps {
  players: Player[];
  currentPlayerIndex: number;
  updateScore: (playerIndex: number, points: number) => void;
  onStealPoint: (fromPlayerIndex: number) => void;
  onSwapScores: (withPlayerIndex: number) => void;
  actionMode: 'normal' | 'steal' | 'swap';
  setActionMode: (mode: 'normal' | 'steal' | 'swap') => void;
}

const ScoreBoard: React.FC<ScoreBoardProps> = ({ 
  players, 
  currentPlayerIndex, 
  updateScore, 
  onStealPoint,
  onSwapScores,
  actionMode,
  setActionMode
}) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Score Board</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {players.map((player, index) => (
          <Card 
            key={index} 
            className={`relative overflow-hidden ${currentPlayerIndex === index ? 'ring-2 ring-offset-2' : ''}`}
            style={{ borderColor: player.color }}
          >
            {currentPlayerIndex === index && (
              <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: player.color }}></div>
            )}
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold" style={{ color: player.color }}>
                  {player.name}
                </h3>
                
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => updateScore(index, -1)}
                    disabled={actionMode !== 'normal'}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  
                  <span className="text-xl font-bold w-8 text-center">{player.score}</span>
                  
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => updateScore(index, 1)}
                    disabled={actionMode !== 'normal'}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ScoreBoard;
