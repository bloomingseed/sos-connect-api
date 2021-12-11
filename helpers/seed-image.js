const fs = require("fs");
const { createCanvas } = require("canvas");
const THUMBNAIL_SIZE = { width: 170, height: 170 };
const COVER_SIZE = { width: 820, height: 312 };

function seedImage(text, path, dimension, shouldGradientBackground = true) {
  let { width, height } = dimension;
  const canvas = createCanvas(width, height);
  let context = canvas.getContext("2d");
  drawGradientBackground(
    context,
    canvas,
    shouldGradientBackground,
    randomizeColor(),
    randomizeColor()
  );
  drawText(text, context, canvas);
  saveImage(canvas, path);
  return path;
}

function randomizeColor() {
  let c = "#000000".replace(/0/g, function () {
    return (~~(Math.random() * 16)).toString(16);
  });
  return c;
}

function drawText(text, context, canvas, fontSize = 30, fontColor = "#fff") {
  context.font = `${fontSize}px Verdana`;
  let textDim = context.measureText(text);
  context.fillStyle = fontColor;
  context.fillText(
    text,
    canvas.width / 2 - textDim.width / 2,
    canvas.height / 2
  );
}
function drawGradientBackground(
  context,
  canvas,
  shouldGradientBackground,
  colorStart = "#000",
  colorEnd = "#fff"
) {
  let style = colorStart;
  if (shouldGradientBackground) {
    let gradient = context.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, colorStart);
    gradient.addColorStop(0.5, colorEnd);
    style = gradient;
  }
  context.fillStyle = style;
  context.fillRect(0, 0, canvas.width, canvas.height);
}
function saveImage(canvas, path) {
  const buffer = canvas.toBuffer("image/png");
  fs.writeFileSync(path, buffer);
}

// seedImage("Nhóm hỗ trợ COVID-19", "TEST-IMAGE.png", {
//   width: 720,
//   height: 460,
// });

module.exports = { seedImage, THUMBNAIL_SIZE, COVER_SIZE };
