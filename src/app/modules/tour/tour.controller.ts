import { sendResponse } from './../../utils/sendResponse';
import { Request, Response } from 'express';
import { catchAsync } from './../../utils/catchAsync';
import { TourService } from './tour.service';


const createTour = catchAsync(async(req: Request, res: Response) => {
     const result = await TourService.createTour(req.body);

     sendResponse(res, {
          statusCode: 201,
          success: true,
          message: 'Tour created successfully',
          data: result
     })
})

const getAllTours = catchAsync(async(req: Request, res: Response) => {
     const query = req.query
     const result = await TourService.getAllTours(query as  Record<string, string>);

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'Tour retrieved successfully',
          data: result.data,
          meta: result.meta
     })
})

const getSingleTour = catchAsync(async(req: Request, res: Response) => {
     const slug = req.params.slug
     const result = await TourService.getSingleTour(slug);

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'Tour retrieved successfully',
          data: result,
     })
})

const updateTour = catchAsync(async(req: Request, res: Response) => {
     const result = await TourService.updateTour(req.params.id, req.body);

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'Tour updated successfully',
          data: result
     })
})

const deleteTour = catchAsync(async(req: Request, res: Response) => {
     const result = await TourService.deleteTour(req.params.id);

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'Tour deleted successfully',
          data: result
     })
})

const createTourType = catchAsync(async(req: Request, res: Response) => {
     const {name} = req.body;

     const result = await TourService.createTourType(name);

     sendResponse(res, {
          statusCode: 201,
          success: true,
          message: "Tour type created successfully",
          data: result,
     })
})

const getAllTourTypes = catchAsync(async(req: Request, res: Response) => {
     const query = req.query;
     const result = await TourService.getAllTourTypes(query as Record<string, string>);

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: "Tour type retrieved successfully",
          data: result,
     })
})

const getSingleTourType = catchAsync(async(req: Request, res: Response) => {

     const id = req.params.id;

     console.log(id)

     const result = await TourService.getSingleTourType(id);

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: "Tour type retrieved successfully",
          data: result,
     })
})

const updateTourType = catchAsync(async(req: Request, res: Response) => {

     const {name} = req.body;
     const result = await TourService.updateTourType(req.params.id, name);

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: "Tour type updated successfully",
          data: result,
     })
})

const deleteTourType = catchAsync(async(req: Request, res: Response) => {

     const result = await TourService.deleteTourType(req.params.id);

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: "Tour type deleted successfully",
          data: result,
     })
})

export const TourController = {
     createTour,
     getAllTours,
     getSingleTour,
     updateTour,
     deleteTour,
     createTourType,
     getAllTourTypes,
     getSingleTourType,
     updateTourType,
     deleteTourType
}