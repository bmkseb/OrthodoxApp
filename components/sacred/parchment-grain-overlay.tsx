import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

/** Ultra-subtle parchment grain at ~2% opacity */
export function ParchmentGrainOverlay() {
  return (
    <View style={styles.wrap} pointerEvents="none">
      <View style={styles.baseGrain} />
      <LinearGradient
        colors={[
          'rgba(245, 236, 215, 0.025)',
          'transparent',
          'rgba(245, 236, 215, 0.015)',
          'transparent',
          'rgba(245, 236, 215, 0.02)',
        ]}
        locations={[0, 0.25, 0.5, 0.75, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={['transparent', 'rgba(201, 147, 58, 0.008)', 'transparent']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  baseGrain: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(245, 236, 215, 0.02)',
  },
});
