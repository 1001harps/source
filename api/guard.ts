type GuardErrorCode = "value_not_defined" | "value_not_uuid";

interface GuardError {
  code: GuardErrorCode;
  propertyName: string;
}

const guardError = (code: GuardErrorCode, propertyName: string): GuardError => {
  return { code, propertyName };
};

const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const testUuid = (value: string) => {
  return value.length === 36 && uuidRegex.test(value);
};

const isDefined = <T>(name: string, value: T | undefined) => {
  if (typeof value === "undefined" || value === undefined) {
    throw guardError("value_not_defined", name);
  }
};

const isUuid = (name: string, value: string) => {
  if (!testUuid(value)) {
    throw guardError("value_not_uuid", name);
  }
};

export const Guard = {
  isDefined,
  isUuid,
};
