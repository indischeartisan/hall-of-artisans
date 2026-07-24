import { useCallback, useEffect, useState } from "react";
import { orderService } from "./orderService";
import type { OrderDetailSnapshot } from "./types";

export function useOrderDetail(requestId: string | undefined) {
  const [data, setData] = useState<OrderDetailSnapshot | null>(null); const [loading, setLoading] = useState(true); const [error,setError]=useState("");
  const refresh = useCallback(async () => { if (!requestId) { setLoading(false); return; } setLoading(true); setError(""); try { setData(await orderService.getDetail(requestId)); } catch (cause) { setData(null); setError(cause instanceof Error ? cause.message : "This order could not be loaded."); } finally { setLoading(false); } }, [requestId]);
  useEffect(() => { void refresh(); const change = () => void refresh(); window.addEventListener("hoa:orders-change", change); return () => window.removeEventListener("hoa:orders-change", change); }, [refresh]);
  return { data, loading, error, refresh };
}
