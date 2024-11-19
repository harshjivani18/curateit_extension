export const EMAIL_PATTERN = /^[a-zA-Z0-9]+[\\._]?[a-zA-Z0-9]+[\\._]?[a-zA-Z0-9]+[@]\w+[.]\w{2,3}$/g;
export const NAME_PATTERN  = /^[a-zA-Z0-9&()]+(([',. -][a-zA-Z0-9&() ])?[a-zA-Z0-9&()]*)*$/g;
export const NAME_PATTERN_WITHOUT_SPACE  = /^[a-zA-Z]+(([a-zA-Z])?[a-zA-Z]*)*$/g;
export const UPPERCASE_PATTERN =  /(?=.*?[A-Z])/;
export const LOWERCASE_PATTERN =  /(?=.*?[a-z])/;
export const SPECIAL_PATTERN = /(?=.*?[#?!@$%^&*-])/;
export const DIGIT_PATTERN = /(?=.*?[0-9])/;
export const NEW_URL_PATTERN = /^https:\/\/([a-zA-Z\d-]+(\.[a-zA-Z\d-]+)*\.[a-zA-Z]{2,})(:\d+)?(\/[-a-zA-Z\d%_.~+:()@,;=!*'()\/]*)(\?[;&a-zA-Z\d%_.~+=\-\/:,@!*'()]*?)?(#[-a-zA-Z\d_]*)?$/;
