import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'user_token';

export const TokenManager = {
  async save(token: string) {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  },
  async get() {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  },
  async remove() {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  }
};