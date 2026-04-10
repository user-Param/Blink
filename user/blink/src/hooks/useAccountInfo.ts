import { useState, useEffect } from 'react';

interface Balance {
  asset: string;
  free: string;
  locked: string;
}

interface AccountInfo {
  makerCommission: number;
  takerCommission: number;
  buyerCommission: number;
  sellerCommission: number;
  canTrade: boolean;
  canWithdraw: boolean;
  canDeposit: boolean;
  updateTime: number;
  accountType: string;
  balances: Balance[];
  permissions: string[];
}

export const useAccountInfo = () => {
  const [accountInfo, setAccountInfo] = useState<AccountInfo | null>(null);
  const [totalBalance, setTotalBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAccountInfo = () => {
      const ws = new WebSocket('ws://localhost:9001');

      ws.onopen = () => {
        ws.send(JSON.stringify({ type: 'get_account_info' }));
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          if (message.type === 'account_info') {
            if (message.error) {
              setError(message.error);
              setLoading(false);
              return;
            }

            if (message.data && message.data.balances) {
              setAccountInfo(message.data);
              
              // Calculate total balance in USDT
              const usdt = message.data.balances.find((b: Balance) => b.asset === 'USDT');
              if (usdt) {
                const total = parseFloat(usdt.free) + parseFloat(usdt.locked);
                setTotalBalance(total);
              } else {
                // If no USDT, show 0
                setTotalBalance(0);
              }
              
              setError(null);
            }
          }
        } catch (err) {
          console.error('Error parsing account info:', err);
          setError('Failed to parse account info');
        }
        setLoading(false);
        ws.close();
      };

      ws.onerror = (err) => {
        console.error('WebSocket error:', err);
        setError('Failed to fetch account info');
        setLoading(false);
      };

      return () => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.close();
        }
      };
    };

    // Initial fetch
    fetchAccountInfo();

    // Refresh every 30 seconds
    const interval = setInterval(fetchAccountInfo, 30000);

    return () => clearInterval(interval);
  }, []);

  return { accountInfo, totalBalance, loading, error };
};
