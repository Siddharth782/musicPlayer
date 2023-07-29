import { NavigationContainer } from '@react-navigation/native';
import EntryStackNav from './navigation/stackNav/EntryStackNav';
import { CurrentSong } from './components/CurrentStatus';
import SongPlayer from './components/SongPlayer';
import BottomNavigator from './components/BottomNavigator';

const App = () => {
  return (
    <CurrentSong>
      <NavigationContainer>
        <EntryStackNav/>
      </NavigationContainer>
      <SongPlayer/>
      {/* <BottomNavigator/> */}
    </CurrentSong>
  );
}



export default App;
