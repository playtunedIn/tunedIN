import React from 'react';
import { Layout, Text, Button, Avatar } from '@ui-kitten/components';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types/types'; // Adjust the path based on where you placed the types.ts file


type WelcomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Welcome'>;

interface Props {
  navigation: WelcomeScreenNavigationProp;
}

const WelcomeScreen: React.FC<Props> = ({ navigation }) => {
    return (
        <Layout style={{ flex: 1, justifyContent: 'space-between', padding: 16 }}>
            <Layout style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text category="h1">App Title</Text>
                <Avatar source={{ uri: 'https://path-to-your-profile-picture.com' }} />
            </Layout>

            <Layout style={{ padding: 16, borderRadius: 10, backgroundColor: 'white' }}>
                <Text category="h5">Welcome to tunedIN Haley!</Text>
                <Text style={{ marginVertical: 10 }}>
                    You have successfully signed in with your Spotify account. Now lets get playing!
                </Text>
                <Button onPress={() => navigation.navigate('PartyPlay')}>Play</Button>
            </Layout>

            <Text style={{ textAlign: 'center' }}>Footer</Text>
        </Layout>
    );
};

export default WelcomeScreen;
