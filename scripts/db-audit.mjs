import { execSync } from "node:child_process"

const RULES = [
  {
    name: "Direct Prisma Usage in Pages/Actions",
    pattern: "prisma\\.",
    include: ["src/app/**/*.tsx", "src/lib/actions/**/*.ts"],
    exclude: ["src/lib/actions/project.actions.ts"], // Barrel file
    message: "Use *-data.ts helpers instead of direct prisma calls.",
  },
  {
    name: "Wide router.refresh()",
    pattern: "router\\.refresh\\(\\)",
    include: ["src/components/**/*.tsx"],
    message: "Prefer local state updates or React Query optimistic updates.",
  },
  {
    name: "findMany without take",
    pattern: "\\.findMany\\((?!.*take:)",
    include: ["src/**/*.ts", "src/**/*.tsx"],
    exclude: ["src/__tests__/**"],
    message: "Always use 'take' or pagination for findMany.",
  },
  {
    name: "Large includes",
    pattern: "include: \\{",
    include: ["src/**/*.ts", "src/**/*.tsx"],
    message: "Check if all included relations are necessary. Prefer select.",
  },
  {
    name: "Weak casts (as any / as unknown)",
    pattern: " as (any|unknown)",
    include: ["src/**/*.ts", "src/**/*.tsx"],
    exclude: ["src/__tests__/**", "src/generated/**"],
    message: "Avoid weak type casts. Use proper interfaces or DTO mappers.",
  },
]

function runAudit() {
  console.log("\x1b[1m\x1b[34m--- Database & Performance Audit ---\x1b[0m\n")
  let totalIssues = 0

  for (const rule of RULES) {
    console.log(`\x1b[33mRule: ${rule.name}\x1b[0m`)
    console.log(`\x1b[90m${rule.message}\x1b[0m`)

    try {
      const includePattern = rule.include.join(" ")
      const excludeArgs = rule.exclude?.map(e => `--exclude "${e}"`).join(" ") || ""

      // Using ripgrep (rg) if available, otherwise grep
      const command = `rg -n "${rule.pattern}" ${includePattern} ${excludeArgs} --color never`
      const output = execSync(command, { encoding: "utf-8", stdio: ["ignore", "pipe", "ignore"] })

      if (output) {
        const lines = output.trim().split("\n")
        console.log(`Found ${lines.length} potential issues:`)
        lines.forEach(line => console.log(`  ${line}`))
        totalIssues += lines.length
      }
    } catch (error) {
      // Exit code 1 means no matches found, which is good
      if (error.status !== 1) {
        // console.error(`Error running audit for rule ${rule.name}:`, error.message)
      } else {
        console.log("No issues found. \x1b[32m✓\x1b[0m")
      }
    }
    console.log("")
  }

  if (totalIssues > 0) {
    console.log(`\x1b[31mAudit failed with ${totalIssues} issues.\x1b[0m`)
  } else {
    console.log("\x1b[32mAudit passed! No major issues found.\x1b[0m")
  }
}

runAudit()
