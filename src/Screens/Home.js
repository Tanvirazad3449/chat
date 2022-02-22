import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNRestart from 'react-native-restart';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

const Home = ({ navigation }) => {
  const [data, setData] = React.useState([]);
  const [userData, setUserData] = React.useState();

  React.useEffect(() => {
    configureGoogleSign()
    getLocalToken();
    getUsers();
  }, []);

  const renderData = ({ item, index }) => {
    return (
      userData.user.uid === item.uid ? null :
        <TouchableOpacity
          onPress={() => navigation.navigate('Chat', { data: item })}
          style={{ margin: 10, paddingLeft: 0, paddingBottom: 5, backgroundColor:"white", flexDirection:"row", alignItems:"center"}}>  
          <Image
            style={{ height: 40, width: 40, borderRadius: 20, borderWidth: 1, borderColor: "grey", marginRight:10 }}
            source={{
              uri: item.photoURL,
            }}
          />    
          <View>    
          <Text style={{ fontSize: 16, fontWeight: 'bold' }}>
            {item?.displayName}
          </Text>
          {item?.latestMessage?.text ? (
            <Text>{item?.latestMessage?.text}</Text>
          ) : (
            <Text>{item.email}</Text>
          )}
          </View>
        </TouchableOpacity>

    );
  };
  getUsers = async () => {
    const unsubscribe = firestore()
      .collection('Users')
      .onSnapshot(querySnapshot => {
        const threads = querySnapshot.docs.map(documentSnapshot => {
          return {
            _id: documentSnapshot.id,
            latestMessage: {
              text: '',
            },
            ...documentSnapshot.data(),
          };
        });
        console.log("Users signed in")

        console.log(threads)
        setData(threads);
      });

    return () => {
      unsubscribe();
    };
  }

  function configureGoogleSign() {
    console.log("Config Google Sign In")
    GoogleSignin.configure({
      webClientId: "541086532591-1sqd1anc13e3lo8m750dgij1f0pbtj0q.apps.googleusercontent.com",
      offlineAccess: false,
      profileImageSize: 120,
    });
  }
  getLocalToken = async () => {
    AsyncStorage.getItem('token').then(res => {
      setUserData(JSON.parse(res));
      console.log("**********************")

      console.log(JSON.parse(res))
    });
  }
  signOut = async () => {
    Alert.alert(
      "Confirm",
      "Do you want to sign out?",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel"
        },
        { text: "OK", onPress: async() => {
          await GoogleSignin.signOut();
        AsyncStorage.clear();
        RNRestart.Restart(); 
      }}
      ]
    )}
    
  


  return (
    <View style={{backgroundColor:"white", flex:1}}>
    {userData?.user?.uid &&
      <View style={{ height: 50, backgroundColor: "white", elevation: 5, justifyContent: 'space-between', flexDirection: "row", alignItems: "center", paddingHorizontal: 15 }}>
        <Text style={{ fontWeight: "bold", fontSize: 18, color: "black" }}>Chats</Text>
        <TouchableOpacity onPress={() => signOut()}>
          <Image
            style={{ height: 30, width: 30, borderRadius: 20, borderWidth: 1, borderColor: "grey" }}
            source={{
              uri: userData.user.photoURL,
            }}
          />

        </TouchableOpacity>
      </View>
    }
      <FlatList
        data={data}
        renderItem={renderData}
      />
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    paddingTop: 50,
  },
  stretch: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },
});
export default Home;
