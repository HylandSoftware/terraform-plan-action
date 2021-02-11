import * as core from '@actions/core';
import { exec, ExecOptions } from '@actions/exec';

async function run(): Promise<void> {
  try {
    const terraformArgs: string = core.getInput('args');
    //const githubToken: string = core.getInput('token');
    const workingDirectory: string = core.getInput('working-directory');
    const debug: boolean =
      (core.getInput('debug', { required: false }) || 'false') === 'true';

    let stdOut = '';
    let stdErr = '';

    const options: ExecOptions = {};
    options.listeners = {
      stdout: (data: Buffer) => {
        stdOut += data.toString();
      },
      stderr: (data: Buffer) => {
        stdErr += data.toString();
      },
    };
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

    await exec('terraform', ['plan', '--no-color', terraformArgs], options);

    core.debug(`Terraform plan completed at ${new Date().toTimeString()}`);
    core.debug(' ------ Standard Out from Plan -----');
    core.debug(stdOut);
    core.debug(' ------ Standard Out from Plan -----');
    core.debug(' ------ Standard Error from Plan -----');
    core.debug(stdErr);
    core.debug(' ------ Standard Error from Plan -----');
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
