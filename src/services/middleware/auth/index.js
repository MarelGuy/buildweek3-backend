const tokenGenerator = require("../../../utils/token");
const Profile = require("../../../model/profiles");
const md5 = require("md5");
const { APIError } = require("../../../utils");
const generateToken = (req, res) => {
  try {
    const { username, password } = req.user;
    const access_token = tokenGenerator(username, password);
    res.send({ access_token });
  } catch (e) {
    res
      .status(500)
      .send({ message: "Auth service is failed while we generate token" });
  }
};

const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    const user = await Profile.findOne({
      $or: [{ username }, { email: username }],
      password: md5(password),
    });
    if (!user) {
      res.status(401).send({ message: "Username or password is not correct!" });
    } else {
      req.user = { username, password };
      next();
    }
  } catch (e) {
    console.log(e);
    res.status(500).send({ message: e.message });
  }
};

const checkToken = async (req, res, next) => {
  try {
    if (req.headers.authorization) {
      const { authorization } = req.headers;
      const [method, token] = authorization.split(" ");

      if (method === "Basic" && token.trim().length > 0) {
        const decodedToken = Buffer.from(token, "base64").toString();
        const [username, password] = decodedToken.split(":");

        const user = await Profile.findOne(
          { $or: [{ username }, { email: username }], password: md5(password) },
          { password: 0 }
        );

        if (!user) {
          res
            .status(401)
            .send({ message: "Username or password is not correct!" });
        } else {
          req.user = user;
          console.log("here");
          next();
        }
      } else {
        res.status(400).send({ message: "authorization header is malformed" });
      }
    } else {
      res.status(400).send({ message: "authorization is not in header!" });
    }
  } catch (e) {
    res.status(500).send({ message: e.message });
  }
};

module.exports = {
  generateToken,
  checkToken,
  login,
};
