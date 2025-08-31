import { Rocket, Star, Trophy, Zap } from 'lucide-react';

export const CosmicTapGameTap: React.FC = ({
  gameStarted,
}: {
  gameStarted: boolean;
}) => {
  return (
    <div>
      {!gameStarted && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-30">
          <div className="text-center text-white p-4 animate-fade-in-up">
            <h1 className="text-6xl md:text-7xl font-extrabold mb-4 bg-gradient-to-r from-red-400 to-amber-400 bg-clip-text text-transparent drop-shadow-xl">
              COSMIC TAP
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90 font-light">
              Tap anywhere to begin your journey!
            </p>
            <div className="space-y-3 text-lg opacity-70 mb-10">
              <p className="flex items-center justify-center gap-2">
                <Star className="w-5 h-5 text-amber-300" /> Build combos for
                higher scores
              </p>
              <p className="flex items-center justify-center gap-2">
                <Zap className="w-5 h-5 text-fuchsia-300" /> Collect power-ups
                for bonuses
              </p>
              <p className="flex items-center justify-center gap-2">
                <Rocket className="w-5 h-5 text-red-300" /> Activate Boost for
                massive points!
              </p>
              <p className="flex items-center justify-center gap-2">
                <Trophy className="w-5 h-5 text-teal-300" /> Unlock unique
                achievements
              </p>
            </div>
            <div className="mt-8 relative inline-block">
              <div className="w-20 h-20 border-4 border-white/40 rounded-full mx-auto animate-pulse-slow" />
              <div className="absolute inset-0 w-20 h-20 border-4 border-white/80 rounded-full mx-auto animate-ping-medium" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-10 h-10 bg-white rounded-full opacity-80 animate-bounce-slow" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const WalletConnectModal = ({
  connectors,
  connect,
  isLoading,
  pendingConnector,
  closeModal,
}) => (
  <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 animate-fade-in">
    <div className="bg-[#301852]/80 border border-fuchsia-500/50 rounded-lg p-6 w-full max-w-sm shadow-xl text-white">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Connect Wallet</h2>
        <button
          onClick={closeModal}
          className="hover:text-amber-300 transition-colors"
        >
          <X />
        </button>
      </div>
      <div className="space-y-3">
        {connectors
          .filter((c) => c.ready)
          .map((connector) => (
            <button
              key={connector.id}
              onClick={() => connect({ connector })}
              className="w-full flex items-center gap-4 px-4 py-3 bg-[#800c2e]/50 rounded-lg hover:bg-[#800c2e]/90 border border-transparent hover:border-amber-400 transition-all duration-200"
            >
              <Wallet className="w-6 h-6 text-amber-300" />
              <span className="text-lg font-semibold">{connector.name}</span>
              {isLoading && pendingConnector?.id === connector.id && (
                <span className="ml-auto text-sm animate-pulse">
                  Connecting...
                </span>
              )}
            </button>
          ))}
      </div>
    </div>
  </div>
);
