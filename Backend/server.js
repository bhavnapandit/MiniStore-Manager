import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import storeRoutes from './routes/storeRoutes.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

app.use('/api', storeRoutes);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
