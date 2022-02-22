import React from 'react';
import { View, Text, SafeAreaView, StyleSheet, Button , Image} from 'react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';
import { CommonActions } from '@react-navigation/native';

const Signup = ({ navigation }) => {
  React.useEffect(() => {
    call()
  }, []);

function call (){
  configureGoogleSign();

}
  function configureGoogleSign() {
    console.log("Config Google Sign In")
    GoogleSignin.configure({
      webClientId: "541086532591-1sqd1anc13e3lo8m750dgij1f0pbtj0q.apps.googleusercontent.com",
      offlineAccess: false,
      profileImageSize: 120,
    });
  }

  async function onGoogleButtonPress() {
    const { idToken } = await GoogleSignin.signIn();
    const googleCredential = auth.GoogleAuthProvider.credential(idToken);
    return auth().signInWithCredential(googleCredential);
  }


  return (
    <SafeAreaView style={styles.container}>
    <Image
        style={{height:100, width:100}}
        source={require("./../Asset/logo.png")}
      />
      
      <Button
        title="Google Sign-In"
        onPress={() =>
          onGoogleButtonPress().then(res =>
            AsyncStorage.setItem('token', JSON.stringify(res)).then(res1 =>
              firestore()
                .collection('Users')
                .doc(res.user.uid)
                .set({
                  displayName: res.user.displayName,
                  email: res.user.email,
                  uid: res.user.uid,
                  photoURL:res.user.photoURL
                })
                .then(() => {
                  console.log(res)
                  navigation.dispatch(
                    CommonActions.reset({
                      index: 0,
                      routes: [{name: 'Home'}],
                    }),
                  );
                }),
            ),
          )
        }
      />
    </SafeAreaView>
  );

};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor:"white",
    paddingVertical:30
  },
});

export default Signup;
