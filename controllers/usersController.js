const User = require("../models/User");
const Note = require("../models/Note");
const asyncHandler = require("express-async-handler"); // this will let use the async await and will help in error handling
const bcrypt = require("bcrypt"); // to encrypt the password before saving it

// @desc Get all users
// @route GET /users
// @access Private
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password").lean();
  // find method will find all user from user schema
  // select method here says return everything except password
  // lean method will only return the json like data which wont include other methods such as save

  if (!users?.length) {
    return res.status(400).json({ message: "No users found" }); // 400 means bad request
  }

  res.json(users);
});

// @desc Create user
// @route POST /users
// @access Private
const createUser = asyncHandler(async (req, res) => {
  const { username, password, roles } = req.body; //destructuring data from request body

  //confirming that the all data exists
  if (!username || !password || !Array.isArray(roles) || !roles.length) {
    return res.status(400).json({ message: "All field are required" });
  }

  //checking for duplicates
  const duplicate = await User.findOne({ username }).lean().exec();
  // findOne method will only return the first result it with the given username
  // exec method makes the query return a promise they do not return promise by default
  if (duplicate) {
    return res.status(409).json({ message: "Duplicate username" }); // 409 means conflict
  }

  // Hash password
  const hashedpwd = await bcrypt.hash(password, 10); // 10 here is salt rounds

  const userObject = { username, password: hashedpwd, roles };

  // Create and store new user
  const user = await User.create(userObject); // Insert into the database ex: MyModel.create(docs) does new MyModel(doc).save() for every doc in docs.
  if (user) {
    // created
    res.status(201).json({ message: `New user ${username} created` });
  } else {
    res.status(400).json({ message: "Invalid user data received" });
  }
});

// @desc Update a user
// @route PATCH /users
// @access Private
const updateUser = asyncHandler(async (req, res) => {
  const { id, username, roles, active, password } = req.body; //destructuring data from request body

  //confirming that the all data exists
  if (
    !id ||
    !username ||
    !Array.isArray(roles) ||
    !roles.length ||
    typeof active !== "boolean"
  ) {
    return res.status(400).json({ message: "All field are required" });
  }

  const user = await User.findById(id).exec();

  if (!user) {
    return res.status(400).json({ message: "user not found" });
  }

  //checking for duplicates
  const duplicate = await User.findOne({ username }).lean().exec();
  //Allow updates to the original user
  if (duplicate && duplicate?._id.toString() !== id) {
    return res.status(409).json({ message: "Duplicate username" }); // 409 means conflict
  }

  user.username = username;
  user.roles = roles;
  user.active = active;

  if (password) {
    // Hash password
    user.password = await bcrypt.hash(password, 10);
  }

  const updatedUser = await user.save();

  res.json({ message: `${updatedUser.username} updated` });
});

// @desc Delete a user
// @route DELETE /users
// @access Private
const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ message: "User ID Required" });
  }

  const note = await Note.findOne({ user: id }).lean().exec();
  if (note) {
    return res.status(400).json({ message: "User has assigned notes" });
  }

  const user = await User.findById(id).exec();

  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  const result = await user.deleteOne()

  const reply = `Username ${result.username} with ID ${result._id} deleted`

  res.json(reply)
});

module.exports = {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
};
