const Task = require("../models/Task.model");
const asyncHandler = require("../utils/asyncHandler");
const APIResponse = require("../utils/APIResponse");
const APIError = require("../utils/APIError");
// Get All tasks
const getAllTasks = asyncHandler(async (req, res) => {
  const tasks = await Task.find({ user: req.user._id });
  return res
    .status(200)
    .json(new APIResponse(200, tasks, "Tasks fetched successfully"));
});

// Search tasks
const searchTasks = asyncHandler(async (req, res) => {
  const { query = {} } = req.query;
  const tasks = await Task.find({
    user: req.user._id,
    $or: [
      { title: { $regex: query, $options: "i" } },
      { description: { $regex: query, $options: "i" } },
    ],
  });
  return res
    .status(200)
    .json(new APIResponse(200, tasks, "Tasks fetched successfully"));
});
// Create task
const createTask = asyncHandler(async (req, res) => {
  const { title, description, status } = req.body;
  if (!title || !description) {
    throw new APIError(400, "Title and description required");
  }
  const task = await Task.create({
    title,
    description,
    status,
    user: req.user._id,
  });

  return res
    .status(201)
    .json(new APIResponse(201, task, "Task created successfully"));
});
// Update task
const updateTask = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!id) throw new APIError(400, "Id is required");

  const { title, description, status } = req.body;
  const task = await Task.findOne({ _id:id, user: req.user._id });
  if (!task) {
    throw new APIError(404, "Task not found");
  }
  if (title) task.title = title;
  if (description) task.description = description;
  if (status) task.status = status;
  await task.save();
  return res
    .status(200)
    .json(new APIResponse(200, task, "Task updated successfully"));
});

// Delete task
const deleteTask = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!id) throw new APIError(400, "Id is required");

  const task = await Task.findOneAndDelete({ _id:id, user: req.user._id });
  if (!task) {
    throw new APIError(404, "Task not found");
  }
  return res
    .status(200)
    .json(new APIResponse(200, {}, "Task deleted successfully"));
});

// Upload attachment
const uploadAttachment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!id) throw new APIError(400, "Id is required");
  const task = await Task.findOne({ _id: id, user: req.user._id });
  if (!task) throw new APIError(404, "Task not found");
  if (!req.file) throw new APIError(400, "No file uploaded");
  task.attachment = {
    data: req.file.buffer,
    contentType: req.file.mimetype,
  };
  await task.save();
  return res
    .status(201)
    .json(
      new APIResponse(
        201,
        { contentType: task.attachment.contentType },
        "Image uploaded successfully"
      )
    );
});

// Get attachment
const getAttachment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const task = await Task.findOne({ _id: id, user: req.user?._id });
  if (!task || !task.attachment.data)
    throw new APIError(404, "No Attachment found");
  res.set("Content-Type", task.attachment.contentType);
  res.send(task.attachment.data);
});
module.exports = {
  getAllTasks,
  searchTasks,
  createTask,
  updateTask,
  deleteTask,
  uploadAttachment,
  getAttachment
};
