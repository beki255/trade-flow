import React from 'react';
import { View, StyleSheet, Image } from 'react-native';

export const CorridorIsometricIllustration: React.FC = () => {
  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/slide1_corridor.png')}
        style={styles.image}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
