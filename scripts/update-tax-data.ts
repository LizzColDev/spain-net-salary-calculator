import { updateTaxData } from "../src/tax-engine/etl/update-tax-data";

function readFlag(name: string) {
  return process.argv.includes(name);
}

function readOption(name: string) {
  const index = process.argv.indexOf(name);
  return index === -1 ? undefined : process.argv[index + 1];
}

const taxYear = Number(readOption("--year")) || new Date().getFullYear();
const dryRun = readFlag("--dry-run");
const forceSameYear = readFlag("--force-same-year");
const skipTests = readFlag("--skip-tests");
const allowEmptyFacts = readFlag("--allow-empty-facts");

async function main() {
  try {
    const summary = await updateTaxData({
      taxYear,
      dryRun,
      forceSameYear,
      runTests: !skipTests,
      allowEmptyFacts,
      projectRoot: process.cwd()
    });

    console.log("\nTax update summary");
    console.log("==================");
    console.log(`Tax year: ${summary.taxYear}`);
    console.log(`Dataset: ${summary.datasetVersion}`);
    console.log(`Documents: ${summary.documents.length}`);
    console.log(`Warnings: ${summary.warnings.length}`);
    console.log(`Validation issues: ${summary.validation.length}`);
    console.log("\nChanged percentages:");
    summary.diff.percentages.forEach((item) => console.log(`- ${item}`));
    console.log("\nChanged regions:");
    summary.diff.regions.forEach((item) => console.log(`- ${item}`));
    console.log("\nChanged bases:");
    summary.diff.bases.forEach((item) => console.log(`- ${item}`));
    console.log("\nChanged deductions:");
    summary.diff.deductions.forEach((item) => console.log(`- ${item}`));
    if (summary.load) {
      console.log("\nWritten files:");
      console.log(`- ${summary.load.writtenDatasetPath}`);
      console.log(`- ${summary.load.updatedCurrentPath}`);
      console.log(`- ${summary.load.diffPath}`);
      console.log(`- ${summary.load.summaryPath}`);
    }

    const errors = summary.validation.filter((issue) => issue.severity === "error");
    if (errors.length > 0) {
      console.error("\nUpdate cancelled due to validation errors.");
      errors.forEach((issue) => console.error(`- ${issue.path}: ${issue.message}`));
      process.exit(1);
    }
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

void main();
