// pages/TestPage.tsx
import { PlaylistPlaybackTest } from '@/components/PlaylistPlaybackTest';
import { BackendTest } from '@/components/BackendTest';

const TestPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/10 to-black">
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        <BackendTest />
        <PlaylistPlaybackTest />
      </div>
    </div>
  );
};

export default TestPage; 