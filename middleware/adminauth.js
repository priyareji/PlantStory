const adminIsLogin = async (req, res, next) => {
  try {
    if (req.session.adminId && req.session.is_admin === 1) {
      next();
    } else {
      console.log("redirectedddddddddddddd");
      return res.redirect("admin/login");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const adminIsLogout = async (req, res, next) => {
  try {
    if (req.session.adminId && req.session.is_admin === 1) {
      return res.redirect("admin/home");
    }
    next();
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  adminIsLogin,
  adminIsLogout,
};
