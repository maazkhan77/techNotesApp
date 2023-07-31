const express = require("express");
const app = express();
const path = require("path");
const { logger } = require("./middleware/logger");
const errorHandler = require("./middleware/errorHandler");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const corsOptions = require("./config/corsOptions");
const PORT = process.env.PORT || 3500;

app.use(logger); // custom middleWare to log events in a file

app.use(cors(corsOptions)); // third party middleware which checks the CORS and allows only the selected urls to access the server/ resource

app.use(express.json()); // parse the json from the request

app.use(cookieParser()); // parses cookies

app.use("/", express.static(path.join(__dirname, "/public"))); // telling express where to look for static files

app.use("/", require("./routes/root"));

//if none of the routes matches we will return a 404 based on api whether it accepts the content (html/json)
app.all("*", (req, res) => {
  res.status(404);
  if (req.accepts("html")) {
    res.sendFile(path.join(__dirname, "views", "404.html"));
  } else if (req.accepts("json")) {
    res.json({ message: "404 Not Found" });
  } else {
    res.type("txt").send("404 Not Found");
  }
});

app.use(errorHandler); // error middleWare to log errors

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
