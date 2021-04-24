import * as dotenv from 'dotenv';
dotenv.config();
import express, { Application, NextFunction, Request, Response } from 'express';

// import routes
import userRoutes from './routes/user.routes';
import categoryRoutes from './routes/category_master.routes';
import tradeStatusRoutes from './routes/trade_status_master.routes';
import gardenRoutes from './routes/garden.routes';
import listingRoutes from './routes/listing.routes';


const app: Application = express();

app.use(express.json({
    limit: '50mb'
}));
app.use((req: Request, res: Response, next: NextFunction) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Origin, Authorization, Accept');
    res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, POST, PATCH, DELETE, OPTIONS');
    next();
});

// routes
app.use('/api', userRoutes);
app.use('/api/trade', tradeStatusRoutes);
app.use('/api/category', categoryRoutes);
app.use('/api/garden', gardenRoutes);
app.use('/api/listing', listingRoutes);

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Listening on port: ${port}`);
});