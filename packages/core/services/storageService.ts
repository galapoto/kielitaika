import AsyncStorage from "@react-native-async-storage/async-storage";

type StorageReadResult =
  | {
      ok: true;
      value: unknown | null;
    }
  | {
      ok: false;
      value: null;
    };

function sortValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortValue);
  }

  if (!value || typeof value !== "object") {
    return value;
  }

  return Object.keys(value as Record<string, unknown>)
    .sort()
    .reduce<Record<string, unknown>>((result, key) => {
      result[key] = sortValue((value as Record<string, unknown>)[key]);
      return result;
    }, {});
}

export const storageService = {
  async inspect(key: string): Promise<StorageReadResult> {
    const value = await AsyncStorage.getItem(key);

    if (value === null) {
      return {
        ok: true,
        value: null,
      };
    }

    try {
      return {
        ok: true,
        value: JSON.parse(value),
      };
    } catch {
      return {
        ok: false,
        value: null,
      };
    }
  },

  async set(key: string, value: unknown) {
    await AsyncStorage.setItem(key, JSON.stringify(sortValue(value)));
  },

  async get(key: string) {
    const result = await this.inspect(key);
    return result.ok ? result.value : null;
  },

  async remove(key: string) {
    await AsyncStorage.removeItem(key);
  },
};
