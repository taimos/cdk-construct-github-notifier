import { buildCodePipelineUrl } from './aws';

enum GithubState {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILURE = 'failure',
}

export interface GitHubPayload {
  state: GithubState;
  'target_url': string;
  description: string;
  context: string;
}

function transformState(state: string): GithubState {
  if (state === 'STARTED' || state === 'CANCELED') {
    return GithubState.PENDING;
  }
  if (state === 'SUCCEEDED') {
    return GithubState.SUCCESS;
  }
  if (state === 'FAILED' || state === 'SUPERSEDED' || state === 'ABANDONED') {
    return GithubState.FAILURE;
  }
  throw new Error('Cannot map state ' + state);
}

export function createPayload(targetEvent: any): GitHubPayload {
  const region = targetEvent.event.region;
  const eventType = targetEvent.event['detail-type'];

  const pipelineName = targetEvent.event.detail.pipeline;
  const stageName = targetEvent.event.detail.stage;
  const actionName = targetEvent.event.detail.action;

  const state = transformState(targetEvent.event.detail.state);
  const githubContext = targetEvent.context.stateContext;

  switch (eventType) {
    case 'CodePipeline Pipeline Execution State Change':
      return createPipelinePayload(pipelineName, region, state, githubContext);
    case 'CodePipeline Stage Execution State Change':
      return createStagePayload(pipelineName, stageName, region, state, githubContext);
    case 'CodePipeline Action Execution State Change':
      return createActionPayload(pipelineName, stageName, actionName, region, state, githubContext);
    default:
      throw new Error('Cannot parse event ' + eventType);
  }
}

function createPipelinePayload(pipelineName: string, region: string, state: GithubState, context: string): GitHubPayload {
  let description;
  switch (state) {
    case GithubState.FAILURE:
      description = 'Pipeline failed';
      break;
    case GithubState.SUCCESS:
      description = 'Pipeline succeeded';
      break;
    case GithubState.PENDING:
      description = 'Pipeline started';
      break;
  }

  return {
    state,
    target_url: buildCodePipelineUrl(pipelineName, region),
    description,
    context,
  };
}

function createStagePayload(pipelineName: string, stageName: string, region: string, state: GithubState, context: string): GitHubPayload {
  let description;
  switch (state) {
    case GithubState.FAILURE:
      description = `Stage ${stageName} failed`;
      break;
    case GithubState.SUCCESS:
      description = `Stage ${stageName} succeeded`;
      break;
    case GithubState.PENDING:
      description = `Stage ${stageName} started`;
      break;
  }

  return {
    state,
    target_url: buildCodePipelineUrl(pipelineName, region),
    description,
    context,
  };
}

function createActionPayload(pipelineName: string, stageName: string, actionName: string,
  region: string, state: GithubState, context: string): GitHubPayload {

  let description;
  switch (state) {
    case GithubState.FAILURE:
      description = `Action ${actionName} in stage ${stageName} failed`;
      break;
    case GithubState.SUCCESS:
      description = `Action ${actionName} in stage ${stageName} succeeded`;
      break;
    case GithubState.PENDING:
      description = `Action ${actionName} in stage ${stageName} started`;
      break;
  }

  return {
    state,
    target_url: buildCodePipelineUrl(pipelineName, region),
    description,
    context,
  };
}
