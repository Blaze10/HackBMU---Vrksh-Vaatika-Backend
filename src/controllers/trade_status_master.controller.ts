import { TradeStatus } from '../models/trade_status_master.model';
import { Request, Response, NextFunction } from 'express';
import { errorHandler, responseHandler } from '../config/helper';

export const createTradeStatus = async (req: Request, res: Response, next: NextFunction,) => {
    try {

        const name: string = req.body.name;
        if (!name) {
            throw { message: 'name is required' };
        }

        const data = await TradeStatus.create({
            name: name
        });

        const tradeStaus: TradeStatus = data.get({ plain: true });

        responseHandler({
            message: 'Trade status created successfully',
            ...tradeStaus,
        }, res);

    } catch (err) {
        errorHandler(err, res);
    }
}

// get all trade status
export const tradeStatusList = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const statusList: TradeStatus[] = await TradeStatus.findAll();
        responseHandler({
            message: ' Trade status fetched successfully',
            data: statusList,
        }, res);

    } catch (err) {
        errorHandler(err, res);
    }
}