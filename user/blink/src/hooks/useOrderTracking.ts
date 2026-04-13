import { useState, useEffect, useCallback, useRef } from 'react';

export interface OrderData {
  id: string;
  order_id: string;
  strategy_id: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'ERROR';
  exchange_order_id?: string;
  message?: string;
  timestamp: number;
  filled_quantity?: number;
  fill_price?: number;
}

export interface Position {
  id: string;
  symbol: string;
  side: 'Long' | 'Short';
  total_quantity: number;
  filled_quantity: number;
  unfilled_quantity: number;
  avg_entry_price: number;
  total_cost: number;
  current_mark_price: number;
  unrealized_pnl: number;
  unrealized_pnl_pct: number;
  orders: OrderData[];
  status: 'OPEN' | 'PARTIALLY_FILLED' | 'CLOSED';
}

export interface PositionsSummary {
  positions: Position[];
  total_equity: number;
  total_margin: number;
  available_margin: number;
  total_unrealized_pnl: number;
  total_unrealized_pnl_pct: number;
}

export const useOrderTracking = (marketPrice?: { symbol?: string; price?: number }) => {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [summary, setSummary] = useState<PositionsSummary>({
    positions: [],
    total_equity: 100000,
    total_margin: 0,
    available_margin: 100000,
    total_unrealized_pnl: 0,
    total_unrealized_pnl_pct: 0,
  });
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  // Connect to executor WebSocket
  useEffect(() => {
    const connectToExecutor = () => {
      try {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.close();
        }

        const websocket = new WebSocket('ws://localhost:9001');
        wsRef.current = websocket;

        websocket.onopen = () => {
          console.log('[OrderTracking] Connected to Executor');
          setIsConnected(true);
        };

        websocket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);

            if (data.type === 'order_result') {
              const newOrder: OrderData = {
                id: `${data.timestamp}-${Math.random()}`,
                order_id: data.order_id,
                strategy_id: data.strategy_id || 'default',
                symbol: data.symbol || 'UNKNOWN',
                side: data.side || 'BUY',
                quantity: data.quantity || 1,
                price: data.price || 0,
                status: data.status,
                exchange_order_id: data.exchange_order_id,
                message: data.message,
                timestamp: data.timestamp,
                filled_quantity: data.status === 'ACCEPTED' ? data.quantity : 0,
              };

              setOrders((prev) => {
                const updated = [newOrder, ...prev];
                updatePositionsFromOrders(updated);
                return updated;
              });
            } else if (data.type === 'executionReport') {
              // Add handler for real execution reports
              setOrders((prev) => {
                const updated = prev.map(order => {
                  if (order.exchange_order_id === data.orderId || order.order_id === data.clientOrderId) {
                    return {
                      ...order,
                      filled_quantity: parseFloat(data.cumulativeFilledQuantity),
                      status: data.orderStatus === 'FILLED' ? 'ACCEPTED' : order.status,
                      fill_price: parseFloat(data.lastFilledPrice)
                    };
                  }
                  return order;
                });
                updatePositionsFromOrders(updated);
                return updated;
              });
            }
          } catch (e) {
            console.log('[OrderTracking] Message received:', event.data);
          }
        };

        websocket.onerror = (error) => {
          console.error('[OrderTracking] WebSocket error:', error);
        };

        websocket.onclose = () => {
          console.log('[OrderTracking] Disconnected from Executor');
          setIsConnected(false);
          wsRef.current = null;
          setTimeout(connectToExecutor, 3000);
        };
      } catch (error) {
        console.error('[OrderTracking] Connection error:', error);
      }
    };

    connectToExecutor();

    return () => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }
    };
  }, []);

  // Update positions when market price changes
  useEffect(() => {
    if (!marketPrice?.price || positions.length === 0) return;

    setPositions((prevPositions) => {
      return prevPositions.map((pos) => {
        if (pos.symbol === marketPrice.symbol) {
          const updatedPos = { ...pos, current_mark_price: marketPrice.price! };
          // Recalculate P&L
          if (pos.filled_quantity > 0) {
            const pnl_per_unit = pos.side === 'Long'
              ? updatedPos.current_mark_price - pos.avg_entry_price
              : pos.avg_entry_price - updatedPos.current_mark_price;
            updatedPos.unrealized_pnl = pnl_per_unit * pos.filled_quantity;
            updatedPos.unrealized_pnl_pct = (pnl_per_unit / pos.avg_entry_price) * 100;
          }
          return updatedPos;
        }
        return pos;
      });
    });
  }, [marketPrice]);

  // Update positions from orders
  const updatePositionsFromOrders = useCallback((orderList: OrderData[]) => {
    const positionMap = new Map<string, Position>();

    // Group orders by symbol
    orderList.forEach((order) => {
      if (order.status === 'ERROR' || order.status === 'REJECTED') {
        return; // Skip failed orders
      }

      const key = order.symbol;

      if (!positionMap.has(key)) {
        positionMap.set(key, {
          id: key,
          symbol: key,
          side: order.side === 'BUY' ? 'Long' : 'Short',
          total_quantity: 0,
          filled_quantity: 0,
          unfilled_quantity: 0,
          avg_entry_price: 0,
          total_cost: 0,
          current_mark_price: marketPrice?.symbol === key ? marketPrice.price! : 0,
          unrealized_pnl: 0,
          unrealized_pnl_pct: 0,
          orders: [],
          status: 'OPEN',
        });
      }

      const pos = positionMap.get(key)!;
      pos.orders.push(order);
      pos.total_quantity += order.quantity;

      // Calculate filled vs unfilled
      if (order.filled_quantity && order.filled_quantity > 0) {
        pos.filled_quantity += order.filled_quantity;
        pos.total_cost += order.filled_quantity * (order.fill_price || order.price);
      } else if (order.status === 'ACCEPTED') {
        // Fallback if filled_quantity not explicitly set but status is ACCEPTED
        pos.filled_quantity += order.quantity;
        pos.total_cost += order.quantity * order.price;
      } else {
        pos.unfilled_quantity += order.quantity;
      }
    });

    // Calculate position metrics
    const updatedPositions: Position[] = [];
    let totalPnL = 0;

    positionMap.forEach((pos) => {
      if (pos.total_quantity > 0) {
        pos.avg_entry_price = pos.total_cost / pos.filled_quantity || pos.orders[0]?.price || 0;

        // Use real market price if available, else keep existing
        if (marketPrice?.symbol === pos.symbol) {
          pos.current_mark_price = marketPrice.price!;
        } else if (pos.current_mark_price === 0) {
          pos.current_mark_price = pos.avg_entry_price;
        }

        // Calculate P&L
        if (pos.filled_quantity > 0) {
          const pnl_per_unit = pos.side === 'Long' 
            ? pos.current_mark_price - pos.avg_entry_price
            : pos.avg_entry_price - pos.current_mark_price;
          
          pos.unrealized_pnl = pnl_per_unit * pos.filled_quantity;
          pos.unrealized_pnl_pct = (pnl_per_unit / pos.avg_entry_price) * 100;
        }

        // Determine status
        if (pos.unfilled_quantity > 0) {
          pos.status = 'PARTIALLY_FILLED';
        } else if (pos.filled_quantity > 0) {
          pos.status = 'OPEN';
        }

        totalPnL += pos.unrealized_pnl;
        updatedPositions.push(pos);
      }
    });

    setPositions(updatedPositions);

    // Update summary
    setSummary((prev) => {
        const totalMargin = updatedPositions.reduce((sum, p) => sum + p.total_cost, 0);
        return {
            ...prev,
            positions: updatedPositions,
            total_margin: totalMargin,
            available_margin: prev.total_equity - totalMargin,
            total_unrealized_pnl: totalPnL,
            total_unrealized_pnl_pct: totalMargin > 0 ? (totalPnL / totalMargin) * 100 : 0,
        };
    });
  }, [marketPrice]);

  return {
    orders,
    positions,
    summary,
    isConnected,
  };
};