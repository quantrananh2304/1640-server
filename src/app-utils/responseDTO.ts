import {
  CATEGORY_STATUS,
  CategoryModelInterface,
} from "@app-repositories/models/Category";
import {
  DEPARTMENT_STATUS,
  DepartmentModelInterface,
} from "@app-repositories/models/Department";
import {
  THREAD_STATUS,
  ThreadModelInterface,
} from "@app-repositories/models/Thread";
import {
  USER_GENDER,
  USER_ROLE,
  USER_STATUS,
  UserModelInterface,
} from "@app-repositories/models/User";

interface SignUpResponseDTO {
  errorCode?: 0;
  message?: "Success";
  data: {
    firstName: string;
    lastName: string;
    email: string;
    avatar: string;
    status: USER_STATUS;
    role: USER_ROLE;
    address: string;
    dob: Date;
    phoneNumber: string;
    gender: USER_GENDER;
    createdAt: Date;
    _id: string;
  };
  errors?: [];
}

interface ActivateUserAccountResponseDTO
  extends RequestResetPasswordResponseDTO {}

interface LoginResponseDTO extends Omit<SignUpResponseDTO, "data"> {
  data: {
    firstName: string;
    lastName: string;
    email: string;
    avatar: string;
    status: USER_STATUS;
    role: USER_ROLE;
    address: string;
    dob: Date;
    phoneNumber: string;
    gender: USER_GENDER;
    createdAt: Date;
    token: string;
    _id: string;
  };
}

interface ChangePasswordResponseDTO extends SignUpResponseDTO {}

interface RequestResetPasswordResponseDTO
  extends Omit<SignUpResponseDTO, "data"> {
  data: {};
}

interface ResetPasswordResponseDTO extends RequestResetPasswordResponseDTO {}

interface GetProfileResponseDTO extends SignUpResponseDTO {}

interface UpdateProfileResponseDTO extends SignUpResponseDTO {}

interface DeactivateUserAccountResponseDTO
  extends ActivateUserAccountResponseDTO {}

interface RequestActivationCodeResponseDTO
  extends RequestResetPasswordResponseDTO {}

interface CreateDepartmentResponseDTO extends Omit<SignUpResponseDTO, "data"> {
  data: {
    name: string;
    note: string;
    status: DEPARTMENT_STATUS;
    createdAt: Date;
    createdBy: string;
    updatedBy: string;
  };
}

interface GetListUserResponseDTO extends Omit<SignUpResponseDTO, "data"> {
  data: {
    users: Array<UserModelInterface>;
    total: number;
    page: number;
    totalPage: number;
  };
}

interface GetListDepartmentResponseDTO extends Omit<SignUpResponseDTO, "data"> {
  data: {
    departments: Array<DepartmentModelInterface>;
    total: number;
    page: number;
    totalPage: number;
  };
}

interface CreateThreadResponseDTO extends Omit<SignUpResponseDTO, "data"> {
  data: {
    name: string;
    description: string;
    note: string;
    closureDate: Date;
    finalClosureDate: Date;
    status: THREAD_STATUS;
    createdAt: Date;
    updatedAt: Date;
    _id: string;
    updatedBy: UserModelInterface;
  };
}

interface CreateCategoryResponseDTO extends Omit<SignUpResponseDTO, "data"> {
  data: {
    name: string;
    status: CATEGORY_STATUS;
    createdAt: Date;
    updatedAt: Date;
    _id: string;
    updatedBy: UserModelInterface;
  };
}

interface CreateIdeaResponseDTO extends Omit<SignUpResponseDTO, "data"> {
  data: {
    title: string;
    description: string;
    documents: Array<string>;
    category: Array<CategoryModelInterface>;
    createdAt: Date;
    updatedAt: Date;
    subscribers: Array<UserModelInterface>;
    _id: string;
    thread: ThreadModelInterface;
    like: Array<{ user: UserModelInterface; createdAt: Date }>;
    disLike: Array<{ user: UserModelInterface; createdAt: Date }>;
    views: Array<{ user: UserModelInterface; createdAt: Date }>;
    updatedBy: UserModelInterface;
    comments: Array<{
      content: string;
      createdBy: UserModelInterface;
      createdAt: Date;
      editHistory: Array<{
        content: string;
        updatedAt: Date;
      }>;
    }>;
  };
}

interface LikeDislikeIdeaResponseDTO extends Omit<SignUpResponseDTO, "data"> {
  data: {
    _id: string;
    title: string;
    description: string;
    category: Array<CategoryModelInterface>;
    createdAt: Date;
    updatedAt: Date;
    subscribers: Array<{ user: UserModelInterface; createdAt: Date }>;
    documents: Array<{ contentType: string; name: string; url: string }>;
    thread: ThreadModelInterface;
    like: Array<{ user: UserModelInterface; createdAt: Date }>;
    dislike: Array<{ user: UserModelInterface; createdAt: Date }>;
    views: Array<{ user: UserModelInterface; createdAt: Date }>;
    updatedBy: UserModelInterface;
    comments: Array<{
      content: string;
      createdBy: UserModelInterface;
      editHistory: Array<{
        content: string;
        updatedAt: Date;
      }>;
      createdAt: Date;
    }>;
  };
}

export type SuccessResponseDTOs =
  | SignUpResponseDTO
  | ActivateUserAccountResponseDTO
  | LoginResponseDTO
  | ChangePasswordResponseDTO
  | ResetPasswordResponseDTO
  | GetProfileResponseDTO
  | UpdateProfileResponseDTO
  | DeactivateUserAccountResponseDTO
  | RequestActivationCodeResponseDTO
  | CreateDepartmentResponseDTO
  | GetListUserResponseDTO
  | GetListDepartmentResponseDTO
  | CreateThreadResponseDTO
  | CreateCategoryResponseDTO
  | CreateIdeaResponseDTO
  | LikeDislikeIdeaResponseDTO;
