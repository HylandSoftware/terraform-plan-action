import * as github from '@actions/github';
import { TerraformResults } from './terraform-results';

export async function createStatusCheck(
  accessToken: string,
  title: string,
  results: TerraformResults
): Promise<void> {
  const octokit = github.getOctokit(accessToken);

  const summary = `Terraform plan completed with exit code ${results.exitCode}`;

  let details = `#Terraform Plan
\`\`\`
${results.output}
\`\`\``;

  if (results.error.length > 0) {
    details = `${details}

#Terraform Error
\`\`\`
${results.error}
\`\`\``;
  }

  const context = github.context;
  const pr = context.payload.pull_request;
  await octokit.checks.create({
    head_sha: (pr && pr['head'] && pr['head'].sha) || context.sha,
    name: 'Tests Report',
    owner: context.repo.owner,
    repo: context.repo.repo,
    status: 'completed',
    conclusion: results.exitCode > 0 ? 'failure' : 'success',
    output: {
      title,
      summary,
      annotations: null,
      text: details,
    },
  });
}
