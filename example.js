async function main() {
  // Imports the Google Cloud client library
  const speech = require("@google-cloud/speech");
  const fs = require("fs");

  // Creates a client
  const client = new speech.SpeechClient();

  // The name of the audio file to transcribe
  const fileName = "./audios/refran.wav";

  // Reads a local audio file and converts it to base64
  const file = fs.readFileSync(fileName);
  const audioBytes = file.toString("base64");

  // The audio file's encoding, sample rate in hertz, and BCP-47 language code
  const audio = {
    content: audioBytes,
  };
  const config = {
    encoding: "LINEAR16",
    sampleRateHertz: 16000,
    languageCode: "es-ES",
    enableWordTimeOffsets: true,
  };
  const request = {
    audio: audio,
    config: config,
  };

  // Detects speech in the audio file
  const [response] = await client.recognize(request);
  const transcription = response.results
    .map((result) => result.alternatives[0].transcript)
    .join("\n");
  console.log(`Transcription: ${transcription}`);

  // Log words and timestamps
  response.results.map((result) => {
    result.alternatives[0].words.map((wordInfo) => {
      // NOTE: If you have a time offset exceeding 2^32 seconds, use the
      // wordInfo.{x}Time.seconds.high to calculate seconds.
      const startSecs =
        `${wordInfo.startTime.seconds}` +
        `.` +
        wordInfo.startTime.nanos / 100000000;
      const endSecs =
        `${wordInfo.endTime.seconds}` +
        `.` +
        wordInfo.endTime.nanos / 100000000;
      console.log(`Word: ${wordInfo.word}`);
      console.log(`\t ${startSecs} secs - ${endSecs} secs`);
    });
  });
}
main().catch(console.error);
