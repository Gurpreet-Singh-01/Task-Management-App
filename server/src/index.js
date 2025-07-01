const dotenv = require("dotenv");
const connectDB = require("./db");
const app = require("./app");

dotenv.config({
  path: "./.env",
});

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log("Server is running ");
    });
  })
  .catch((error) => {
    console.log("DB CONNECTION FALIED");
  });
