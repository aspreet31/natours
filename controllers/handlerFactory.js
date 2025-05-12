import AppError from '../utils/AppError.js';
import APIFeatures from '../utils/apifeatures.js';
import catchAsync from '../utils/catchAsync.js';

export const deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  });

export const createOne = (Model) =>
  catchAsync(async (req, res) => {
    const doc = await Model.create(req.body);
    res.status(200).json({
      status: 'success',
      data: {
        doc,
      },
    });
  });

export const updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    //PATCH
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) return next(new AppError('No Doc found with that ID', 404));

    res.status(200).json({
      status: 'success',
      data: {
        doc,
      },
    });
  });

export const getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    //GET one tour
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;

    if (!doc) return next(new AppError('No doc found with that ID', 404));
    res.status(200).json({
      status: 200,
      data: {
        doc,
      },
    });
  });

export const getAll = (Model, popOptions) =>
  catchAsync(async (req, res) => {
    // GET
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };
    // EXECUTE QUERY/
    const features = new APIFeatures(
      Model.find(filter).populate(popOptions),
      req.query,
    )
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const docs = await features.query;
    // const tours = await Tour.find();
    res.status(200).json({
      status: 'success',
      results: docs.length,
      data: {
        docs,
      },
    });
  });
