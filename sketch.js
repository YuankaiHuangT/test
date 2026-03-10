//Yuankai Huang
//huang.yuank@northeastern.edu
//ARTG 2262
//LAB 2
//A 6 Hacker Level
//Super drawing app & Mirror image on the XY axis
//Help by claude - color picker
//press s to save or click button save
let mode = "brush";
let brushSize = 4;
//size you can choose
const brushSizes = [1, 4, 8, 15, 20, 30];
let selectedSizeIndex = 1;
//current color
let currentColor;
//color picker
let colorPickerGraphic;
// symmetry mode: "none", "x", "xy"
let symmetryMode = "none";

// canvas size
const canvasW = 1100;
const canvasH = 800;
const drawAreaW = 800;

// draw area center (for mirroring)
const drawCenterX = drawAreaW / 2;
const drawCenterY = 70 + (canvasH - 70) / 2;

// picker position
const pickerX = 840,
  pickerY = 90;
const pickerW = 220,
  pickerH = 180;

// brush size buttons 60*60
const brushBtnSize = 56;
const brushBtnY = 495;

//give data for button
const buttonBrush = { x: 20, y: 20, w: 90, h: 36, label: "Brush" };
const buttonEraser = { x: 120, y: 20, w: 90, h: 36, label: "Eraser" };
const buttonSave = { x: 990, y: 755, w: 90, h: 36, label: "Save" };
const buttonClear = { x: 880, y: 755, w: 90, h: 36, label: "Clear" };
// symmetry buttons
const buttonSymNone = { x: 240, y: 20, w: 70, h: 36, label: "No Sym" };
const buttonSymX = { x: 320, y: 20, w: 70, h: 36, label: "X Sym" };
const buttonSymXY = { x: 400, y: 20, w: 70, h: 36, label: "XY Sym" };

//preset color
const swatches = ["#000000", "#DEDEDE", "#888888", "#ff0000", "#0000ff"];
const swatchSize = 36;

function setup() {
  createCanvas(canvasW, canvasH);
  background(255);
  currentColor = color(0, 0, 0); //start color

  // upper ui
  noStroke();
  fill(220);
  rect(0, 0, canvasW, 70);

  // right ui
  fill(210);
  rect(drawAreaW, 70, canvasW - drawAreaW, canvasH - 70);

  //create color picker
  colorPickerGraphic = createGraphics(pickerW, pickerH); //note: create a new "layer", (x,y)
  colorPickerGraphic.colorMode(HSB, 360, 100, 100); //change it to hsb
  for (let x = 0; x < pickerW; x++) {
    for (let y = 0; y < pickerH; y++) {
      let h = map(x, 0, pickerW, 0, 360); //note: map(value, start1, stop1, start2, stop2)
      let s = map(y, 0, pickerH, 0, 100);
      let b = map(y, 0, pickerH, 100, 40);
      colorPickerGraphic.stroke(h, s, b);
      colorPickerGraphic.point(x, y);
    }
  }
}

// create block for brush button
function getBrushBtn(i) {
  // change column when >3
  let col = i % 3;
  let row = floor(i / 3);
  return {
    x: 860 + col * (brushBtnSize + 8),
    y: brushBtnY + row * (brushBtnSize + 8),
    w: brushBtnSize,
    h: brushBtnSize,
  };
}

function draw() {
  // upper ui
  noStroke();
  fill(220);
  rect(0, 0, canvasW, 70);

  // right ui
  fill(210);
  rect(drawAreaW, 70, canvasW - drawAreaW, canvasH - 70);
  // text color picker
  noStroke();
  fill(80);
  textAlign(CENTER, TOP);
  textSize(13);
  text("Color Picker", drawAreaW + (canvasW - drawAreaW) / 2, 76);

  // output color picker at (pickerX, pickerY)
  image(colorPickerGraphic, pickerX, pickerY);
  noFill();
  stroke(150);
  strokeWeight(1);
  rect(pickerX, pickerY, pickerW, pickerH);
  //color presets
  for (let i = 0; i < swatches.length; i++) {
    fill(swatches[i]);
    noStroke();
    rect(840 + i * (swatchSize + 6), 275, swatchSize, swatchSize, 4);
  }
  // color preview
  noStroke();
  fill(190);
  rect(840, 390, 220, 75, 6);
  fill(currentColor);
  rect(855, 400, 190, 55, 6);
  fill(80);
  textAlign(CENTER, TOP);
  textSize(12);
  text("Current Color", drawAreaW + (canvasW - drawAreaW) / 2, 375);

  // text brush size
  fill(80);
  textAlign(CENTER, TOP);
  textSize(13);
  text("Brush Size", drawAreaW + (canvasW - drawAreaW) / 2, 475);

  // brush preview background block
  for (let i = 0; i < brushSizes.length; i++) {
    let btn = getBrushBtn(i);
    let active = i === selectedSizeIndex;

    // change color when activate
    noStroke();
    fill(active ? 30 : 190);
    rect(btn.x, btn.y, btn.w, btn.h, 8);

    // brush preview
    let dotSize = min(brushSizes[i], brushBtnSize - 10); // prevent circle get out of the square
    fill(currentColor);
    ellipse(btn.x + btn.w / 2, btn.y + btn.h / 2 - 8, dotSize);

    // text px
    fill(active ? 255 : 80);
    textAlign(CENTER, BOTTOM);
    textSize(11);
    text(brushSizes[i] + "px", btn.x + btn.w / 2, btn.y + btn.h - 4);
  }

  // draw buttons
  drawButton(buttonBrush, mode === "brush");
  drawButton(buttonEraser, mode === "eraser");
  drawButton(buttonSave, false);
  drawButton(buttonClear, false);
  drawButton(buttonSymNone, symmetryMode === "none");
  drawButton(buttonSymX, symmetryMode === "x");
  drawButton(buttonSymXY, symmetryMode === "xy");
}

// draw mirrored lines based on symmetry mode
function drawMirroredLine(x1, y1, x2, y2) {
  // offset from center
  let dx1 = x1 - drawCenterX,
    dy1 = y1 - drawCenterY;
  let dx2 = x2 - drawCenterX,
    dy2 = y2 - drawCenterY;

  if (symmetryMode === "none") {
    line(x1, y1, x2, y2);
  } else if (symmetryMode === "x") {
    // original + left-right mirror
    line(drawCenterX + dx1, y1, drawCenterX + dx2, y2);
    line(drawCenterX - dx1, y1, drawCenterX - dx2, y2);
  } else if (symmetryMode === "xy") {
    // original + 3 mirrors (left-right, up-down, diagonal)
    line(
      drawCenterX + dx1,
      drawCenterY + dy1,
      drawCenterX + dx2,
      drawCenterY + dy2
    );
    line(
      drawCenterX - dx1,
      drawCenterY + dy1,
      drawCenterX - dx2,
      drawCenterY + dy2
    );
    line(
      drawCenterX + dx1,
      drawCenterY - dy1,
      drawCenterX + dx2,
      drawCenterY - dy2
    );
    line(
      drawCenterX - dx1,
      drawCenterY - dy1,
      drawCenterX - dx2,
      drawCenterY - dy2
    );
  }
}

//draw button, change color when active
function drawButton(button, active) {
  push();
  noStroke();
  fill(active ? 30 : 200); //detect true or false, if true 30, if false 200
  rect(button.x, button.y, button.w, button.h, 8);
  fill(active ? 255 : 30);
  textAlign(CENTER, CENTER);
  textSize(14);
  text(button.label, button.x + button.w / 2, button.y + button.h / 2);
  pop();
}

//detect click
function isClicked(btn) {
  return (
    mouseX > btn.x &&
    mouseX < btn.x + btn.w &&
    mouseY > btn.y &&
    mouseY < btn.y + btn.h
  );
}

function mousePressed() {
  // get select color
  if (
    mouseX > pickerX &&
    mouseX < pickerX + pickerW &&
    mouseY > pickerY &&
    mouseY < pickerY + pickerH
  ) {
    currentColor = get(mouseX, mouseY);
    return; //could delete but best keep it
  }

  // change brush size
  for (let i = 0; i < brushSizes.length; i++) {
    if (isClicked(getBrushBtn(i))) {
      selectedSizeIndex = i;
      brushSize = brushSizes[i];
      return;
    }
  }

  //change color if activate
  if (isClicked(buttonBrush)) mode = "brush";
  if (isClicked(buttonEraser)) mode = "eraser";

  // switch symmetry mode
  if (isClicked(buttonSymNone)) {
    symmetryMode = "none";
  }
  if (isClicked(buttonSymX)) {
    symmetryMode = "x";
  }
  if (isClicked(buttonSymXY)) {
    symmetryMode = "xy";
  }
  //clear
  if (isClicked(buttonClear)) {
    fill(255);
    noStroke();
    rect(0, 70, drawAreaW, canvasH - 70);
  }
  //save
  if (isClicked(buttonSave)) {
    let pg = get(0, 70, drawAreaW, canvasH - 70); //only save the canva
    save(pg, "my_drawing.png");
  }

  for (let i = 0; i < swatches.length; i++) {
    let sx = 840 + i * (swatchSize + 6);
    if (
      mouseX > sx &&
      mouseX < sx + swatchSize &&
      mouseY > 275 &&
      mouseY < 275 + swatchSize
    ) {
      currentColor = color(swatches[i]);
      return;
    }
  }
}

//ezpz
function mouseDragged() {
  if (mouseY < 70 || mouseY > canvasH) return; //prevent draw on ui
  if (mouseX > drawAreaW || mouseX < 0) return; // prevent draw on ui
  if (mode === "eraser") {
    stroke(255);
  } else {
    stroke(currentColor);
  }
  strokeWeight(brushSize);
  drawMirroredLine(pmouseX, pmouseY, mouseX, mouseY);
}
function keyPressed() {
  if (key === "s") {
    let pg = get(0, 70, drawAreaW, canvasH - 70); //only save the canva
    save(pg, "my_drawing.png");
  }
}
