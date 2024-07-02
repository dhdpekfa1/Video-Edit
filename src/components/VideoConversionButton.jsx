import { Button } from "antd";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";
import Stack from "@mui/material/Stack";
import { fetchFile } from "@ffmpeg/ffmpeg";
import { readFileAsBase64, sliderValueToVideoTime } from "../utils/utils";
import out from "../assets/icons/out.svg";
import dark_download from "../assets/icons/dark_download.svg";
import styles from "./VideoConversionButton.module.css";

function VideoConversionButton({
  videoPlayerState,
  sliderValues,
  videoFile,
  ffmpeg,
  onConversionStart,
  onConversionEnd,
  isGrayscale,
  setIsGrayscale,
  speed,
  setSpeed,
}) {
  const convertToGif = async () => {
    onConversionStart(true);

    const inputFileName = "input.mp4";
    const outputFileName = "output.gif";

    // writing the video file to memory
    ffmpeg.FS("writeFile", inputFileName, await fetchFile(videoFile));

    const [min, max] = sliderValues;
    const minTime = sliderValueToVideoTime(videoPlayerState.duration, min);
    const maxTime = sliderValueToVideoTime(videoPlayerState.duration, max);

    // cutting the video and converting it to GIF with a FFMpeg command
    await ffmpeg.run(
      "-i",
      inputFileName,
      "-ss",
      `${minTime}`,
      "-to",
      `${maxTime}`,
      "-f",
      "gif",
      outputFileName
    );

    // reading the resulting file
    const data = ffmpeg.FS("readFile", outputFileName);

    // converting the GIF file created by FFmpeg to a valid image URL
    const gifUrl = URL.createObjectURL(
      new Blob([data.buffer], { type: "image/gif" })
    );

    const link = document.createElement("a");
    link.href = gifUrl;
    link.setAttribute("download", "");
    link.click();

    // ending the conversion process

    onConversionEnd(false);
  };

  const onCutTheVideo = async () => {
    onConversionStart(true);

    const [min, max] = sliderValues;
    const minTime = sliderValueToVideoTime(videoPlayerState.duration, min);
    const maxTime = sliderValueToVideoTime(videoPlayerState.duration, max);

    ffmpeg.FS("writeFile", "input.mp4", await fetchFile(videoFile));

    const speedFilter = `setpts=${1 / speed}*PTS`;
    const audioFilter = `atempo=${speed}`;

    const ffmpegArgs = [
      "-ss",
      `${minTime}`, // 입력 시간 지정
      "-i",
      "input.mp4", // 입력 파일 지정
      "-t",
      `${maxTime}`, // 최대 출력 시간 지정
      "-vf",
      `${isGrayscale ? "format=gray," : ""}${speedFilter},scale=640:-1`, // 필터, 배속 적용
      "-af",
      audioFilter, // 오디오 필터 적용 (배속 조정)
      "-c:v",
      "libx264", // 비디오 코덱 지정
      "-preset",
      "veryfast", // 인코딩 속도 및 압축률 조정 (속도 빠름)
      "-crf",
      "18", // 비디오 품질과 파일 크기 사이의 균형 조절 (0-51, 낮을수록 품질 높음)
      "-c:a",
      "aac", // 오디오 코덱 지정 (AAC 사용)
      "-b:a",
      "192k", // 오디오 비트레이트 지정 (192kbps)
      "-threads",
      "4", // 멀티스레딩을 활용하여 인코딩 속도 향상
      "-movflags",
      "faststart", // 빠른 시작 플래그 (웹 스트리밍에 유리)
      "output.mp4", // 출력 파일 이름 지정
    ];
    await ffmpeg.run(...ffmpegArgs);

    const data = ffmpeg.FS("readFile", "output.mp4");
    const dataURL = await readFileAsBase64(
      new Blob([data.buffer], { type: "video/mp4" })
    );

    const link = document.createElement("a");
    link.href = dataURL;
    link.setAttribute("download", "");
    link.click();

    onConversionEnd(false);
  };

  return (
    <Stack className={styles.btn_wrapper}>
      <section
        style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: "13px",
        }}
      >
        <DropdownButton
          id="dropdown-basic-button"
          title={`재생 속도  ${speed}x`}
          onSelect={(e) => setSpeed(Number(e))}
        >
          <Dropdown.Item eventKey="1">1x</Dropdown.Item>
          <Dropdown.Item eventKey="1.25">1.25x</Dropdown.Item>
          <Dropdown.Item eventKey="1.5">1.5x</Dropdown.Item>
          <Dropdown.Item eventKey="2">2x</Dropdown.Item>
        </DropdownButton>
      </section>
      <section
        style={{
          display: "flex",
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 13,
          justifyContent: "center",
        }}
      >
        <Button onClick={() => convertToGif()} className={styles.btn}>
          <img src={out} alt="GIF 내보내기" />
          <p className={styles.text}>GIF 내보내기</p>
        </Button>

        <Button onClick={() => onCutTheVideo()} className={styles.btn}>
          <img src={dark_download} alt="비디오 저장하기" />
          <p className={styles.text}>비디오 저장하기</p>
        </Button>
      </section>

      <section
        style={{
          display: "flex",
          justifyContent: "center",
          margin: "13px",
        }}
      >
        <Button
          onClick={() => setIsGrayscale(!isGrayscale)}
          className={styles.change_btn}
          style={{ backgroundColor: isGrayscale ? "gray" : "#2cadf9" }}
        >
          {isGrayscale ? "컬러로 변환" : "흑백으로 변환"}
        </Button>
      </section>
    </Stack>
  );
}

export default VideoConversionButton;
