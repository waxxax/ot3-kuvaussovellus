import { StatusBar } from 'expo-status-bar';
import { Image, StyleSheet, View } from 'react-native';
import {
  Appbar,
  IconButton,
  PaperProvider,
  Text,
  Dialog,
  TextInput,
  Button,
  Portal
} from 'react-native-paper';
import {
  CameraView,
  useCameraPermissions,
  CameraCapturedPicture
} from 'expo-camera';
import { useRef, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Kuvaustiedot-tyyppi
interface Kuvaustiedot {
  kuvaustila?: boolean;
  virhe: string;
  kuva?: CameraCapturedPicture;
  nimi: string;
  dialogi: boolean;
  info: string;
}

const App: React.FC = (): React.ReactElement => {
  const [kameraLupa, pyydaKameraLupa] = useCameraPermissions();
  const kameraRef = useRef<CameraView | null>(null);
  const [kuvaustiedot, setKuvaustiedot] = useState<Kuvaustiedot>({
    kuvaustila: false,
    virhe: "",
    nimi: "",
    info: "",
    dialogi: false
  });

  const kaynnistaKamera = async () => {
    await pyydaKameraLupa();
    setKuvaustiedot((prev) => ({
      ...prev,
      kuvaustila: kameraLupa?.granted,
      virhe: !kameraLupa?.granted ? "Ei lupaa kameran käyttöön." : ""
    }));
  };

  const otaKuva = async () => {
    if (!kameraRef.current) return;

    const kuva = await kameraRef.current.takePictureAsync();

    setKuvaustiedot(prev => ({
      ...prev,
      kuvaustila: false,
      kuva,
      info: "",
      dialogi: true
    }));
  };

  const lahetaPalvelimelle = async () => {
    if (!kuvaustiedot.kuva || !kuvaustiedot.nimi) return;

    const formData = new FormData();
    formData.append('image', {
      uri: kuvaustiedot.kuva.uri,
      type: 'image/jpeg',
      name: `${kuvaustiedot.nimi}.jpg`
    } as any);

    await fetch('http://<IP-OSOITE>:3000/upload', {
      method: 'POST',
      body: formData,
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    setKuvaustiedot({
      kuvaustila: false,
      virhe: "",
      kuva: undefined,
      nimi: "",
      info: "Kuva lähetetty!",
      dialogi: false
    });
  };

  const aloitusNakyma = () => (
    <>
      <Appbar.Header>
        <Appbar.Content title="Kuvaussovellus" />
        <IconButton icon="camera" onPress={kaynnistaKamera} />
      </Appbar.Header>
      <View style={styles.container}>
        {kuvaustiedot.virhe && <Text>{kuvaustiedot.virhe}</Text>}
        {kuvaustiedot.kuva && (
          <>
            <Image
              source={{ uri: kuvaustiedot.kuva.uri }}
              style={styles.kuva}
            />
            <Text style={styles.nimi}>{kuvaustiedot.nimi}</Text>
            <Button mode="contained" onPress={lahetaPalvelimelle}>
              Lähetä palvelimelle
            </Button>
          </>
        )}
        <Text>{kuvaustiedot.info}</Text>
        <StatusBar style="auto" />
      </View>
    </>
  );

  const kameraNakyma = () => (
    <CameraView style={styles.kuvaustila} ref={kameraRef}>
      {kuvaustiedot.info && (
        <Text style={{ color: "#fff" }}>{kuvaustiedot.info}</Text>
      )}
      <Button icon="camera" mode="contained" onPress={otaKuva}>
        Ota kuva
      </Button>
      <Button icon="close" onPress={() => setKuvaustiedot({ ...kuvaustiedot, kuvaustila: false })}>
        Peruuta
      </Button>
    </CameraView>
  );

  return (
    <SafeAreaProvider>
      <PaperProvider>
        {!kuvaustiedot.kuvaustila ? aloitusNakyma() : kameraNakyma()}
        <Portal>
          <Dialog
            visible={kuvaustiedot.dialogi}
            onDismiss={() => setKuvaustiedot({ ...kuvaustiedot, dialogi: false })}
          >
            <Dialog.Title>Anna kuvalle nimi</Dialog.Title>
            <Dialog.Content>
              <TextInput
                label="Esim. keittiö"
                value={kuvaustiedot.nimi}
                onChangeText={(nimi) => setKuvaustiedot({ ...kuvaustiedot, nimi })}
              />
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setKuvaustiedot({ ...kuvaustiedot, dialogi: false })}>
                OK
              </Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </PaperProvider>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16
  },
  kuvaustila: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  kuva: {
    width: 300,
    height: 400,
    resizeMode: 'contain',
    marginBottom: 8
  },
  nimi: {
    fontSize: 16,
    marginBottom: 16
  }
});

export default App;
