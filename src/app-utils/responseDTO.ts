import {
  USER_GENDER,
  USER_ROLE,
  USER_STATUS,
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

export type SuccessResponseDTOs =
  | SignUpResponseDTO
  | ActivateUserAccountResponseDTO
  | LoginResponseDTO
  | ChangePasswordResponseDTO
  | ResetPasswordResponseDTO
  | GetProfileResponseDTO
  | UpdateProfileResponseDTO
  | DeactivateUserAccountResponseDTO;
