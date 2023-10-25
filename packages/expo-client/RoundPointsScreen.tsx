import { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';
import { View, Text } from 'react-native';
import { Button, Avatar, Input, Icon } from 'react-native-elements';
import { RootStackParamList } from './navigationTypes';
import styles from './styles';

type RoundPointsNavigationProp = StackNavigationProp<RootStackParamList, 'RoundResults'>;

type RoundPointsProps = {
  navigation: RoundPointsNavigationProp;
};

export function RoundPointsScreen({ navigation }: RoundPointsProps) {
  return (
    <View style={styles.container}>

<View style={styles.headerContainer}>
        <Text style={styles.logoText}>tuned<Text style={styles.logoIN}>IN</Text></Text>
        <Icon name="music-note" size={30} color="#000" />
      </View>

      <View style={styles.contentContainer}>
        <Text style={styles.welcomeText}>Party Play</Text>
        <Text style={styles.descriptionText}>1. Which player has this song queued up?</Text>
        <Text></Text>
        <Text>Haley 150 </Text>
        <Text>Matt 000</Text>
        <Text>Shayne 100</Text>
        <Text>Trevor 100</Text> 
        <Text></Text>
        <Button title="SessionWinner" buttonStyle={styles.playButton} onPress={() => navigation.navigate('SessionWinner')}/>
      </View>

      <View style={styles.socialIconsContainer}>
          <Icon name="facebook" type="font-awesome" color="#3b5998" size={24} />
          <Icon name="instagram" type="font-awesome" color="#C13584" size={24} style={styles.iconSpacing} />
          <Icon name="snapchat" type="font-awesome" color="#FFFC00" size={24} style={styles.iconSpacing} />
          <Icon name="spotify" type="font-awesome" color="#1DB954" size={24} style={styles.iconSpacing} />
      </View>
      <Text style={styles.footerText}>COPYRIGHT © 2023 TUNEDIN</Text>
    </View>
  );
}
