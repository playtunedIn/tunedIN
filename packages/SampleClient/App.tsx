import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './src/Component/LoginScreen';
import WelcomeScreen from './src/Component/WelcomeScreen';
import PartyPlayScreen from './src/Component/PartyPlayScreen';

type RootStackParamList = {
  Login: undefined;
  Welcome: undefined;
  PartyPlay: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const App: React.FC = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="Login">
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="Welcome" component={WelcomeScreen} />
                <Stack.Screen name="PartyPlay" component={PartyPlayScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default App;
