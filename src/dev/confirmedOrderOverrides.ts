const LOCAL_CONFIRMED_ORDERS = new Set(["HO-2026-00003"]);
const LOCAL_ORDER_STAGE_KEY = "hoa:local-order-stages";
const localOrderIds = new Set<string>();

const isLocalPreview = () => typeof window !== "undefined" && ["127.0.0.1", "localhost"].includes(window.location.hostname);

export const isLocallyConfirmedOrder = (orderNumber: string) => isLocalPreview() && LOCAL_CONFIRMED_ORDERS.has(orderNumber);

const readStages = (): Record<string, string> => {
  try { return JSON.parse(window.localStorage.getItem(LOCAL_ORDER_STAGE_KEY) ?? "{}"); } catch { return {}; }
};

export const registerLocallyConfirmedOrder = (orderId: string, orderNumber: string) => {
  if (isLocallyConfirmedOrder(orderNumber)) localOrderIds.add(orderId);
};

export const isLocallyConfirmedOrderId = (orderId: string) => isLocalPreview() && localOrderIds.has(orderId);
export const getLocalOrderStage = (orderId: string) => isLocalPreview() ? readStages()[orderId] : undefined;
export const setLocalOrderStage = (orderId: string, stage: string) => {
  const stages = readStages();
  stages[orderId] = stage;
  window.localStorage.setItem(LOCAL_ORDER_STAGE_KEY, JSON.stringify(stages));
  window.dispatchEvent(new CustomEvent("hoa:orders-change"));
};
