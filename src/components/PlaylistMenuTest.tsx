import { useState } from 'react';
import { Track } from '@/types/music';
import PlaylistMenu from './PlaylistMenu';

// Track de prueba
const testTrack: Track = {
  id: 'test-1',
  name: 'Test Song',
  duration: '180',
  artist_id: 'artist-1',
  artist_name: 'Test Artist',
  artist_idstr: 'artist-1',
  album_id: 'album-1',
  album_name: 'Test Album',
  album_image: '/placeholder.svg',
  album_images: {
    size25: '/placeholder.svg',
    size50: '/placeholder.svg',
    size100: '/placeholder.svg',
    size130: '/placeholder.svg',
    size200: '/placeholder.svg',
    size300: '/placeholder.svg',
    size400: '/placeholder.svg',
    size500: '/placeholder.svg',
    size600: '/placeholder.svg',
  },
  license_ccurl: '',
  position: 0,
  releasedate: '',
  album_datecreated: '',
  prourl: '',
  shorturl: '',
  shareurl: '',
  audio: '',
  audiodownload: '',
  audiodlallowed: false,
  image: '/placeholder.svg',
  waveform: '',
  proaudio: '',
  tags: { genres: [], instruments: [], vartags: [] },
};

export default function PlaylistMenuTest() {
  return (
    <div className="p-8 bg-gray-900 min-h-screen">
      <div className="max-w-md mx-auto">
        <h2 className="text-white text-xl mb-4">Prueba del Menú de Playlists</h2>
        
        <div className="bg-black/20 backdrop-blur-sm border border-purple-500/30 rounded-lg p-4">
          <div className="text-white mb-4">
            <h3 className="font-semibold">{testTrack.name}</h3>
            <p className="text-gray-400">{testTrack.artist_name}</p>
          </div>
          
          <div className="bg-black/90 backdrop-blur-sm border border-purple-500/30 rounded-md p-1">
            <div className="text-white hover:bg-purple-500/20 px-2 py-1.5 rounded-sm cursor-pointer">
              Añadir a la cola
            </div>
            
            <div className="h-px bg-purple-500/30 my-1" />
            
            <PlaylistMenu track={testTrack} />
            
            <div className="h-px bg-purple-500/30 my-1" />
            
            <div className="text-white hover:bg-purple-500/20 px-2 py-1.5 rounded-sm cursor-pointer">
              Me gusta
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 