import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const defaultRecordDir = path.join(projectRoot, "work", "test-records");

function safeFilePart(value) {
  return value.replace(/[^a-z0-9._-]+/gi, "-").replace(/^-+|-+$/g, "").toLowerCase();
}

function markdownCell(value) {
  return String(value ?? "").replaceAll("|", "\\|").replaceAll("\n", " ");
}

export class TestRecorder {
  constructor({ suite, command, environment = "local" }) {
    this.suite = suite;
    this.command = command;
    this.environment = environment;
    this.startedAt = new Date().toISOString();
    this.finishedAt = null;
    this.status = "RUNNING";
    this.cases = [];
    this.write();
  }

  async case(id, title, expected, callback) {
    const started = Date.now();
    try {
      const actual = await callback();
      this.cases.push({
        id,
        title,
        expected,
        actual: actual ?? "Assertions completed successfully",
        status: "PASS",
        durationMs: Date.now() - started,
      });
      this.write();
      return actual;
    } catch (error) {
      this.cases.push({
        id,
        title,
        expected,
        actual: "Test threw an error",
        status: "FAIL",
        durationMs: Date.now() - started,
        error: error instanceof Error ? error.message : String(error),
      });
      this.write();
      throw error;
    }
  }

  finish() {
    this.finishedAt = new Date().toISOString();
    this.status = this.cases.every((item) => item.status === "PASS") ? "PASSED" : "FAILED";
    this.write();
  }

  write() {
    fs.mkdirSync(defaultRecordDir, { recursive: true });
    const record = {
      suite: this.suite,
      command: this.command,
      environment: this.environment,
      startedAt: this.startedAt,
      finishedAt: this.finishedAt,
      status: this.status,
      totals: {
        cases: this.cases.length,
        passed: this.cases.filter((item) => item.status === "PASS").length,
        failed: this.cases.filter((item) => item.status === "FAIL").length,
      },
      cases: this.cases,
    };
    const prefix = safeFilePart(this.suite);
    const jsonPath = path.join(defaultRecordDir, `${prefix}-latest.json`);
    const markdownPath = path.join(defaultRecordDir, `${prefix}-latest.md`);
    fs.writeFileSync(jsonPath, `${JSON.stringify(record, null, 2)}\n`);
    fs.writeFileSync(markdownPath, this.toMarkdown(record));
  }

  toMarkdown(record) {
    const rows = record.cases.length
      ? record.cases.map((item) => `| ${item.id} | ${markdownCell(item.title)} | ${item.status} | ${item.durationMs} ms | ${markdownCell(item.expected)} | ${markdownCell(item.actual)}${item.error ? ` — ${markdownCell(item.error)}` : ""} |`).join("\n")
      : "| — | No test cases recorded yet | RUNNING | — | — | — |";
    return `# ${record.suite} test record\n\n- Status: **${record.status}**\n- Command: \`${record.command}\`\n- Environment: ${record.environment}\n- Started: ${record.startedAt}\n- Finished: ${record.finishedAt ?? "still running"}\n- Total cases recorded: ${record.totals.cases}\n- Passed: ${record.totals.passed}\n- Failed: ${record.totals.failed}\n\n| ID | Test case | Result | Duration | Expected | Actual |\n| --- | --- | --- | ---: | --- | --- |\n${rows}\n`;
  }
}

