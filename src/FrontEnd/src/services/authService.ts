import { fetchWrapper } from './FetchWrapper.tsx';
import config from '../config.json';
import { FormValues as SignInForms } from '../components/SignIn/types.ts';
import { FormValues as RegisterForms } from '../components/Register/types.ts';
import { extendSessionFormValues } from '../components/SignIn/types.ts';

interface LoginResponse {
  accessToken?: string;
  refreshToken?: string;
}

interface RequestBody {
  email: string;
  password: string;
}

interface ExtendSessionRequestBody {
  token: string;
  refreshToken: string;
}

export const authService = {
  login: async (formData: SignInForms) => {
    try {
      const url = `${config.baseUrl}${config.loginEndpoint}`;
      const headers = { headers: { 'Content-Type': 'application/json' } };
      const body: RequestBody = formData;
      const response = await fetchWrapper.post<LoginResponse, RequestBody>(url, body, headers);
      const accessToken = response.headers.get('access-token');
      const refreshToken = response.headers.get('refresh-token');

      if (!accessToken || !refreshToken) {
        throw new Error('Access or refresh token not found');
      }

      const expirationDate = new Date();
      expirationDate.setUTCDate(expirationDate.getUTCDate() + 5);
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      // TODO to be refactored
      const tokenParts = accessToken.split('.');
      const tokenPayload = JSON.parse(atob(tokenParts[1]));
      const expirationTime = tokenPayload.exp * 1000;
      const currentTime = new Date().getTime();
      const remainingTime = expirationTime - currentTime;

      setTimeout(() => {
        // TODO in next branch
      }, remainingTime);

      return response;
    } catch (error) {
      throw new Error('Login failed');
    }
  },

  register: async (formData: RegisterForms) => {
    delete formData['confirmPassword'];
    const { confirmPassword, ...registerData } = formData;
    try {
      const url = `${config.baseUrl}${config.registerEndpoint}`;
      const response = await fetchWrapper.post(url, registerData);
      if (!response) {
        throw new Error('Request failed');
      }
    } catch (error) {
      console.error(error);
      throw new Error('Registration failed');
    }
  },

  extendSession: async (formData: extendSessionFormValues) => {
    try {
      const url = `${config.baseUrl}${config.refreshTokenEndpoint}`;
      const response = await fetchWrapper.post<LoginResponse, ExtendSessionRequestBody>(
        url,
        formData
      );
      if (!response) {
        throw new Error('Request failed');
      }
      return response;
    } catch (error) {
      console.error(error);
      throw new Error('Session extension failed');
    }
  },

  googleLogin: async (formData: string | undefined) => {
    try {
      const headers = { headers: { 'Content-Type': 'application/json' } };
      const url = `${config.baseUrl}${config.googleLoginEndpoint}`;
      const response = await fetchWrapper.post(url, formData, headers);
      if (!response) {
        throw new Error('Request failed');
      }
      localStorage.setItem('accessToken', response.headers.get('access-token'));
      localStorage.setItem('refreshToken', response.headers.get('refresh-token'));
      return response;
    } catch (error) {
      console.error(error);
      throw new Error('Google login failed');
    }
  },
};
