import { useState, useEffect, useRef } from 'react';
import { Activity, TrendingUp, TrendingDown, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

interface OrderUpdate {
  id: string;
  order_id: string;
  strategy_id: string;
  side: 'BUY' | 'SELL';
  symbol: string;
  quantity: number;
  price: number;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'ERROR';
  exchange_order_id?: string;
  message?: string;
  timestamp: number;
}

const TradeRealtimeMonitor = () => {
  const [orders, setOrders] = useState<OrderUpdate[]>([]);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const ordersEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const connectToExecutor = () => {
      try {
        const websocket = new WebSocket('ws://localhost:9001');

        websocket.onopen = () => {
          console.log('[TradeMonitor] Connected to Executor');
          setIsConnected(true);
          wsRef.current = websocket;
          websocket.send(JSON.stringify({ type: 'ping' }));
        };

        websocket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            
            if (data.type === 'order_result') {
              const newOrder: OrderUpdate = {
                id: `${data.timestamp}-${Math.random()}`,
                order_id: data.order_id,
                strategy_id: data.strategy_id || 'default',
                side: data.side || 'BUY',
                symbol: data.symbol || 'UNKNOWN',
                quantity: data.quantity || 1,
                price: data.price || 0,
                status: data.status,
                exchange_order_id: data.exchange_order_id,
                message: data.message,
                timestamp: data.timestamp
              };
              
              setOrders(prev => [newOrder, ...prev].slice(0, 50));
              console.log('[TradeMonitor] New order:', newOrder);
            }
          } catch (e) {
            console.log('[TradeMonitor] Message received:', event.data);
          }
        };

        websocket.onerror = (error) => {
          console.error('[TradeMonitor] WebSocket error:', error);
          setIsConnected(false);
        };

        websocket.onclose = () => {
          console.log('[TradeMonitor] Disconnected from Executor');
          setIsConnected(false);
          // Attempt to reconnect after 3 seconds
          setTimeout(connectToExecutor, 3000);
        };

        setWs(websocket);
      } catch (error) {
        console.error('[TradeMonitor] Connection error:', error);
      }
    };

    connectToExecutor();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  // Auto-scroll to latest order
  useEffect(() => {
    ordersEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [orders]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACCEPTED':
        return 'bg-green-500/10 border-green-500/30 text-green-400';
      case 'PENDING':
        return 'bg-blue-500/10 border-blue-500/30 text-blue-400';
      case 'REJECTED':
        return 'bg-orange-500/10 border-orange-500/30 text-orange-400';
      case 'ERROR':
        return 'bg-red-500/10 border-red-500/30 text-red-400';
      default:
        return 'bg-white/5 border-white/10 text-white/60';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACCEPTED':
        return <CheckCircle2 size={16} className="text-green-400" />;
      case 'PENDING':
        return <Clock size={16} className="text-blue-400 animate-spin" />;
      case 'REJECTED':
      case 'ERROR':
        return <AlertCircle size={16} className="text-red-400" />;
      default:
        return <Activity size={16} className="text-white/40" />;
    }
  };

  const getSideIcon = (side: string) => {
    return side === 'BUY' ? (
      <TrendingUp size={16} className="text-green-400" />
    ) : (
      <TrendingDown size={16} className="text-red-400" />
    );
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#0d0d0d] border border-white/10 rounded-lg overflow-hidden shadow-lg">
      {/* Header */}
      <div className="p-3 border-b border-white/10 bg-[#111]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Real-Time Orders</h3>
            <span className="text-[10px] text-white/40">
              {isConnected ? '● Connected' : '● Disconnected'}
            </span>
          </div>
          <span className="text-[10px] bg-white/5 px-2 py-1 rounded text-white/60 font-mono">
            {orders.length} orders
          </span>
        </div>
      </div>

      {/* Orders List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {orders.length === 0 ? (
          <div className="h-full flex items-center justify-center text-white/40">
            <div className="text-center">
              <Activity size={28} className="mx-auto mb-2 opacity-40" />
              <p className="text-xs">Waiting for order updates...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-1.5 p-2">
            {orders.map((order) => (
              <div
                key={order.id}
                className={`p-2.5 border rounded transition-all duration-300 ${getStatusColor(
                  order.status
                )} space-y-1.5 hover:scale-[1.01]`}
              >
                {/* Order Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(order.status)}
                    <div>
                      <p className="text-[11px] font-bold">
                        {order.symbol}
                      </p>
                      <p className="text-[9px] text-white/50">
                        {order.strategy_id}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {getSideIcon(order.side)}
                    <span className="text-xs font-bold">
                      {order.side}
                    </span>
                  </div>
                </div>

                {/* Order Details */}
                <div className="grid grid-cols-3 gap-1 text-[9px] p-1.5 bg-black/20 rounded">
                  <div>
                    <span className="text-white/40">Status</span>
                    <p className="font-mono font-bold text-white/90">{order.status}</p>
                  </div>
                  <div>
                    <span className="text-white/40">Qty</span>
                    <p className="font-mono text-white/90">{order.quantity}</p>
                  </div>
                  <div>
                    <span className="text-white/40">Time</span>
                    <p className="font-mono text-white/90">{formatTime(order.timestamp).split(' ')[0]}</p>
                  </div>
                </div>

                {/* Message / Response */}
                {order.message && (
                  <div className="p-1.5 bg-black/40 rounded text-[9px] text-white/80 border-l-2 border-current">
                    <p className="font-mono line-clamp-2">{order.message}</p>
                  </div>
                )}

                {/* Order ID */}
                <div className="text-[8px] text-white/50 font-mono truncate">
                  {order.order_id}
                </div>
              </div>
            ))}
            <div ref={ordersEndRef} />
          </div>
        )}
      </div>

      {/* Stats Footer */}
      {orders.length > 0 && (
        <div className="border-t border-white/10 bg-[#111] p-2 grid grid-cols-4 gap-1 text-[9px]">
          <div className="text-center px-1 py-1.5 rounded bg-green-500/5 border border-green-500/20">
            <p className="text-white/40 text-[8px]">Accepted</p>
            <p className="font-bold text-green-400 text-xs">
              {orders.filter(o => o.status === 'ACCEPTED').length}
            </p>
          </div>
          <div className="text-center px-1 py-1.5 rounded bg-blue-500/5 border border-blue-500/20">
            <p className="text-white/40 text-[8px]">Pending</p>
            <p className="font-bold text-blue-400 text-xs">
              {orders.filter(o => o.status === 'PENDING').length}
            </p>
          </div>
          <div className="text-center px-1 py-1.5 rounded bg-orange-500/5 border border-orange-500/20">
            <p className="text-white/40 text-[8px]">Rejected</p>
            <p className="font-bold text-orange-400 text-xs">
              {orders.filter(o => o.status === 'REJECTED').length}
            </p>
          </div>
          <div className="text-center px-1 py-1.5 rounded bg-red-500/5 border border-red-500/20">
            <p className="text-white/40 text-[8px]">Errors</p>
            <p className="font-bold text-red-400 text-xs">
              {orders.filter(o => o.status === 'ERROR').length}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TradeRealtimeMonitor;
