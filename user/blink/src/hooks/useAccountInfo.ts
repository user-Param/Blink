import { useState, useEffect, useRef } from 'react';

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
  const wsRef = useRef<WebSocket | null>(null);
  const retryCount = useRef(0);
  const maxRetries = 3;

  useEffect(() => {
    const fetchAccountInfo = () => {
      // Close existing connection before opening a new one
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }

      const ws = new WebSocket('ws://localhost:9001');
      wsRef.current = ws;

      ws.onopen = () => {
        retryCount.current = 0; // Reset on success
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
        wsRef.current = null;
      };

      ws.onerror = (err) => {
        console.error('WebSocket error:', err);
        if (retryCount.current < maxRetries) {
          retryCount.current++;
          const backoff = Math.pow(2, retryCount.current) * 1000;
          setTimeout(fetchAccountInfo, backoff);
        } else {
          setError('Failed to fetch account info');
          setLoading(false);
        }
        wsRef.current = null;
      };
    };

    fetchAccountInfo();
    const interval = setInterval(fetchAccountInfo, 30000);

    return () => {
      clearInterval(interval);
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }
    };
  }, []);

  return { accountInfo, totalBalance, loading, error };
};