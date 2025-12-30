import { NavigationContainer } from '@react-navigation/native';
import EntryStackNav from './navigation/stackNav/EntryStackNav';
import { PlayerProvider } from './context/PlayerContext';
import SongPlayer from './components/SongPlayer';
import BottomNavigator from './components/BottomNavigator';
import { AuthProvider } from './context/AuthContext';


const App = () => {
  return (
    <AuthProvider>
      <PlayerProvider>
        <NavigationContainer>
          <EntryStackNav />
        </NavigationContainer>
        <SongPlayer />
        {/* <BottomNavigator />  */}
      </PlayerProvider>
    </AuthProvider>
  );
};

export default App;