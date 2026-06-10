export interface AppConfig {
  port: number;
  mongoUri: string;
  jwtSecret: string;
  nodeEnv: string;
  aws: {
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
    bucketName: string;
  };
}

function getEnv(name: string, fallback?: string): string {
  const value = process.env[name];
  if (value === undefined || value === null || value === "") {
    if (fallback !== undefined) return fallback;
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function resolveMongoUri(): string {
  const raw = process.env.MONGO_URI;
  const nodeEnv = process.env.NODE_ENV ?? "development";
  const isProduction = nodeEnv === "production";

  if (!raw || raw.trim() === "") {
    if (isProduction) {
      throw new Error(
        "MONGO_URI is required in production. Set it in Render Environment to your MongoDB Atlas connection string (e.g. mongodb+srv://USER:PASS@cluster.mongodb.net/postcard_crm?retryWrites=true&w=majority)."
      );
    }
    return "mongodb://localhost:27017/postcard_crm";
  }

  if (isProduction && /localhost|127\.0\.0\.1/i.test(raw)) {
    throw new Error(
      "MONGO_URI cannot point to localhost in production. Use your MongoDB Atlas connection string in Render Environment."
    );
  }

  return raw;
}

export const config: AppConfig = {
  port: Number(getEnv("PORT", "4000")),
  mongoUri: resolveMongoUri(),
  jwtSecret: getEnv("JWT_SECRET", "change-me-in-production"),
  nodeEnv: getEnv("NODE_ENV", "development"),
  aws: {
    accessKeyId: getEnv("AWS_ACCESS_KEY_ID", ""),
    secretAccessKey: getEnv("AWS_SECRET_ACCESS_KEY", ""),
    region: getEnv("AWS_REGION", ""),
    bucketName: getEnv("AWS_S3_BUCKET_NAME", ""),
  },
};
