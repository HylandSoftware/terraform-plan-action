import * as core from '@actions/core';
import { exec, ExecOptions } from '@actions/exec';

async function run(): Promise<void> {
  try {
    const terraformArgs: string = core.getInput('args');
    //const githubToken: string = core.getInput('token');
    const workingDirectory: string = core.getInput('working-directory');
    const debug: boolean =
      (core.getInput('debug', { required: false }) || 'false') === 'true';

    const stdOut: Buffer[] = [];
    const stdErr: Buffer[] = [];

    const options: ExecOptions = {};
    options.listeners = {
      stdout: (data: Buffer) => {
        stdOut.push(data);
      },
      stderr: (data: Buffer) => {
        stdErr.push(data);
      },
    };
    options.ignoreReturnCode = true;
    options.cwd = workingDirectory;
    // don't escape the args cause
    options.windowsVerbatimArguments = true;
    if (debug) {
      if (options.env != null) {
        options.env['TF_LOG'] = 'DEBUG';
      } else {
        options.env = { TF_LOG: 'DEBUG' };
      }
    }

    core.debug(`Starting terraform plan at ${new Date().toTimeString()}`);

    const exitCode = await exec(
      'terraform',
      ['plan', '-no-color', '-input=false', terraformArgs],
      options
    );

    core.debug(`Terraform plan completed at ${new Date().toTimeString()}`);
    core.debug(`exitcode: ${exitCode}`);
    core.debug(' ------ Standard Out from Plan -----');
    core.debug(writeBufferToString(stdOut));
    core.debug(' ------ Standard Out from Plan -----');
    core.debug(' ------ Standard Error from Plan -----');
    core.debug(writeBufferToString(stdErr));
    core.debug(' ------ Standard Error from Plan -----');

    if (exitCode !== 0) {
      core.setFailed(`Terraform exited with code ${exitCode}.`);
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

function writeBufferToString(data: Buffer[]): string {
  return data.map((buffer) => buffer.toString()).join('');
}

run();
