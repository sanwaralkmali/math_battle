import { useState, useEffect } from 'react';
import PlayerSetup from './PlayerSetup';
import GameBoard from './GameBoard';
import ScoreBoard from './ScoreBoard';
import GameOver from './GameOver';
import { useToast } from '../components/ui/use-toast';
import { Button } from '../components/ui/button';
import { SkipForward } from 'lucide-react';

// Types for our game
export type Player = {
  id: number;
  name: string;
  score: number;
  color: string;
};

export type CardContent = {
  type: 'question' | 'points' | 'challenge' | 'steal' | 'swap' | 'extra';
  value: string;
  description: string;
  timeLimit?: number;
};

// Move generateCards function before it's used
const generateCards = (): CardContent[] => {
  const cards: CardContent[] = [
    { type: 'question', value: 'Q1', description: 'Answer question 1 (3 minutes)', timeLimit: 180 },
    { type: 'question', value: 'Q2', description: 'Answer question 2 (3 minutes)', timeLimit: 180 },
    { type: 'question', value: 'Q3', description: 'Answer question 3 (3 minutes)', timeLimit: 180 },
    { type: 'question', value: 'Q4', description: 'Answer question 4 (3 minutes)', timeLimit: 180 },
    { type: 'question', value: 'Q5', description: 'Answer question 5 (3 minutes)', timeLimit: 180 },
    { type: 'question', value: 'Q6', description: 'Answer question 6 (3 minutes)', timeLimit: 180 },
    { type: 'question', value: 'Q7', description: 'Answer question 7 (3 minutes)', timeLimit: 180 },
    { type: 'question', value: 'Q8', description: 'Answer question 8 (3 minutes)', timeLimit: 180 },
    { type: 'question', value: 'Q9', description: 'Answer question 9 (3 minutes)', timeLimit: 180 },
    { type: 'question', value: 'Q10', description: 'Answer question 10 (3 minutes)', timeLimit: 180 },

    { type: 'challenge', value: 'Q15', description: 'Challenge Question! (1 minute)', timeLimit: 60 },
    { type: 'challenge', value: 'Q16', description: 'Challenge Question! (1 minute)', timeLimit: 60 },
    
    { type: 'points', value: '+1', description: 'You get +1 point!', timeLimit: 0 },
    { type: 'points', value: '+1', description: 'You get +1 point!', timeLimit: 0 },
    { type: 'points', value: '-1', description: 'You lose 1 point!', timeLimit: 0 },
    { type: 'points', value: '-1', description: 'You lose 1 point!', timeLimit: 0 },
    
    { type: 'steal', value: 'steal', description: 'Steal 1 point from another player!', timeLimit: 0 },
    { type: 'steal', value: 'steal', description: 'Steal 1 point from another player!', timeLimit: 0 },
    { type: 'extra', value: 'extra', description: 'Flip an extra card!', timeLimit: 0 },
    { type: 'points', value: '+2', description: 'You get +2 points!', timeLimit: 0 },
  ];
  
  return [...cards].sort(() => Math.random() - 0.5);
};

const Game = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [timerActive, setTimerActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [actionMode, setActionMode] = useState<'normal' | 'steal' | 'swap'>('normal');
  const [showLastCard, setShowLastCard] = useState(false);
  const { toast } = useToast();
  
  const [cards, setCards] = useState<CardContent[]>([]);

  const startGame = (playerData: Player[]) => {
    setPlayers(playerData);
    setGameStarted(true);
    setCurrentPlayerIndex(0);
    setFlippedCards([]);
    setGameOver(false);
    setShowLastCard(false);
    setActionMode('normal');
    setCards(generateCards());
  };

  const handleCardFlip = (cardIndex: number) => {
    if (flippedCards.includes(cardIndex) || timerActive) return;
    
    const newFlippedCards = [...flippedCards, cardIndex];
    setFlippedCards(newFlippedCards);
    
    const card = cards[cardIndex];
    playSound('flip');
    
    // If this is the last card, show the last card screen instead of handling the action
    if (newFlippedCards.length >= cards.length) {
      setShowLastCard(true);
      return;
    }
    
    handleCardAction(card);
  };

  const handleCardAction = (card: CardContent) => {
    const currentPlayer = players[currentPlayerIndex];
    let points: number;
    
    switch (card.type) {
      case 'question':
      case 'challenge':
        if (card.timeLimit) {
          setTimeLeft(card.timeLimit);
          setTimerActive(true);
          
          toast({
            title: `Question for ${currentPlayer.name}`,
            description: card.description,
            duration: 3000,
          });
        }
        break;
        
      case 'points':
        points = parseInt(card.value);
        updatePlayerScore(currentPlayerIndex, points);
        
        toast({
          title: `${currentPlayer.name} ${points > 0 ? 'gained' : 'lost'} ${Math.abs(points)} point${Math.abs(points) > 1 ? 's' : ''}!`,
          duration: 3000,
        });
        
        nextTurn();
        break;
        
      case 'steal':
        setActionMode('steal');
        break;
        
      case 'swap':
        if (players.length === 2) {
          // For 2 players, automatically swap with the other player
          const otherPlayerIndex = currentPlayerIndex === 0 ? 1 : 0;
          swapScores(otherPlayerIndex);
        } else {
          setActionMode('swap');
        }
        break;
        
      case 'extra':
        toast({
          title: `${currentPlayer.name} gets an extra turn!`,
          duration: 3000,
        });
        break;
        
      default:
        nextTurn();
    }
  };

  const updatePlayerScore = (playerIndex: number, points: number) => {
    const updatedPlayers = [...players];
    updatedPlayers[playerIndex].score += points;
    setPlayers(updatedPlayers);
    playSound('score');
  };

  const stealPoint = (fromPlayerIndex: number) => {
    if (fromPlayerIndex === currentPlayerIndex) return;
    
    const updatedPlayers = [...players];
    if (updatedPlayers[fromPlayerIndex].score > 0) {
      updatedPlayers[fromPlayerIndex].score -= 1;
      updatedPlayers[currentPlayerIndex].score += 1;
      setPlayers(updatedPlayers);
      playSound('score');
      
      toast({
        title: `${players[currentPlayerIndex].name} stole 1 point from ${players[fromPlayerIndex].name}!`,
        duration: 3000,
      });
    } else {
      toast({
        title: `${players[fromPlayerIndex].name} has no points to steal!`,
        duration: 3000,
      });
    }
    setActionMode('normal');
    nextTurn();
  };

  const swapScores = (withPlayerIndex: number) => {
    if (withPlayerIndex === currentPlayerIndex) return;
    
    const updatedPlayers = [...players];
    const temp = updatedPlayers[currentPlayerIndex].score;
    updatedPlayers[currentPlayerIndex].score = updatedPlayers[withPlayerIndex].score;
    updatedPlayers[withPlayerIndex].score = temp;
    setPlayers(updatedPlayers);
    playSound('score');
    
    toast({
      title: `${players[currentPlayerIndex].name} swapped scores with ${players[withPlayerIndex].name}!`,
      duration: 3000,
    });
    setActionMode('normal');
    nextTurn();
  };

  const nextTurn = () => {
    setCurrentPlayerIndex((prevIndex) => (prevIndex + 1) % players.length);
  };

  const handleLastCardAction = () => {
    const lastCardIndex = flippedCards[flippedCards.length - 1];
    const lastCard = cards[lastCardIndex];
    handleCardAction(lastCard);
    setGameOver(true);
  };

  const resetGame = () => {
    setGameStarted(false);
    setPlayers([]);
    setCurrentPlayerIndex(0);
    setFlippedCards([]);
    setGameOver(false);
    setTimerActive(false);
    setTimeLeft(0);
    setActionMode('normal');
    setShowLastCard(false);
  };

  const playSound = (type: 'flip' | 'timeup' | 'score') => {
    const audio = new Audio();
    switch (type) {
      case 'flip':
        audio.src = 'https://assets.mixkit.co/sfx/preview/mixkit-quick-win-video-game-notification-269.mp3';
        break;
      case 'timeup':
        audio.src = 'https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3';
        break;
      case 'score':
        audio.src = 'https://assets.mixkit.co/sfx/preview/mixkit-unlock-game-notification-253.mp3';
        break;
    }
    audio.play().catch(e => console.log('Error playing sound:', e));
  };

  const skipTimer = () => {
    if (timerActive) {
      setTimerActive(false);
      setTimeLeft(0);
      playSound('timeup');
      nextTurn();
      
      toast({
        title: "Time Skipped",
        description: "Moving to next turn",
        duration: 3000,
      });
    }
  };

  useEffect(() => {
    let interval: number | undefined;
    
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000) as unknown as number;
    } else if (timeLeft === 0 && timerActive) {
      setTimerActive(false);
      playSound('timeup');
      toast({
        title: "Time's up!",
        description: "Check answers and update scores.",
        duration: 5000,
      });
      nextTurn();
    }
    
    return () => clearInterval(interval);
  }, [timerActive, timeLeft]);

  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl">
      <div className="flex flex-col items-center mb-8">
        <h1 className="text-4xl font-bold text-center text-blue-600">
          Math Battle
        </h1>
      </div>
      
      {!gameStarted ? (
        <PlayerSetup onStartGame={startGame} />
      ) : gameOver ? (
        <GameOver players={players} onRestart={resetGame} />
      ) : showLastCard ? (
        <div className="space-y-6">
          <ScoreBoard 
            players={players} 
            currentPlayerIndex={currentPlayerIndex} 
            updateScore={updatePlayerScore}
            onStealPoint={stealPoint}
            onSwapScores={swapScores}
            actionMode={actionMode}
            setActionMode={setActionMode}
          />
          
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-4">Last Card!</h2>
            <p className="text-lg mb-6">This is the final card of the game. Click the button below to see who won!</p>
            <Button 
              onClick={handleLastCardAction}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Show Winner
            </Button>
          </div>
          
          <GameBoard 
            cards={cards} 
            flippedCards={flippedCards} 
            onCardFlip={handleCardFlip} 
            currentPlayer={players[currentPlayerIndex]}
            timerActive={timerActive}
            actionMode={actionMode}
            players={players}
            onAction={(playerIndex) => {
              if (actionMode === 'steal') {
                stealPoint(playerIndex);
              } else if (actionMode === 'swap') {
                swapScores(playerIndex);
              }
            }}
          />
        </div>
      ) : (
        <div className="space-y-6">
          <ScoreBoard 
            players={players} 
            currentPlayerIndex={currentPlayerIndex} 
            updateScore={updatePlayerScore}
            onStealPoint={stealPoint}
            onSwapScores={swapScores}
            actionMode={actionMode}
            setActionMode={setActionMode}
          />
          
          {timerActive && (
            <div className="flex flex-col items-center justify-center my-4">
              <h2 className="text-2xl font-semibold mb-2">Time Remaining</h2>
              <div className="text-4xl font-bold mb-4">
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
              </div>
              <Button 
                onClick={skipTimer}
                variant="outline"
                className="flex items-center gap-2"
              >
                <SkipForward className="w-4 h-4" />
                Skip Time
              </Button>
            </div>
          )}
          
          <GameBoard 
            cards={cards} 
            flippedCards={flippedCards} 
            onCardFlip={handleCardFlip} 
            currentPlayer={players[currentPlayerIndex]}
            timerActive={timerActive}
            actionMode={actionMode}
            players={players}
            onAction={(playerIndex) => {
              if (actionMode === 'steal') {
                stealPoint(playerIndex);
              } else if (actionMode === 'swap') {
                swapScores(playerIndex);
              }
            }}
          />
          
          <div className="flex justify-center mt-4">
            <button 
              onClick={resetGame}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Reset Game
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Game;
