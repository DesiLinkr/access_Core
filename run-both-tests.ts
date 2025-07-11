import { execa } from "execa";
import path from "path";

const root = path.resolve(__dirname);

async function runTestsInOrder() {
  try {
    console.log("🧪 Running UNIT tests...");
    await execa(
      "jest",
      [
        "--config",
        path.join(root, "tests/setup/jest.config.unit.ts"),
        "--passWithNoTests",
      ],
      {
        stdio: "inherit",
      }
    );

    console.log("🧪 Running INTEGRATION tests...");
    await execa(
      "jest",
      [
        "--config",
        path.join(root, "tests/setup/jest.config.integration.ts"),
        "--passWithNoTests",
      ],
      {
        stdio: "inherit",
      }
    );

    console.log("✅ All tests done.");
  } catch (err) {
    console.error("❌ Test run failed");
    process.exit(1);
  }
}

runTestsInOrder();
