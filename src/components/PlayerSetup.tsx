
import React, { useState } from 'react';
import { Player } from './Game';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Label } from '../components/ui/label';

interface PlayerSetupProps {
  onStartGame: (players: Player[]) => void;
}

const PlayerSetup: React.FC<PlayerSetupProps> = ({ onStartGame }) => {
  const [numPlayers, setNumPlayers] = useState<2 | 3>(2);
  const [playerNames, setPlayerNames] = useState<string[]>(['Player 1', 'Player 2', 'Player 3']);
  const [isValid, setIsValid] = useState(true);

  const playerColors = ['text-[#3B82F6]', 'text-[#22C55E]', 'text-[#F59E0B]'];
  const playerBgColors = ['bg-[#3B82F6]', 'bg-[#22C55E]', 'bg-[#F59E0B]'];

  const handleNameChange = (index: number, name: string) => {
    const newNames = [...playerNames];
    newNames[index] = name;
    setPlayerNames(newNames);
    
    // Check if all required names are filled
    const filledNames = newNames.slice(0, numPlayers).filter(name => name.trim() !== '');
    setIsValid(filledNames.length === numPlayers);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const players: Player[] = [];
    for (let i = 0; i < numPlayers; i++) {
      players.push({
        id: i + 1,
        name: playerNames[i].trim() || `Player ${i + 1}`,
        score: 0,
        color: i === 0 ? 'var(--player1)' : i === 1 ? 'var(--player2)' : 'var(--player3)',
      });
    }
    
    onStartGame(players);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Welcome to Math Battle!</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <Label htmlFor="num-players" className="text-lg font-medium">Number of Players</Label>
            <div className="flex space-x-4">
              <Button 
                type="button"
                variant={numPlayers === 2 ? "default" : "outline"} 
                className="flex-1"
                onClick={() => setNumPlayers(2)}
              >
                2 Players
              </Button>
              <Button 
                type="button"
                variant={numPlayers === 3 ? "default" : "outline"} 
                className="flex-1"
                onClick={() => setNumPlayers(3)}
              >
                3 Players
              </Button>
            </div>
          </div>
          
          <div className="space-y-4">
            <Label className="text-lg font-medium">Player Names</Label>
            {Array.from({ length: numPlayers }).map((_, idx) => (
              <div key={idx} className="flex items-center space-x-4">
                <div className={`w-6 h-6 rounded-full ${playerBgColors[idx]}`}></div>
                <Input
                  placeholder={`Player ${idx + 1}`}
                  value={playerNames[idx]}
                  onChange={(e) => handleNameChange(idx, e.target.value)}
                  className="flex-1"
                  required
                />
              </div>
            ))}
          </div>
          
          <Button 
            type="submit" 
            className="w-full text-lg" 
            disabled={!isValid}
          >
            Start Game
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default PlayerSetup;
