import * as AWS from 'aws-sdk';
import * as axios from 'axios';

const codepipeline = new AWS.CodePipeline();

interface GitHubPayload {
  state: string;
  'target_url': string;
  description: string;
  context: string;
}

export async function handler(targetEvent: any) {
  console.log(targetEvent);

  const region = targetEvent.event.region;
  const pipelineName = targetEvent.event.detail.pipeline;
  const executionId = targetEvent.event.detail['execution-id'];
  const state = transformState(targetEvent.event.detail.state);
  const githubContext = targetEvent.context.stateContext;

  if (state === null) {
    return;
  }

  const result = await getPipelineExecution(pipelineName, executionId);
  const payload = createPayload(pipelineName, region, state, githubContext);
  await postStatusToGitHub(result.owner, result.repository, result.sha, payload);

  return null;
};

function transformState(state: string) {
  if (state === 'STARTED' || state === 'CANCELED') {
    return 'pending';
  }
  if (state === 'SUCCEEDED') {
    return 'success';
  }
  if (state === 'FAILED' || state === 'SUPERSEDED') {
    return 'failure';
  }
  return null;
}

function createPayload(pipelineName: string, region: string, state: string, context: string): GitHubPayload {
  let description;
  if (state === 'pending') {
    description = 'Build started';
  } else if (state === 'success') {
    description = 'Build succeeded';
  } else if (state === 'failure') {
    description = 'Build failed!';
  } else {
    throw new Error('Invalid state');
  }

  return {
    state,
    target_url: buildCodePipelineUrl(pipelineName, region),
    description,
    context,
  };
}

function buildCodePipelineUrl(pipelineName: string, region: string) {
  return `https://${region}.console.aws.amazon.com/codepipeline/home?region=${region}#/view/${pipelineName}`;
}

async function getPipelineExecution(pipelineName: string, executionId: string) {
  const params = {
    pipelineName: pipelineName,
    pipelineExecutionId: executionId,
  };

  const result = await codepipeline.getPipelineExecution(params).promise();
  const artifactRevision = result.pipelineExecution!.artifactRevisions![0];

  const revisionURL = artifactRevision.revisionUrl!;
  const sha = artifactRevision.revisionId!;

  const pattern = /github.com\/(.+)\/(.+)\/commit\//;
  const matches = pattern.exec(revisionURL);

  return {
    owner: matches![1],
    repository: matches![2],
    sha: sha,
  };
};

async function postStatusToGitHub(owner: string, repository: string, sha: string, payload: GitHubPayload) {
  const url = `/${owner}/${repository}/statuses/${sha}`;

  const config: axios.AxiosRequestConfig = {
    baseURL: 'https://api.github.com/repos',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
    },
  };

  await axios.default.post(url, payload, config);
};
