const canvas = document.getElementById('drawing-board');
const toolbar = document.getElementById('toolbar');
const ctx = canvas.getContext('2d');



const canvasOffsetX = canvas.offsetLeft;
const canvasOffsetY = canvas.offsetTop;

canvas.width = 100;
canvas.height = 100;

canvas.style.backgroundColor = 'black';

let isPainting = false;
let lineWidth = 5;
let startX;
let startY;

toolbar.addEventListener('click', e => {
    if (e.target.id === 'clear') {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
});

const draw = (e) => {
    if (!isPainting) {
        return;
    }

    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'white';

    ctx.lineTo(e.clientX - canvasOffsetX, e.clientY);
    ctx.stroke();
}

canvas.addEventListener('mousedown', (e) => {
    isPainting = true;
    startX = e.clientX;
    startY = e.clientY;
});

canvas.addEventListener('mouseup', e => {
    isPainting = false;
    ctx.stroke();
    ctx.beginPath();

    predictKana();
});

canvas.addEventListener('mousemove', draw);

let model;

async function loadModel() {
    model = await tf.loadGraphModel('weights_JS_format/model.json');
    console.log('Model loaded successfully!');
}

loadModel();

// Assuming you have a variable `resultParagraph` to reference the <p> element
const resultParagraph = document.getElementById('result');

function preprocessData() {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    const { data, width, height } = imageData;
    const inputData = [];

    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        inputData.push(r, g, b);
    }
    console.log(inputData);
    const inputTensor = tf.tensor4d(inputData, [1, height, width, 3]);
    const resizedTensor = tf.image.resizeBilinear(inputTensor, [100, 100]);

    return resizedTensor;
}

function getMostProbablePrediction(predictions) {
    const logits = predictions.arraySync()[0];
    const maxProbabilityIndex = logits.indexOf(Math.max(...logits));
    return maxProbabilityIndex;
}

function predictKana() {
    const input = preprocessData();
    const predictions = model.predict(input);

    // Perform further processing on the predictions as needed
    // For example, identify the most probable Kana character
    const result = getMostProbablePrediction(predictions);

    resultParagraph.textContent = result; // Set the result in the <p> element

    predictions.dispose(); // Clean up the memory used by the predictions
}