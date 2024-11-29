import express from 'express';
import cookieParser from 'cookie-parser';
import accountRouter from './routes/accountRoutes.js';
import charactorRouter from './routes/charactor/charactorRoutes.js';
import charactorItemRouter from './routes/charactor/chractorItemRoutes.js'
import itemRouter from './routes/itemRoutes.js';

const app = express();
const PORT = 3018;

app.use(express.json());
app.use(cookieParser());
app.use('/api', [accountRouter, charactorRouter, itemRouter, charactorItemRouter]);

app.listen(PORT, () => {
    console.log(PORT, '포트로 서버가 열렸어요!');
});