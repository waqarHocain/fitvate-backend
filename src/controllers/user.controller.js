const db = require("../services/db");
const { generateReqId } = require("../utils/generateReqId");

const getProfile = async (req, res) => {
  const { id } = req.params;
  const requestId = generateReqId();

  const user = await db.user.findUnique({
    where: {
      id,
    },
  });

  if (!user) {
    return res.status(404).json({
      status: "error",
      code: 400,
      timestamp: new Date(),
      requestId,
      message: "invalid user id",
    });
  }

  return res.json({
    status: "success",
    data: {
      name: user.name,
      email: user.email,
      profilePic: user.profilePic,
      mobileNumber: user.mobileNumber,
      dateOfBirth: user.dateofBirth,
      gender: user.gender,
      height: user.height,
      weight: user.weight,
      provider: user.provider,
    },
  });
};

const updateProfile = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const requestId = generateReqId();

  // only logged in user should be able to update own profile
  if (id !== userId) {
    return res.status(403).json({
      status: "error",
      code: 403,
      timestamp: new Date(),
      requestId,
      message: "Not Authorized",
    });
  }
  const user = await db.user.findUnique({
    where: {
      id,
    },
  });
  if (!user)
    return res.status(400).json({
      status: "error",
      code: 400,
      timestamp: new Date(),
      requestId,
      message: "Invalid user id",
    });

  const dataToBeUpdated = {};
  const { body } = req;

  if (body.name) dataToBeUpdated.name = body.name;
  if (body.email) dataToBeUpdated.email = body.email;
  if (body.profilePic) dataToBeUpdated.profilePic = body.profilePic;
  if (body.dateofBirth) dataToBeUpdated.dateofBirth = body.dateofBirth;
  if (body.gender) dataToBeUpdated.gender = body.gender;
  if (body.height) dataToBeUpdated.height = body.height;
  if (body.weight) dataToBeUpdated.weight = body.weight;

  if (Object.keys(dataToBeUpdated).length === 0)
    return res.status(400).json({
      status: "error",
      code: 400,
      timestamp: new Date(),
      requestId,
      message: "No data provided for update.",
    });

  try {
    const updatedUser = await db.user.update({
      where: {
        id,
      },
      data: {
        ...dataToBeUpdated,
      },
    });

    delete updatedUser.password;
    delete updatedUser.id;
    return res.json({ status: "success", data: { ...updatedUser } });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      status: "error",
      code: 500,
      timestamp: new Date(),
      requestId,
      message: "Unable to update user",
    });
  }
};

const deleteProfile = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  // only logged in user should be able to delete own profile
  if (id !== userId) {
    return res.status(403).json({
      status: "error",
      code: 403,
      timestamp: new Date(),
      requestId,
      message: "Not Authorized",
    });
  }
  const user = await db.user.findUnique({
    where: {
      id,
    },
  });
  if (!user)
    return res.status(400).json({
      status: "error",
      code: 400,
      timestamp: new Date(),
      requestId,
      message: "invalid user id",
    });

  try {
    await db.user.delete({
      where: {
        id,
      },
    });
    return res.json({
      status: "success",
    });
  } catch (e) {
    return res.status(500).json({
      status: "error",
      code: 500,
      timestamp: new Date(),
      requestId,
      message: "Unable to delete profile",
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  deleteProfile,
};
