import { sendResponse } from './../../utils/sendResponse';
import { Request, Response, } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { DivisionServices } from "./division.service";
import { IDivision } from './division.interface';


const createDivision = catchAsync(async(req: Request, res: Response) => {
     const payload : IDivision = {
          ...req.body,
          thumbnail: req.file?.path
     }
     const result = await DivisionServices.createDivision(payload);
     sendResponse(res,  {
          statusCode: 201,
          success: true,
          message: "Division created",
          data: result,
     })
});

const getAllDivision = catchAsync(async(req: Request, res: Response) =>{
     const query = req.query;
     const result = await DivisionServices.getAllDivision(query as Record<string, string>);
     sendResponse(res,  {
          statusCode: 201,
          success: true,
          message: "Divisions retrieved",
          data: result.data,
          meta: result.meta
     })
})

const getSingleDivision = catchAsync(async(req: Request, res: Response) =>{
     const slug = req.params.slug;
     const result = await DivisionServices.getSingleDivision(slug);
     sendResponse(res,  {
          statusCode: 200,
          success: true,
          message: "Division retrieved",
          data: result.data
     })
})



const updateDivision = catchAsync(async(req: Request, res: Response) => {
     const id = req.params.id;
     const payload : IDivision = {
          ...req.body,
          thumbnail: req.file?.path
     }
     const result = await DivisionServices.updateDivision(id, payload);

     sendResponse(res,  {
          statusCode: 200,
          success: true,
          message: "Division updated",
          data: result
     })

})

const deleteDivision = catchAsync(async(req: Request, res: Response) => {
     const result = await DivisionServices.deleteDivision(req.params.id);

     sendResponse(res,  {
          statusCode: 200,
          success: true,
          message: "Division deleted",
          data: result
     })

})

export const DivisionController = {
     createDivision,
     getAllDivision,
     getSingleDivision,
     updateDivision,
     deleteDivision
}
 