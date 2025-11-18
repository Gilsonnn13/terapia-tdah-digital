"use client"

import { useState, useEffect } from 'react'
import { Star, Trophy, Target, Brain, Zap, Award, Settings, BarChart3, Play, Pause, RotateCcw, Heart, Sparkles, Calendar, Puzzle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

// Tipos
interface GameSession {
  gameId: string
  score: number
  duration: number
  accuracy: number
  date: string
}

interface UserProgress {
  totalPoints: number
  gamesPlayed: number
  achievements: string[]
  sessions: GameSession[]
  level: number
  streak: number
}

interface GameSettings {
  difficulty: number
  soundEnabled: boolean
  vibrationEnabled: boolean
  sessionDuration: number
}

export default function FocusTherapyApp() {
  // Estados principais
  const [activeTab, setActiveTab] = useState('games')
  const [userProgress, setUserProgress] = useState<UserProgress>({
    totalPoints: 0,
    gamesPlayed: 0,
    achievements: [],
    sessions: [],
    level: 1,
    streak: 0
  })
  const [settings, setSettings] = useState<GameSettings>({
    difficulty: 2,
    soundEnabled: true,
    vibrationEnabled: true,
    sessionDuration: 5
  })

  // Estados dos jogos
  const [activeGame, setActiveGame] = useState<string | null>(null)
  const [gameScore, setGameScore] = useState(0)
  const [gameTime, setGameTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  
  // Jogo de Memória de Cores
  const [colorSequence, setColorSequence] = useState<string[]>([])
  const [playerSequence, setPlayerSequence] = useState<string[]>([])
  const [showingSequence, setShowingSequence] = useState(false)
  const [currentColorIndex, setCurrentColorIndex] = useState(0)
  
  // Jogo de Atenção Seletiva
  const [targetShape, setTargetShape] = useState<string>('circle')
  const [shapes, setShapes] = useState<Array<{id: number, shape: string, x: number, y: number}>>([])
  const [correctClicks, setCorrectClicks] = useState(0)
  
  // Jogo de Foco Sustentado
  const [focusTarget, setFocusTarget] = useState({ x: 50, y: 50 })
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 })
  const [focusAccuracy, setFocusAccuracy] = useState(100)

  // Jogo de Quebra-Cabeça
  const [puzzlePieces, setPuzzlePieces] = useState<Array<{id: number, position: number, correctPosition: number}>>([])
  const [puzzleMoves, setPuzzleMoves] = useState(0)
  const [puzzleCompleted, setPuzzleCompleted] = useState(false)

  // Desafios Semanais
  const [weeklyChallenge, setWeeklyChallenge] = useState<{title: string, description: string, completed: boolean}>({
    title: '',
    description: '',
    completed: false
  })

  const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500']
  const colorNames = ['red', 'blue', 'green', 'yellow', 'purple', 'pink']

  const weeklyChallenges = [
    { title: "Artista da Semana", description: "Complete 3 jogos de memória sem errar", completed: false },
    { title: "Mestre da Concentração", description: "Alcance 500 pontos em um único jogo", completed: false },
    { title: "Explorador Dedicado", description: "Jogue todos os jogos disponíveis", completed: false },
    { title: "Campeão da Precisão", description: "Consiga 95% de precisão em qualquer jogo", completed: false }
  ]

  // Carregar dados do localStorage
  useEffect(() => {
    const savedProgress = localStorage.getItem('focusTherapyProgress')
    const savedSettings = localStorage.getItem('focusTherapySettings')
    
    if (savedProgress) {
      setUserProgress(JSON.parse(savedProgress))
    }
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings))
    }

    // Inicializar desafio semanal
    const savedChallenge = localStorage.getItem('weeklyChallenge')
    if (savedChallenge) {
      setWeeklyChallenge(JSON.parse(savedChallenge))
    } else {
      const randomChallenge = weeklyChallenges[Math.floor(Math.random() * weeklyChallenges.length)]
      setWeeklyChallenge(randomChallenge)
      localStorage.setItem('weeklyChallenge', JSON.stringify(randomChallenge))
    }
  }, [])

  // Salvar progresso
  useEffect(() => {
    localStorage.setItem('focusTherapyProgress', JSON.stringify(userProgress))
  }, [userProgress])

  // Salvar configurações
  useEffect(() => {
    localStorage.setItem('focusTherapySettings', JSON.stringify(settings))
  }, [settings])

  // Timer do jogo
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isPlaying && activeGame) {
      interval = setInterval(() => {
        setGameTime(prev => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isPlaying, activeGame])

  // Iniciar Jogo de Memória de Cores
  const startColorMemoryGame = () => {
    setActiveGame('colorMemory')
    setGameScore(0)
    setGameTime(0)
    setIsPlaying(true)
    setColorSequence([])
    setPlayerSequence([])
    generateColorSequence()
  }

  const generateColorSequence = () => {
    const newColor = colorNames[Math.floor(Math.random() * colorNames.length)]
    const newSequence = [...colorSequence, newColor]
    setColorSequence(newSequence)
    setShowingSequence(true)
    setCurrentColorIndex(0)
    playSequence(newSequence)
  }

  const playSequence = (sequence: string[]) => {
    sequence.forEach((color, index) => {
      setTimeout(() => {
        setCurrentColorIndex(index)
        if (index === sequence.length - 1) {
          setTimeout(() => {
            setShowingSequence(false)
            setCurrentColorIndex(-1)
          }, 600)
        }
      }, index * 800)
    })
  }

  const handleColorClick = (color: string) => {
    if (showingSequence || !isPlaying) return
    
    const newPlayerSequence = [...playerSequence, color]
    setPlayerSequence(newPlayerSequence)
    
    // Verificar se está correto
    if (newPlayerSequence[newPlayerSequence.length - 1] !== colorSequence[newPlayerSequence.length - 1]) {
      // Errou
      endGame('colorMemory', gameScore)
      return
    }
    
    // Completou a sequência
    if (newPlayerSequence.length === colorSequence.length) {
      const points = colorSequence.length * 10
      setGameScore(prev => prev + points)
      setPlayerSequence([])
      setTimeout(() => generateColorSequence(), 1000)
    }
  }

  // Iniciar Jogo de Atenção Seletiva
  const startSelectiveAttentionGame = () => {
    setActiveGame('selectiveAttention')
    setGameScore(0)
    setGameTime(0)
    setIsPlaying(true)
    setCorrectClicks(0)
    const shapes = ['circle', 'square', 'triangle']
    setTargetShape(shapes[Math.floor(Math.random() * shapes.length)])
    generateShapes()
  }

  const generateShapes = () => {
    const shapeTypes = ['circle', 'square', 'triangle']
    const newShapes = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      shape: shapeTypes[Math.floor(Math.random() * shapeTypes.length)],
      x: Math.random() * 80 + 10,
      y: Math.random() * 70 + 15
    }))
    setShapes(newShapes)
  }

  const handleShapeClick = (shape: string) => {
    if (!isPlaying) return
    
    if (shape === targetShape) {
      const points = 15
      setGameScore(prev => prev + points)
      setCorrectClicks(prev => prev + 1)
      generateShapes()
      
      if (correctClicks + 1 >= 20) {
        endGame('selectiveAttention', gameScore + points)
      }
    } else {
      setGameScore(prev => Math.max(0, prev - 5))
    }
  }

  // Iniciar Jogo de Foco Sustentado
  const startSustainedFocusGame = () => {
    setActiveGame('sustainedFocus')
    setGameScore(0)
    setGameTime(0)
    setIsPlaying(true)
    setFocusAccuracy(100)
    moveFocusTarget()
  }

  const moveFocusTarget = () => {
    setFocusTarget({
      x: Math.random() * 80 + 10,
      y: Math.random() * 70 + 15
    })
  }

  useEffect(() => {
    if (activeGame === 'sustainedFocus' && isPlaying) {
      const interval = setInterval(moveFocusTarget, 3000)
      return () => clearInterval(interval)
    }
  }, [activeGame, isPlaying])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (activeGame !== 'sustainedFocus' || !isPlaying) return
    
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    
    setCursorPosition({ x, y })
    
    // Calcular distância do alvo
    const distance = Math.sqrt(
      Math.pow(x - focusTarget.x, 2) + Math.pow(y - focusTarget.y, 2)
    )
    
    if (distance < 10) {
      setGameScore(prev => prev + 2)
      setFocusAccuracy(100)
    } else if (distance < 20) {
      setFocusAccuracy(80)
    } else {
      setFocusAccuracy(Math.max(0, focusAccuracy - 1))
    }
  }

  // Iniciar Jogo de Quebra-Cabeça
  const startPuzzleGame = () => {
    setActiveGame('puzzle')
    setGameScore(0)
    setGameTime(0)
    setIsPlaying(true)
    setPuzzleMoves(0)
    setPuzzleCompleted(false)
    
    // Criar peças embaralhadas (3x3 = 9 peças)
    const pieces = Array.from({ length: 9 }, (_, i) => ({
      id: i,
      position: i,
      correctPosition: i
    }))
    
    // Embaralhar
    for (let i = pieces.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      const temp = pieces[i].position
      pieces[i].position = pieces[j].position
      pieces[j].position = temp
    }
    
    setPuzzlePieces(pieces)
  }

  const handlePuzzlePieceClick = (pieceId: number) => {
    if (!isPlaying || puzzleCompleted) return
    
    const clickedPiece = puzzlePieces.find(p => p.id === pieceId)
    const emptyPiece = puzzlePieces.find(p => p.position === 8) // Última posição é vazia
    
    if (!clickedPiece || !emptyPiece) return
    
    // Verificar se a peça está adjacente ao espaço vazio
    const clickedRow = Math.floor(clickedPiece.position / 3)
    const clickedCol = clickedPiece.position % 3
    const emptyRow = Math.floor(emptyPiece.position / 3)
    const emptyCol = emptyPiece.position % 3
    
    const isAdjacent = 
      (Math.abs(clickedRow - emptyRow) === 1 && clickedCol === emptyCol) ||
      (Math.abs(clickedCol - emptyCol) === 1 && clickedRow === emptyRow)
    
    if (isAdjacent) {
      // Trocar posições
      const newPieces = puzzlePieces.map(p => {
        if (p.id === clickedPiece.id) {
          return { ...p, position: emptyPiece.position }
        }
        if (p.id === emptyPiece.id) {
          return { ...p, position: clickedPiece.position }
        }
        return p
      })
      
      setPuzzlePieces(newPieces)
      setPuzzleMoves(prev => prev + 1)
      
      // Verificar se completou
      const completed = newPieces.every(p => p.position === p.correctPosition)
      if (completed) {
        setPuzzleCompleted(true)
        const points = Math.max(100, 500 - puzzleMoves * 5)
        setGameScore(points)
        setTimeout(() => endGame('puzzle', points), 1000)
      }
    }
  }

  // Iniciar Desafio Semanal
  const startWeeklyChallengeGame = () => {
    setActiveGame('weeklyChallenge')
    setGameScore(0)
    setGameTime(0)
    setIsPlaying(true)
  }

  const completeWeeklyChallenge = () => {
    if (!isPlaying) return
    
    const points = 200
    setGameScore(points)
    
    const updatedChallenge = { ...weeklyChallenge, completed: true }
    setWeeklyChallenge(updatedChallenge)
    localStorage.setItem('weeklyChallenge', JSON.stringify(updatedChallenge))
    
    endGame('weeklyChallenge', points)
  }

  // Finalizar jogo
  const endGame = (gameId: string, finalScore: number) => {
    setIsPlaying(false)
    
    const session: GameSession = {
      gameId,
      score: finalScore,
      duration: gameTime,
      accuracy: gameId === 'sustainedFocus' ? focusAccuracy : 
                gameId === 'selectiveAttention' ? (correctClicks / 20) * 100 : 
                gameId === 'puzzle' ? (puzzleCompleted ? 100 : 0) :
                gameId === 'weeklyChallenge' ? 100 :
                (colorSequence.length / 10) * 100,
      date: new Date().toISOString()
    }
    
    const newProgress = {
      ...userProgress,
      totalPoints: userProgress.totalPoints + finalScore,
      gamesPlayed: userProgress.gamesPlayed + 1,
      sessions: [...userProgress.sessions, session],
      level: Math.floor((userProgress.totalPoints + finalScore) / 500) + 1
    }
    
    // Verificar conquistas
    if (finalScore > 100 && !newProgress.achievements.includes('first100')) {
      newProgress.achievements.push('first100')
    }
    if (newProgress.gamesPlayed >= 10 && !newProgress.achievements.includes('dedicated')) {
      newProgress.achievements.push('dedicated')
    }
    
    setUserProgress(newProgress)
    setActiveGame(null)
  }

  const resetGame = () => {
    setIsPlaying(false)
    setActiveGame(null)
    setGameScore(0)
    setGameTime(0)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const games = [
    {
      id: 'colorMemory',
      title: 'Memória de Cores',
      description: 'Memorize e repita a sequência de cores',
      icon: Brain,
      color: 'from-purple-400 to-pink-500',
      action: startColorMemoryGame
    },
    {
      id: 'selectiveAttention',
      title: 'Atenção Seletiva',
      description: 'Clique apenas nas formas corretas',
      icon: Target,
      color: 'from-blue-400 to-cyan-500',
      action: startSelectiveAttentionGame
    },
    {
      id: 'sustainedFocus',
      title: 'Foco Sustentado',
      description: 'Mantenha o cursor no alvo em movimento',
      icon: Zap,
      color: 'from-green-400 to-emerald-500',
      action: startSustainedFocusGame
    },
    {
      id: 'puzzle',
      title: 'Quebra-Cabeça',
      description: 'Resolva o quebra-cabeça deslizante',
      icon: Puzzle,
      color: 'from-orange-400 to-red-500',
      action: startPuzzleGame
    },
    {
      id: 'weeklyChallenge',
      title: 'Desafio Semanal',
      description: 'Complete o desafio da semana',
      icon: Calendar,
      color: 'from-yellow-400 to-orange-500',
      action: startWeeklyChallengeGame
    }
  ]

  const achievements = [
    { id: 'first100', name: 'Primeira Centena', description: '100 pontos em um jogo', icon: Star },
    { id: 'dedicated', name: 'Dedicado', description: 'Jogou 10 vezes', icon: Trophy },
    { id: 'master', name: 'Mestre', description: 'Alcançou nível 5', icon: Award }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-purple-600" />
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              FocusPlay
            </h1>
            <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-pink-600" />
          </div>
          <p className="text-base sm:text-lg text-gray-700">Treine sua atenção de forma divertida!</p>
        </div>

        {/* Desafio Semanal Banner */}
        {!weeklyChallenge.completed && (
          <Card className="mb-6 border-0 shadow-xl bg-gradient-to-r from-yellow-400 to-orange-500">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3">
                <Calendar className="w-8 h-8 text-white" />
                <div className="flex-1">
                  <h3 className="text-lg sm:text-xl font-bold text-white">{weeklyChallenge.title}</h3>
                  <p className="text-sm sm:text-base text-white/90">{weeklyChallenge.description}</p>
                </div>
                <Badge className="bg-white text-orange-600 font-bold">+200 pts</Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <Card className="bg-gradient-to-br from-yellow-400 to-orange-500 border-0 shadow-lg">
            <CardContent className="p-3 sm:p-4 text-center">
              <Trophy className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-1 sm:mb-2 text-white" />
              <p className="text-xl sm:text-2xl font-bold text-white">{userProgress.totalPoints}</p>
              <p className="text-xs sm:text-sm text-white/90">Pontos</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-blue-400 to-purple-500 border-0 shadow-lg">
            <CardContent className="p-3 sm:p-4 text-center">
              <Star className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-1 sm:mb-2 text-white" />
              <p className="text-xl sm:text-2xl font-bold text-white">Nível {userProgress.level}</p>
              <p className="text-xs sm:text-sm text-white/90">Progresso</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-400 to-teal-500 border-0 shadow-lg">
            <CardContent className="p-3 sm:p-4 text-center">
              <Target className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-1 sm:mb-2 text-white" />
              <p className="text-xl sm:text-2xl font-bold text-white">{userProgress.gamesPlayed}</p>
              <p className="text-xs sm:text-sm text-white/90">Jogos</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-pink-400 to-red-500 border-0 shadow-lg">
            <CardContent className="p-3 sm:p-4 text-center">
              <Heart className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-1 sm:mb-2 text-white" />
              <p className="text-xl sm:text-2xl font-bold text-white">{userProgress.streak}</p>
              <p className="text-xs sm:text-sm text-white/90">Sequência</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white/80 backdrop-blur-sm p-1 rounded-xl shadow-lg">
            <TabsTrigger value="games" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white">
              <Play className="w-4 h-4 mr-2" />
              Jogos
            </TabsTrigger>
            <TabsTrigger value="progress" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white">
              <BarChart3 className="w-4 h-4 mr-2" />
              Progresso
            </TabsTrigger>
            <TabsTrigger value="settings" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white">
              <Settings className="w-4 h-4 mr-2" />
              Ajustes
            </TabsTrigger>
          </TabsList>

          {/* Jogos Tab */}
          <TabsContent value="games" className="space-y-6">
            {!activeGame ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {games.map((game) => {
                  const Icon = game.icon
                  return (
                    <Card key={game.id} className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden">
                      <div className={`h-3 bg-gradient-to-r ${game.color}`} />
                      <CardHeader>
                        <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-r ${game.color} flex items-center justify-center mb-3 sm:mb-4 mx-auto`}>
                          <Icon className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                        </div>
                        <CardTitle className="text-center text-lg sm:text-xl">{game.title}</CardTitle>
                        <CardDescription className="text-center text-sm sm:text-base">{game.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button 
                          onClick={game.action}
                          className={`w-full bg-gradient-to-r ${game.color} hover:opacity-90 text-white font-bold py-5 sm:py-6 text-base sm:text-lg rounded-xl shadow-lg`}
                        >
                          <Play className="w-5 h-5 mr-2" />
                          Jogar Agora
                        </Button>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            ) : (
              <Card className="border-0 shadow-2xl">
                <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                      <CardTitle className="text-xl sm:text-2xl">
                        {games.find(g => g.id === activeGame)?.title}
                      </CardTitle>
                      <CardDescription className="text-white/90 text-sm sm:text-base">
                        Pontos: {gameScore} | Tempo: {formatTime(gameTime)}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                      <Button 
                        onClick={() => setIsPlaying(!isPlaying)}
                        variant="secondary"
                        size="sm"
                        className="flex-1 sm:flex-none"
                      >
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </Button>
                      <Button 
                        onClick={resetGame}
                        variant="secondary"
                        size="sm"
                        className="flex-1 sm:flex-none"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  {/* Jogo de Memória de Cores */}
                  {activeGame === 'colorMemory' && (
                    <div className="space-y-4 sm:space-y-6">
                      <div className="text-center">
                        <p className="text-base sm:text-lg font-semibold mb-2">
                          {showingSequence ? 'Observe a sequência...' : 'Repita a sequência!'}
                        </p>
                        <Badge variant="secondary" className="text-sm sm:text-base px-3 sm:px-4 py-1 sm:py-2">
                          Sequência: {colorSequence.length}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-3 sm:gap-4 max-w-md mx-auto">
                        {colorNames.map((color, index) => (
                          <button
                            key={color}
                            onClick={() => handleColorClick(color)}
                            disabled={showingSequence || !isPlaying}
                            className={`
                              aspect-square rounded-2xl shadow-lg transition-all duration-300
                              ${color === 'red' ? 'bg-red-500' : ''}
                              ${color === 'blue' ? 'bg-blue-500' : ''}
                              ${color === 'green' ? 'bg-green-500' : ''}
                              ${color === 'yellow' ? 'bg-yellow-500' : ''}
                              ${color === 'purple' ? 'bg-purple-500' : ''}
                              ${color === 'pink' ? 'bg-pink-500' : ''}
                              ${showingSequence && colorSequence[currentColorIndex] === color ? 'scale-110 ring-4 ring-white' : 'scale-100'}
                              ${!showingSequence && !isPlaying ? 'opacity-50' : 'hover:scale-105'}
                              disabled:cursor-not-allowed
                            `}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Jogo de Atenção Seletiva */}
                  {activeGame === 'selectiveAttention' && (
                    <div className="space-y-4 sm:space-y-6">
                      <div className="text-center">
                        <p className="text-base sm:text-lg font-semibold mb-2">
                          Clique apenas nos:
                        </p>
                        <Badge className="text-base sm:text-lg px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-500 to-cyan-500">
                          {targetShape === 'circle' ? '🔵 Círculos' : targetShape === 'square' ? '🟦 Quadrados' : '🔺 Triângulos'}
                        </Badge>
                        <p className="text-sm sm:text-base text-gray-600 mt-2">
                          Acertos: {correctClicks}/20
                        </p>
                        <Progress value={(correctClicks / 20) * 100} className="mt-2" />
                      </div>
                      
                      <div className="relative h-64 sm:h-96 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl border-4 border-blue-200">
                        {shapes.map((shape) => (
                          <button
                            key={shape.id}
                            onClick={() => handleShapeClick(shape.shape)}
                            disabled={!isPlaying}
                            className="absolute transition-all duration-300 hover:scale-110"
                            style={{ left: `${shape.x}%`, top: `${shape.y}%` }}
                          >
                            {shape.shape === 'circle' && (
                              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 shadow-lg" />
                            )}
                            {shape.shape === 'square' && (
                              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-400 to-green-600 shadow-lg rounded-lg" />
                            )}
                            {shape.shape === 'triangle' && (
                              <div className="w-0 h-0 border-l-[20px] sm:border-l-[24px] border-r-[20px] sm:border-r-[24px] border-b-[35px] sm:border-b-[42px] border-l-transparent border-r-transparent border-b-red-500 shadow-lg" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Jogo de Foco Sustentado */}
                  {activeGame === 'sustainedFocus' && (
                    <div className="space-y-4 sm:space-y-6">
                      <div className="text-center">
                        <p className="text-base sm:text-lg font-semibold mb-2">
                          Mantenha o cursor no alvo em movimento
                        </p>
                        <Badge variant="secondary" className="text-sm sm:text-base px-3 sm:px-4 py-1 sm:py-2">
                          Precisão: {focusAccuracy.toFixed(0)}%
                        </Badge>
                        <Progress value={focusAccuracy} className="mt-2" />
                      </div>
                      
                      <div 
                        className="relative h-64 sm:h-96 bg-gradient-to-br from-green-50 to-teal-50 rounded-2xl border-4 border-green-200 cursor-none overflow-hidden"
                        onMouseMove={handleMouseMove}
                      >
                        {/* Alvo */}
                        <div 
                          className="absolute w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-red-400 to-red-600 shadow-xl transition-all duration-1000 ease-in-out flex items-center justify-center"
                          style={{ 
                            left: `${focusTarget.x}%`, 
                            top: `${focusTarget.y}%`,
                            transform: 'translate(-50%, -50%)'
                          }}
                        >
                          <div className="w-4 h-4 sm:w-6 sm:h-6 rounded-full bg-white" />
                        </div>
                        
                        {/* Cursor customizado */}
                        <div 
                          className="absolute w-4 h-4 sm:w-6 sm:h-6 rounded-full bg-blue-500 shadow-lg pointer-events-none"
                          style={{ 
                            left: `${cursorPosition.x}%`, 
                            top: `${cursorPosition.y}%`,
                            transform: 'translate(-50%, -50%)'
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Jogo de Quebra-Cabeça */}
                  {activeGame === 'puzzle' && (
                    <div className="space-y-4 sm:space-y-6">
                      <div className="text-center">
                        <p className="text-base sm:text-lg font-semibold mb-2">
                          Monte o quebra-cabeça deslizante!
                        </p>
                        <Badge variant="secondary" className="text-sm sm:text-base px-3 sm:px-4 py-1 sm:py-2">
                          Movimentos: {puzzleMoves}
                        </Badge>
                      </div>
                      
                      <div className="max-w-md mx-auto">
                        <div className="grid grid-cols-3 gap-2 bg-gradient-to-br from-orange-50 to-red-50 p-4 rounded-2xl border-4 border-orange-300">
                          {puzzlePieces.map((piece) => {
                            const row = Math.floor(piece.position / 3)
                            const col = piece.position % 3
                            const isEmpty = piece.position === 8
                            
                            return (
                              <button
                                key={piece.id}
                                onClick={() => handlePuzzlePieceClick(piece.id)}
                                disabled={!isPlaying || isEmpty}
                                className={`
                                  aspect-square rounded-lg transition-all duration-300
                                  ${isEmpty ? 'bg-transparent' : 'bg-gradient-to-br from-orange-400 to-red-500 hover:scale-105 shadow-lg'}
                                  ${!isPlaying ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                                  flex items-center justify-center text-white font-bold text-2xl
                                `}
                              >
                                {!isEmpty && piece.id + 1}
                              </button>
                            )
                          })}
                        </div>
                        
                        {puzzleCompleted && (
                          <div className="mt-4 text-center">
                            <Badge className="text-lg px-6 py-3 bg-gradient-to-r from-green-400 to-emerald-500">
                              🎉 Parabéns! Você completou!
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Desafio Semanal */}
                  {activeGame === 'weeklyChallenge' && (
                    <div className="space-y-4 sm:space-y-6">
                      <div className="text-center">
                        <Calendar className="w-16 h-16 mx-auto mb-4 text-yellow-600" />
                        <h3 className="text-xl sm:text-2xl font-bold mb-2">{weeklyChallenge.title}</h3>
                        <p className="text-base sm:text-lg text-gray-700 mb-4">{weeklyChallenge.description}</p>
                        <Badge className="text-lg px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500">
                          Recompensa: 200 Pontos
                        </Badge>
                      </div>
                      
                      <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-300">
                        <CardContent className="p-6 text-center">
                          <p className="text-base mb-4">
                            Complete este desafio para ganhar pontos extras e desbloquear conquistas especiais!
                          </p>
                          <Button 
                            onClick={completeWeeklyChallenge}
                            disabled={!isPlaying || weeklyChallenge.completed}
                            className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:opacity-90 text-white font-bold py-6 text-lg"
                          >
                            {weeklyChallenge.completed ? '✅ Desafio Completo!' : '🎯 Completar Desafio'}
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Progresso Tab */}
          <TabsContent value="progress" className="space-y-6">
            <Card className="border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
                <CardTitle className="text-xl sm:text-2xl">Relatório de Progresso</CardTitle>
                <CardDescription className="text-white/90">
                  Acompanhe sua evolução e conquistas
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 space-y-6">
                {/* Conquistas */}
                <div>
                  <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 flex items-center gap-2">
                    <Award className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500" />
                    Conquistas
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                    {achievements.map((achievement) => {
                      const Icon = achievement.icon
                      const unlocked = userProgress.achievements.includes(achievement.id)
                      return (
                        <Card key={achievement.id} className={`${unlocked ? 'bg-gradient-to-br from-yellow-100 to-orange-100 border-yellow-300' : 'bg-gray-100 opacity-60'}`}>
                          <CardContent className="p-3 sm:p-4 text-center">
                            <Icon className={`w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 ${unlocked ? 'text-yellow-600' : 'text-gray-400'}`} />
                            <p className="font-bold text-sm sm:text-base">{achievement.name}</p>
                            <p className="text-xs sm:text-sm text-gray-600">{achievement.description}</p>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </div>

                {/* Histórico de Sessões */}
                <div>
                  <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
                    Últimas Sessões
                  </h3>
                  <div className="space-y-2 sm:space-y-3">
                    {userProgress.sessions.slice(-5).reverse().map((session, index) => (
                      <Card key={index} className="bg-gradient-to-r from-purple-50 to-pink-50">
                        <CardContent className="p-3 sm:p-4">
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                            <div>
                              <p className="font-semibold text-sm sm:text-base">
                                {games.find(g => g.id === session.gameId)?.title}
                              </p>
                              <p className="text-xs sm:text-sm text-gray-600">
                                {new Date(session.date).toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                            <div className="flex gap-3 sm:gap-4 text-xs sm:text-sm">
                              <Badge variant="secondary" className="bg-yellow-100">
                                {session.score} pts
                              </Badge>
                              <Badge variant="secondary" className="bg-blue-100">
                                {Math.floor(session.accuracy)}% precisão
                              </Badge>
                              <Badge variant="secondary" className="bg-green-100">
                                {formatTime(session.duration)}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {userProgress.sessions.length === 0 && (
                      <p className="text-center text-gray-500 py-6 sm:py-8">
                        Nenhuma sessão registrada ainda. Comece a jogar!
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Configurações Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                <CardTitle className="text-xl sm:text-2xl">Personalização</CardTitle>
                <CardDescription className="text-white/90">
                  Ajuste os jogos de acordo com suas necessidades
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 space-y-6">
                {/* Dificuldade */}
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="difficulty" className="text-base sm:text-lg font-semibold">
                      Nível de Dificuldade
                    </Label>
                    <Badge variant="secondary" className="text-sm sm:text-base">
                      {settings.difficulty === 1 ? 'Fácil' : settings.difficulty === 2 ? 'Médio' : 'Difícil'}
                    </Badge>
                  </div>
                  <Slider
                    id="difficulty"
                    min={1}
                    max={3}
                    step={1}
                    value={[settings.difficulty]}
                    onValueChange={(value) => setSettings({...settings, difficulty: value[0]})}
                    className="w-full"
                  />
                </div>

                {/* Duração da Sessão */}
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="duration" className="text-base sm:text-lg font-semibold">
                      Duração da Sessão
                    </Label>
                    <Badge variant="secondary" className="text-sm sm:text-base">
                      {settings.sessionDuration} minutos
                    </Badge>
                  </div>
                  <Slider
                    id="duration"
                    min={3}
                    max={15}
                    step={1}
                    value={[settings.sessionDuration]}
                    onValueChange={(value) => setSettings({...settings, sessionDuration: value[0]})}
                    className="w-full"
                  />
                </div>

                {/* Som */}
                <div className="flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-500 flex items-center justify-center">
                      <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <Label htmlFor="sound" className="text-base sm:text-lg font-semibold cursor-pointer">
                      Efeitos Sonoros
                    </Label>
                  </div>
                  <Switch
                    id="sound"
                    checked={settings.soundEnabled}
                    onCheckedChange={(checked) => setSettings({...settings, soundEnabled: checked})}
                  />
                </div>

                {/* Vibração */}
                <div className="flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-xl">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-green-500 flex items-center justify-center">
                      <Target className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <Label htmlFor="vibration" className="text-base sm:text-lg font-semibold cursor-pointer">
                      Feedback Tátil
                    </Label>
                  </div>
                  <Switch
                    id="vibration"
                    checked={settings.vibrationEnabled}
                    onCheckedChange={(checked) => setSettings({...settings, vibrationEnabled: checked})}
                  />
                </div>

                {/* Resetar Progresso */}
                <div className="pt-4 sm:pt-6 border-t">
                  <Button 
                    variant="destructive"
                    className="w-full py-5 sm:py-6 text-base sm:text-lg"
                    onClick={() => {
                      if (confirm('Tem certeza que deseja resetar todo o progresso?')) {
                        setUserProgress({
                          totalPoints: 0,
                          gamesPlayed: 0,
                          achievements: [],
                          sessions: [],
                          level: 1,
                          streak: 0
                        })
                      }
                    }}
                  >
                    <RotateCcw className="w-5 h-5 mr-2" />
                    Resetar Progresso
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
