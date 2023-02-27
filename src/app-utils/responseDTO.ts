import { CATEGORY_STATUS } from "@app-repositories/models/Category";
import {
  DEPARTMENT_STATUS,
  DepartmentModelInterface,
} from "@app-repositories/models/Department";
import { THREAD_STATUS } from "@app-repositories/models/Thread";
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
    updatedBy: string;
  };
}

interface CreateCategoryResponseDTO extends Omit<SignUpResponseDTO, "data"> {
  data: {
    name: string;
    status: CATEGORY_STATUS;
    createdAt: Date;
    updatedAt: Date;
    _id: string;
    updatedBy: string;
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
  | CreateCategoryResponseDTO;
