import { divisionSearchableFields } from './division.constant';
import { QueryBuilder } from './../../utils/queryBuilder';
import { IDivision } from "./division.interface";
import httpStatus from "http-status-codes";
import AppError from "../../errorHelpers/AppError";
import { Division } from "./division.model";

const createDivision = async (payload: IDivision) => {
  const existingDivision = await Division.findOne({ name: payload.name });
  if (existingDivision) {
    throw new AppError(httpStatus.BAD_REQUEST, "User ALready Exist");
  }

  const division = await Division.create(payload);

  return division;
};

const getAllDivision = async (query: Record<string, string>) => {
  const queryBuilder = new QueryBuilder(Division.find(), query)

    const divisionsData = queryBuilder
        .search(divisionSearchableFields)
        .filter()
        .sort()
        .fields()
        .paginate()

    const [data, meta] = await Promise.all([
        divisionsData.build(),
        queryBuilder.getMeta()
    ])

    return {
        data,
        meta
    }
};

const getSingleDivision = async (slug: string) => {
  const division = await Division.findOne({ slug });

  return {
    data: division,
  };
};

const updateDivision = async (id: string, payload: Partial<IDivision>) => {
  const existingDivision = await Division.findById(id);
  if (!existingDivision) {
    throw new AppError(httpStatus.BAD_REQUEST, "Division not found.");
  }

  const duplicateDivision = await Division.findOne({
    name: payload.name,
    _id: { $ne: id },
  });

  if (duplicateDivision) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "A division with this name already exists."
    );
  }

  const updatedDivision = await Division.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  return updatedDivision;
};

const deleteDivision = async (id: string) => {
  await Division.findByIdAndDelete(id);
  return null;
};

export const DivisionServices = {
  createDivision,
  getAllDivision,
  getSingleDivision,
  updateDivision,
  deleteDivision,
};
