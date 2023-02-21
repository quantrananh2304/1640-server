const CONSTANTS = {
  DEFAULT_PASSWORD: "1640Group3!",

  CODE_LENGTH: 6,

  SERVER_ERROR: {
    USER_EXISTED: {
      errorCode: "01",
      message: "User existed",
    },

    USER_NOT_EXIST: {
      errorCode: "02",
      message: "User not found",
    },

    WRONG_PASSWORD: {
      errorCode: "03",
      message: "Email or password incorrect",
    },

    ACCOUNT_NOT_ACTIVATED: {
      errorCode: "04",
      message: "Account is not activated",
    },

    INTERNAL_EMAIL_ERROR: {
      errorCode: "05",
      message: "Internal email server error, email not sent",
    },

    CODE_EXPIRED: {
      errorCode: "06",
      message: "Code expired",
    },

    INVALID_AUTHORIZED_TOKEN: {
      errorCode: "013",
      message: "Invalid Authorization Token",
    },
  },
};

export default CONSTANTS;
