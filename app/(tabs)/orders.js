import { View, Text, ScrollView, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import React, { useEffect, useState } from 'react';
import { TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useAuthContext } from '../../context/AuthProvider';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

// ── Status config ─────────────────────────────────────────────────────────────
const DELIVERY_STATUS = {
  pending:   { label: 'Pending Confirmation', icon: 'pending',          color: '#6B7280', bg: '#F3F4F6', text: '#374151' },
  transit:   { label: 'In Transit',           icon: 'delivery-dining',  color: '#92400E', bg: '#FEF3C7', text: '#92400E' },
  cancelled: { label: 'Cancelled',            icon: 'cancel',           color: '#DC2626', bg: '#FEE2E2', text: '#DC2626' },
  delivered: { label: 'Delivered',            icon: 'check-circle',     color: '#6B21A8', bg: '#EDE9FE', text: '#6B21A8' },
};

const PAYMENT_STATUS = {
  pending:   { label: 'Pending Payment',    bg: '#F3F4F6', text: '#6B7280' },
  confirmed: { label: 'Payment Confirmed',  bg: '#DCFCE7', text: '#166534' },
};

// ── Status Badge ──────────────────────────────────────────────────────────────
const DeliveryBadge = ({ status }) => {
  const s = DELIVERY_STATUS[status] ?? DELIVERY_STATUS.pending;
  return (
    <View style={{ backgroundColor: s.bg }} className="flex-row items-center gap-1.5 rounded-full px-3 py-1.5">
      <MaterialIcons name={s.icon} size={13} color={s.color} />
      <Text style={{ color: s.text }} className="text-xs font-montserrat-semibold">{s.label}</Text>
    </View>
  );
};

const PaymentBadge = ({ status }) => {
  const s = status === 'pending' ? PAYMENT_STATUS.pending : PAYMENT_STATUS.confirmed;
  return (
    <View style={{ backgroundColor: s.bg }} className="flex-row items-center gap-1.5 rounded-full px-3 py-1.5">
      <MaterialCommunityIcons name="cash-multiple" size={13} color={s.text} />
      <Text style={{ color: s.text }} className="text-xs font-montserrat-semibold">{s.label}</Text>
    </View>
  );
};

// ── Order Card ────────────────────────────────────────────────────────────────
const OrderCard = ({ order, onCancel, cancelLoading }) => {
  const total = order.total_price + order.delivery_cost;
  const canCancel = order.delivery_status === 'pending';

  return (
    <View
      className="bg-white rounded-3xl mb-4 overflow-hidden"
      style={{ shadowColor: '#6B21A8', shadowOpacity: 0.07, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 3 }}
    >
      {/* Header stripe */}
      <View className="bg-purple-950 px-5 py-3 flex-row justify-between items-center">
        <Text className="text-white font-montserrat-black text-base">
          Ksh {total.toLocaleString()}
        </Text>
        <View className="flex-row items-center gap-1.5">
          <MaterialIcons name="date-range" size={13} color="#C4B5FD" />
          <Text className="text-purple-300 text-xs font-montserrat-light">{order.order_date}</Text>
        </View>
      </View>

      <View className="px-4 pt-4 pb-3">

        {/* Items list */}
        <Text className="text-gray-400 text-xs font-montserrat-light uppercase tracking-wide mb-2">Items</Text>
        {order.items.map((item, i) => (
          <View
            key={item._id ?? i}
            className={`flex-row items-center py-2.5 ${i < order.items.length - 1 ? 'border-b border-gray-50' : ''}`}
          >
            <View className="flex-1">
              <Text className="text-gray-800 text-sm font-montserrat-semibold" numberOfLines={1}>
                {item.productName}
              </Text>
              <Text className="text-purple-400 text-xs font-montserrat-light">#{item.productId}</Text>
            </View>
            <View className="items-end">
              <Text className="text-gray-700 text-sm font-montserrat-semibold">
                Ksh {item.price.toLocaleString()}
              </Text>
              <Text className="text-gray-400 text-xs font-montserrat-light">×{item.quantity}</Text>
            </View>
          </View>
        ))}

        {/* Delivery row */}
        <View className="bg-gray-50 rounded-2xl flex-row items-center gap-2 px-3 py-3 mt-3">
          <View className="w-8 h-8 rounded-full bg-purple-100 items-center justify-center">
            <MaterialIcons name="delivery-dining" size={16} color="#6B21A8" />
          </View>
          <View className="flex-1">
            <Text className="text-gray-800 text-sm font-montserrat-semibold">{order.deliveryLocation}</Text>
            <Text className="text-gray-400 text-xs font-montserrat-light">
              Delivery fee: Ksh {order.delivery_cost.toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Status badges */}
        <View className="flex-row flex-wrap gap-2 mt-3">
          <PaymentBadge status={order.completion_status} />
          <DeliveryBadge status={order.delivery_status} />
        </View>

        {/* Cancel button */}
        {canCancel && (
          <View className="mt-4">
            {cancelLoading ? (
              <ActivityIndicator color="#7C3AED" size="small" />
            ) : (
              <TouchableOpacity
                onPress={() => onCancel(order._id)}
                className="border border-red-200 bg-red-50 rounded-2xl py-3 flex-row items-center justify-center gap-2"
                activeOpacity={0.8}
              >
                <MaterialIcons name="cancel" size={16} color="#DC2626" />
                <Text className="text-red-600 text-sm font-montserrat-semibold">Cancel Order</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </View>
  );
};

// ── Main ──────────────────────────────────────────────────────────────────────
const Orders = () => {
  const { token, logout } = useAuthContext();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

  const fetchOrders = () => {
    if (!token) { setLoading(false); return; }

    fetch(`${process.env.EXPO_PUBLIC_API_URL}/GetMyOrders`, {
      headers: { 'Authorization': `Bearer ${token}` },
    })
      .then(res => {
        if (res.ok) return res.json();
        if (res.status === 401) { logout(); router.push('/login'); }
      })
      .then(result =>
        Promise.all(
          result.map(order =>
            fetch(`${process.env.EXPO_PUBLIC_API_URL}/get_location/${order.deliveryLocation}`, {
              headers: { 'Authorization': `Bearer ${token}` },
            })
              .then(r => r.json())
              .then(loc => ({ ...order, deliveryLocation: loc.town }))
          )
        )
      )
      .then(data => { setOrders(data.reverse()); setLoading(false); setRefreshing(false); })
      .catch(() => { setError(true); setLoading(false); setRefreshing(false); });
  };

  useEffect(() => { fetchOrders(); }, [token]);

  const onRefresh = () => { setRefreshing(true); fetchOrders(); };

  const cancelAlert = id =>
    Alert.alert('Cancel Order', 'Are you sure you want to cancel this order?', [
      { text: 'Keep Order', style: 'cancel' },
      { text: 'Cancel Order', style: 'destructive', onPress: () => handleCancel(id) },
    ]);

  const handleCancel = id => {
    setCancelLoading(true);
    fetch(`${process.env.EXPO_PUBLIC_API_URL}/cancel_order/${id}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    })
      .then(res => {
        setCancelLoading(false);
        if (res.ok) {
          Alert.alert('Cancelled', 'Order cancelled. Await your refund.', [{ text: 'OK', onPress: fetchOrders }]);
        } else {
          res.json().then(err => Alert.alert('Failed', err));
        }
      })
      .catch(err => { setCancelLoading(false); Alert.alert('Error', String(err)); });
  };

  // ── Logged out ──
  if (!token) {
    return (
      <View className="flex-1 justify-center items-center p-6 bg-white">
        <View className="w-20 h-20 rounded-full bg-purple-50 items-center justify-center mb-5">
          <MaterialIcons name="receipt-long" size={36} color="#7C3AED" />
        </View>
        <Text className="text-xl font-montserrat-semibold text-gray-800 mb-2">No Orders Yet</Text>
        <Text className="text-sm font-montserrat-light text-gray-400 text-center mb-8">
          Login to view your order history and track deliveries
        </Text>
        <TouchableOpacity
          className="bg-purple-950 w-full py-3.5 rounded-2xl mb-3"
          onPress={() => router.push({ pathname: '/login', params: { referer: '/orders' } })}
        >
          <Text className="text-white text-center font-montserrat-semibold">Log In</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="border border-purple-200 w-full py-3.5 rounded-2xl"
          onPress={() => router.push('/home')}
        >
          <Text className="text-purple-700 text-center font-montserrat-semibold">Browse Shop</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Loading ──
  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator color="#7C3AED" size="large" />
        <Text className="text-gray-400 text-sm mt-3 font-montserrat-light">Loading orders…</Text>
      </View>
    );
  }

  // ── Error ──
  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-8">
        <MaterialIcons name="wifi-off" size={40} color="#D1D5DB" />
        <Text className="text-gray-500 font-montserrat-semibold mt-4 mb-1">Couldn't load orders</Text>
        <TouchableOpacity onPress={fetchOrders} className="mt-3 bg-purple-50 px-6 py-2.5 rounded-xl">
          <Text className="text-purple-700 font-montserrat-semibold text-sm">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Empty ──
  if (orders.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-8">
        <View className="w-20 h-20 rounded-full bg-purple-50 items-center justify-center mb-5">
          <MaterialIcons name="receipt-long" size={36} color="#7C3AED" />
        </View>
        <Text className="text-gray-800 font-montserrat-semibold text-base mb-2">No orders placed yet</Text>
        <Text className="text-gray-400 text-sm font-montserrat-light text-center mb-6">
          Start shopping and your orders will appear here
        </Text>
        <TouchableOpacity
          className="bg-purple-950 px-8 py-3.5 rounded-2xl"
          onPress={() => router.push('/')}
        >
          <Text className="text-white font-montserrat-semibold text-sm">Shop Now</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header */}
      <View className="flex-row items-center gap-2 mb-4">
        <View className="w-8 h-8 rounded-full bg-purple-100 items-center justify-center">
          <MaterialIcons name="receipt-long" size={16} color="#6B21A8" />
        </View>
        <Text className="text-gray-800 font-montserrat-semibold text-base">My Orders</Text>
        <View className="bg-purple-950 rounded-full px-2 py-0.5 ml-1">
          <Text className="text-white text-xs">{orders.length}</Text>
        </View>
      </View>

      {orders.map((order, i) => (
        <OrderCard
          key={order._id ?? i}
          order={order}
          onCancel={cancelAlert}
          cancelLoading={cancelLoading}
        />
      ))}
    </ScrollView>
  );
};

export default Orders;