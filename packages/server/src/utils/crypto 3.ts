import crypto from 'crypto';

const secret = process.env.JWT_SIGNING_HASH || '';
if (secret === '') {
  throw new Error('JWT_SIGNING_HASH not found');
}
export const encrypt = (plainText: string): string | undefined => {
  try {
    const iv = crypto.randomBytes(16);
    const key = crypto.createHash('sha256').update(secret).digest('base64').substr(0, 32);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);

    let encrypted = cipher.update(plainText);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
  } catch (error) {
    console.log(error);
  }
  return undefined;
};

export const decrypt = (encryptedText: string): string | undefined => {
  try {
    const textParts = encryptedText.split(':');
    const firstPart = textParts.shift() || '';
    const iv = Buffer.from(firstPart, 'hex');

    const encryptedData = Buffer.from(textParts.join(':'), 'hex');
    const key = crypto.createHash('sha256').update(secret).digest('base64').substr(0, 32);
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);

    const decrypted = decipher.update(encryptedData);
    const decryptedText = Buffer.concat([decrypted, decipher.final()]);
    return decryptedText.toString();
  } catch (error) {
    console.log(error);
  }
  return undefined;
};
