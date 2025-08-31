import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Star,
  Zap,
  Trophy,
  RotateCcw,
  Volume2,
  VolumeX,
  Rocket,
  UserCircle,
  Snowflake,
  Wallet,
  Route,
  Coins,
  Gem,
  Plus,
} from 'lucide-react';
import { CosmicTapGameTap } from './components/CosmicTapGameTap';
import { connect } from 'http2';
import { useRouter } from 'next/navigation';

const CosmicTapGame = () => {
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [powerUps, setPowerUps] = useState([]);
  const [particles, setParticles] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [tapPosition, setTapPosition] = useState({ x: 0, y: 0 });
  const [showTapEffect, setShowTapEffect] = useState(false);
  const [scorePopups, setScorePopups] = useState([]);
  const [boostPoints, setBoostPoints] = useState(0);
  const [boostActive, setBoostActive] = useState(false);
  const [boostCooldown, setBoostCooldown] = useState(0);
  const [userToken, setUserToken] = useState(localStorage.getItem('userToken'));
  const [upgrades, setUpgrades] = useState({});
  const [showUpgrades, setShowUpgrades] = useState(false);

  const gameAreaRef = useRef(null);
  const comboTimeoutRef = useRef(null);
  const powerUpTimeoutRef = useRef(null);
  const boostTimeoutRef = useRef(null);
  const boostCooldownRef = useRef(null);

  const achievementList = [
    {
      id: 'first_tap',
      name: 'First Contact',
      desc: 'Make your first tap',
      threshold: 1,
      icon: '🚀',
    },
    {
      id: 'hundred_club',
      name: 'Hundred Club',
      desc: 'Score 100 points',
      threshold: 100,
      icon: '💫',
    },
    {
      id: 'combo_master',
      name: 'Combo Master',
      desc: 'Achieve 10x combo',
      threshold: 10,
      icon: '⚡',
    },
    {
      id: 'speed_demon',
      name: 'Speed Demon',
      desc: 'Reach level 5',
      threshold: 5,
      icon: '🌟',
    },
    {
      id: 'thousand_points',
      name: 'Cosmic Legend',
      desc: 'Score 1000 points',
      threshold: 1000,
      icon: '🌌',
    },
  ];

  const upgradeList = [
    {
      id: 'auto_tap',
      name: 'Auto-Tap Drone',
      desc: 'Automatically taps for you',
      icon: <Snowflake className="w-5 h-5 text-sky-400" />,
      baseCost: 100,
      costMultiplier: 1.5,
      effect: 1, // taps per second
    },
    {
      id: 'tap_strength',
      name: 'Tap Strength',
      desc: 'Increase points per tap',
      icon: <Plus className="w-5 h-5 text-amber-400" />,
      baseCost: 50,
      costMultiplier: 1.2,
      effect: 1, // points per tap
    },
    {
      id: 'combo_mastery',
      name: 'Combo Mastery',
      desc: 'Combo lasts longer',
      icon: <Gem className="w-5 h-5 text-fuchsia-400" />,
      baseCost: 200,
      costMultiplier: 1.8,
      effect: 1000, // milliseconds
    },
  ];

  const getUpgradeCost = (upgradeId) => {
    const upgrade = upgradeList.find((u) => u.id === upgradeId);
    const level = upgrades[upgradeId] || 0;
    return Math.round(
      upgrade.baseCost * Math.pow(upgrade.costMultiplier, level),
    );
  };

  const applyUpgrades = useCallback(() => {
    const tapStrengthLevel = upgrades.tap_strength || 0;
    const comboMasteryLevel = upgrades.combo_mastery || 0;

    const basePoints = 1 + tapStrengthLevel;
    // You would adjust the tap logic here
    const comboTimeout = 1500 + comboMasteryLevel * 1000;

    return { basePoints, comboTimeout };
  }, [upgrades]);

  const purchaseUpgrade = (upgradeId) => {
    const cost = getUpgradeCost(upgradeId);
    if (score >= cost) {
      setScore((s) => s - cost);
      setUpgrades((prev) => ({
        ...prev,
        [upgradeId]: (prev[upgradeId] || 0) + 1,
      }));
      showScorePopup(
        `${upgradeList.find((u) => u.id === upgradeId).name} Purchased!`,
        gameAreaRef.current.offsetWidth / 2,
        gameAreaRef.current.offsetHeight / 2,
        false,
        true, // isUpgrade
      );
    } else {
      showScorePopup(
        'Not enough score!',
        gameAreaRef.current.offsetWidth / 2,
        gameAreaRef.current.offsetHeight / 2,
        false,
        true,
        'text-red-400',
      );
    }
  };

  const createParticle = useCallback((x, y, type = 'normal') => {
    const particle = {
      id: Math.random(),
      x,
      y,
      vx: (Math.random() - 0.5) * 8,
      vy: (Math.random() - 0.5) * 8 - 2,
      life: 1,
      decay: 0.02 + Math.random() * 0.02,
      size: type === 'powerup' ? 8 : 4 + Math.random() * 4,
      color:
        type === 'powerup'
          ? '#fcd34d'
          : `hsl(${(330 + Math.random() * 90) % 360}, 80%, 60%)`,
      type,
    };
    setParticles((prev) => [...prev.slice(-50), particle]);
  }, []);

  // **FIXED**: Fetch game state when userToken is available
  useEffect(() => {
    const fetchGameState = async () => {
      if (!userToken) {
        console.log('No user token, starting new game locally.');
        return;
      }
      try {
        const response = await fetch('http://localhost:5000/api/game/state', {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setScore(data.score || 0);
          setMaxCombo(data.maxCombo || 0);
          setAchievements(data.achievements || []);
          setUpgrades(data.upgrades || {});
        } else {
          console.log('No existing game state found. Starting a new game.');
          setScore(0);
          setMaxCombo(0);
          setAchievements([]);
          setUpgrades({});
        }
      } catch (error) {
        console.error('Failed to fetch game state:', error);
      }
    };
    fetchGameState();
  }, [userToken]);

  const showScorePopup = (
    amount,
    x,
    y,
    isBoost = false,
    isAchievement = false,
    colorClass = 'text-white',
  ) => {
    const newPopup = {
      id: Math.random(),
      amount,
      x,
      y,
      isBoost,
      isAchievement,
      colorClass,
    };
    setScorePopups((prev) => [...prev, newPopup]);
    setTimeout(() => {
      setScorePopups((prev) => prev.filter((p) => p.id !== newPopup.id));
    }, 1000);
  };

  const createPowerUp = useCallback(() => {
    if (!gameAreaRef.current) return;
    const rect = gameAreaRef.current.getBoundingClientRect();
    const powerUp = {
      id: Math.random(),
      x: Math.random() * (rect.width - 60) + 30,
      y: Math.random() * (rect.height - 60) + 30,
      type: Math.random() > 0.5 ? 'multiplier' : 'points',
      life: 5000,
      pulse: 0,
    };
    setPowerUps((prev) => [...prev, powerUp]);
    setTimeout(() => {
      setPowerUps((prev) => prev.filter((p) => p.id !== powerUp.id));
    }, 5000);
  }, []);

  const handleTap = useCallback(
    (e) => {
      if (!gameStarted) setGameStarted(true);
      const tapEvent = e.touches ? e.touches[0] : e;
      const rect = e.currentTarget.getBoundingClientRect();
      const x = tapEvent.clientX - rect.left;
      const y = tapEvent.clientY - rect.top;

      setTapPosition({ x, y });
      setShowTapEffect(true);
      setTimeout(() => setShowTapEffect(false), 200);

      let powerUpHit = false;
      setPowerUps((prev) => {
        const remaining = prev.filter((powerUp) => {
          const distance = Math.sqrt(
            Math.pow(x - powerUp.x, 2) + Math.pow(y - powerUp.y, 2),
          );
          if (distance < 40) {
            powerUpHit = true;
            if (powerUp.type === 'multiplier') {
              setMultiplier((m) => Math.min(m + 1, 5));
              clearTimeout(powerUpTimeoutRef.current);
              powerUpTimeoutRef.current = setTimeout(
                () => setMultiplier(1),
                10000,
              );
              showScorePopup('x2!', powerUp.x, powerUp.y, true);
            } else {
              const points = 50 * multiplier * (boostActive ? 2 : 1);
              setScore((s) => s + points);
              showScorePopup(`+${points}`, powerUp.x, powerUp.y, true);
            }
            createParticle(powerUp.x, powerUp.y, 'powerup');
            return false;
          }
          return true;
        });
        return remaining;
      });

      if (powerUpHit) return;
      const { basePoints, comboTimeout } = applyUpgrades();
      const points = basePoints * multiplier * (boostActive ? 2 : 1);

      setScore((prev) => prev + points);
      setCombo((prev) => prev + 1);
      setBoostPoints((prev) => Math.min(prev + basePoints, 100));
      showScorePopup(`+${points}`, x, y, boostActive);

      clearTimeout(comboTimeoutRef.current);
      comboTimeoutRef.current = setTimeout(() => setCombo(0), comboTimeout);

      for (let i = 0; i < 3 + Math.min(combo / 10, 5); i++) {
        createParticle(
          x + (Math.random() - 0.5) * 20,
          y + (Math.random() - 0.5) * 20,
        );
      }
    },
    [
      gameStarted,
      combo,
      multiplier,
      boostActive,
      createParticle,
      applyUpgrades,
    ],
  );

  const saveGame = useCallback(async () => {
    if (!userToken) return;
    try {
      const response = await fetch('http://localhost:5000/api/game/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({ score, maxCombo, achievements, upgrades }),
      });
      if (!response.ok) throw new Error('Failed to save game state');
      console.log('Game state saved successfully!');
    } catch (error) {
      console.error('Error saving game:', error);
    }
  }, [score, maxCombo, achievements, upgrades, userToken]);

  const activateBoost = useCallback(() => {
    if (boostPoints >= 100 && !boostCooldown) {
      setBoostPoints(0);
      setBoostActive(true);
      showScorePopup(
        'BOOST!',
        gameAreaRef.current.offsetWidth / 2,
        gameAreaRef.current.offsetHeight / 2,
        true,
      );

      clearTimeout(boostTimeoutRef.current);
      boostTimeoutRef.current = setTimeout(() => {
        setBoostActive(false);
        setBoostCooldown(30);
      }, 7000);
    }
  }, [boostPoints, boostCooldown]);

  useEffect(() => {
    if (!gameStarted) return;
    const interval = setInterval(() => {
      setParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            vy: p.vy + 0.2,
            life: p.life - p.decay,
          }))
          .filter((p) => p.life > 0),
      );
      setPowerUps((prev) =>
        prev.map((p) => ({ ...p, pulse: (p.pulse + 0.1) % (Math.PI * 2) })),
      );
      setLevel(Math.floor(score / 100) + 1);
      setMaxCombo((prev) => Math.max(prev, combo));
      if (Math.random() < 0.003 + level * 0.001) {
        createPowerUp();
      }
    }, 16);
    return () => clearInterval(interval);
  }, [gameStarted, score, combo, level, createPowerUp]);

  // Auto-tap logic
  useEffect(() => {
    const autoTapLevel = upgrades.auto_tap || 0;
    if (autoTapLevel === 0) return;

    const interval = setInterval(() => {
      const rect = gameAreaRef.current.getBoundingClientRect();
      const x = Math.random() * rect.width;
      const y = Math.random() * rect.height;
      handleTap({
        touches: [{ clientX: x + rect.left, clientY: y + rect.top }],
        currentTarget: gameAreaRef.current,
      });
    }, 1000 / autoTapLevel);

    return () => clearInterval(interval);
  }, [upgrades.auto_tap, handleTap]);

  useEffect(() => {
    if (boostCooldown > 0) {
      clearTimeout(boostCooldownRef.current);
      boostCooldownRef.current = setTimeout(() => {
        setBoostCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearTimeout(boostCooldownRef.current);
  }, [boostCooldown]);

  useEffect(() => {
    achievementList.forEach((achievement) => {
      if (achievements.includes(achievement.id)) return;
      let achieved = false;
      switch (achievement.id) {
        case 'first_tap':
          achieved = score > 0;
          break;
        case 'hundred_club':
        case 'thousand_points':
          achieved = score >= achievement.threshold;
          break;
        case 'combo_master':
          achieved = maxCombo >= achievement.threshold;
          break;
        case 'speed_demon':
          achieved = level >= achievement.threshold;
          break;
        default:
          break;
      }
      if (achieved) {
        setAchievements((prev) => [...prev, achievement.id]);
        const achievementNotification = {
          id: Math.random(),
          name: achievement.name,
          icon: achievement.icon,
        };
        showScorePopup(
          `${achievement.icon} ${achievement.name} UNLOCKED!`,
          window.innerWidth / 2,
          window.innerHeight / 3,
          false,
          true,
        );
      }
    });
  }, [score, maxCombo, level, achievements]);

  // **FIXED**: Corrected auto-save logic using setInterval
  useEffect(() => {
    if (!gameStarted || !userToken) {
      return;
    }
    const intervalId = setInterval(() => {
      console.log('Auto-saving game state...');
      saveGame();
    }, 15000);
    return () => clearInterval(intervalId);
  }, [gameStarted, userToken, saveGame]);

  // **IMPROVED**: Reset game function now calls a server endpoint
  const resetGame = async () => {
    if (userToken) {
      try {
        await fetch('http://localhost:5000/api/game/reset', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${userToken}`,
          },
        });
        console.log('Game state reset on server.');
      } catch (error) {
        console.error('Failed to reset game state on server:', error);
      }
    }
    setScore(0);
    setLevel(1);
    setCombo(0);
    setMaxCombo(0);
    setMultiplier(1);
    setPowerUps([]);
    setParticles([]);
    setAchievements([]);
    setGameStarted(false);
    setBoostPoints(0);
    setBoostActive(false);
    setBoostCooldown(0);
    setUpgrades({});
    clearTimeout(comboTimeoutRef.current);
    clearTimeout(powerUpTimeoutRef.current);
    clearTimeout(boostTimeoutRef.current);
    clearTimeout(boostCooldownRef.current);
  };

  const getComboColor = () => {
    if (combo < 5) return 'text-orange-300';
    if (combo < 15) return 'text-red-400';
    if (combo < 25) return 'text-fuchsia-400';
    return 'text-amber-300';
  };

  const route = useRouter();

  const connectWallet = async () => {
    route.push('/login');
  };

  return (
    <div className="relative w-full h-screen bg-gradient-to-br from-[#301852] to-[#800c2e] overflow-hidden font-sans">
      <div className="absolute inset-0 z-0">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-star-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}
        <div className="absolute inset-0 bg-radial-gradient opacity-30 animate-slow-fade"></div>
      </div>
      <div className="absolute top-4 left-4 z-10 flex items-center gap-4">
        <div className="bg-[#301852]/50 backdrop-blur-sm rounded-full p-2 text-white border border-gray-600">
          <UserCircle className="w-7 h-7 text-gray-300" />
        </div>
        <div className="space-y-2">
          <div className="bg-[#301852]/50 backdrop-blur-sm rounded-lg p-3 text-white shadow-lg">
            <div className="flex items-center gap-2 mb-1">
              <Star className="w-4 h-4 text-amber-400" />
              <span className="font-bold text-xl drop-shadow-md">
                {score.toLocaleString()}
              </span>
            </div>
            <div className="text-sm opacity-75">Level {level}</div>
          </div>
          {combo > 2 && (
            <div
              className={`bg-[#301852]/50 backdrop-blur-sm rounded-lg p-2 text-white transform transition-transform duration-200 ease-out ${
                combo > 10 ? 'scale-110 ring-2 ring-amber-500' : ''
              }`}
            >
              <div
                className={`font-bold text-lg ${getComboColor()} drop-shadow-md`}
              >
                {combo}x COMBO!
              </div>
            </div>
          )}
          {multiplier > 1 && (
            <div className="bg-amber-500/20 backdrop-blur-sm rounded-lg p-2 text-amber-300 border border-amber-400/30 flex items-center gap-1 shadow-md animate-pulse-light">
              <Zap className="w-4 h-4" />
              <span className="font-bold">{multiplier}x MULTIPLIER</span>
            </div>
          )}
        </div>
      </div>
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <button
          onClick={() => setShowUpgrades(true)}
          className="flex items-center gap-2 bg-purple-500/50 backdrop-blur-sm rounded-lg p-2 text-white hover:bg-purple-600/70 transition-colors"
          title="Upgrades"
        >
          <Coins className="w-5 h-5" />
          Upgrades
        </button>
        <button
          onClick={activateBoost}
          disabled={boostPoints < 100 || boostCooldown > 0}
          className={`relative flex items-center gap-2 bg-[#301852]/50 backdrop-blur-sm rounded-lg p-2 text-white transition-all duration-200 ease-in-out ${
            boostPoints >= 100 && boostCooldown === 0
              ? 'hover:bg-amber-600/70 cursor-pointer animate-glow-pulse border border-amber-500'
              : 'opacity-60 cursor-not-allowed border border-gray-700'
          } ${boostActive ? 'bg-amber-700/80 !opacity-100 animate-none' : ''}`}
          title={
            boostCooldown > 0
              ? `Cooldown: ${boostCooldown}s`
              : boostPoints < 100
              ? `Collect ${100 - boostPoints} more points`
              : 'Activate Boost!'
          }
        >
          <Rocket
            className={`w-5 h-5 ${
              boostActive ? 'text-white' : 'text-amber-400'
            }`}
          />
          <span className="font-bold">BOOST</span>
          {boostPoints < 100 && !boostActive && (
            <div
              className="absolute inset-0 bg-gray-700/80 rounded-lg"
              style={{ width: `${boostPoints}%` }}
            ></div>
          )}
          {boostCooldown > 0 && (
            <span className="absolute inset-0 flex items-center justify-center bg-black/70 rounded-lg text-sm font-mono">
              {boostCooldown}s
            </span>
          )}
          {boostActive && (
            <div className="absolute inset-0 rounded-lg border-2 border-amber-300 animate-boost-active"></div>
          )}
        </button>
        <button
          onClick={connectWallet}
          className="flex items-center gap-2 bg-[#301852]/50 backdrop-blur-sm rounded-lg p-2 text-white"
        >
          <Wallet className="w-6 h-6 text-amber-400" />
          Connect Wallet
        </button>
      </div>
      {achievements.length > 0 && (
        <div className="absolute bottom-4 left-4 z-10">
          <div className="bg-[#301852]/50 backdrop-blur-sm rounded-lg p-3 text-white shadow-lg">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span className="font-bold">Achievements</span>
            </div>
            <div className="flex gap-2">
              {achievementList
                .filter((a) => achievements.includes(a.id))
                .map((achievement) => (
                  <span
                    key={achievement.id}
                    className="text-2xl hover:scale-125 transition-transform relative group"
                    title={achievement.name}
                  >
                    {achievement.icon}
                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      {achievement.name}
                    </span>
                  </span>
                ))}
            </div>
          </div>
        </div>
      )}
      <div className="absolute bottom-4 right-4 z-10 text-right">
        <div className="bg-[#301852]/50 backdrop-blur-sm rounded-lg p-3 text-white text-sm shadow-lg">
          <div>
            Best Combo:{' '}
            <span className="font-bold text-amber-300">{maxCombo}x</span>
          </div>
          <div>
            Achievements:{' '}
            <span className="font-bold text-amber-300">
              {achievements.length}
            </span>
            /<span className="font-bold">{achievementList.length}</span>
          </div>
        </div>
      </div>
      <div
        ref={gameAreaRef}
        className="absolute inset-0 cursor-pointer select-none"
        onClick={handleTap}
        onTouchStart={handleTap}
      >
        {showTapEffect && (
          <div
            className="absolute pointer-events-none z-20"
            style={{ left: tapPosition.x, top: tapPosition.y }}
          >
            <div className="w-16 h-16 border-2 border-amber-300 rounded-full animate-tap-ping opacity-75 transform -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute inset-0 w-8 h-8 bg-amber-200/50 rounded-full animate-tap-pulse transform -translate-x-1/2 -translate-y-1/2" />
          </div>
        )}
        {scorePopups.map((popup) => (
          <div
            key={popup.id}
            className={`absolute pointer-events-none z-30 font-bold text-lg animate-score-popup drop-shadow-lg ${
              popup.isBoost
                ? 'text-amber-300 text-2xl animate-boost-text'
                : popup.isAchievement
                ? 'text-fuchsia-400 text-3xl animate-achievement-notify'
                : 'text-white'
            }`}
            style={{
              left: popup.x,
              top: popup.y,
              transform: 'translateX(-50%)',
            }}
          >
            {popup.isAchievement ? popup.amount : `+${popup.amount}`}
          </div>
        ))}
        {powerUps.map((powerUp) => (
          <div
            key={powerUp.id}
            className="absolute z-10 cursor-pointer animate-float-subtle"
            style={{
              left: powerUp.x,
              top: powerUp.y,
              transform: `translate(-50%, -50%) scale(${
                1 + Math.sin(powerUp.pulse) * 0.1
              })`,
            }}
          >
            <div
              className={`w-14 h-14 rounded-full flex items-center justify-center border-2 shadow-xl ${
                powerUp.type === 'multiplier'
                  ? 'bg-amber-400/80 border-amber-300 text-amber-900 shadow-amber-400/60'
                  : 'bg-fuchsia-400/80 border-fuchsia-300 text-fuchsia-900 shadow-fuchsia-400/60'
              } hover:scale-110 active:scale-90 transition-transform duration-150 ease-out`}
            >
              {powerUp.type === 'multiplier' ? (
                <Zap className="w-7 h-7" />
              ) : (
                <Star className="w-7 h-7" />
              )}
            </div>
            <div className="absolute inset-0 w-14 h-14 rounded-full border-2 border-white/50 animate-powerup-pulse" />
          </div>
        ))}
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute pointer-events-none z-5"
            style={{
              left: p.x,
              top: p.y,
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              opacity: p.life,
              borderRadius: '50%',
              transform: `scale(${p.life})`,
              boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
            }}
          />
        ))}
        <CosmicTapGameTap gameStarted={gameStarted} />
        {combo > 5 && (
          <div
            className="absolute inset-0 pointer-events-none z-5 opacity-0 animate-combo-pulse"
            style={{
              background: `radial-gradient(circle at ${tapPosition.x}px ${
                tapPosition.y
              }px, rgba(128, 12, 46, ${Math.min(
                combo / 50,
                0.5,
              )}) 0%, transparent 60%)`,
            }}
          />
        )}
      </div>

      {showUpgrades && (
        <div className="absolute inset-0 z-40 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#301852] border border-gray-600 rounded-lg p-6 w-full max-w-2xl text-white shadow-xl">
            <h2 className="text-3xl font-bold mb-4 text-center text-amber-400">
              Cosmic Upgrades
            </h2>
            <div className="flex items-center justify-center mb-6">
              <span className="text-xl font-bold">Your Score:</span>
              <Coins className="w-6 h-6 ml-2 text-amber-400" />
              <span className="text-2xl font-bold ml-2">
                {score.toLocaleString()}
              </span>
            </div>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              {upgradeList.map((upgrade) => {
                const level = upgrades[upgrade.id] || 0;
                const cost = getUpgradeCost(upgrade.id);
                const canAfford = score >= cost;
                return (
                  <div
                    key={upgrade.id}
                    className="flex items-center justify-between p-4 bg-[#402062] rounded-lg border border-gray-700 hover:bg-[#50287a] transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-full bg-black/20">
                        {upgrade.icon}
                      </div>
                      <div>
                        <div className="text-lg font-bold">
                          {upgrade.name} (Lvl {level})
                        </div>
                        <div className="text-sm text-gray-300">
                          {upgrade.desc}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => purchaseUpgrade(upgrade.id)}
                      disabled={!canAfford}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all duration-200 ${
                        canAfford
                          ? 'bg-amber-500 hover:bg-amber-600 text-black'
                          : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <Coins className="w-4 h-4" />
                      <span>{cost.toLocaleString()}</span>
                    </button>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-center mt-6">
              <button
                onClick={() => setShowUpgrades(false)}
                className="px-6 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg font-bold text-white transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CosmicTapGame;
