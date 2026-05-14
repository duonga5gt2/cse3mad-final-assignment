import { useEffect, useRef } from "react";
import { Platform, StyleSheet, View } from "react-native";
import MapView, {
  Marker,
  PROVIDER_DEFAULT,
  PROVIDER_GOOGLE,
} from "react-native-maps";

type MapCoordinate = {
  latitude: number;
  longitude: number;
};

type MapScreenProps = {
  coordinate?: MapCoordinate;
  markerTitle?: string;
};

const DEFAULT_COORDINATE = {
  latitude: -33.8688,
  longitude: 151.2093,
};

const REGION_DELTA = {
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

export default function MapScreen({
  coordinate = DEFAULT_COORDINATE,
  markerTitle = "Pickup location",
}: MapScreenProps) {
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    mapRef.current?.animateToRegion(
      {
        ...coordinate,
        ...REGION_DELTA,
      },
      300,
    );
  }, [coordinate]);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={Platform.OS === "android" ? PROVIDER_GOOGLE : PROVIDER_DEFAULT}
        style={styles.map}
        initialRegion={{
          ...coordinate,
          ...REGION_DELTA,
        }}
        pitchEnabled={false}
        rotateEnabled={false}
        scrollEnabled={false}
        toolbarEnabled={false}
        zoomControlEnabled={false}
        zoomEnabled={false}
      >
        <Marker
          coordinate={coordinate}
          title={markerTitle}
        />
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: "100%",
    height: "100%",
  },
});
