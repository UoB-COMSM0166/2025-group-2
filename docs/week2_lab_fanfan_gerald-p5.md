```
function setup() {
  createCanvas(400, 600);
  background(205, 164, 211); // set the background to purple
  
  textSize(20);
  fill(100); // set the text colour to dark grey
  text("simple paint v0.1\nclick to draw a rainbow line", 10, 30);
  

}

function draw() {
  
    textSize(20);
  fill(100); // set the text colour to dark grey
  text("simple paint v0.1\nclick to draw a rainbow line", 10, 30);
  if (mouseIsPressed) {
    noStroke();
    fill(random(255), random(10, 200),             random(100, 150));
  ellipse(mouseX + random(-10, 10), mouseY +     random(-10, 10), 1 + random(4), 1 +           random(4));
  }
  
}
```
