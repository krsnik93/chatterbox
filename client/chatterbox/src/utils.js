import jwt from "jsonwebtoken";

export const hasTokenExpired = (accessToken) => {
  const decoded = jwt.decode(accessToken, { complete: true });
  return Date.now() - decoded.payload.exp * 1000 > 0;
};

export const isUserLoggedIn = (tokens) =>
  tokens.accessToken !== null &&
  tokens.accessToken !== undefined &&
  !hasTokenExpired(tokens.accessToken);

export const isoToLocale = (isoStr) =>
  new Date(Date.parse(isoStr)).toLocaleString();

export const roundDatetoNextHour = (date) => {
  date.setMinutes(date.getMinutes() + 60);
  date.setMinutes(0);
  return date;
};

export const toIsoStringKeepTimezone = (date) => {
  const tzoffset = date.getTimezoneOffset() * 60000;
  const localIsoTime = new Date(date - tzoffset).toISOString();
  return localIsoTime;
};

export const setServerErrors = (errors, setError) => {
  Object.keys(errors).forEach((key) => {
    setError(key, {
      type: "server",
      message: errors[key].message,
    });
  });
};
