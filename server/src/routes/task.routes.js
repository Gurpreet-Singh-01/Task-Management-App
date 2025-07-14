const router = require("express").Router();
const verifyJWT = require("../middlewares/authMiddleware");
const upload = require("../middlewares/mutlerMiddleware");
const {
  createTask,
  deleteTask,
  getAllTasks,
  getAttachment,
  searchTasks,
  updateTask,
  uploadAttachment,
} = require("../controllers/tasks.controller");
router.use(verifyJWT);
router.post("/", createTask);
router.delete("/:id", deleteTask);
router.get("/", getAllTasks);
router.get("/:id/attachment", getAttachment);
router.post("/:id/attachment", upload.single("attachment"), uploadAttachment);
router.get("/search", searchTasks);
router.patch("/search", updateTask);
module.exports = router;
