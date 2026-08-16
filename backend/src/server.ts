import app from "./app.js";
import { env } from "./config/env.js";


app.listen(env.port, () => {
  console.log(`Mediconnect API running on port ${env.port} in ${env.nodeEnv}`);
});
