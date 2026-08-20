import crypto from "crypto";

const sessions = new Map();

export const SESSION_COOKIE = "sid";

export const createSession = (data) => {
  const id = crypto.randomBytes(24).toString("hex");
  sessions.set(id, data);
  return id;
};

export const getSession = (id) =>
  id ? sessions.get(id) || null : null;

export const deleteSession = (id) => {
  if (id) sessions.delete(id);
};