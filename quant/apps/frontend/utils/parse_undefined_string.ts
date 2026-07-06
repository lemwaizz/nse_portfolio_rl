export const parseUndefinedString = (value?: string) => {
  if (value) {
    return value.trim().length < 1 ? undefined : value?.trim();
  } else {
    return undefined;
  }
};
