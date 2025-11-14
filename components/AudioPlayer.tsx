import React from 'react';

interface AudioPlayerProps {
  src: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ src }) => {
  return (
    <audio controls src={src} className="w-full h-10">
      Your browser does not support the audio element.
    </audio>
  );
};

export default AudioPlayer;
