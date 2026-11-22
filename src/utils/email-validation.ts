export const validateEmail = (email: string): boolean => {
  const allowedDomain: string | undefined = process.env.TEST_DOMAIN;
  const regexp: RegExp = new RegExp(
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  );
  if (!regexp.test(email)) {
    return false;
  }

  if (allowedDomain) {
    const givenDomain: string = email.split("@")[1]?.toLowerCase();
    if (allowedDomain != givenDomain) return false;
  }
  return true;
};
