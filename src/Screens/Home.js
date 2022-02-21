import React from 'react';
import {View, Text, FlatList, TouchableOpacity} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Home = ({navigation}) => {
  const [data, setData] = React.useState([]);
  const [userData, setUserData] = React.useState();

  React.useEffect(() => {
    AsyncStorage.getItem('token').then(res => {
      console.log("TOKEN----------------------")

      console.log(JSON.parse(res))
      setUserData(JSON.parse(res));
    });
    
    const unsubscribe = firestore()
      .collection('Users')

      .onSnapshot(querySnapshot => {
        const threads = querySnapshot.docs.map(documentSnapshot => {
          return {
            _id: documentSnapshot.id,
            // give defaults

            latestMessage: {
              text: '',
            },
            ...documentSnapshot.data(),
          };
        });
        console.log("THREADS----------------------")
        console.log(threads)

        setData(threads);
      });

    /**
     * unsubscribe listener
     */
    return () => {
      unsubscribe();
    };
  }, []);

  const renderData = ({item, index}) => {
    return (
      userData.user.uid === item.uid ? null :
      <TouchableOpacity
        onPress={() => navigation.navigate('Chat', {data: item})}
        style={{margin: 10, paddingLeft: 20}}>
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
      ItemSeparatorComponent={() => (
        <View
          style={{
            height: 0.5,
            width: '100%',
            backgroundColor: '#7a7e83',
            marginTop: 5,
          }}
        />
      )}
    />
  );
};

export default Home;
