"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TourService = void 0;
const queryBuilder_1 = require("./../../utils/queryBuilder");
const tour_model_1 = require("./tour.model");
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const tour_constant_1 = require("./tour.constant");
const cloudinary_config_1 = require("../../config/cloudinary.config");
const createTour = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    // throw new AppError(
    //     httpStatus.BAD_REQUEST,
    //     "A tour with this title already exists."
    //   );
    const existingTour = yield tour_model_1.Tour.findOne({ title: payload.title });
    if (existingTour) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "A tour with this title already exists.");
    }
    const tour = yield tour_model_1.Tour.create(payload);
    return tour;
});
const getAllTours = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const queryBuilder = new queryBuilder_1.QueryBuilder(tour_model_1.Tour.find(), query);
    const tours = yield queryBuilder.search(tour_constant_1.tourSearchableFields).filter().sort().fields().paginate();
    const [data, meta] = yield Promise.all([
        tours.build(),
        queryBuilder.getMeta()
    ]);
    return {
        data,
        meta
    };
});
const getSingleTour = (slug) => __awaiter(void 0, void 0, void 0, function* () {
    const tour = yield tour_model_1.Tour.findOne({ slug: slug });
    return tour;
});
const updateTour = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const existingTour = yield tour_model_1.Tour.findById(id);
    if (!existingTour) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Tour Not Found");
    }
    if (payload.images && payload.images.length > 0 && existingTour.images && existingTour.images.length > 0) {
        payload.images = [...payload.images, ...existingTour.images];
    }
    if (payload.deleteImages && payload.deleteImages.length > 0 && existingTour.images && existingTour.images.length > 0) {
        const restDBImages = existingTour.images.filter(imageUrl => { var _a; return !((_a = payload.deleteImages) === null || _a === void 0 ? void 0 : _a.includes(imageUrl)); });
        const updatedPayloadImages = (payload.images || [])
            .filter(imageUrl => { var _a; return !((_a = payload.deleteImages) === null || _a === void 0 ? void 0 : _a.includes(imageUrl)); })
            .filter(imageUrl => !restDBImages.includes(imageUrl));
        payload.images = [...restDBImages, ...updatedPayloadImages];
    }
    const updatedTour = yield tour_model_1.Tour.findByIdAndUpdate(id, payload, { new: true });
    if (payload.deleteImages && payload.deleteImages.length > 0 && existingTour.images && existingTour.images.length > 0) {
        yield Promise.all(payload.deleteImages.map(url => (0, cloudinary_config_1.deleteImageFromCloudinary)(url)));
    }
    return updatedTour;
});
const deleteTour = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield tour_model_1.Tour.findByIdAndDelete(id);
});
const createTourType = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const existingTourType = yield tour_model_1.TourType.findOne({ name: payload.name });
    if (existingTourType) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Tour type already exists.");
    }
    return yield tour_model_1.TourType.create({ name });
});
const getAllTourTypes = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const queryBuilder = new queryBuilder_1.QueryBuilder(tour_model_1.TourType.find(), query);
    const tourTypes = yield queryBuilder.search(tour_constant_1.tourTypeSearchableFields).filter().sort().fields().paginate();
    const [data, meta] = yield Promise.all([
        tourTypes.build(),
        queryBuilder.getMeta()
    ]);
    return {
        data,
        meta
    };
});
const getSingleTourType = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const tourType = yield tour_model_1.TourType.findOne({ _id: id });
    return tourType;
});
const updateTourType = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const existingTourType = yield tour_model_1.TourType.findById(id);
    if (!existingTourType) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Tour type not found.");
    }
    const updatedTourType = yield tour_model_1.TourType.findByIdAndUpdate(id, payload, {
        new: true,
    });
    return updatedTourType;
});
const deleteTourType = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const existingTourType = yield tour_model_1.TourType.findById(id);
    if (!existingTourType) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Tour type not found.");
    }
    return yield tour_model_1.TourType.findByIdAndDelete(id);
});
exports.TourService = {
    createTour,
    getAllTours,
    getSingleTour,
    updateTour,
    deleteTour,
    createTourType,
    getAllTourTypes,
    getSingleTourType,
    updateTourType,
    deleteTourType,
};
