const simpleGit = require("simple-git");
const git = simpleGit();

git
  .raw(["config", "user.email"])
  .then((email) => console.log("Git Email:", email.trim()))
  .catch((err) => console.error("Error:", err));
