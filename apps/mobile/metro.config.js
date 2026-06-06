const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// 모노레포 전체 감시 (기존 기본값 유지 + 루트 추가)
config.watchFolders = [...(config.watchFolders ?? []), workspaceRoot];

// mobile 로컬 node_modules 우선, 없으면 루트에서 resolve
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// 모노레포에서 React 두 카피 문제 방지
// extraNodeModules는 폴백이라 이미 찾은 경우 무시됨.
// resolveRequest로 모든 react import를 강제 인터셉트해서 단일 경로 고정.
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // react, react-dom, react-native가 루트/앱 node_modules 양쪽에 존재할 경우
  // 서로 다른 모듈 인스턴스가 생겨 Registry 불일치 문제가 발생함.
  // 모두 앱 로컬 node_modules 기준으로 단일 인스턴스로 고정.
  if (
    moduleName === 'react' || moduleName.startsWith('react/') ||
    moduleName === 'react-dom' || moduleName.startsWith('react-dom/') ||
    moduleName === 'react-native' || moduleName.startsWith('react-native/')
  ) {
    return {
      filePath: require.resolve(moduleName, { paths: [projectRoot] }),
      type: 'sourceFile',
    };
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
