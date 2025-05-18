import express from 'express';
import multer from 'multer';
import cors from 'cors';
import fs from 'fs';

const app = express();
const port = 3000;
app.use(cors());

const storage = multer.diskStorage({
    destination: 'uploads/',
    filename: (_, file, cb) => cb(null, file.originalname)
});
const upload = multer({ storage });

app.post('/upload', upload.single('image'), (req, res): void => {
    if (!req.file) {
        res.status(400).send('Ei tiedostoa');
        return;
    }
    res.send('Kuva vastaanotettu');
});

app.listen(port, () => {
    if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');
    console.log(`Palvelin käynnissä: http://localhost:${port}`);
});
