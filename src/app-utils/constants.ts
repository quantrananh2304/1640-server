const CONSTANTS = {
  BASE_URL: "https://1640-client.vercel.app",

  DEFAULT_PASSWORD: "1640Group3!",

  CODE_LENGTH: 6,

  PASSWORD_MIN_LENGTH: 8,

  PASSWORD_MAX_LENGTH: 12,

  ACCOUNT_ACTIVATION: "Account activation",

  ACCOUNT_ACTIVATION_BODY: `<p>Your account is created successfully. Please login to the system with your email to activate your account. Default password: 1640Group3!.</p>
  <p>Your activation code is <b>{user.code}</b></p>
  <p>This code will be expired in a day.</p>`,

  PASSWORD_RESET_REQUEST: "Password reset request",

  PASSWORD_RESET_REQUEST_BODY: `
    <p>WARNING: Someone is trying to reset your account password.</p>
    <p>If this is not you, please report to our system.</p>
    <p>Do not share this code to anyone</p>
    <p>Your reset code is <b>{user.code}</b></p>
  `,

  MIN_CODE_REQUEST_TIME: 10 * 60,

  NEW_IDEA_NOTIFICATION_TITLE: "New idea submitted: ${idea.title}",

  NEW_IDEA_NOTIFICATION_BODY:
    "<p>${user.firstName} ${user.lastName} submitted a new idea in campaign ${thread.name} at ${idea.createdAt}: </p>" +
    '<p><a href="${baseUrl}/ideas/lists/${idea._id}">${idea.title}</a></p>',

  NEW_ANONYMOUS_IDEA_NOTIFICATION_BODY:
    "<p>A user submitted a new idea in campaign ${thread.name} at ${idea.createdAt}: </p>" +
    '<p><a href="${baseUrl}/ideas/lists/${idea._id}">${idea.title}</a></p>',

  NEW_IDEA_COMMENT_NOTIFICATION_TITLE:
    "New comment added in idea: ${idea.title}",

  NEW_IDEA_COMMENT_NOTIFICATION_BODY:
    "<p>${user.firstName} ${user.lastName} added a comment in your idea at ${comment.createdAt}: </p>" +
    '<p><a href="${baseUrl}/ideas/lists/${idea._id}">${idea.title}</a></p>',

  NEW_ANONYMOUS_IDEA_COMMENT_NOTIFICATION_BODY:
    "<p>A user added a comment in your idea at ${comment.createdAt}: </p>" +
    '<p><a href="${baseUrl}/ideas/lists/${idea._id}">${idea.title}</a></p>',

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

    THREAD_EXISTED: {
      errorCode: "016",
      message: "Thread existed",
    },

    CATEGORY_EXISTED: {
      errorCode: "017",
      message: "Category existed",
    },

    NOT_ADMIN_OR_QAM: {
      errorCode: "018",
      message: "Not an Admin or Quality Assurance Manager",
    },

    IDEA_EXISTED: {
      errorCode: "019",
      message: "Idea existed",
    },

    THREAD_NOT_EXISTED: {
      errorCode: "020",
      message: "Thread not existed",
    },

    THREAD_EXPIRED: {
      errorCode: "021",
      message: "Thread expired",
    },

    CATEGORY_NOT_EXISTED: {
      errorCode: "022",
      message: "Category not existed",
    },

    IDEA_NOT_EXISTED: {
      errorCode: "023",
      message: "Idea not existed",
    },

    COMMENT_NOT_EXISTED: {
      errorCode: "024",
      message: "Comment not existed",
    },

    CANNOT_DELETE_OTHER_COMMENT: {
      errorCode: "025",
      message: "Cannot delete others' comment",
    },

    CANNOT_EDIT_OTHER_COMMENT: {
      errorCode: "026",
      message: "Cannot edit others' comment",
    },

    DEPARTMENT_NOT_EXISTED: {
      errorCode: "027",
      message: "Department not existed",
    },

    USER_ALREADY_IN_DEPARTMENT: {
      errorCode: "028",
      message: "User already in this department",
    },

    NOTIFICATION_NOT_EXIST: {
      errorCode: "029",
      message: "Notification not exist",
    },

    CANNOT_READ_OTHER_NOTIFICATION: {
      errorCode: "030",
      message: "Cannot read others' notification",
    },

    DEPARTMENT_ALREADY_ACTIVE: {
      errorCode: "031",
      message: "Department already active",
    },

    DEPARTMENT_ALREADY_INACTIVE: {
      errorCode: "032",
      message: "Department already inactive",
    },

    CANNOT_EDIT_OTHER_IDEA: {
      errorCode: "033",
      message: "Cannot edit others' idea",
    },

    ONLY_STAFF_CAN_SUBMIT_IDEA: {
      errorCode: "033",
      message: "Only staff can submit new idea",
    },

    CANNOT_ASSIGN_DEPARTMENT_TO_QAM_OR_ADMIN: {
      errorCode: "034",
      message: "Cannot assign department to Admin or Quality Assurance Manager",
    },

    NOT_QAM: {
      errorCode: "035",
      message: "Not a Quality Assurance Manager",
    },

    CANNOT_UPDATE_CATEGORY_NAME_TO_SAME_NAME: {
      errorCode: "036",
      message: "Cannot update category name to its same name",
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

    SORT_OPTION_INVALID: "Sort option invalid",

    FINAL_CLOSURE_DATE_NOTE_BEFORE_CLOSURE_DATE:
      "Final closure date cannot before closure date",

    DOCUMENT_INVALID: "Document is not valid",

    ACTION_INVALID: "Action invalid",
  },
};

export default CONSTANTS;
