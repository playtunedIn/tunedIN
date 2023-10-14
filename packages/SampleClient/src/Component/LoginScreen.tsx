import React from 'react';
import { Layout, Text, Button } from '@ui-kitten/components';
import { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
  Login: undefined;
  Welcome: undefined;
  PartyPlay: undefined;
};

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

interface Props {
  navigation: LoginScreenNavigationProp;
}

const LoginScreen: React.FC<Props> = ({ navigation }) => {
    return (
        <Layout style={{ flex: 1, justifyContent: 'space-between', padding: 16 }}>
            <Text category="h1" style={{ textAlign: 'center' }}>App Title</Text>

            <Layout style={{ padding: 16, borderRadius: 10, backgroundColor: 'white' }}>
                <Text category="h5">Welcome to tunedIN</Text>
                <Text style={{ marginVertical: 10 }}>
                    tunedIN uses your Spotify music history to create a fun and interactive game for you and your friends! Click the button below to link your Spotify account now.
                </Text>
                <Button onPress={() => navigation.navigate('Welcome')}>Link Spotify Account</Button>
            </Layout>

            <Text style={{ textAlign: 'center' }}>Footer</Text>
        </Layout>
    );
};

export default LoginScreen;
