import React from 'react';
import { Layout, Text, Button, Input, Avatar } from '@ui-kitten/components';

const PartyPlayScreen: React.FC = () => {
    return (
        <Layout style={{ flex: 1, justifyContent: 'space-between', padding: 16 }}>
            <Layout style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text category="h1">App Title</Text>
                <Avatar source={{ uri: 'https://path-to-your-profile-picture.com' }} />
            </Layout>

            <Layout>
                <Text category="h5" style={{ textAlign: 'center' }}>Party Play</Text>
                <Text style={{ marginVertical: 10, textAlign: 'center' }}>
                    Enter Code to Join Room
                </Text>

                <Layout style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Input placeholder="Enter Code" style={{ flex: 1, marginRight: 10 }} />
                    <Button style={{ flex: 0.3 }}>Join</Button>
                </Layout>

                <Text style={{ marginVertical: 10, textAlign: 'center' }}>or</Text>

                <Button>Create Room</Button>
            </Layout>

            <Text style={{ textAlign: 'center' }}>Footer</Text>
        </Layout>
    );
};

export default PartyPlayScreen;
