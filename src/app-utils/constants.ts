const CONSTANTS = {
  DEFAULT_PASSWORD: "1640Group3!",

  CODE_LENGTH: 6,

  PASSWORD_MIN_LENGTH: 8,

  PASSWORD_MAX_LENGTH: 12,

  ACCOUNT_ACTIVATION: "Account activation",

  ACCOUNT_ACTIVATION_BODY: `<p>Your activation code is <b>{user.code}</b></p>
  <p>This code will be expired in a day.</p>`,

  PASSWORD_RESET_REQUEST: "Password reset request",

  PASSWORD_RESET_REQUEST_BODY: `
    <p>WARNING: Someone is trying to reset your account password.</p>
    <p>If this is not you, please report to our system.</p>
    <p>Do not share this code to anyone</p>
    <p>Your reset code is <b>{user.code}</b></p>
  `,

  MIN_CODE_REQUEST_TIME: 10 * 60,

  DEFAULT_CODE_EXPIRES: {
    days: 1,
  },

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

    ACCOUNT_NOT_INACTIVE: {
      errorCode: "09",
      message: "Account activated or locked/deleted",
    },

    UNKNOWN_DATA: {
      errorCode: "010",
      message: "Unknown parameters passed",
    },

    CANNOT_REQUEST_NEW_CODE_YET: {
      errorCode: "011",
      message: "Cannot request new code yet",
    },

    ACCOUNT_ACTIVATED: {
      errorCode: "012",
      message: "Account activated",
    },

    INVALID_AUTHORIZED_TOKEN: {
      errorCode: "013",
      message: "Invalid Authorization Token",
    },

    ACCOUNT_LOCKED_OR_DELETED: {
      errorCode: "014",
      message: "Account locked or deleted",
    },

    DEPARTMENT_EXISTED: {
      errorCode: "015",
      message: "Department existed",
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
