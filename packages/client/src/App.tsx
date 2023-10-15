import { registerRootComponent } from 'expo';
import { MultiplayerProvider } from '@hooks/multiplayer';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import SocketStatus from '@components/common/SocketStatus';
import './App.css';

export default function App() {
  return (
    <MultiplayerProvider>
      <>
        <SocketStatus />
        <View style={styles.container}>
          <Text>Open up App.js to start working on your app!</Text>
          <StatusBar style="auto" />
        </View>
      </>
    </MultiplayerProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

registerRootComponent(App);
