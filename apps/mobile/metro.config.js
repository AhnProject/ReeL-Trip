const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// 모노레포의 모든 파일을 감시
config.watchFolders = [workspaceRoot];

// React를 mobile app의 node_modules에서 우선 resolve (중복 인스턴스 방지)
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// react-native는 workspace root에만 존재하므로 그쪽에서 resolve
config.resolver.extraNodeModules = {
  'react-native': path.resolve(workspaceRoot, 'node_modules/react-native'),
};

// react는 react-native 내부 require 포함 모든 경로에서 mobile local(19.0.0)로 고정
// → 단일 React 인스턴스 보장 (hooks 오류 방지)
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'react') {
    return {
      filePath: path.resolve(projectRoot, 'node_modules/react/index.js'),
      type: 'sourceFile',
    };
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
