import { Request, Response, NextFunction } from 'express';
import * as propertyService from '../services/property.service';

const getImagePaths = (req: Request): string[] => {
  const files = (req.files as Express.Multer.File[]) || [];
  return files.map((f) => `/uploads/${f.filename}`);
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const property = await propertyService.createProperty(req.user!.id, req.body, getImagePaths(req));
    res.status(201).json(property);
  } catch (error) {
    next(error);
  }
};

export const getOne = async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json(await propertyService.getPropertyById(req.params.id as string));
  } catch (error) {
    next(error);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const property = await propertyService.updateProperty(
      req.params.id as string, req.user!.id, req.body, getImagePaths(req)
    );
    res.json(property);
  } catch (error) {
    next(error);
  }
};
export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await propertyService.deleteProperty(req.params.id as string, req.user!.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const mine = async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json(await propertyService.getMyProperties(req.user!.id));
  } catch (error) {
    next(error);
  }
};

export const search = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    res.json(await propertyService.searchProperties(res.locals.query));
  } catch (error) {
    next(error);
  }
};

export const similar = async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json(await propertyService.getSimilarProperties(req.params.id as string));
  } catch (error) {
    next(error);
  }
};