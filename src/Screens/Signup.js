import React, { useState } from 'react';
import { View, Text, SafeAreaView, StyleSheet, Button, Image } from 'react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';
import { CommonActions } from '@react-navigation/native';
import {
  LoginButton,
  AccessToken,
  GraphRequest,
  GraphRequestManager,
} from 'react-native-fbsdk';

const Signup = ({ navigation }) => {
  const [userName, setUserName] = useState('');
  const [token, setToken] = useState('');
  const [profilePic, setProfilePic] = useState('');
  React.useEffect(() => {
    configureGoogleSign();
  }, []);

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

  const getFBInfo = (error, result) => {
    if (error) {
      //Alert for the Error
      alert('Error fetching data: ' + error.toString());
    } else {
      var fbRes =
      {
        _id: result.id,
        displayName: result.name,
        email: "Facebook Login",
        latestMessage: {
          text: ""
        },
        photoURL: result.picture.data.url,
        uid: result.id
      }

      AsyncStorage.setItem('token', JSON.stringify(fbRes))
        .then(res1 =>
          firestore()
            .collection('Users')
            .doc(result.id)
            .set({
              displayName: result.name,
              email: "Facebook Login",
              uid: result.id,
              photoURL: result.picture.data.url
            })
            .then(() => {
              navigation.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [{ name: 'Home' }],
                }),
              );
            }),
        ),

        //response alert
        console.log(JSON.stringify(result));
      // setUserName('Welcome ' + result.name);
      // setToken('User Token: ' + result.id);
      // setProfilePic(result.picture.data.url);
    }
  };

  const onLogout = () => {
    //Clear the state after logout
    setUserName(null);
    setToken(null);
    setProfilePic(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      
      <Image
        style={{ height: 100, width: 100 }}
        source={require("./../Asset/logo.png")}
      />
<View>
      <Button
        title="Google Sign-In"
        onPress={() =>
          onGoogleButtonPress().then(res =>
            AsyncStorage.setItem('token', JSON.stringify(res.user)).then(res1 =>
              firestore()
                .collection('Users')
                .doc(res.user.uid)
                .set({
                  displayName: res.user.displayName,
                  email: res.user.email,
                  uid: res.user.uid,
                  photoURL: res.user.photoURL
                })
                .then(() => {
                  console.log(res)
                  navigation.dispatch(
                    CommonActions.reset({
                      index: 0,
                      routes: [{ name: 'Home' }],
                    }),
                  );
                }),
            ),
          )
        }
      />
      <View style={{height:20}}/>
      <LoginButton
        readPermissions={['public_profile']}
        onLoginFinished={(error, result) => {
          if (error) {
            alert(error);
            console.log('Login has error: ' + result.error);
          } else if (result.isCancelled) {
            alert('Login is cancelled.');
          } else {
            AccessToken.getCurrentAccessToken().then((data) => {
              AsyncStorage.setItem('fb_access_token', data.accessToken.toString())
              console.log(data.accessToken.toString());
              const processRequest = new GraphRequest(
                '/me?fields=name,picture.type(large)',
                null,
                getFBInfo,
              );
              // Start the graph request.
              new GraphRequestManager()
                .addRequest(processRequest).start();
            });
          }
        }}
        onLogoutFinished={onLogout}
      />
      </View>
    </SafeAreaView>
  );

};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: "white",
    paddingVertical: 30
  },
  textStyle: {
    fontSize: 20,
    color: '#000',
    textAlign: 'center',
    padding: 10,
  },
  imageStyle: {
    width: 200,
    height: 300,
    resizeMode: 'contain',
  },
  titleText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 20,
  },
  footerHeading: {
    fontSize: 18,
    textAlign: 'center',
    color: 'grey',
  },
  footerText: {
    fontSize: 16,
    textAlign: 'center',
    color: 'grey',
  },
});

export default Signup;
