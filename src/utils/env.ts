import {config} from "dotenv";
import {resolve} from "path";

const EnvFile = process.env.NODE_ENV === "production" ? ".env" : ".dev.env";
const EnvFilePath = resolve(process.cwd(), EnvFile);

config({ path: EnvFilePath });

export function getEnvVariable(name: string, fallback?: string): string {
    const envVariable = process.env[name] ?? fallback;

    if (!envVariable) {
        throw new Error(`Environment variable "${name}" not found.`);
    }

    return envVariable;
}