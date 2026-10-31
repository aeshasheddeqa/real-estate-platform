import { Request, Response, NextFunction } from 'express';
import * as inquiryService from '../services/inquiry.service';

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const inquiry = await inquiryService.createInquiry(
      req.params.id as string,
      req.user!.id,
      req.body.message
    );
    res.status(201).json(inquiry);
  } catch (error) {
    next(error);
  }
};

export const received = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { limit, cursor } = res.locals.query;
    res.json(await inquiryService.getReceivedInquiries(req.user!.id, limit, cursor));
  } catch (error) {
    next(error);
  }
};

export const sent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json(await inquiryService.getSentInquiries(req.user!.id));
  } catch (error) {
    next(error);
  }
};