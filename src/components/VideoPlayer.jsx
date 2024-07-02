import React, { useEffect, useRef, useState } from "react";
import { Player, BigPlayButton, LoadingSpinner, ControlBar } from "video-react";
import "video-react/dist/video-react.css";

const VideoPlayer = ({
  src,
  onPlayerChange,
  onChange,
  startTime = undefined,
  className,
  isPlaying,
  setIsPlaying,
  onLoadedData,
  playbackRate = 1,
}) => {
  const [player, setPlayer] = useState();
  const [playerState, setPlayerState] = useState(undefined);
  const [source, setSource] = useState();

  useEffect(() => {
    setSource(URL.createObjectURL(src));
  }, [src]);

  useEffect(() => {
    if (playerState) {
      onChange(playerState);
    }
  }, [playerState, onChange]);

  useEffect(() => {
    onPlayerChange(player);
    if (player) {
      player.subscribeToStateChange(setPlayerState);

      // 비디오 로드 시 호출
      player.video.video.addEventListener("loadeddata", onLoadedData);
      return () => {
        player.video.video.removeEventListener("loadeddata", onLoadedData);
      };
    }
  }, [player]);

  useEffect(() => {
    if (player) {
      if (isPlaying) {
        player.play();
      } else {
        player.pause();
      }
    }
  }, [isPlaying, player]);

  useEffect(() => {
    if (player) {
      player.video.video.playbackRate = playbackRate;
    }
  }, [playbackRate, player]);

  const handlePlay = () => {
    setIsPlaying(true);
  };

  return (
    <div
      className={`video-wrapper ${className}`}
      style={{ width: "70%", height: "100%" }}
      onClick={handlePlay}
    >
      <Player
        ref={(player) => {
          setPlayer(player);
        }}
        startTime={startTime}
        src={source}
      >
        <source src={source} />
        <BigPlayButton position="center" />

        <LoadingSpinner />
        <ControlBar disableCompletely></ControlBar>
      </Player>
    </div>
  );
};

export default VideoPlayer;
