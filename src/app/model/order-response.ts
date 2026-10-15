export interface OrderResponse {
  order_id: number;
  customer_id: number;
  delivery_date: string;
  quantity: number;
  unit_price: string;
  unit_cost: string;
  is_simulated: number;
  status: string;
  name: string;
  phone: string;
  address: string;
  latitude: string;
  longitude: string;
}
