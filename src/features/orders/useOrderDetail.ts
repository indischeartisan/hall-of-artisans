import { useCallback, useEffect, useRef, useState } from "react";
import { orderService } from "./orderService";
import type { OrderDetailSnapshot } from "./types";

export function useOrderDetail(requestId: string | undefined) {
  const [data, setData] = useState<OrderDetailSnapshot | null>(null); const [loading, setLoading] = useState(true); const [error,setError]=useState("");
  const loadedRequestId = useRef<string>();
  const refresh = useCallback(async () => { if (!requestId) { setLoading(false); return; } const initialLoad = loadedRequestId.current !== requestId; if (initialLoad) setLoading(true); setError(""); try { setData(await orderService.getDetail(requestId)); loadedRequestId.current = requestId; } catch (cause) { if (initialLoad) setData(null); setError(cause instanceof Error ? cause.message : "This order could not be loaded."); } finally { if (initialLoad) setLoading(false); } }, [requestId]);
  useEffect(() => { void refresh(); const change = () => void refresh(); window.addEventListener("hoa:orders-change", change); return () => window.removeEventListener("hoa:orders-change", change); }, [refresh]);
  return { data, loading, error, refresh };
}
