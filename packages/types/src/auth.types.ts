export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: "Bearer";
  username: string;
  email: string;
  role: string;
}

export interface SignupInput {
  username: string;
  password: string;
  email: string;
}

export interface LoginInput {
  username: string;
  password: string;
}
