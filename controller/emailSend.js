const forgotPassword = asyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
      const user = await User.findById(id);
      if (!user) {
        return res.status(COMMON_NOT_FOUND_CODE).json({ message: COM_NOT_FOUND_MESSAGE("user") });
      }
      const token = generateToken(user._id);
      const link = `http://localhost:3001/resetPassword/${user._id}/${token}`;
      await sendResetPasswordEmail(user.email, link);
      console.log(link, " link ===========================================");
    } catch (error) {
      // Handle errors
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });
  const resetPassword = asyncHandler(async (req, res) => {
    const { id, token } = req.params;
    try {
      const { email } = jwt.verify(token);
      res.render("index", { email });
    } catch (error) {
      // Handle token verification errors
      console.error(error);
      res.send("Not Verified");
    }
  });
  const updatePassword = asyncHandler(async (req, res) => {
    const { id, token } = req.params;
    const { password } = req.body;
    try {
      const { email } = jwt.verify(token);
      const encryptedPassword = await bcrypt.hash(password, 10);
      await User.findByIdAndUpdate(id, { password: encryptedPassword });
      res.send("Password Updated Successfully");
    } catch (error) {
      // Handle token verification errors or database update errors
      console.error(error);
      res.status(500).send("Failed to update password");
    }
  });
  const sendResetPasswordEmail = async (email, link) => {
    try {
      var transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "adarsh438tcsckandivali@gmail.com",
          pass: "rmdklolcsmswvyfw",
        },
      });
      var mailOptions = {
        from: "istra0802@gmail.com",
        to: email,
        subject: "Password Reset",
        text: link,
      };
      await transporter.sendMail(mailOptions);
      console.log("Email sent successfully");
    } catch (error) {
      // Handle email sending errors
      console.error("Error sending email:", error);
    }
  };