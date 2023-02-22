const CONSTANTS = {
  DEFAULT_PASSWORD: "1640Group3!",

  CODE_LENGTH: 6,

  PASSWORD_MIN_LENGTH: 8,

  PASSWORD_MAX_LENGTH: 12,

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

    ADMIN_ONLY: {
      errorCode: "07",
      message: "Required admin permission",
    },

    CODE_INVALID: {
      errorCode: "08",
      message: "Code invalid",
    },

    INVALID_AUTHORIZED_TOKEN: {
      errorCode: "013",
      message: "Invalid Authorization Token",
    },

    AUTHORIZATION_FORBIDDEN: {
      errorCode: "403",
      message: "Authorization forbidden",
    },

    AUTHORIZATION_UNAUTHORIZED: {
      errorCode: "401",
      message: "Unauthorized",
    },
  },

  VALIDATION_MESSAGE: {
    EMAIL_FORMAT_NOT_VALID: "Email format invalid",

    USER_ROLE_NOT_EXIST: "User role not exist",

    DATE_FORMAT_NOT_VALID: "Date format invalid",

    OBJECT_ID_NOT_VALID: "ObjectId invalid",

    PASSWORD_NOT_VALID: "Password invalid",

    CONFIRM_PASSWORD_DIFFERENT: "Confirm password not the same",
  },
};

export default CONSTANTS;