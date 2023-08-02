import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const secret = process.env.JWT_SIGNING_HASH || '';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const authenticateToken = (req: any, res: any, next: () => void) => {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  console.log({ authHeader, token });
  if (token == null) return res.sendStatus(401);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  jwt.verify(token, process.env.JWT_SIGNING_HASH as string, (err: any, user: any) => {
    console.log(err, user);
    if (err) return res.sendStatus(403);
    req.user = user;
    req.token = decrypt(user.spotifyToken);
    console.log(req.token);
    next();
  });
};

export const encrypt = (plainText: string): string => {
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
  return '';
};

export const decrypt = (encryptedText: string) => {
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
  return '';
};
