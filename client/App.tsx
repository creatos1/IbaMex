import { StyleSheet, View } from 'react-native';
import Layout from './src/components/Layout';
import Section from './src/components/Section';

export default function App() {
  return (
    <Layout>
      <Section 
        title="Sección 1" 
        content="Contenido de la primera sección" 
      />
      <Section 
        title="Sección 2" 
        content="Contenido de la segunda sección" 
      />
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});