import * as github from '@actions/github';
import { TerraformResults } from './terraform-results';

export async function createStatusCheck(
  accessToken: string,
  title: string,
  results: TerraformResults
): Promise<void> {
  const octokit = github.getOctokit(accessToken);

  const summary = `Terraform plan completed with exit code ${results.exitCode}`;

  let details = `# Terraform Plan
<details>
    <summary>Click to expand!</summary>

    \`\`\`
        ${results.output}
    \`\`\`

</details>
`;

  if (results.error.length > 0) {
    details = `${details}

# Terraform Error
<details>
    <summary>Click to expand!</summary>

    \`\`\`
        ${results.error}
    \`\`\`

</details>
`;
  }

  const context = github.context;
  const pr = context.payload.pull_request;
  await octokit.checks.create({
    head_sha: (pr && pr['head'] && pr['head'].sha) || context.sha,
    name: 'Terraform Plan Report',
    owner: context.repo.owner,
    repo: context.repo.repo,
    status: 'completed',
    conclusion: results.exitCode > 0 ? 'failure' : 'success',
    output: {
      title,
      summary,
      annotations: [],
      text: details,
    },
  });
}
