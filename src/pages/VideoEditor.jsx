import React, { useState, useRef, useEffect } from "react";
import { createFFmpeg } from "@ffmpeg/ffmpeg";
import Stack from "@mui/material/Stack";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";

import VideoPlayer from "../components/VideoPlayer";
import { Button, Modal, Spinner, Toast, ToastContainer } from "react-bootstrap";
import MultiRangeSlider from "../components/MultiRangeSlider";
import styles from "./VideoEditor.module.css";

import video_placeholder from "../assets/image/video_placeholder.png";
import VideoConversionButton from "../components/VideoConversionButton";
import { sliderValueToVideoTime, toTimeString } from "../utils/utils";

const ffmpeg = createFFmpeg({ log: true });

const VideoEditor = ({ isDark }) => {
  const [videoFile, setVideoFile] = useState();
  const [sliderValues, setSliderValues] = useState([0, 100]);
  const [ffmpegLoaded, setFFmpegLoaded] = useState(false);
  const [videoPlayerState, setVideoPlayerState] = useState();
  const [videoPlayer, setVideoPlayer] = useState();
  const [processing, setProcessing] = useState(false);
  const [show, setShow] = useState(false);
  const [isGrayscale, setIsGrayscale] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1); // 배속 상태
  const uploadFile = useRef("");

  useEffect(() => {
    ffmpeg.load().then(() => {});
    setFFmpegLoaded(true);
  }, []);

  useEffect(() => {
    const min = sliderValues[0];

    if (min !== undefined && videoPlayerState && videoPlayer) {
      videoPlayer.seek(sliderValueToVideoTime(videoPlayerState.duration, min));
    }
  }, [sliderValues]);

  useEffect(() => {
    if (videoPlayer && videoPlayerState) {
      const [min, max] = sliderValues;

      const minTime = sliderValueToVideoTime(videoPlayerState.duration, min);
      const maxTime = sliderValueToVideoTime(videoPlayerState.duration, max);

      if (videoPlayerState.currentTime < minTime) {
        videoPlayer.seek(minTime);
      }
      if (videoPlayerState.currentTime > maxTime) {
        videoPlayer.seek(minTime);
      }
    }
  }, [sliderValues, videoPlayerState, videoPlayer]);

  useEffect(() => {
    if (!videoFile) {
      setVideoPlayerState(undefined);
    } else {
      setSliderValues([0, 100]);
    }
  }, [videoFile]);

  useEffect(() => {
    if (videoPlayer) {
      if (isPlaying) {
        videoPlayer.play();
      } else {
        videoPlayer.pause();
      }
    }
  }, [isPlaying, videoPlayer]);

  // 비디오 파일 변경 시 슬러이더 값, 배속 초기화
  useEffect(() => {
    if (videoFile) {
      setSliderValues([0, 100]);
      setSpeed(1);
    }
  }, [videoFile]);

  if (!ffmpegLoaded) return <div>Loading...</div>;

  const handleStart = () => {
    setProcessing(true);
    setIsPlaying(false);
  };

  const handleEnd = () => {
    setProcessing(false);
    setIsPlaying(true);
    setShow(true);
  };

  return (
    <Container className={`video-editor ${isDark ? "dark" : "light"}`}>
      <Stack style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <h1
          className={`${styles.title} ${isDark ? styles.dark : styles.light}`}
        >
          Video Edit
        </h1>

        {videoFile && (
          <Box>
            <input
              onChange={(e) => setVideoFile(e.target.files[0])}
              type="file"
              accept="video/*"
              style={{ display: "none" }}
              ref={uploadFile}
            />
            <Button
              onClick={() => uploadFile.current.click()}
              className={`${styles.re_upload_btn} ${
                isDark ? styles.dark : styles.light
              }`}
            >
              비디오 재선택
            </Button>
          </Box>
        )}
      </Stack>

      <section className={styles.video_wrapper}>
        {videoFile ? (
          <VideoPlayer
            className={`${styles.video_player} ${
              isGrayscale ? styles.gray : ""
            }`}
            src={videoFile}
            onPlayerChange={(videoPlayer) => {
              setVideoPlayer(videoPlayer);
            }}
            onChange={(videoPlayerState) => {
              setVideoPlayerState(videoPlayerState);
            }}
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying}
            onLoadedData={() => {
              setSliderValues([0, 100]);
            }}
            playbackRate={speed} // 재생 속도 전달
          />
        ) : (
          <>
            <Stack>
              <img
                className={styles.video_placeholder}
                src={video_placeholder}
                alt="비디오를 업로드해주세요"
                ref={uploadFile}
              />
              <input
                onChange={(e) => setVideoFile(e.target.files[0])}
                type="file"
                accept="video/*"
                ref={uploadFile}
                style={{ display: "none" }}
              />
            </Stack>
            <Button
              onClick={() => uploadFile.current.click()}
              className={styles.upload_btn}
            >
              비디오 업로드하기
            </Button>
          </>
        )}
      </section>

      {videoFile && (
        <Stack style={{ margin: "0" }}>
          <section
            style={{
              width: "100%",
              marginTop: 30,
              marginBottom: 62,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <MultiRangeSlider
              min={0}
              max={100}
              onChange={({ min, max }) => {
                setSliderValues([min, max]);
              }}
              sliderValues={sliderValues}
            />
          </section>
          <section>
            <VideoConversionButton
              onConversionStart={handleStart}
              onConversionEnd={handleEnd}
              ffmpeg={ffmpeg}
              videoPlayerState={videoPlayerState}
              videoFile={videoFile}
              sliderValues={sliderValues}
              isGrayscale={isGrayscale}
              setIsGrayscale={setIsGrayscale}
              speed={speed}
              setSpeed={setSpeed}
            />
          </section>
        </Stack>
      )}

      <ToastContainer position={"top-center"} style={{ xIndex: 1 }}>
        <Toast
          onClose={() => setShow(false)}
          show={show}
          delay={2000}
          dg="dark"
          autohide
        >
          <Toast.Header closeButton={false}>
            <strong className="me-auto">Video Editor</strong>
            <Toast.Body>내보내기가 완료되었습니다.</Toast.Body>
          </Toast.Header>
        </Toast>
      </ToastContainer>

      <Modal
        className={styles.modal}
        show={processing}
        onHide={() => setProcessing(false)}
        backdrop={false}
        keyboard={false}
        centered
        size="sm"
      >
        <div style={{ textAlign: "center" }}>
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>

          <p className={styles.exported_text}>내보내기가 진행중입니다.</p>
          <Button onClick={() => setProcessing(false)}>내보내기 취소</Button>
        </div>
      </Modal>
    </Container>
  );
};

export default VideoEditor;
