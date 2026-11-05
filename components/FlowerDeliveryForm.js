import React, { useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

const PHONE = /^0\d{9}$/; // matches the server's phoneRegex
export const MAX_NOTE = 250;

export const emptyFlowerDetails = {
  sameDay: true,
  preferredDate: '',
  recipientName: '',
  recipientPhone: '',
  recipientAddress: '',
  note: '',
  acknowledgedAvailability: false,
};

const toISO = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export function validateFlowerDetails(v) {
  const e = {};
  if (!v.recipientName.trim()) e.recipientName = "Enter the recipient's name";
  if (!PHONE.test(v.recipientPhone.trim())) e.recipientPhone = 'Enter a valid phone number, e.g. 0712345678';
  if (v.recipientAddress.trim().length < 5) e.recipientAddress = 'Enter the full delivery address';
  if (!v.sameDay && !v.preferredDate) e.preferredDate = 'Choose a delivery date';
  if (v.note.length > MAX_NOTE) e.note = `Note must be ${MAX_NOTE} characters or fewer`;
  if (!v.acknowledgedAvailability) e.acknowledgedAvailability = 'Please confirm the recipient will be available';
  return e;
}

// Short notice reused on the product page and in the cart
export const FlowerNotice = ({ style }) => (
  <View style={style} className="border border-pink-300 bg-pink-50 rounded-2xl p-3">
    <Text className="text-pink-900 text-xs leading-5">
      <Text className="font-bold">Flower orders: </Text>
      at checkout you'll be asked for same-day delivery, the recipient's name, phone and address,
      and a message for the card. The recipient must be available to receive the flowers.
    </Text>
  </View>
);

const Err = ({ msg }) => (msg ? <Text className="text-red-600 text-xs mt-1">{msg}</Text> : null);

const Radio = ({ selected, label, onPress }) => (
  <TouchableOpacity onPress={onPress} className="flex-row items-center gap-2 py-1.5" activeOpacity={0.7}>
    <MaterialIcons
      name={selected ? 'radio-button-checked' : 'radio-button-unchecked'}
      size={20}
      color={selected ? '#581C87' : '#9CA3AF'}
    />
    <Text className="text-gray-700 text-sm">{label}</Text>
  </TouchableOpacity>
);

export default function FlowerDeliveryForm({ value, onChange, errors }) {
  // Tomorrow onward: "today" is the same-day option
  const dates = useMemo(() => {
    const out = [];
    for (let i = 1; i <= 14; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      out.push({
        iso: toISO(d),
        day: d.toLocaleDateString('en-GB', { weekday: 'short' }),
        label: d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
      });
    }
    return out;
  }, []);

  const inputCls = 'border border-gray-300 rounded-lg p-4 bg-white text-black';

  return (
    <View className="mb-4 mt-4 border border-pink-300 rounded-2xl p-4 bg-pink-50/40">
      <Text className="font-bold text-gray-700 text-center text-lg mb-3">Flower Delivery Details</Text>

      {/* Availability notice */}
      <View className="bg-amber-50 border border-amber-300 rounded-xl p-3 mb-4">
        <Text className="text-amber-900 text-xs leading-5">
          <Text className="font-bold">Please note: </Text>
          the recipient must be available at the delivery address to receive the flowers. Make
          sure they know to expect a delivery and can be reached on the phone number you give below.
        </Text>
      </View>

      {/* Same day or chosen date */}
      <Radio
        selected={value.sameDay}
        label="Same-day delivery"
        onPress={() => onChange({ sameDay: true, preferredDate: '' })}
      />
      <Radio
        selected={!value.sameDay}
        label="Deliver on another day"
        onPress={() => onChange({ sameDay: false })}
      />
      {!value.sameDay && (
        <View className="mt-2 mb-2">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {dates.map((d) => {
              const active = value.preferredDate === d.iso;
              return (
                <TouchableOpacity
                  key={d.iso}
                  onPress={() => onChange({ preferredDate: d.iso })}
                  className="items-center rounded-xl px-3 py-2 mr-2 border"
                  style={{
                    backgroundColor: active ? '#581C87' : '#fff',
                    borderColor: active ? '#581C87' : '#D1D5DB',
                  }}
                >
                  <Text style={{ color: active ? '#E9D5FF' : '#6B7280', fontSize: 11 }}>{d.day}</Text>
                  <Text style={{ color: active ? '#fff' : '#111827', fontSize: 13, fontWeight: '600' }}>
                    {d.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          <Err msg={errors.preferredDate} />
        </View>
      )}

      {/* Recipient */}
      <View className="mt-3">
        <TextInput
          placeholder="Recipient's name"
          value={value.recipientName}
          onChangeText={(t) => onChange({ recipientName: t })}
          className={inputCls}
        />
        <Err msg={errors.recipientName} />
      </View>
      <View className="mt-3">
        <TextInput
          placeholder="Recipient's phone (e.g. 0712345678)"
          keyboardType="phone-pad"
          value={value.recipientPhone}
          onChangeText={(t) => onChange({ recipientPhone: t })}
          className={inputCls}
        />
        <Err msg={errors.recipientPhone} />
      </View>
      <View className="mt-3">
        <TextInput
          placeholder="Delivery address (building, street, landmark)"
          multiline
          numberOfLines={2}
          textAlignVertical="top"
          value={value.recipientAddress}
          onChangeText={(t) => onChange({ recipientAddress: t })}
          className={inputCls}
          style={{ minHeight: 64 }}
        />
        <Err msg={errors.recipientAddress} />
      </View>

      {/* Card note */}
      <View className="mt-3">
        <TextInput
          placeholder="Message for the card (optional)"
          multiline
          numberOfLines={3}
          maxLength={MAX_NOTE}
          textAlignVertical="top"
          value={value.note}
          onChangeText={(t) => onChange({ note: t })}
          className={inputCls}
          style={{ minHeight: 84 }}
        />
        <View className="flex-row justify-between">
          <Err msg={errors.note} />
          <Text className="text-xs text-gray-500 ml-auto">{value.note.length}/{MAX_NOTE}</Text>
        </View>
      </View>

      {/* Acknowledgement */}
      <TouchableOpacity
        onPress={() => onChange({ acknowledgedAvailability: !value.acknowledgedAvailability })}
        className="flex-row items-start gap-2 mt-4"
        activeOpacity={0.7}
      >
        <MaterialIcons
          name={value.acknowledgedAvailability ? 'check-box' : 'check-box-outline-blank'}
          size={22}
          color={value.acknowledgedAvailability ? '#581C87' : '#9CA3AF'}
        />
        <Text className="flex-1 text-sm text-gray-700">
          I confirm the recipient will be available to receive this delivery.
        </Text>
      </TouchableOpacity>
      <Err msg={errors.acknowledgedAvailability} />
    </View>
  );
}