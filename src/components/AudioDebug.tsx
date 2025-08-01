import { usePlayer } from '@/contexts/PlayerContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AudioDebug() {
  const { 
    currentTrack, 
    queue, 
    currentIndex, 
    isRepeatMode, 
    isShuffleMode,
    toggleRepeat,
    toggleShuffle,
    nextTrack,
    prevTrack
  } = usePlayer();

  if (!currentTrack) {
    return (
      <Card className="cyber-card">
        <CardHeader>
          <CardTitle>🎵 Audio Debug</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400">No hay canción seleccionada</p>
        </CardContent>
      </Card>
    );
  }

  const testAudioUrl = () => {
    if (currentTrack.audio) {
      console.log('🎵 Testing audio URL:', currentTrack.audio);
      const audio = new Audio(currentTrack.audio);
      
      audio.addEventListener('loadstart', () => console.log('✅ Audio load started'));
      audio.addEventListener('canplay', () => console.log('✅ Audio can play'));
      audio.addEventListener('error', (e) => console.error('❌ Audio error:', e));
      audio.addEventListener('stalled', () => console.warn('⚠️ Audio stalled'));
      
      audio.play()
        .then(() => console.log('✅ Audio playing successfully'))
        .catch(err => console.error('❌ Audio play failed:', err));
        
      setTimeout(() => {
        audio.pause();
        console.log('⏸️ Audio paused for test');
      }, 2000);
    }
  };

  return (
    <Card className="cyber-card">
      <CardHeader>
        <CardTitle>🎵 Audio Debug</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm font-medium">Current Track:</p>
          <p className="text-xs text-gray-400">{currentTrack.name} - {currentTrack.artist_name}</p>
        </div>
        
        <div>
          <p className="text-sm font-medium">Audio URL:</p>
          <p className="text-xs text-gray-400 break-all">{currentTrack.audio || 'No audio URL'}</p>
        </div>
        
        <div>
          <p className="text-sm font-medium">Queue Info:</p>
          <p className="text-xs text-gray-400">
            Position: {currentIndex + 1} / {queue.length}
          </p>
          <p className="text-xs text-gray-400">
            Repeat: {isRepeatMode ? '🔁 On' : '🔁 Off'} | 
            Shuffle: {isShuffleMode ? '🔀 On' : '🔀 Off'}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={prevTrack}
            size="sm"
            variant="outline"
          >
            ⏮️ Prev
          </Button>
          <Button 
            onClick={nextTrack}
            size="sm"
            variant="outline"
          >
            ⏭️ Next
          </Button>
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={toggleRepeat}
            size="sm"
            variant={isRepeatMode ? "default" : "outline"}
          >
            🔁 Repeat
          </Button>
          <Button 
            onClick={toggleShuffle}
            size="sm"
            variant={isShuffleMode ? "default" : "outline"}
          >
            🔀 Shuffle
          </Button>
        </div>
        
        <Button 
          onClick={testAudioUrl}
          className="w-full"
          variant="outline"
        >
          🧪 Test Audio URL
        </Button>
      </CardContent>
    </Card>
  );
}
