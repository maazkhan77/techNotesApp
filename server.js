const express = require("express");
const app = express();
const path = require("path");
const { logger } = require("./middleware/logger");
const errorHandler = require("./middleware/errorHandler");
const PORT = process.env.PORT || 3500;

app.use(logger);

app.use(express.json()); // parse the json from the request

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

app.use(errorHandler)

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
