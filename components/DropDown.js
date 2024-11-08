import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Modal,
  TouchableWithoutFeedback,
  Platform,
} from "react-native";
import React, { useCallback, useRef, useState } from "react";
import { AntDesign } from "@expo/vector-icons";

export default function Dropdown({ data, onChange, placeholder }) {
  const [expanded, setExpanded] = useState(false);
  const [value, setValue] = useState("");
  const [top, setTop] = useState(0);

  const toggleExpanded = useCallback(() => setExpanded(!expanded), [expanded]);

  const buttonRef = useRef(null);

  const onSelect = useCallback((item) => {
    onChange(item);
    setValue(item.category);
    setExpanded(false);
  }, []);

  return (
    <View
      ref={buttonRef}
      onLayout={(event) => {
        const layout = event.nativeEvent.layout;
        const topOffset = layout.y;
        const heightOfComponent = layout.height;

        const finalValue =
          topOffset + heightOfComponent + (Platform.OS === "android" ? -32 : 3);

        setTop(finalValue);
      }}
    >
      <TouchableOpacity
        style={styles.button}
        activeOpacity={0.8}
        onPress={toggleExpanded}
      >
        <Text style={styles.text} numberOfLines={1} ellipsizeMode="tail" >{value || placeholder}</Text>
        <AntDesign name={expanded ? "caretup" : "caretdown"} color="black" />
      </TouchableOpacity>
      {expanded ? (
        <Modal visible={expanded} transparent>
          <TouchableWithoutFeedback onPress={() => setExpanded(false)}>
            <View style={styles.backdrop}>
              <View
                style={[
                  styles.options,
                  {
                    top,
                  },
                ]}
              >
                <FlatList
                  keyExtractor={(item) => item._id}
                  data={data}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      activeOpacity={0.8}
                      style={styles.optionItem}
                      onPress={() => onSelect(item)}
                    >
                      <Text>{item.category}</Text>
                    </TouchableOpacity>
                  )}
                  ItemSeparatorComponent={() => (
                    <View style={styles.separator} />
                  )}
                />
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  optionItem: {
    height: 40,
    justifyContent: "flex-start",
  },
  separator: {
    height: 4,
  },
  options: {
    position: "absolute",
    backgroundColor: "white",
    marginTop: 110,
    width: "30%",
    padding: 10,
    borderRadius: 6,
    maxHeight: 200,
    right: 0
  },
  text: {
    fontSize: 13,
    opacity: 0.8,
    flexShrink: 1
  },
  button: {
    height: 32,
    gap: 10,
    justifyContent:"space-between",
    backgroundColor: "#EEEEEE",
    flexDirection: "row",
    width: 150,
    alignItems: "center",
    paddingHorizontal: 15,
    borderRadius: 4,
    paddingTop:4,
    paddingBottom: 4
  },
});
