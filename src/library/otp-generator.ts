import { generate } from 'otp-generator';

const generateOtp = () => {
  return generate(6, {
    upperCaseAlphabets: false,
    lowerCaseAlphabets: false,
    specialChars: false,
  });
};

export default generateOtp;
