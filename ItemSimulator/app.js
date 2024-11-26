import express from 'express';
import router from './routes/itemRouter.js'

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const router = express.Router();

router.get('/', (req, res) => {
    return res.json({ message: 'Welcome Item Simulator In BC' });
});

app.use('/api', [router, itemRouter]);

app.listen(PORT, () => {
    console.log(PORT, 'Port, Server Open');
});