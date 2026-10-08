import { createBackendApp } from "./app.js";

const app = createBackendApp();
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Seva Backend microservice listening on port ${PORT}`);
});
