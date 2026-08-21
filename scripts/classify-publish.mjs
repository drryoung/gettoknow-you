/**
 * CLI used by publish-site.ps1.
 * Reads git porcelain status on stdin; writes a JSON PublishDecision on stdout.
 */
import fs from "fs";
import { decidePublish, parseGitStatusPorcelain } from "./publishPaths";

const args = process.argv.slice(2);

function flag(name) {
  const index = args.indexOf(name);
  if (index === -1) return null;
  return args[index + 1] ?? "";
}

const branch = flag("--branch") || "main";
const expectedBranch = flag("--expected-branch") || "main";
const remoteAhead = Number(flag("--remote-ahead") || "0");
const localAhead = Number(flag("--local-ahead") || "0");
const commitMessage = flag("--message");

const statusFile = flag("--status-file");
let stdin = "";
if (statusFile) {
  stdin = fs.readFileSync(statusFile, "utf8");
} else {
  stdin = fs.readFileSync(0, "utf8");
}
const paths = parseGitStatusPorcelain(stdin);

const decision = decidePublish({
  branch,
  expectedBranch,
  remoteAhead,
  localAhead,
  paths,
  commitMessage,
  readFile(path) {
    try {
      return fs.readFileSync(path, "utf8");
    } catch {
      return null;
    }
  },
});

process.stdout.write(JSON.stringify(decision));
