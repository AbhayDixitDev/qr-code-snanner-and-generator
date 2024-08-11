// QR Code Generator
const qrInput = document.getElementById('qr-input');
const generateBtn = document.getElementById('generate-btn');
const qrCodeContainer = document.getElementById('qr-code-container');
const qrCodeImg = document.getElementById('qr-code');

generateBtn.addEventListener('click', () => {
    const qrText = qrInput.value.trim();
    if (qrText) {
        const qrCode = new QRCode(qrText, {
            errorCorrectLevel: 'H',
            type: 'image/png',
            renderer: {
                width: 200,
                height: 200,
                margin: 10
            }
        });
        const qrCodeUrl = qrCode.make();
        qrCodeImg.src = qrCodeUrl;
        qrCodeContainer.style.display = 'block';
    } else {
        alert('Please enter some text to generate QR code');
    }
});

// QR Code Scanner
const video = document.getElementById('video');
const scanBtn = document.getElementById('scan-btn');
const scanResultContainer = document.getElementById('scan-result-container');
const scanResultP = document.getElementById('scan-result');

scanBtn.addEventListener('click', () => {
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            video.srcObject = stream;
            video.play();
            const qrCodeScanner = new QRCodeScanner(video, (result) => {
                if (result) {
                    scanResultContainer.style.display = 'block';
                    scanResultP.textContent = `Scanned QR code: ${result}`;
                } else {
                    scanResultContainer.style.display = 'none';
                }
            });
        })
        .catch(error => {
            console.error('Error accessing camera:', error);
        });
});

class QRCodeScanner {
    constructor(video, callback) {
        this.video = video;
        this.callback = callback;
        this.qrCodeReader = new ZXing.QRCodeReader();
        this.scanInterval = setInterval(() => {
            this.scanQRCode();
        }, 100);
    }

    scanQRCode() {
        const canvas = document.createElement('canvas');
        canvas.width = this.video.videoWidth;
        canvas.height = this.video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(this.video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const luminanceSource = new ZXing.LuminanceSource(imageData.data, imageData.width, imageData.height);
        const binaryBitmap = new ZXing.BinaryBitmap(new ZXing.HybridBinarizer(luminanceSource));
        try {
            const result = this.qrCodeReader.decode(binaryBitmap);
            this.callback(result.getText());
        } catch (e) {
            // console.error('Error scanning QR code:', e);
        }
    }
}

// QRCode library
class QRCode {
    constructor(text, options) {
        this.text = text;
        this.options = options;
    }

    make() {
        const qrCode = new QRCodeModel(this.text, this.options);
        return qrCode.make();
    }
}

class QRCodeModel {
    constructor(text, options) {
        this.text = text;
        this.options = options;
    }

    make() {
        const qrCodeMatrix = this.makeMatrix();
        const qrCodeImage = this.makeImage(qrCodeMatrix);
        return qrCodeImage;
    }

    makeMatrix() {
        const qrCodeMatrix = [];
        for (let i = 0; i < this.options.height; i++) {
            qrCodeMatrix[i] = [];
            for (let j = 0; j < this.options.width; j++) {
                qrCodeMatrix[i][j] = 0;
            }
        }
        const data = this.text.split('');
        let x = 0;
        let y = 0;
        for (let i = 0; i < data.length; i++) {
            const charCode = data[i].charCodeAt(0);
            for (let j = 0; j < 8; j++) {
                const bit = (charCode >> (7 - j)) & 1;
                if (y >= this.options.height || x >= this.options.width) {
                    break;
                }
                if (!qrCodeMatrix[y]) {
                    qrCodeMatrix[y] = [];
                }
                qrCodeMatrix[y][x] = bit;
                x++;
                if (x >= this.options.width) {
                    x = 0;
                    y++;
                    if (y >= this.options.height) {
                        break;
                    }
                }
            }
        }
        return qrCodeMatrix;
    }

    makeImage(qrCodeMatrix) {
        const canvas = document.createElement('canvas');
        canvas.width = this.options.width;
        canvas.height = this.options.height;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'black';
        for (let y = 0; y < this.options.height; y++) {
            for (let x = 0; x < this.options.width; x++) {
                if (qrCodeMatrix[x][y]) {
                    ctx.fillRect(x, y, 1, 1);
                }
            }
        }
        return canvas.toDataURL();
    }
}