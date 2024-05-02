import { genSalt, hash, compare } from 'bcrypt';

export async function hashPassword(password: string): Promise<string> {
    const salt = await genSalt();
    if (!/^\$2[abxy]?\$\d+\$/.test(password)) {
      return await hash(password, salt);
    }
}

export async function checkPassword(plainPassword: string, password: string): Promise<boolean> {
    return await compare(plainPassword, password);
}