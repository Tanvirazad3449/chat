import React from 'react';
import {View, Text, FlatList, TouchableOpacity, StyleSheet, Image} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Home = ({navigation}) => {
  const [data, setData] = React.useState([]);
  const [userData, setUserData] = React.useState();

  React.useEffect(() => {
    AsyncStorage.getItem('token').then(res => {      
      setUserData(JSON.parse(res));
    });
    
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
  }, []);

  const renderData = ({item, index}) => {
    return (
      userData.user.uid === item.uid ? null :
      <TouchableOpacity
        onPress={() => navigation.navigate('Chat', {data: item})}
        style={{margin: 10, paddingLeft: 20, paddingBottom:5,borderBottomWidth: 1, borderBottomColor:"grey"}}>
        {/* <Image
        style={styles.stretch}
        source={{
          uri: 'https://reactnative.dev/img/tiny_logo.png',
        }}
      /> */}
        <Text style={{fontSize: 16, fontWeight: 'bold'}}>
          {item?.displayName}
        </Text>
        {item?.latestMessage?.text ? (
          <Text>{item?.latestMessage?.text}</Text>
        ) : (
          <Text>{item.email}</Text>
        )}
      </TouchableOpacity>
        
    );
  };

  return (
    <FlatList
      data={data}
      renderItem={renderData}      
    />
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
