import React from 'react';
import {View, Text} from 'react-native';
import {GiftedChat, Bubble, Actions, Send} from 'react-native-gifted-chat';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Chat = routes => {
  const [chatData, setChatData] = React.useState(routes.route.params.data);
  const [chatText, setText] = React.useState('');
  const [messages, setMessages] = React.useState([]);
  const [seenMessages, setSeenMessages] = React.useState('');
  const [userData, setUserData] = React.useState();

  async function getToken() {
    AsyncStorage.getItem('token').then(async res => {
    setUserData(JSON.parse(res))
    userId = JSON.parse(res)?.user?.uid
    friendId = routes.route.params.data.uid
    const docid  = friendId > userId ? userId + "-" + friendId : friendId +"-" + userId 
    console.log("this is docid--------------------------------------------");

console.log(docid);
    getMessages(docid)
    //getMessages(JSON.parse(res)?.user?.uid + "-" + routes.route.params.data.uid)
    })
  }

  async function getMessages(doc_name) {
    console.log("--------------getting message of ", doc_name);
    const messagesListener = firestore()
        .collection('Chats')
        .doc(doc_name)
        .collection('MESSAGES')
        .orderBy('createdAt', 'desc')
        .onSnapshot(querySnapshot => {
          console.log("this Snapshot------------------------------",querySnapshot);
          const messages = querySnapshot.docs.map(doc => {
            const firebaseData = doc.data();
            const data = {
              _id: doc?.id,
              text: '',
              createdAt: new Date().getTime(),
              ...firebaseData,
            };
  
            if (!firebaseData?.system) {
              data.user = {
                ...firebaseData?.user,
                name: firebaseData?.name,
              };
            }
  
            return data;
          });
          console.log("this is message---------------------", messages);
          setSeenMessages(messages[0]?.createdAt);
          setMessages(messages);
        });
      if (messages.length >= 1) {
        await firestore().collection('Chats').doc(doc_name).set(
          {
            lastSeenTimestamp: seenMessages,
          },
          {merge: true},
        );
      }
      return () => {
        messagesListener();
      };
  }

  React.useEffect(async () => {
    getToken();
    
  }, []);
  async function handleSend(messages, image, pdf) {
    const text = messages[0]?.text || chatText[0]?.text;
    userId = userData?.user?.uid
    friendId = routes.route.params.data.uid
    const docid  = friendId > userId ? userId + "-" + friendId : friendId +"-" + userId 
    firestore()
      .collection('Chats')
      .doc(docid)
      .collection('MESSAGES')
      .add({
        text: text ? text : '',
        createdAt: new Date().getTime(),
        system: false,
        sentTo:routes.route.params.data.uid,
        sentBy: userData?.user?.uid,
        name: userData?.user?.displayName,
        user: {
          _id: userData?.user?.uid,
        },
      });

    await firestore()
      .collection('Chats')
      .doc(docid)
      .set(
        {
          latestMessage: {
            text,
            createdAt: new Date().getTime(),
          },
          lastSeenTimestamp: new Date().getTime(),
        },
        {merge: true},
      );
    setText('');
  }

  console.log(messages);
  return (
    <View style={{ flex: 1 }}>
<View style={{height:50, backgroundColor:"white", elevation:5, justifyContent: 'center',}}>
  <Text style={{fontWeight:"bold", fontSize:18, color:"black", paddingLeft:20}}>{routes.route.params.data.displayName}</Text>
</View>
    <GiftedChat
      messages={messages}
      keyboardShouldPersistTaps={'handled'}
      isTyping={true}
      renderUsernameOnMessage={false}
      renderAvatar={null}
      onSend={messages => {
        setText(messages);
        handleSend(messages);
      }}
      user={{
        _id: userData?.user?.uid,
      }}
    />
    </View>
  );
};

export default Chat;
