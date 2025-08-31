import { http, createConfig } from 'wagmi';
import { mainnet } from 'wagmi/chains';
import { injected, metaMask, walletConnect } from 'wagmi/connectors';

// Your WalletConnect project ID
const projectId = 'fdd332531ed727358700364d8f3f56c6';

// Set up wagmi config
export const config = createConfig({
  chains: [mainnet],
  transports: {
    [mainnet.id]: http(),
  },
  connectors: [
    // Use the new connector functions
    injected(),
    walletConnect({ projectId }),
    metaMask(),
  ],
});
