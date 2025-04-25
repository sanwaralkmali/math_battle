
import React from 'react';
import { Player } from './Game';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../components/ui/card';

interface GameOverProps {
  players: Player[];
  onRestart: () => void;
}

const GameOver: React.FC<GameOverProps> = ({ players, onRestart }) => {
  // Sort players by score (highest first)
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  
  // Find the winner(s) - there might be a tie
  const winnerScore = sortedPlayers[0].score;
  const winners = sortedPlayers.filter(player => player.score === winnerScore);
  
  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Game Over!</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {winners.length === 1 ? (
          <div className="text-center">
            <h3 className="text-xl font-medium mb-2">Winner</h3>
            <p className="text-3xl font-bold" style={{ color: winners[0].color }}>
              {winners[0].name}
            </p>
            <p className="text-xl mt-1">Score: {winners[0].score}</p>
            
            <div className="my-6 text-5xl animate-bounce">🏆</div>
          </div>
        ) : (
          <div className="text-center">
            <h3 className="text-xl font-medium mb-2">It's a Tie!</h3>
            <div className="space-y-2">
              {winners.map((player, idx) => (
                <p key={idx} className="text-2xl font-bold" style={{ color: player.color }}>
                  {player.name}: {player.score}
                </p>
              ))}
            </div>
            <div className="my-6 text-5xl">🤝</div>
          </div>
        )}
        
        <div className="space-y-2">
          <h3 className="font-medium text-center">Final Scores</h3>
          {sortedPlayers.map((player, idx) => (
            <div key={idx} className="flex justify-between items-center">
              <span className="font-medium" style={{ color: player.color }}>{player.name}</span>
              <span className="text-xl font-bold">{player.score}</span>
            </div>
          ))}
        </div>
      </CardContent>
      
      <CardFooter>
        <Button onClick={onRestart} className="w-full">
          Play Again
        </Button>
      </CardFooter>
    </Card>
  );
};

export default GameOver;
