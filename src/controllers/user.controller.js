const db = require("../services/db");

const getProfile = async (req, res) => {
  const { id } = req.params;
  const user = await db.user.findUnique({
    where: {
      id,
    },
  });

  if (!user) {
    return res.status(404).json({ error: "invalid user id" });
  }

  return res.json({
    name: user.name,
    email: user.email,
    profilePic: user.profilePic,
    mobileNumber: user.mobileNumber,
    dateOfBirth: user.dateofBirth,
    gender: user.gender,
    height: user.height,
    weight: user.weight,
    provider: user.provider,
  });
};

const updateProfile = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  // only logged in user should be able to update own profile
  if (id !== userId) {
    return res.status(401).json({ error: "Invalid user id" });
  }
  const user = await db.user.findUnique({
    where: {
      id,
    },
  });
  if (!user)
    return res.status(401).json({
      error: "Invalid user id",
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
    return res.status(400).json({ error: "No data provided for update." });

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
    return res.json({ ...updatedUser });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Unable to update user" });
  }
};

const deleteProfile = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  // only logged in user should be able to delete own profile
  if (id !== userId) {
    return res.status(401).json({ error: "Invalid user id" });
  }
  const user = await db.user.findUnique({
    where: {
      id,
    },
  });
  if (!user)
    return res.status(401).json({
      error: "Invalid user id",
    });

  try {
    await db.user.delete({
      where: {
        id,
      },
    });
    return res.json({
      success: "Profile has been deleted.",
    });
  } catch (e) {
    return res.status(500).json({
      error: "Unable to delete profile",
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  deleteProfile,
};
