import * as axios from 'axios';
import * as aws from './aws';
import * as fmt from './formatter';

export async function handler(targetEvent: any) {
  console.log(targetEvent);

  const executionId = targetEvent.event.detail['execution-id'];
  const pipelineName = targetEvent.event.detail.pipeline;
  const result = await aws.getCommitInfo(pipelineName, executionId);

  const payload = fmt.createPayload(targetEvent);

  await postStatusToGitHub(result.owner, result.repository, result.commitHash, payload);
};

async function postStatusToGitHub(owner: string, repository: string, commitHash: string, payload: fmt.GitHubPayload) {
  const url = `/${owner}/${repository}/statuses/${commitHash}`;

  const config: axios.AxiosRequestConfig = {
    baseURL: 'https://api.github.com/repos',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
    },
  };

  await axios.default.post(url, payload, config);
};
