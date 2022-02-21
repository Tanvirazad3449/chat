import * as React from 'react';
import {View, Text} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import Route from './src/Route/index';
export default function App() {
  return (
    <NavigationContainer>
      <Route />
    </NavigationContainer>
  );
}
