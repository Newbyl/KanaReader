const canvas = document.getElementById('drawing-board');
const toolbar = document.getElementById('toolbar');
const ctx = canvas.getContext('2d');

const canvasRect = canvas.getBoundingClientRect();
const canvasOffsetX = canvasRect.left;
const canvasOffsetY = canvasRect.top;


canvas.width = 500;
canvas.height = 500;

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

toolbar.addEventListener('change', e => {
    if (e.target.id === 'lineWidth') {
        lineWidth = e.target.value;
    }

});

const draw = (e) => {
    if (!isPainting) {
        return;
    }

    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'white';

    // Calculate the adjusted coordinates relative to the canvas offset
    const adjustedX = e.clientX - canvasOffsetX;
    const adjustedY = e.clientY - (canvasOffsetY/2) + 30;

    ctx.lineTo(adjustedX, adjustedY);
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
    
    const inputTensor = tf.tensor4d(inputData, [1, height, width, 3]);
    const resizedTensor = tf.image.resizeBilinear(inputTensor, [100, 100]);

    return resizedTensor;
}

function getMostProbableKana(predictions, topK) {
    const logits = predictions.arraySync()[0];
    const predictionResults = logits
        .map((logit, index) => ({ logit, index }))
        .sort((a, b) => b.logit - a.logit)
        .slice(0, topK)
        .map(({ logit, index }) => ({
            index,
            logit,
        }));

    return predictionResults;
}



const classNames = ['ba', 'be', 'bi', 'bo', 'bu', 'da', 'de', 'ji', 'do', 'du', 'ga', 'ge', 'gi', 'go', 'gu', 'ha', 'he', 'hi', 'ho', 'fu', 'ka', 'ke', 'ki', 'ko', 'ku', 'ma', 'me', 'mi', 'mo', 'mu', 'na', 'ne', 'ni', 'no', 'nu', 'pa', 'pe', 'pi', 'po', 'pu', 'ra', 're', 'ri', 'ro', 'ru', 'sa', 'se', 'si', 'so', 'su', 'ta', 'te', 'chi', 'to', 'tsu', 'wa', 'wo', 'u', 'ya', 'i', 'yo', 'yu', 'za', 'ze', 'ji', 'zo', 'zu'];

const resultParagraph1 = document.getElementById('result1');
const resultParagraph2 = document.getElementById('result2');
const resultParagraph3 = document.getElementById('result3');
const resultParagraph4 = document.getElementById('result4');
const resultParagraph5 = document.getElementById('result5');

function predictKana() {
    const input = preprocessData();
    const predictions = model.predict(input);

    const result = getMostProbableKana(predictions, 5);

    resultParagraph1.textContent = classNames[result[0]['index']] + " : " + (result[0]['logit'] * 100).toFixed(2) + "%";
    resultParagraph2.textContent = classNames[result[1]['index']] + " : " + (result[1]['logit'] * 100).toFixed(2) + "%";
    resultParagraph3.textContent = classNames[result[2]['index']] + " : " + (result[2]['logit'] * 100).toFixed(2) + "%";
    resultParagraph4.textContent = classNames[result[3]['index']] + " : " + (result[3]['logit'] * 100).toFixed(2) + "%";
    resultParagraph5.textContent = classNames[result[4]['index']] + " : " + (result[4]['logit'] * 100).toFixed(2) + "%";

    predictions.dispose();
}