import { useCallback, useEffect, useState } from "react";
import { orderService } from "./orderService";
import type { OrderDetailSnapshot } from "./types";

export function useOrderDetail(requestId: string | undefined) {
  const [data, setData] = useState<OrderDetailSnapshot | null>(null); const [loading, setLoading] = useState(true);
  const refresh = useCallback(async () => { if (!requestId) { setLoading(false); return; } setData(await orderService.getDetail(requestId)); setLoading(false); }, [requestId]);
  useEffect(() => { void refresh(); const change = () => void refresh(); window.addEventListener("hoa:orders-change", change); return () => window.removeEventListener("hoa:orders-change", change); }, [refresh]);
  return { data, loading, refresh };
}
