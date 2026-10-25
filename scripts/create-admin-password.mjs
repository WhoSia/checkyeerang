import { randomBytes, scryptSync } from "node:crypto";
import { createInterface } from "node:readline";

const rl = createInterface({ input: process.stdin, output: process.stdout });
const password = await new Promise(resolve => rl.question("관리자 비밀번호: ", resolve));
rl.close();
if (password.length < 12) {
  console.error("12자 이상으로 설정하세요.");
  process.exit(1);
}
const salt = randomBytes(16).toString("hex");
const digest = scryptSync(password, salt, 64).toString("hex");
console.log("\n.env.local에 다음 항목을 복사하세요. 파일은 Git에 올리지 마세요.");
console.log("ADMIN_PASSWORD_HASH=" + salt + ":" + digest);
console.log("ADMIN_SESSION_SECRET=" + randomBytes(32).toString("hex"));
