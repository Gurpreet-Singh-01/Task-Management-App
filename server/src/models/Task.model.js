const { model, Schema } = require("mongoose");

const TaskSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
    },
    status: {
      type: String,
      enum: ["todo", "in-progress", "done"],
      default: "todo",
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    attachment: {
      data: { type: Buffer },
      contentType: { type: String },
    },
  },
  { timestamps: true }
);

const Task = model("Task", TaskSchema);
module.exports = Task;