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
  React.useEffect(async () => {
    AsyncStorage.getItem('token').then(res => {
      setUserData(JSON.parse(res));
    });
    const messagesListener = firestore()
      .collection('Users')
      .doc(chatData._id)
      .collection('MESSAGES')
      .orderBy('createdAt', 'desc')
      .onSnapshot(querySnapshot => {
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
        setSeenMessages(messages[0]?.createdAt);
        setMessages(messages);
      });
    if (messages.length >= 1) {
      await firestore().collection('Users').doc(chatData._id).set(
        {
          lastSeenTimestamp: seenMessages,
        },
        {merge: true},
      );
    }
    return () => {
      messagesListener();
    };
  }, []);

  async function handleSend(messages, image, pdf) {
    const text = messages[0]?.text || chatText[0]?.text;
    firestore()
      .collection('Users')
      .doc(chatData._id)
      .collection('MESSAGES')
      .add({
        text: text ? text : '',
        createdAt: new Date().getTime(),
        system: false,
        sentBy: userData?.user?.uid,
        name: userData?.user?.displayName,
        user: {
          _id: userData?.user?.uid,
        },
      });

    await firestore()
      .collection('Users')
      .doc(chatData._id)
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
    <GiftedChat
      messages={messages}
      keyboardShouldPersistTaps={'handled'}
      isTyping={true}
      renderUsernameOnMessage={true}
      renderAvatar={null}
      onSend={messages => {
        setText(messages);
        handleSend(messages);
      }}
      user={{
        _id: userData?.user?.uid,
      }}
    />
  );
};

export default Chat;
