import React from 'react';
import {View, Text} from 'react-native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Home from '../Screens/Home';
import Signup from '../Screens/Signup';
import Chat from '../Screens/Chat';

import AsyncStorage from '@react-native-async-storage/async-storage';

const Stack = createNativeStackNavigator();
const HomeStack = createNativeStackNavigator();

function HomeStackContainer() {
  return (
    <HomeStack.Navigator
      screenOptions={{
        headerShown: false,
      }}>
      <HomeStack.Screen
        name="Home"
        component={Home}
        options={{
          headerShown: false,
          title: 'Chats',
          headerTitleStyle: {
            fontWeight: '400',
            fontFamily: Platform.OS == 'android' ? 'roboto' : null,
          },
        }}
      />
      <HomeStack.Screen
        name="Chat"
        component={Chat}
        options={{
          headerShown: false,
        }}
      />
    </HomeStack.Navigator>
  );
}

const Routes = () => {
  const [data, setData] = React.useState(false);
  const [isLoading, setLoading] = React.useState(true);
  const [initRoute, setInitRoute] = React.useState(null);

  React.useEffect(async () => {
    let tokenObj = await AsyncStorage.getItem('token');
    if (tokenObj) {
      setInitRoute('Home');

      setData(true);
      setLoading(false);
    } else {
      setInitRoute('Signup');

      setData(false);
      setLoading(false);
    }
  }, []);

  if (isLoading) {
    return null;
  }

  return (
    <Stack.Navigator initialRouteName={initRoute}>
      <Stack.Screen
        name="Home"
        component={HomeStackContainer}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Signup"
        component={Signup}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
};

export default Routes;
