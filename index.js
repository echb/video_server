const express = require("express");
const app = express();
const fs = require("fs");

app.get("/", function (req, res) {
  res.send();
});

app.get("/video/:id", function (req, res) {
  // Ensure there is a range given for the video
  const range = req.headers.range;
  let { id } = req.params;
  const videoPath = `${id}.mp4`;
  // console.log(req.params);

  if (!range) {
    const headers = {
      // "Content-Range": `bytes ${start}-${end}/${videoSize}`,
      // "Accept-Ranges": "bytes",
      // "Content-Length": contentLength,
      "Content-Type": "video/mp4",
    };

    res.writeHead(206, headers);
    const videoStream = fs.createReadStream(videoPath);

    videoStream.pipe(res);

  } else {
    // get video stats (about 61MB)
    const videoSize = fs.statSync(videoPath).size;

    // Parse Range
    // Example: "bytes=32324-"
    const CHUNK_SIZE = 10 ** 6; // 1MB
    const start = Number(range.replace(/\D/g, ""));
    const end = Math.min(start + CHUNK_SIZE, videoSize - 1);

    // Create headers
    const contentLength = end - start + 1;
    const headers = {
      "Content-Range": `bytes ${start}-${end}/${videoSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": contentLength,
      "Content-Type": "video/mp4",
    };

    // HTTP Status 206 for Partial Content
    res.writeHead(206, headers);

    // create video read stream for this particular chunk
    const videoStream = fs.createReadStream(videoPath, { start, end });

    // Stream the video chunk to the client
    videoStream.pipe(res);

  }

});

app.listen(process.env.PORT || 5000, function () {
  console.log(`Listening on port ${process.env.PORT || 5000}`);
  console.log('init');
});
