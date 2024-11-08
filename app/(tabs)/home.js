import { Link } from "expo-router";
import { TouchableOpacity } from "react-native";
import { Text, View } from "react-native";
import { useAuthContext } from "../../context/AuthProvider";

export default function Index() {
  const { logout } = useAuthContext();
  return (
    <View
    className="flex-1 items-center justify-center bg-black"
    >
      <Text 
    className="text-2xl text-white font-montserrat-regular">Edit app/index.tsx to edit this screen.</Text>

      {/* <Link href="/login">
        Login
      </Link> */}

      <TouchableOpacity onPress={()=>{
        logout();
      }}>
          <Text className="text-white">Logout</Text>
      </TouchableOpacity>
    </View>
  );
}
