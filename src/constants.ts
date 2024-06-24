export const UserRolesEnum = {
  OWNER: "OWNER",
  USER: "USER",
};

export const AvailableUserRoles = Object.values(UserRolesEnum);

export const UserLoginType = {
  GOOGLE: "GOOGLE",
  GITHUB: "GITHUB",
  EMAIL_PASSWORD: "EMAIL_PASSWORD",
};

export const AvailableSocialLogins = Object.values(UserLoginType);
