import { axiosClient } from './axiosClient';

export const chatApi = {
  sendMessage: (message: string) =>
    axiosClient
      .post<{ reply: string; sender: string }>('/chat', { message })
      .then((r) => r.data),
};
