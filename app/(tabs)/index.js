import { Link } from "expo-router";
import { Text, View } from "react-native";

export default function Index() {
  return (
    <View
    className="flex-1 items-center justify-center bg-black"
    >
      <Text 
    className="text-2xl text-white font-montserrat-regular">Edit app/index.tsx to edit this screen.</Text>

      <Link href="/login">
        Login
      </Link>
    </View>
  );
}
